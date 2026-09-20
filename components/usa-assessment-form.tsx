"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createDefaultUSAssessmentAnswers } from "@/lib/assessment/usa/defaults";
import { analyseUSAssessment } from "@/lib/assessment/usa/engine";
import { deriveUSClimateFromZip } from "@/lib/assessment/usa/climate";
import {
  USAssessmentAnswers,
  US_BUILD_YEAR_BANDS,
  US_CLIMATE_CONTEXTS,
  US_COOLING_TYPES,
  US_FOUNDATION_TYPES,
  US_GARAGE_TYPES,
  US_HEATING_TYPES,
  US_HOME_SIZE_BANDS,
  US_HOME_TYPES,
  US_OCCUPANT_BANDS,
  US_SYSTEM_AGE_BANDS,
  US_WATER_HEATING_TYPES,
  US_WINDOW_AGE_BANDS,
  US_WINDOW_TYPES,
} from "@/lib/assessment/usa/schema";

type UploadedPhoto = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

type NarrativeReport = {
  bottom_line?: string;
  home_energy_snapshot?: string;
  fuel_specific_findings?: string[];
  solar_battery_ev_findings?: string[];
  photo_evidence?: Array<{
    photo_number?: number;
    finding?: string;
    confidence?: "High" | "Medium";
  }>;
  photo_evidence_limitations?: string;
  positive_findings?: string[];
  what_to_check_next?: string[];
  assumptions_and_limits?: string[];
};

const WINDOW_DOOR_ISSUES = [
  "Drafts",
  "Condensation",
  "Fogging between panes",
  "Hard to open/close",
  "Visible gaps/worn seals",
  "Hot sun through windows",
  "No obvious issues",
];

const HOT_COLD_LOCATIONS = [
  "Upstairs",
  "Downstairs",
  "Sun-facing room",
  "Room over garage",
  "Room far from HVAC unit",
  "Room with lots of windows",
  "Basement",
  "Other",
];

const HVAC_SYMPTOMS = [
  "Long runtimes",
  "Short cycling",
  "Weak airflow",
  "Noisy",
  "Hot rooms",
  "Cold rooms",
  "High summer bills",
  "High winter bills",
  "Frequent auxiliary/emergency heat",
  "None",
];

const COLD_STORAGE_LOCATIONS = [
  "Kitchen",
  "Garage",
  "Basement",
  "Utility room",
  "Outbuilding",
  "Other",
];

const OTHER_COLD_STORAGE = [
  "Chest freezer",
  "Upright freezer",
  "Wine fridge",
  "Mini-fridge",
  "None",
];

const COOKING_EQUIPMENT = [
  "Gas range",
  "Electric range",
  "Induction range",
  "Wall oven",
  "Microwave",
  "Air fryer",
  "Toaster oven",
  "Other",
];

const COMPUTING_LOADS = [
  "Desktop PCs",
  "Gaming PCs",
  "Game consoles",
  "Multiple TVs",
  "Home server/NAS",
  "Network equipment",
  "Home theater",
  "Other",
];

const CONTINUOUS_LOADS = [
  "Aquarium",
  "Terrarium",
  "Medical equipment",
  "Dehumidifier",
  "Air purifier",
  "Sump pump",
  "Other",
];

const GARAGE_EQUIPMENT = [
  "Refrigerator/freezer",
  "Workshop tools",
  "Portable heater",
  "Dehumidifier",
  "EV charger",
  "Compressor",
  "Other",
];

const UNUSUAL_LOADS = [
  "Sauna",
  "Greenhouse heating",
  "Heated driveway",
  "Heated floors",
  "Large pumps",
  "Workshop machinery",
  "Server rack",
  "Other",
];

const BILL_CHANGE_REASONS = [
  "Added EV",
  "Added pool/spa",
  "More people at home",
  "Work from home",
  "New appliance",
  "HVAC change",
  "Rate increase",
  "Weather",
  "Not sure",
];

const ASSESSMENT_SECTIONS = [
  "Home",
  "Heating & Cooling",
  "Hot Water",
  "Appliances",
  "Outdoor",
  "Solar & EV",
  "Bills",
] as const;

function Section({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`assessment-section-${number}`}
      className="rounded-[1.75rem] border border-[#dbe8f2] border-t-8 border-t-[#17356f] bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#17356f] font-black text-white">
          {number}
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#17356f]">{title}</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[] | string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[#dbe8f2] bg-white px-3 py-3 font-normal text-slate-900 outline-none focus:border-[#59b9ec] focus:ring-2 focus:ring-[#59b9ec]/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step = 1,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <div className="flex items-center rounded-xl border border-[#dbe8f2] bg-white">
        {prefix && <span className="pl-3 text-slate-400">{prefix}</span>}
        <input
          type="number"
          value={value ?? ""}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value === "" ? null : Number(event.target.value))
          }
          className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-3 font-normal text-slate-900 outline-none"
        />
        {suffix && <span className="pr-3 text-slate-400">{suffix}</span>}
      </div>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[#dbe8f2] bg-white px-3 py-3 font-normal text-slate-900 outline-none focus:border-[#59b9ec] focus:ring-2 focus:ring-[#59b9ec]/20"
      />
    </label>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-[#dbe8f2] bg-[#f7fbff] p-4 text-sm font-bold text-slate-700">
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#17356f]"
      />
      {label}
    </label>
  );
}

function CheckboxGroup({
  label,
  values,
  options,
  onChange,
}: {
  label: string;
  values: string[];
  options: readonly string[] | string[];
  onChange: (values: string[]) => void;
}) {
  function toggle(option: string) {
    if (option === "None" || option === "No obvious issues") {
      onChange(values.includes(option) ? [] : [option]);
      return;
    }

    const withoutNone = values.filter(
      (value) => value !== "None" && value !== "No obvious issues"
    );

    onChange(
      withoutNone.includes(option)
        ? withoutNone.filter((value) => value !== option)
        : [...withoutNone, option]
    );
  }

  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-bold text-slate-700">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-3 rounded-xl border border-[#dbe8f2] bg-[#f7fbff] p-3 text-sm font-semibold text-slate-700"
          >
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() => toggle(option)}
              className="h-4 w-4 accent-[#17356f]"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#bde8ff] bg-[#e9f6fe] p-4">
      <p className="text-xs font-black uppercase tracking-wide text-[#17356f]/70">
        {label}
      </p>
      <p className="mt-1 font-black text-[#17356f]">{value}</p>
    </div>
  );
}

export default function USAssessmentForm() {
  const router = useRouter();
  const supabase = createClient();

  const [answers, setAnswers] = useState<USAssessmentAnswers>(() =>
    createDefaultUSAssessmentAnswers()
  );
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasPaidAccess, setHasPaidAccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [photoErrorMessage, setPhotoErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      try {
        const response = await fetch("/api/access/status", { cache: "no-store" });
        const data = (await response.json()) as { paidAccess?: boolean };

        if (!cancelled) setHasPaidAccess(Boolean(data.paidAccess));
      } catch {
        if (!cancelled) setHasPaidAccess(false);
      } finally {
        if (!cancelled) setCheckingAccess(false);
      }
    }

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  const climate = useMemo(
    () => deriveUSClimateFromZip(answers.home.zip_code),
    [answers.home.zip_code]
  );

  const analysis = useMemo(() => analyseUSAssessment(answers), [answers]);

  type USSectionKey = Exclude<keyof USAssessmentAnswers, "assessment_version">;

  function updateSection(
    section: USSectionKey,
    field: string,
    value: unknown
  ) {
    setAnswers((current) => ({
      ...current,
      [section]: {
        ...(current[section] as unknown as Record<string, unknown>),
        [field]: value,
      },
    }));
  }

  function updateZip(value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 5);
    const result = deriveUSClimateFromZip(cleaned);

    setAnswers((current) => ({
      ...current,
      home: {
        ...current.home,
        zip_code: cleaned,
        state: result.state,
      },
      hidden_context: {
        climate_context: result.climate_context,
        climate_source: result.source,
      },
    }));
  }

  function updateHomeType(value: string) {
    const homeType = value as USAssessmentAnswers["home"]["home_type"];

    setAnswers((current) => ({
      ...current,
      home: {
        ...current.home,
        home_type: homeType,
      },
      solar_battery_ev: {
        ...current.solar_battery_ev,
        authority_to_install_solar:
          homeType === "Apartment" || homeType === "Condo"
            ? "Shared/HOA/condo"
            : current.solar_battery_ev.authority_to_install_solar ===
                "Shared/HOA/condo"
              ? "Yes"
              : current.solar_battery_ev.authority_to_install_solar,
      },
    }));
  }

  function updateGarage(value: string) {
    updateSection("home", "garage_type", value);

    if (value !== "Attached") {
      updateSection("home", "rooms_above_or_beside_attached_garage", "N/A");
    }
  }

  function updatePool(value: boolean) {
    setAnswers((current) => ({
      ...current,
      outdoor: {
        ...current.outdoor,
        swimming_pool: value,
        ...(value
          ? {}
          : {
              pool_pump_type: "N/A",
              pool_pump_runtime: "N/A",
              pool_heating: "N/A",
              pool_cover_use: "N/A",
            }),
      },
    }));
  }

  function updateSpa(value: boolean) {
    setAnswers((current) => ({
      ...current,
      outdoor: {
        ...current.outdoor,
        hot_tub_spa: value,
        ...(value
          ? {}
          : {
              hot_tub_use_frequency: null,
              hot_tub_cover: "N/A",
              hot_tub_kept_hot_continuously: "N/A",
            }),
      },
    }));
  }

  function updateEv(value: string) {
    setAnswers((current) => ({
      ...current,
      solar_battery_ev: {
        ...current.solar_battery_ev,
        ev_phev: value as USAssessmentAnswers["solar_battery_ev"]["ev_phev"],
        ...(value === "No"
          ? {
              home_charging_type: "N/A",
              ev_charging_time: "N/A",
              cheaper_off_peak_ev_rate: "N/A",
            }
          : {}),
      },
      appliances: {
        ...current.appliances,
        electric_vehicle:
          value === "Yes" ? "Yes" : value === "Planning" ? "Planning soon" : "No",
      },
    }));
  }

  function compressImageToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new window.Image();

        image.onload = () => {
          const maxSize = 1200;
          let { width, height } = image;

          if (width > maxSize || height > maxSize) {
            const scale = Math.min(maxSize / width, maxSize / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Could not process image."));
            return;
          }

          context.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };

        image.onerror = () => reject(new Error("Could not read image."));
        image.src = String(reader.result);
      };

      reader.onerror = () => reject(new Error("Could not read image."));
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotos(files: FileList | null) {
    if (!files) return;

    setPhotoErrorMessage("");

    const remaining = Math.max(0, 5 - uploadedPhotos.length);
    const selected = Array.from(files).slice(0, remaining);

    if (selected.length === 0) {
      setPhotoErrorMessage("You can upload up to 5 appliance photos.");
      return;
    }

    try {
      const processed = await Promise.all(
        selected.map(async (file) => ({
          name: file.name,
          mimeType: "image/jpeg",
          dataUrl: await compressImageToDataUrl(file),
        }))
      );

      setUploadedPhotos((current) => [...current, ...processed].slice(0, 5));
    } catch {
      setPhotoErrorMessage("One or more photos could not be processed.");
    }
  }

  async function handleSubmit() {
    if (saving) return;

    setErrorMessage("");

    if (!hasPaidAccess) {
      setErrorMessage("Paid access is required to generate a report.");
      return;
    }

    if (answers.home.zip_code.length !== 5) {
      setErrorMessage("Please enter a valid 5-digit US ZIP code.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("You need to be signed in to create a report.");
        return;
      }

      const finalClimate = deriveUSClimateFromZip(answers.home.zip_code);
      const finalAnswers: USAssessmentAnswers = {
        ...answers,
        home: {
          ...answers.home,
          state: finalClimate.state,
        },
        hidden_context: {
          climate_context: finalClimate.climate_context,
          climate_source: finalClimate.source,
        },
      };

      const localAnalysis = analyseUSAssessment(finalAnswers);

      const aiResponse = await fetch("/api/generate-assessment-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: finalAnswers,
          photos: uploadedPhotos,
        }),
      });

      const aiData = (await aiResponse.json()) as {
        reportText?: string;
        report?: NarrativeReport;
        analysis?: ReturnType<typeof analyseUSAssessment>;
        error?: string;
      };

      if (!aiResponse.ok || !aiData.reportText) {
        setErrorMessage(aiData.error || "Failed to generate the report.");
        return;
      }

      const validatedAnalysis = aiData.analysis ?? localAnalysis;

      const { data: savedAssessment, error: assessmentError } = await supabase
        .from("assessments")
        .insert({
          user_id: user.id,
          answers: {
            ...finalAnswers,
            uploaded_photo_count: uploadedPhotos.length,
          },
          scores: validatedAnalysis,
        })
        .select("id")
        .single();

      if (assessmentError || !savedAssessment) {
        setErrorMessage(
          assessmentError?.message || "Failed to save the assessment."
        );
        return;
      }

      const { error: reportError } = await supabase.from("reports").insert({
        user_id: user.id,
        assessment_id: savedAssessment.id,
        report_text: aiData.reportText,
      });

      if (reportError) {
        setErrorMessage(reportError.message);
        return;
      }

      router.push(`/report/${savedAssessment.id}`);
      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while generating the report. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (checkingAccess) {
    return (
      <main className="min-h-screen bg-[#f7fbff] px-5 py-8">
        <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
          <div className="rounded-[2rem] border border-[#dbe8f2] bg-white p-8 text-center shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#17356f]">
              Checking access
            </p>
            <h1 className="mt-4 text-3xl font-black text-black">
              Loading your Save Your EGO USA assessment...
            </h1>
          </div>
        </div>
      </main>
    );
  }

  if (!hasPaidAccess) {
    return (
      <main className="min-h-screen bg-[#f7fbff] px-5 py-8">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
          <section className="w-full rounded-[2rem] border border-[#dbe8f2] bg-white p-8 text-center shadow-xl sm:p-12">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#17356f]">
              Paid access required
            </p>
            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight text-[#17356f] sm:text-5xl">
              Your Save Your EGO assessment is locked
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-700">
              Sign in with the same email address used at checkout. Existing paid
              customers keep their access when the USA version launches.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="https://www.saveyourego.com/"
                className="rounded-full bg-[#17356f] px-8 py-4 font-black text-white"
              >
                Unlock My Report
              </a>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-full border border-[#dbe8f2] bg-white px-8 py-4 font-black text-[#17356f]"
              >
                Back to dashboard
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const isAttachedGarage = answers.home.garage_type === "Attached";
  const isHeatPump = answers.hvac.main_heating === "Heat pump";
  const hasPool = answers.outdoor.swimming_pool;
  const hasSpa = answers.outdoor.hot_tub_spa;
  const hasWell = answers.outdoor.private_well === "Yes";
  const solarAuthority = answers.solar_battery_ev.authority_to_install_solar;
  const canAskRoof =
    answers.home.home_type !== "Apartment" &&
    solarAuthority !== "No" &&
    answers.solar_battery_ev.solar_interest !== "No";
  const hasEv =
    answers.solar_battery_ev.ev_phev === "Yes" ||
    answers.solar_battery_ev.ev_phev === "Planning";

  return (
    <main className="min-h-screen bg-[#f7fbff] px-5 py-6 text-[#050505] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-[#dbe8f2] bg-white shadow-xl shadow-[#17356f]/10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <Image
                src="/save-your-ego-logo.png"
                alt="Save Your EGO"
                width={300}
                height={115}
                priority
                className="h-auto w-64"
              />
              <div className="mt-7 inline-flex rounded-full bg-[#17356f] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
                USA Home Energy Assessment
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-black sm:text-5xl">
                Find the waste before you buy the upgrade
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Seven focused sections help identify likely energy waste, low-cost
                fixes and the checks worth doing before larger purchases.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#17356f] via-[#0d4f78] to-black p-6 text-white sm:p-8 lg:p-10">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#ffd600]">
                USA diagnostic model
              </p>
              <div className="mt-8 grid gap-4">
                <div className="rounded-[1.5rem] bg-white/10 p-5">
                  <p className="text-xs font-black uppercase text-white/60">
                    Sections
                  </p>
                  <p className="mt-2 text-5xl font-black">7</p>
                </div>
                <div className="rounded-[1.5rem] bg-[#ffd600] p-5 text-black">
                  <p className="text-xs font-black uppercase opacity-70">
                    Core rule
                  </p>
                  <p className="mt-2 text-xl font-black">
                    Fix the $20 problem before the $20,000 solution.
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-white p-5 text-black">
                  <p className="text-xs font-black uppercase text-slate-500">
                    Climate
                  </p>
                  <p className="mt-2 text-xl font-black">
                    Derived from your ZIP code
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav
          aria-label="Assessment sections"
          className="sticky top-3 z-20 mt-5 overflow-x-auto rounded-2xl border border-[#dbe8f2] bg-white/95 p-2 shadow-lg shadow-[#17356f]/10 backdrop-blur"
        >
          <div className="flex min-w-max gap-2">
            {ASSESSMENT_SECTIONS.map((label, index) => (
              <a
                key={label}
                href={`#assessment-section-${index + 1}`}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black text-[#17356f] transition hover:bg-[#e9f6fe]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#17356f] text-[10px] text-white">
                  {index + 1}
                </span>
                {label}
              </a>
            ))}
          </div>
        </nav>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {errorMessage}
          </div>
        )}

        <div className="mt-5 grid gap-3 rounded-2xl border border-[#bde8ff] bg-[#e9f6fe] p-4 text-sm leading-6 text-[#17356f] sm:grid-cols-[auto_1fr] sm:items-start">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-wide">
            Good to know
          </span>
          <p>
            This is an indicative home energy assessment, not a code-compliance,
            engineering, electrical, gas, structural, tax-credit or contractor
            determination. If you do not know an answer, leave it unknown rather
            than guessing.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <Section
            number={1}
            title="Home Details & Building Basics"
            description="We start with the home, its location and the symptoms you actually notice. ZIP code is used internally to derive climate context."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <TextField
                label="ZIP code"
                value={answers.home.zip_code}
                maxLength={5}
                placeholder="e.g. 33602"
                onChange={updateZip}
              />
              <InfoCard label="State" value={climate.state ?? "Waiting for ZIP"} />
              <InfoCard
                label="Climate context"
                value={climate.climate_context ?? "Waiting for ZIP"}
              />

              <SelectField
                label="Home type"
                value={answers.home.home_type}
                options={US_HOME_TYPES}
                onChange={updateHomeType}
              />
              <SelectField
                label="Year built"
                value={answers.home.build_year_band}
                options={US_BUILD_YEAR_BANDS}
                onChange={(value) => updateSection("home", "build_year_band", value)}
              />
              <SelectField
                label="Approximate home size"
                value={answers.home.home_size_band}
                options={US_HOME_SIZE_BANDS}
                onChange={(value) => updateSection("home", "home_size_band", value)}
              />
              <SelectField
                label="Number of occupants"
                value={answers.home.occupants}
                options={US_OCCUPANT_BANDS}
                onChange={(value) => updateSection("home", "occupants", value)}
              />
              <SelectField
                label="Foundation"
                value={answers.home.foundation}
                options={US_FOUNDATION_TYPES}
                onChange={(value) => updateSection("home", "foundation", value)}
              />
              <SelectField
                label="Garage"
                value={answers.home.garage_type}
                options={US_GARAGE_TYPES}
                onChange={updateGarage}
              />

              {isAttachedGarage && (
                <SelectField
                  label="Rooms above or beside attached garage"
                  value={answers.home.rooms_above_or_beside_attached_garage}
                  options={["Yes", "No", "Not sure"]}
                  onChange={(value) =>
                    updateSection(
                      "home",
                      "rooms_above_or_beside_attached_garage",
                      value
                    )
                  }
                />
              )}

              <SelectField
                label="Windows"
                value={answers.home.windows}
                options={US_WINDOW_TYPES}
                onChange={(value) => updateSection("home", "windows", value)}
              />
              <SelectField
                label="Approximate window age"
                value={answers.home.window_age_band}
                options={US_WINDOW_AGE_BANDS}
                onChange={(value) => updateSection("home", "window_age_band", value)}
              />
            </div>

            <div className="mt-6 grid gap-6">
              <CheckboxGroup
                label="Do you notice any window or door issues?"
                values={answers.home.window_door_issues}
                options={WINDOW_DOOR_ISSUES}
                onChange={(values) =>
                  updateSection("home", "window_door_issues", values)
                }
              />

              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Main sunny-window covering"
                  value={answers.home.sunny_window_coverings}
                  options={[
                    "Curtains",
                    "Blinds/shades",
                    "Exterior shutters/awnings",
                    "Solar screens/window film",
                    "Nothing",
                    "Mixture",
                  ]}
                  onChange={(value) =>
                    updateSection("home", "sunny_window_coverings", value)
                  }
                />
                <SelectField
                  label="Close coverings before strong summer sun?"
                  value={answers.home.closes_coverings_for_summer_sun}
                  options={[
                    "Usually",
                    "Sometimes",
                    "Rarely",
                    "Never",
                    "N/A or not sure",
                  ]}
                  onChange={(value) =>
                    updateSection(
                      "home",
                      "closes_coverings_for_summer_sun",
                      value
                    )
                  }
                />
                <SelectField
                  label="Any rooms consistently hotter or colder?"
                  value={answers.home.rooms_consistently_hot_or_cold}
                  options={["No", "Yes", "Not sure"]}
                  onChange={(value) =>
                    updateSection("home", "rooms_consistently_hot_or_cold", value)
                  }
                />
              </div>

              {answers.home.rooms_consistently_hot_or_cold === "Yes" && (
                <CheckboxGroup
                  label="Where are the hot or cold rooms?"
                  values={answers.home.hot_or_cold_room_locations}
                  options={HOT_COLD_LOCATIONS}
                  onChange={(values) =>
                    updateSection("home", "hot_or_cold_room_locations", values)
                  }
                />
              )}
            </div>
          </Section>

          <Section
            number={2}
            title="Heating, Cooling & Thermostat"
            description="This section looks for operating, airflow and comfort symptoms before considering equipment replacement."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="Main heating system"
                value={answers.hvac.main_heating}
                options={US_HEATING_TYPES}
                onChange={(value) =>
                  updateSection("hvac", "main_heating", value)
                }
              />
              <SelectField
                label="Main cooling system"
                value={answers.hvac.main_cooling}
                options={US_COOLING_TYPES}
                onChange={(value) =>
                  updateSection("hvac", "main_cooling", value)
                }
              />
              <SelectField
                label="Approximate system age"
                value={answers.hvac.system_age_band}
                options={US_SYSTEM_AGE_BANDS}
                onChange={(value) =>
                  updateSection("hvac", "system_age_band", value)
                }
              />
              <SelectField
                label="Thermostat"
                value={answers.hvac.thermostat_type}
                options={[
                  "Manual",
                  "Programmable",
                  "Smart",
                  "Multiple thermostats/zones",
                  "Not sure",
                ]}
                onChange={(value) =>
                  updateSection("hvac", "thermostat_type", value)
                }
              />
              <NumberField
                label="Typical summer setpoint"
                value={answers.hvac.summer_setpoint_f}
                min={55}
                max={90}
                suffix="°F"
                onChange={(value) =>
                  updateSection("hvac", "summer_setpoint_f", value)
                }
              />
              <NumberField
                label="Typical winter setpoint"
                value={answers.hvac.winter_setpoint_f}
                min={50}
                max={85}
                suffix="°F"
                onChange={(value) =>
                  updateSection("hvac", "winter_setpoint_f", value)
                }
              />
              <SelectField
                label="Setback when away or sleeping"
                value={answers.hvac.setback_when_away_or_sleeping}
                options={["Automatically", "Usually", "Sometimes", "Rarely", "Never"]}
                onChange={(value) =>
                  updateSection("hvac", "setback_when_away_or_sleeping", value)
                }
              />
              <SelectField
                label="HVAC filter check/replacement"
                value={answers.hvac.filter_frequency}
                options={[
                  "Monthly",
                  "Every 2-3 months",
                  "A few times/year",
                  "Rarely",
                  "Not sure",
                ]}
                onChange={(value) =>
                  updateSection("hvac", "filter_frequency", value)
                }
              />
              <SelectField
                label="Blocked supply or return vents?"
                value={answers.hvac.blocked_supply_or_return_vents}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) =>
                  updateSection("hvac", "blocked_supply_or_return_vents", value)
                }
              />
              <SelectField
                label="Where do most ducts run?"
                value={answers.hvac.duct_location}
                options={[
                  "Conditioned space",
                  "Attic",
                  "Crawlspace",
                  "Basement",
                  "Garage",
                  "Combination",
                  "Not sure",
                ]}
                onChange={(value) =>
                  updateSection("hvac", "duct_location", value)
                }
              />
              <SelectField
                label="Ceiling-fan use"
                value={answers.hvac.ceiling_fan_use}
                options={["Regularly", "Sometimes", "Rarely", "No"]}
                onChange={(value) =>
                  updateSection("hvac", "ceiling_fan_use", value)
                }
              />
              {answers.hvac.ceiling_fan_use !== "No" && (
                <SelectField
                  label="Turn fans off in empty rooms?"
                  value={answers.hvac.turns_off_fans_in_empty_rooms}
                  options={["Usually", "Sometimes", "Rarely", "Never", "N/A"]}
                  onChange={(value) =>
                    updateSection("hvac", "turns_off_fans_in_empty_rooms", value)
                  }
                />
              )}
              <SelectField
                label="Portable space-heater use"
                value={answers.hvac.portable_space_heater_use}
                options={["Never", "Occasionally", "Regularly", "Several rooms"]}
                onChange={(value) =>
                  updateSection("hvac", "portable_space_heater_use", value)
                }
              />
              {isHeatPump && (
                <SelectField
                  label="Auxiliary/emergency heat frequency"
                  value={answers.hvac.heat_pump_aux_heat_frequency}
                  options={["Rarely", "Sometimes", "Frequently", "Not sure"]}
                  onChange={(value) =>
                    updateSection("hvac", "heat_pump_aux_heat_frequency", value)
                  }
                />
              )}
            </div>

            <div className="mt-6">
              <CheckboxGroup
                label="HVAC symptoms"
                values={answers.hvac.symptoms}
                options={HVAC_SYMPTOMS}
                onChange={(values) => updateSection("hvac", "symptoms", values)}
              />
            </div>
          </Section>

          <Section
            number={3}
            title="Water Heating & Hot Water"
            description="Hot-water habits and distribution problems often reveal useful savings before a water-heater replacement is justified."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="Water-heating system"
                value={answers.water_heating.type}
                options={US_WATER_HEATING_TYPES}
                onChange={(value) =>
                  updateSection("water_heating", "type", value)
                }
              />
              <SelectField
                label="Approximate age"
                value={answers.water_heating.age_band}
                options={["Under 5", "5-10", "10-15", "15+ years", "Not sure"]}
                onChange={(value) =>
                  updateSection("water_heating", "age_band", value)
                }
              />
              <SelectField
                label="Temperature setting"
                value={answers.water_heating.temperature_band}
                options={[
                  "Below 120F",
                  "Around 120F",
                  "121-130F",
                  "Above 130F",
                  "Not sure",
                ]}
                onChange={(value) =>
                  updateSection("water_heating", "temperature_band", value)
                }
              />
              <SelectField
                label="Showers per day"
                value={answers.water_heating.showers_per_day}
                options={["1-2", "3-4", "5-6", "7+", "Not sure"]}
                onChange={(value) =>
                  updateSection("water_heating", "showers_per_day", value)
                }
              />
              <SelectField
                label="Typical shower length"
                value={answers.water_heating.shower_length}
                options={["Under 5 min", "5-10", "10-15", "Over 15", "Varies"]}
                onChange={(value) =>
                  updateSection("water_heating", "shower_length", value)
                }
              />
              <SelectField
                label="Mostly showers or baths?"
                value={answers.water_heating.showers_or_baths}
                options={["Showers", "Baths", "Mixture"]}
                onChange={(value) =>
                  updateSection("water_heating", "showers_or_baths", value)
                }
              />
              <SelectField
                label="Low-flow showerheads?"
                value={answers.water_heating.low_flow_showerheads}
                options={["Yes", "No", "Some", "Not sure"]}
                onChange={(value) =>
                  updateSection("water_heating", "low_flow_showerheads", value)
                }
              />
              <SelectField
                label="Dripping hot-water faucet/showerhead?"
                value={answers.water_heating.dripping_hot_water_fixtures}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) =>
                  updateSection(
                    "water_heating",
                    "dripping_hot_water_fixtures",
                    value
                  )
                }
              />
              <SelectField
                label="Long wait for hot water?"
                value={answers.water_heating.long_hot_water_wait}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) =>
                  updateSection("water_heating", "long_hot_water_wait", value)
                }
              />
              <SelectField
                label="Hot-water recirculation pump"
                value={answers.water_heating.recirculation_pump}
                options={[
                  "Continuous",
                  "Scheduled",
                  "Demand-activated",
                  "Yes but unsure",
                  "No",
                  "Not sure",
                ]}
                onChange={(value) =>
                  updateSection("water_heating", "recirculation_pump", value)
                }
              />
              <SelectField
                label="Accessible hot-water pipes insulated?"
                value={answers.water_heating.accessible_hot_water_pipes_insulated}
                options={["Yes", "Some", "No", "Not sure"]}
                onChange={(value) =>
                  updateSection(
                    "water_heating",
                    "accessible_hot_water_pipes_insulated",
                    value
                  )
                }
              />
              <SelectField
                label="Water-heater location"
                value={answers.water_heating.water_heater_location}
                options={[
                  "Conditioned space",
                  "Basement",
                  "Garage",
                  "Attic",
                  "Crawlspace",
                  "Utility room",
                  "Outdoors",
                  "Not sure",
                ]}
                onChange={(value) =>
                  updateSection("water_heating", "water_heater_location", value)
                }
              />
              <SelectField
                label="Run out of hot water?"
                value={answers.water_heating.runs_out_of_hot_water}
                options={["Frequently", "Occasionally", "Rarely", "Never"]}
                onChange={(value) =>
                  updateSection("water_heating", "runs_out_of_hot_water", value)
                }
              />
            </div>
          </Section>

          <Section
            number={4}
            title="Appliances, Laundry & Plug Loads"
            description="We look for repeated runtime, unnecessary standby use and hidden continuous loads rather than assuming an older appliance should be replaced."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="Refrigerators in regular use"
                value={answers.appliances.refrigerators_in_regular_use}
                options={["1", "2", "3+", "Not sure"]}
                onChange={(value) =>
                  updateSection("appliances", "refrigerators_in_regular_use", value)
                }
              />
              <SelectField
                label="Extra refrigerator/freezer age"
                value={answers.appliances.extra_cold_storage_age_band ?? "Not applicable"}
                options={[
                  "Not applicable",
                  "Under 5",
                  "5-10",
                  "10-15",
                  "15-20",
                  "20+ years",
                  "Not sure",
                ]}
                onChange={(value) =>
                  updateSection(
                    "appliances",
                    "extra_cold_storage_age_band",
                    value === "Not applicable" ? null : value
                  )
                }
              />
              <SelectField
                label="Clothes dryer"
                value={answers.appliances.clothes_dryer_type}
                options={[
                  "Electric dryer",
                  "Gas dryer",
                  "Heat-pump dryer",
                  "Mostly air dry",
                  "Mixture",
                ]}
                onChange={(value) =>
                  updateSection("appliances", "clothes_dryer_type", value)
                }
              />
              <SelectField
                label="Dryer loads per week"
                value={answers.appliances.dryer_loads_per_week}
                options={["<3", "3-5", "6-10", "10+"]}
                onChange={(value) =>
                  updateSection("appliances", "dryer_loads_per_week", value)
                }
              />
              <SelectField
                label="Need multiple drying cycles?"
                value={answers.appliances.multiple_drying_cycles}
                options={["Often", "Sometimes", "Rarely", "Never"]}
                onChange={(value) =>
                  updateSection("appliances", "multiple_drying_cycles", value)
                }
              />
              <SelectField
                label="Dishwasher heated dry"
                value={answers.appliances.dishwasher_heated_dry}
                options={["Always", "Sometimes", "Rarely", "Never/air dry", "Not sure"]}
                onChange={(value) =>
                  updateSection("appliances", "dishwasher_heated_dry", value)
                }
              />
              <SelectField
                label="Dishwasher frequency"
                value={answers.appliances.dishwasher_frequency}
                options={["<1/day", "About 1/day", ">1/day"]}
                onChange={(value) =>
                  updateSection("appliances", "dishwasher_frequency", value)
                }
              />
              <SelectField
                label="Laundry wash temperature"
                value={answers.appliances.laundry_wash_temperature}
                options={["Cold", "Warm", "Hot", "Mixed"]}
                onChange={(value) =>
                  updateSection("appliances", "laundry_wash_temperature", value)
                }
              />
              <SelectField
                label="Run partial appliance loads?"
                value={answers.appliances.partial_loads}
                options={["Yes", "Sometimes", "Rarely", "No"]}
                onChange={(value) =>
                  updateSection("appliances", "partial_loads", value)
                }
              />
              <SelectField
                label="Work from home"
                value={answers.appliances.work_from_home_frequency}
                options={["No", "1-2 days/week", "3-4", "5+"]}
                onChange={(value) =>
                  updateSection("appliances", "work_from_home_frequency", value)
                }
              />
              <SelectField
                label="Equipment left on unnecessarily"
                value={answers.appliances.entertainment_left_on_unnecessarily}
                options={["Often", "Sometimes", "Rarely", "Never"]}
                onChange={(value) =>
                  updateSection(
                    "appliances",
                    "entertainment_left_on_unnecessarily",
                    value
                  )
                }
              />
              <SelectField
                label="Outdoor/security lighting"
                value={answers.appliances.outdoor_security_lighting}
                options={["Dusk-to-dawn", "Motion", "Manual", "No", "Not sure"]}
                onChange={(value) =>
                  updateSection("appliances", "outdoor_security_lighting", value)
                }
              />
            </div>

            <div className="mt-6 grid gap-6">
              <CheckboxGroup
                label="Where is extra cold storage located?"
                values={answers.appliances.extra_cold_storage_location}
                options={COLD_STORAGE_LOCATIONS}
                onChange={(values) =>
                  updateSection("appliances", "extra_cold_storage_location", values)
                }
              />
              <CheckboxGroup
                label="Other cold-storage appliances"
                values={answers.appliances.other_cold_storage}
                options={OTHER_COLD_STORAGE}
                onChange={(values) =>
                  updateSection("appliances", "other_cold_storage", values)
                }
              />
              <CheckboxGroup
                label="Main cooking equipment"
                values={answers.appliances.main_cooking_equipment}
                options={COOKING_EQUIPMENT}
                onChange={(values) =>
                  updateSection("appliances", "main_cooking_equipment", values)
                }
              />
              <CheckboxGroup
                label="High-use computing or entertainment equipment"
                values={answers.appliances.high_use_computing_entertainment}
                options={COMPUTING_LOADS}
                onChange={(values) =>
                  updateSection(
                    "appliances",
                    "high_use_computing_entertainment",
                    values
                  )
                }
              />
              <CheckboxGroup
                label="Other continuous loads"
                values={answers.appliances.other_continuous_loads}
                options={CONTINUOUS_LOADS}
                onChange={(values) =>
                  updateSection("appliances", "other_continuous_loads", values)
                }
              />

              <div className="rounded-2xl border border-dashed border-[#59b9ec] bg-[#f7fbff] p-5">
                <h3 className="font-black text-[#17356f]">
                  Optional AI photo review
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Upload up to 5 photos of appliance labels or equipment. When
                  you generate the report, AI will review each image for clearly
                  readable energy-related evidence. It will not guess from an
                  unclear photo or override your answers.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => handlePhotos(event.target.files)}
                  className="mt-4 block w-full text-sm text-slate-600"
                />
                {uploadedPhotos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {uploadedPhotos.map((photo, index) => (
                      <button
                        type="button"
                        key={`${photo.name}-${index}`}
                        onClick={() =>
                          setUploadedPhotos((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                        className="rounded-full border border-[#dbe8f2] bg-white px-3 py-2 text-xs font-bold text-[#17356f]"
                      >
                        {photo.name} ×
                      </button>
                    ))}
                  </div>
                )}
                {photoErrorMessage && (
                  <p className="mt-3 text-sm font-semibold text-red-700">
                    {photoErrorMessage}
                  </p>
                )}
              </div>
            </div>
          </Section>

          <Section
            number={5}
            title="Pool, Spa, Garage & Outdoor Loads"
            description="These loads can dominate a bill in some homes, so they appear only when relevant."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleField
                label="Swimming pool"
                value={answers.outdoor.swimming_pool}
                onChange={updatePool}
              />
              <ToggleField
                label="Hot tub or spa"
                value={answers.outdoor.hot_tub_spa}
                onChange={updateSpa}
              />
            </div>

            {hasPool && (
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <SelectField
                  label="Pool pump"
                  value={answers.outdoor.pool_pump_type}
                  options={["Single-speed", "Two-speed", "Variable-speed", "Not sure"]}
                  onChange={(value) =>
                    updateSection("outdoor", "pool_pump_type", value)
                  }
                />
                <SelectField
                  label="Pump runtime"
                  value={answers.outdoor.pool_pump_runtime}
                  options={["Under 4", "4-8", "8-12", ">12 hours/day", "Not sure"]}
                  onChange={(value) =>
                    updateSection("outdoor", "pool_pump_runtime", value)
                  }
                />
                <SelectField
                  label="Pool heating"
                  value={answers.outdoor.pool_heating}
                  options={[
                    "None",
                    "Gas",
                    "Electric resistance",
                    "Heat pump",
                    "Solar",
                    "Not sure",
                  ]}
                  onChange={(value) =>
                    updateSection("outdoor", "pool_heating", value)
                  }
                />
                <SelectField
                  label="Pool cover use"
                  value={answers.outdoor.pool_cover_use}
                  options={["Yes", "Sometimes", "No"]}
                  onChange={(value) =>
                    updateSection("outdoor", "pool_cover_use", value)
                  }
                />
              </div>
            )}

            {hasSpa && (
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <TextField
                  label="Hot-tub use frequency"
                  value={answers.outdoor.hot_tub_use_frequency ?? ""}
                  placeholder="e.g. weekends"
                  onChange={(value) =>
                    updateSection("outdoor", "hot_tub_use_frequency", value || null)
                  }
                />
                <SelectField
                  label="Effective cover?"
                  value={answers.outdoor.hot_tub_cover}
                  options={["Yes", "No", "Not sure"]}
                  onChange={(value) =>
                    updateSection("outdoor", "hot_tub_cover", value)
                  }
                />
                <SelectField
                  label="Kept hot continuously?"
                  value={answers.outdoor.hot_tub_kept_hot_continuously}
                  options={["Yes", "No", "Not sure"]}
                  onChange={(value) =>
                    updateSection(
                      "outdoor",
                      "hot_tub_kept_hot_continuously",
                      value
                    )
                  }
                />
              </div>
            )}

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <SelectField
                label="Garage-door use"
                value={answers.outdoor.garage_door_use}
                options={["Several times/day", "Once/twice/day", "Occasionally", "N/A"]}
                onChange={(value) =>
                  updateSection("outdoor", "garage_door_use", value)
                }
              />
              <SelectField
                label="Outdoor-lighting control"
                value={answers.outdoor.outdoor_lighting_control}
                options={["Motion", "Dusk-to-dawn", "Timer", "Manual", "None"]}
                onChange={(value) =>
                  updateSection("outdoor", "outdoor_lighting_control", value)
                }
              />
              <SelectField
                label="Landscape lighting"
                value={answers.outdoor.landscape_lighting}
                options={["LED", "Mostly LED", "Older/non-LED", "Not sure", "None"]}
                onChange={(value) =>
                  updateSection("outdoor", "landscape_lighting", value)
                }
              />
              <SelectField
                label="Private well?"
                value={answers.outdoor.private_well}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) =>
                  updateSection("outdoor", "private_well", value)
                }
              />
              {hasWell && (
                <SelectField
                  label="Well pump cycles unusually often?"
                  value={answers.outdoor.well_pump_cycles_unusually_often}
                  options={["Yes", "No", "Not sure"]}
                  onChange={(value) =>
                    updateSection(
                      "outdoor",
                      "well_pump_cycles_unusually_often",
                      value
                    )
                  }
                />
              )}
              <ToggleField
                label="Irrigation system"
                value={answers.outdoor.irrigation_system}
                onChange={(value) =>
                  updateSection("outdoor", "irrigation_system", value)
                }
              />
            </div>

            <div className="mt-6 grid gap-6">
              <CheckboxGroup
                label="Garage equipment"
                values={answers.outdoor.garage_equipment}
                options={GARAGE_EQUIPMENT}
                onChange={(values) =>
                  updateSection("outdoor", "garage_equipment", values)
                }
              />
              <CheckboxGroup
                label="Other unusual loads"
                values={answers.outdoor.unusual_loads}
                options={UNUSUAL_LOADS}
                onChange={(values) =>
                  updateSection("outdoor", "unusual_loads", values)
                }
              />
            </div>
          </Section>

          <Section
            number={6}
            title="Solar, Battery & EV"
            description="Solar is treated as a diagnostic opportunity, not a default recommendation. Ownership and roof control come first."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleField
                label="Rooftop solar already installed"
                value={answers.solar_battery_ev.rooftop_solar}
                onChange={(value) =>
                  updateSection("solar_battery_ev", "rooftop_solar", value)
                }
              />
              <ToggleField
                label="Home battery already installed"
                value={answers.solar_battery_ev.home_battery_installed}
                onChange={(value) =>
                  updateSection(
                    "solar_battery_ev",
                    "home_battery_installed",
                    value
                  )
                }
              />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {answers.solar_battery_ev.rooftop_solar && (
                <>
                  <NumberField
                    label="Solar size if known"
                    value={answers.solar_battery_ev.solar_size_kw}
                    min={0}
                    max={100}
                    step={0.1}
                    suffix="kW"
                    onChange={(value) =>
                      updateSection("solar_battery_ev", "solar_size_kw", value)
                    }
                  />
                  <NumberField
                    label="Solar install year"
                    value={answers.solar_battery_ev.solar_install_year}
                    min={1980}
                    max={2035}
                    onChange={(value) =>
                      updateSection(
                        "solar_battery_ev",
                        "solar_install_year",
                        value
                      )
                    }
                  />
                </>
              )}

              <SelectField
                label="Interested in solar?"
                value={answers.solar_battery_ev.solar_interest}
                options={["Yes", "Maybe", "No"]}
                onChange={(value) =>
                  updateSection("solar_battery_ev", "solar_interest", value)
                }
              />
              <SelectField
                label="Authority to install rooftop solar"
                value={answers.solar_battery_ev.authority_to_install_solar}
                options={["Yes", "No", "Shared/HOA/condo", "Not sure"]}
                onChange={(value) =>
                  updateSection(
                    "solar_battery_ev",
                    "authority_to_install_solar",
                    value
                  )
                }
              />
            </div>

            {canAskRoof && (
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <SelectField
                  label="Roof orientation"
                  value={answers.solar_battery_ev.roof_orientation}
                  options={[
                    "Mostly south",
                    "Mostly east/west",
                    "Mostly north",
                    "Multiple directions",
                    "Flat",
                    "Not sure",
                  ]}
                  onChange={(value) =>
                    updateSection("solar_battery_ev", "roof_orientation", value)
                  }
                />
                <SelectField
                  label="Roof shading"
                  value={answers.solar_battery_ev.roof_shading}
                  options={["Little/none", "Some", "Heavy", "Not sure"]}
                  onChange={(value) =>
                    updateSection("solar_battery_ev", "roof_shading", value)
                  }
                />
                <SelectField
                  label="Usable roof space"
                  value={answers.solar_battery_ev.usable_roof_space}
                  options={["Plenty", "Limited", "Very limited", "Not sure"]}
                  onChange={(value) =>
                    updateSection("solar_battery_ev", "usable_roof_space", value)
                  }
                />
              </div>
            )}

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <SelectField
                label="Battery goal"
                value={answers.solar_battery_ev.battery_goal}
                options={[
                  "Backup power",
                  "Peak-rate reduction",
                  "Use more solar",
                  "Energy independence",
                  "Not interested",
                  "Not sure",
                ]}
                onChange={(value) =>
                  updateSection("solar_battery_ev", "battery_goal", value)
                }
              />
              <SelectField
                label="EV / PHEV"
                value={answers.solar_battery_ev.ev_phev}
                options={["Yes", "No", "Planning"]}
                onChange={updateEv}
              />
            </div>

            {hasEv && (
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <SelectField
                  label="Home charging"
                  value={answers.solar_battery_ev.home_charging_type}
                  options={["120V/Level 1", "Level 2", "Mostly public", "Not sure"]}
                  onChange={(value) =>
                    updateSection("solar_battery_ev", "home_charging_type", value)
                  }
                />
                <SelectField
                  label="Typical charging time"
                  value={answers.solar_battery_ev.ev_charging_time}
                  options={[
                    "Overnight",
                    "Daytime",
                    "Whenever plugged in",
                    "Scheduled off-peak",
                    "Not sure",
                  ]}
                  onChange={(value) =>
                    updateSection("solar_battery_ev", "ev_charging_time", value)
                  }
                />
                <SelectField
                  label="Cheaper off-peak EV rate?"
                  value={answers.solar_battery_ev.cheaper_off_peak_ev_rate}
                  options={["Yes", "No", "Not sure"]}
                  onChange={(value) =>
                    updateSection(
                      "solar_battery_ev",
                      "cheaper_off_peak_ev_rate",
                      value
                    )
                  }
                />
              </div>
            )}
          </Section>

          <Section
            number={7}
            title="Energy Bills & Household Behaviour"
            description="Actual usage or bill data is preferred when available. You can leave optional numeric fields blank rather than guessing."
          >
            <div className="grid gap-6">
              <CheckboxGroup
                label="Energy sources used at home"
                values={answers.bills_behaviour.energy_sources}
                options={[
                  "Electricity",
                  "Natural gas",
                  "Propane",
                  "Heating oil",
                  "Wood/pellets",
                  "Other",
                  "Not sure",
                ]}
                onChange={(values) =>
                  updateSection("bills_behaviour", "energy_sources", values)
                }
              />

              <div className="grid gap-5 md:grid-cols-3">
                <NumberField
                  label="Typical monthly electricity bill"
                  value={answers.bills_behaviour.typical_monthly_electricity_bill}
                  prefix="$"
                  min={0}
                  step={1}
                  onChange={(value) =>
                    updateSection(
                      "bills_behaviour",
                      "typical_monthly_electricity_bill",
                      value
                    )
                  }
                />
                <NumberField
                  label="Highest electricity bill"
                  value={answers.bills_behaviour.highest_electricity_bill}
                  prefix="$"
                  min={0}
                  step={1}
                  onChange={(value) =>
                    updateSection(
                      "bills_behaviour",
                      "highest_electricity_bill",
                      value
                    )
                  }
                />
                <NumberField
                  label="Electricity use per month if known"
                  value={answers.bills_behaviour.electricity_usage_kwh_monthly}
                  min={0}
                  suffix="kWh"
                  onChange={(value) =>
                    updateSection(
                      "bills_behaviour",
                      "electricity_usage_kwh_monthly",
                      value
                    )
                  }
                />
                <NumberField
                  label="Annual electricity use if known"
                  value={answers.bills_behaviour.electricity_usage_kwh_annual}
                  min={0}
                  suffix="kWh"
                  onChange={(value) =>
                    updateSection(
                      "bills_behaviour",
                      "electricity_usage_kwh_annual",
                      value
                    )
                  }
                />
                <NumberField
                  label="Electricity rate if known"
                  value={answers.bills_behaviour.electricity_unit_rate_per_kwh}
                  min={0}
                  step={0.001}
                  prefix="$"
                  suffix="/kWh"
                  onChange={(value) =>
                    updateSection(
                      "bills_behaviour",
                      "electricity_unit_rate_per_kwh",
                      value
                    )
                  }
                />
              </div>

              {answers.bills_behaviour.energy_sources.includes("Natural gas") && (
                <div className="grid gap-5 md:grid-cols-3">
                  <NumberField
                    label="Typical monthly gas bill"
                    value={answers.bills_behaviour.natural_gas_typical_bill}
                    prefix="$"
                    min={0}
                    onChange={(value) =>
                      updateSection(
                        "bills_behaviour",
                        "natural_gas_typical_bill",
                        value
                      )
                    }
                  />
                  <NumberField
                    label="Natural gas use if known"
                    value={answers.bills_behaviour.natural_gas_therms}
                    min={0}
                    suffix="therms"
                    onChange={(value) =>
                      updateSection(
                        "bills_behaviour",
                        "natural_gas_therms",
                        value
                      )
                    }
                  />
                  <NumberField
                    label="Gas rate if known"
                    value={answers.bills_behaviour.natural_gas_unit_rate_per_therm}
                    min={0}
                    step={0.01}
                    prefix="$"
                    suffix="/therm"
                    onChange={(value) =>
                      updateSection(
                        "bills_behaviour",
                        "natural_gas_unit_rate_per_therm",
                        value
                      )
                    }
                  />
                </div>
              )}

              {answers.bills_behaviour.energy_sources.includes("Propane") && (
                <div className="grid gap-5 md:grid-cols-3">
                  <NumberField
                    label="Annual propane spend"
                    value={answers.bills_behaviour.propane_annual_spend}
                    prefix="$"
                    min={0}
                    onChange={(value) =>
                      updateSection(
                        "bills_behaviour",
                        "propane_annual_spend",
                        value
                      )
                    }
                  />
                  <NumberField
                    label="Annual propane use"
                    value={answers.bills_behaviour.propane_gallons}
                    min={0}
                    suffix="gal"
                    onChange={(value) =>
                      updateSection(
                        "bills_behaviour",
                        "propane_gallons",
                        value
                      )
                    }
                  />
                  <NumberField
                    label="Propane rate if known"
                    value={answers.bills_behaviour.propane_unit_rate_per_gallon}
                    min={0}
                    step={0.01}
                    prefix="$"
                    suffix="/gal"
                    onChange={(value) =>
                      updateSection(
                        "bills_behaviour",
                        "propane_unit_rate_per_gallon",
                        value
                      )
                    }
                  />
                </div>
              )}

              {answers.bills_behaviour.energy_sources.includes("Heating oil") && (
                <div className="grid gap-5 md:grid-cols-3">
                  <NumberField
                    label="Annual heating-oil spend"
                    value={answers.bills_behaviour.heating_oil_annual_spend}
                    prefix="$"
                    min={0}
                    onChange={(value) =>
                      updateSection(
                        "bills_behaviour",
                        "heating_oil_annual_spend",
                        value
                      )
                    }
                  />
                  <NumberField
                    label="Annual heating-oil use"
                    value={answers.bills_behaviour.heating_oil_gallons}
                    min={0}
                    suffix="gal"
                    onChange={(value) =>
                      updateSection(
                        "bills_behaviour",
                        "heating_oil_gallons",
                        value
                      )
                    }
                  />
                  <NumberField
                    label="Heating-oil rate if known"
                    value={answers.bills_behaviour.heating_oil_unit_rate_per_gallon}
                    min={0}
                    step={0.01}
                    prefix="$"
                    suffix="/gal"
                    onChange={(value) =>
                      updateSection(
                        "bills_behaviour",
                        "heating_oil_unit_rate_per_gallon",
                        value
                      )
                    }
                  />
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-3">
                <SelectField
                  label="When are bills highest?"
                  value={answers.bills_behaviour.bills_highest}
                  options={["Summer", "Winter", "Similar all year", "Varies", "Not sure"]}
                  onChange={(value) =>
                    updateSection("bills_behaviour", "bills_highest", value)
                  }
                />
                <SelectField
                  label="Bills increased noticeably?"
                  value={answers.bills_behaviour.bills_increased_noticeably}
                  options={["Yes", "No", "Not sure"]}
                  onChange={(value) =>
                    updateSection(
                      "bills_behaviour",
                      "bills_increased_noticeably",
                      value
                    )
                  }
                />
                <SelectField
                  label="Home occupied during the day"
                  value={answers.bills_behaviour.daytime_occupancy}
                  options={["Most days", "Several days/week", "Rarely", "Varies"]}
                  onChange={(value) =>
                    updateSection("bills_behaviour", "daytime_occupancy", value)
                  }
                />
                <SelectField
                  label="Occupied year-round?"
                  value={answers.bills_behaviour.occupied_year_round}
                  options={["Yes", "Seasonal", "Away for long periods", "Varies"]}
                  onChange={(value) =>
                    updateSection("bills_behaviour", "occupied_year_round", value)
                  }
                />
                <SelectField
                  label="Heat/cool rarely used rooms?"
                  value={answers.bills_behaviour.heats_or_cools_rarely_used_rooms}
                  options={["Yes", "Sometimes", "No", "Not sure"]}
                  onChange={(value) =>
                    updateSection(
                      "bills_behaviour",
                      "heats_or_cools_rarely_used_rooms",
                      value
                    )
                  }
                />
                <SelectField
                  label="Doors/windows open while HVAC runs?"
                  value={answers.bills_behaviour.doors_windows_open_while_hvac_runs}
                  options={["Often", "Sometimes", "Rarely", "Never"]}
                  onChange={(value) =>
                    updateSection(
                      "bills_behaviour",
                      "doors_windows_open_while_hvac_runs",
                      value
                    )
                  }
                />
                <SelectField
                  label="Electricity use peaks"
                  value={answers.bills_behaviour.electricity_use_peak}
                  options={["Morning", "Afternoon", "Evening", "Overnight", "Not sure"]}
                  onChange={(value) =>
                    updateSection("bills_behaviour", "electricity_use_peak", value)
                  }
                />
                <SelectField
                  label="Time-of-use pricing?"
                  value={answers.bills_behaviour.time_of_use_pricing}
                  options={["Yes", "No", "Not sure"]}
                  onChange={(value) =>
                    updateSection("bills_behaviour", "time_of_use_pricing", value)
                  }
                />
                {answers.bills_behaviour.time_of_use_pricing === "Yes" && (
                  <TextField
                    label="Known peak hours"
                    value={answers.bills_behaviour.known_peak_hours ?? ""}
                    placeholder="e.g. 4-9 PM"
                    onChange={(value) =>
                      updateSection(
                        "bills_behaviour",
                        "known_peak_hours",
                        value || null
                      )
                    }
                  />
                )}
              </div>

              {answers.bills_behaviour.bills_increased_noticeably === "Yes" && (
                <CheckboxGroup
                  label="What changed around the time bills increased?"
                  values={answers.bills_behaviour.changes_when_bills_increased}
                  options={BILL_CHANGE_REASONS}
                  onChange={(values) =>
                    updateSection(
                      "bills_behaviour",
                      "changes_when_bills_increased",
                      values
                    )
                  }
                />
              )}
            </div>
          </Section>
        </div>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#dbe8f2] bg-gradient-to-br from-white via-[#f7fbff] to-[#e9f6fe] p-6 shadow-xl sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#17356f]">
                Ready to analyse
              </p>
              <h2 className="mt-2 text-3xl font-black text-black">
                Build your US home energy report
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Your answers are checked by the deterministic engine first. AI
                then turns the validated findings into a clear report and reviews
                any photos you uploaded for reliable supporting evidence.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.recommendations.slice(0, 4).map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full bg-[#e9f6fe] px-3 py-2 text-xs font-bold text-[#17356f]"
                  >
                    {item.group}: {item.title}
                  </span>
                ))}
                {analysis.recommendations.length === 0 && (
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                    Complete the questions to surface targeted findings
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="w-full rounded-full bg-[#ffd600] px-8 py-4 text-base font-black text-black shadow-lg transition hover:bg-[#ffea5c] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
            >
              {saving
                ? "AI is reviewing your assessment..."
                : "Generate My AI-Assisted Report"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
