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
  "Do you have a garage?",
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
  "How often does someone work from home?",
  "New appliance",
  "HVAC change",
  "Rate increase",
  "Weather",
  "Not sure",
];

const ASSESSMENT_SECTIONS = [
  "Your Home",
  "Heating & Cooling",
  "Hot Water",
  "Appliances",
  "Outdoor",
  "Solar & EV",
  "Your Bills",
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
    <label
      className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-bold transition ${value ? "border-[#17356f] bg-[#e9f6fe] text-[#17356f] shadow-sm" : "border-[#dbe8f2] bg-[#f7fbff] text-slate-700"}`}
    >
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
            className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-semibold transition ${values.includes(option) ? "border-[#17356f] bg-[#e9f6fe] text-[#17356f] shadow-sm" : "border-[#dbe8f2] bg-[#f7fbff] text-slate-700"}`}
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
  const [activeSection, setActiveSection] = useState(1);

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

  useEffect(() => {
    const sections = Array.from({ length: ASSESSMENT_SECTIONS.length }, (_, index) =>
      document.getElementById(`assessment-section-${index + 1}`)
    ).filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const number = Number(visible.target.id.replace("assessment-section-", ""));
        if (Number.isFinite(number)) setActiveSection(number);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.05, 0.2, 0.5] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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

  function updateDo you have a garage?(value: string) {
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

  const isAttachedDo you have a garage? = answers.home.garage_type === "Attached";
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
                Home Energy Checkup
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
                How it works
              </p>
              <div className="mt-8 grid gap-4">
                <div className="rounded-[1.5rem] bg-white/10 p-5">
                  <p className="text-xs font-black uppercase text-white/60">
                    Quick sections
                  </p>
                  <p className="mt-2 text-5xl font-black">7</p>
                </div>
                <div className="rounded-[1.5rem] bg-[#ffd600] p-5 text-black">
                  <p className="text-xs font-black uppercase opacity-70">
                    Our promise
                  </p>
                  <p className="mt-2 text-xl font-black">
                    Start with the simple fix before the expensive upgrade.
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-white p-5 text-black">
                  <p className="text-xs font-black uppercase text-slate-500">
                    Climate
                  </p>
                  <p className="mt-2 text-xl font-black">
                    Matched to your local climate
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
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black transition ${activeSection === index + 1 ? "bg-[#17356f] text-white shadow-sm" : "text-[#17356f] hover:bg-[#e9f6fe]"}`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${activeSection === index + 1 ? "bg-white text-[#17356f]" : "bg-[#17356f] text-white"}`}>
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
            This gives you practical guidance for your home. It is not a contractor inspection or engineering report. If you do not know an answer, choose “Not sure” or leave optional numbers blank — guessing can make the advice less useful.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <Section
            number={1}
            title="Your Home & Comfort"
            description="Tell us the basics about your home and anything that feels uncomfortable, drafty, too hot or too cold."
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
                label="About how large is your home?"
                value={answers.home.home_size_band}
                options={US_HOME_SIZE_BANDS}
                onChange={(value) => updateSection("home", "home_size_band", value)}
              />
              <SelectField
                label="How many people live here?"
                value={answers.home.occupants}
                options={US_OCCUPANT_BANDS}
                onChange={(value) => updateSection("home", "occupants", value)}
              />
              <SelectField
                label="What is underneath the home?"
                value={answers.home.foundation}
                options={US_FOUNDATION_TYPES}
                onChange={(value) => updateSection("home", "foundation", value)}
              />
              <SelectField
                label="Do you have a garage?"
                value={answers.home.garage_type}
                options={US_GARAGE_TYPES}
                onChange={updateDo you have a garage?}
              />

              {isAttachedDo you have a garage? && (
                <SelectField
                  label="Is there a room above or next to the attached garage?"
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
                label="What type of windows do you mostly have?"
                value={answers.home.windows}
                options={US_WINDOW_TYPES}
                onChange={(value) => updateSection("home", "windows", value)}
              />
              <SelectField
                label="About how old are most of the windows?"
                value={answers.home.window_age_band}
                options={US_WINDOW_AGE_BANDS}
                onChange={(value) => updateSection("home", "window_age_band", value)}
              />
            </div>

            <div className="mt-6 grid gap-6">
              <CheckboxGroup
                label="Do you notice any of these window or door problems?"
                values={answers.home.window_door_issues}
                options={WINDOW_DOOR_ISSUES}
                onChange={(values) =>
                  updateSection("home", "window_door_issues", values)
                }
              />

              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="What do you usually use on sunny windows?"
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
                  label="Do you close blinds or curtains before strong summer sun hits?"
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
                  label="Is any room usually much hotter or colder than the rest of the home?"
                  value={answers.home.rooms_consistently_hot_or_cold}
                  options={["No", "Yes", "Not sure"]}
                  onChange={(value) =>
                    updateSection("home", "rooms_consistently_hot_or_cold", value)
                  }
                />
              </div>

              {answers.home.rooms_consistently_hot_or_cold === "Yes" && (
                <CheckboxGroup
                  label="Where is the uncomfortable room?"
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
            title="Heating & Cooling"
            description="Tell us how you heat and cool the home, how you use the thermostat, and whether anything seems wrong."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="What mainly heats your home?"
                value={answers.hvac.main_heating}
                options={US_HEATING_TYPES}
                onChange={(value) =>
                  updateSection("hvac", "main_heating", value)
                }
              />
              <SelectField
                label="What mainly cools your home?"
                value={answers.hvac.main_cooling}
                options={US_COOLING_TYPES}
                onChange={(value) =>
                  updateSection("hvac", "main_cooling", value)
                }
              />
              <SelectField
                label="About how old is the main heating/cooling equipment?"
                value={answers.hvac.system_age_band}
                options={US_SYSTEM_AGE_BANDS}
                onChange={(value) =>
                  updateSection("hvac", "system_age_band", value)
                }
              />
              <SelectField
                label="What type of thermostat do you have?"
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
                label="Usual summer thermostat setting"
                value={answers.hvac.summer_setpoint_f}
                min={55}
                max={90}
                suffix="°F"
                onChange={(value) =>
                  updateSection("hvac", "summer_setpoint_f", value)
                }
              />
              <NumberField
                label="Usual winter thermostat setting"
                value={answers.hvac.winter_setpoint_f}
                min={50}
                max={85}
                suffix="°F"
                onChange={(value) =>
                  updateSection("hvac", "winter_setpoint_f", value)
                }
              />
              <SelectField
                label="Do you change the thermostat when you’re away or asleep?"
                value={answers.hvac.setback_when_away_or_sleeping}
                options={["Automatically", "Usually", "Sometimes", "Rarely", "Never"]}
                onChange={(value) =>
                  updateSection("hvac", "setback_when_away_or_sleeping", value)
                }
              />
              <SelectField
                label="How often do you check or replace the air filter?"
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
                label="Are any heating/cooling vents blocked by furniture, rugs or belongings?"
                value={answers.hvac.blocked_supply_or_return_vents}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) =>
                  updateSection("hvac", "blocked_supply_or_return_vents", value)
                }
              />
              <SelectField
                label="Where do most of the air ducts run?"
                value={answers.hvac.duct_location}
                options={[
                  "Conditioned space",
                  "Attic",
                  "Crawlspace",
                  "Basement",
                  "Do you have a garage?",
                  "Combination",
                  "Not sure",
                ]}
                onChange={(value) =>
                  updateSection("hvac", "duct_location", value)
                }
              />
              <SelectField
                label="How often do you use ceiling fans?"
                value={answers.hvac.ceiling_fan_use}
                options={["Regularly", "Sometimes", "Rarely", "No"]}
                onChange={(value) =>
                  updateSection("hvac", "ceiling_fan_use", value)
                }
              />
              {answers.hvac.ceiling_fan_use !== "No" && (
                <SelectField
                  label="Do you turn ceiling fans off when nobody is in the room?"
                  value={answers.hvac.turns_off_fans_in_empty_rooms}
                  options={["Usually", "Sometimes", "Rarely", "Never", "N/A"]}
                  onChange={(value) =>
                    updateSection("hvac", "turns_off_fans_in_empty_rooms", value)
                  }
                />
              )}
              <SelectField
                label="How often do you use portable space heaters?"
                value={answers.hvac.portable_space_heater_use}
                options={["Never", "Occasionally", "Regularly", "Several rooms"]}
                onChange={(value) =>
                  updateSection("hvac", "portable_space_heater_use", value)
                }
              />
              {isHeatPump && (
                <SelectField
                  label="How often do you see AUX or Emergency Heat?"
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
                label="Have you noticed any of these heating or cooling problems?"
                values={answers.hvac.symptoms}
                options={HVAC_SYMPTOMS}
                onChange={(values) => updateSection("hvac", "symptoms", values)}
              />
            </div>
          </Section>

          <Section
            number={3}
            title="Hot Water"
            description="A few simple hot-water habits and problems can matter more than the age of the water heater."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="What heats your water?"
                value={answers.water_heating.type}
                options={US_WATER_HEATING_TYPES}
                onChange={(value) =>
                  updateSection("water_heating", "type", value)
                }
              />
              <SelectField
                label="About how old is it?"
                value={answers.water_heating.age_band}
                options={["Under 5", "5-10", "10-15", "15+ years", "Not sure"]}
                onChange={(value) =>
                  updateSection("water_heating", "age_band", value)
                }
              />
              <SelectField
                label="Water-heater temperature"
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
                label="About how many showers does the household take each day?"
                value={answers.water_heating.showers_per_day}
                options={["1-2", "3-4", "5-6", "7+", "Not sure"]}
                onChange={(value) =>
                  updateSection("water_heating", "showers_per_day", value)
                }
              />
              <SelectField
                label="How long is a typical shower?"
                value={answers.water_heating.shower_length}
                options={["Under 5 min", "5-10", "10-15", "Over 15", "Varies"]}
                onChange={(value) =>
                  updateSection("water_heating", "shower_length", value)
                }
              />
              <SelectField
                label="Does your household mostly take showers or baths?"
                value={answers.water_heating.showers_or_baths}
                options={["Showers", "Baths", "Mixture"]}
                onChange={(value) =>
                  updateSection("water_heating", "showers_or_baths", value)
                }
              />
              <SelectField
                label="Do you have water-saving showerheads?"
                value={answers.water_heating.low_flow_showerheads}
                options={["Yes", "No", "Some", "Not sure"]}
                onChange={(value) =>
                  updateSection("water_heating", "low_flow_showerheads", value)
                }
              />
              <SelectField
                label="Does any hot-water faucet or shower drip?"
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
                label="Do you wait a long time for hot water at a faucet or shower?"
                value={answers.water_heating.long_hot_water_wait}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) =>
                  updateSection("water_heating", "long_hot_water_wait", value)
                }
              />
              <SelectField
                label="Do you have a hot-water recirculation system?"
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
                label="Are the hot-water pipes you can see insulated?"
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
                label="Where is the water heater?"
                value={answers.water_heating.water_heater_location}
                options={[
                  "Conditioned space",
                  "Basement",
                  "Do you have a garage?",
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
                label="How often do you run out of hot water?"
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
            title="Appliances & Everyday Energy Use"
            description="Tell us about the appliances and electronics you use regularly. We are looking for avoidable use, not excuses to replace working equipment."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="How many refrigerators are used regularly?"
                value={answers.appliances.refrigerators_in_regular_use}
                options={["1", "2", "3+", "Not sure"]}
                onChange={(value) =>
                  updateSection("appliances", "refrigerators_in_regular_use", value)
                }
              />
              <SelectField
                label="About how old is the extra fridge or freezer?"
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
                label="How do you usually dry clothes?"
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
                label="How many dryer loads do you run in a typical week?"
                value={answers.appliances.dryer_loads_per_week}
                options={["<3", "3-5", "6-10", "10+"]}
                onChange={(value) =>
                  updateSection("appliances", "dryer_loads_per_week", value)
                }
              />
              <SelectField
                label="Do clothes often need a second drying cycle?"
                value={answers.appliances.multiple_drying_cycles}
                options={["Often", "Sometimes", "Rarely", "Never"]}
                onChange={(value) =>
                  updateSection("appliances", "multiple_drying_cycles", value)
                }
              />
              <SelectField
                label="How often do you use the dishwasher’s heated-dry setting?"
                value={answers.appliances.dishwasher_heated_dry}
                options={["Always", "Sometimes", "Rarely", "Never/air dry", "Not sure"]}
                onChange={(value) =>
                  updateSection("appliances", "dishwasher_heated_dry", value)
                }
              />
              <SelectField
                label="How often do you run the dishwasher?"
                value={answers.appliances.dishwasher_frequency}
                options={["<1/day", "About 1/day", ">1/day"]}
                onChange={(value) =>
                  updateSection("appliances", "dishwasher_frequency", value)
                }
              />
              <SelectField
                label="What temperature do you usually wash clothes at?"
                value={answers.appliances.laundry_wash_temperature}
                options={["Cold", "Warm", "Hot", "Mixed"]}
                onChange={(value) =>
                  updateSection("appliances", "laundry_wash_temperature", value)
                }
              />
              <SelectField
                label="Do you often run the dishwasher or washer before it is full?"
                value={answers.appliances.partial_loads}
                options={["Yes", "Sometimes", "Rarely", "No"]}
                onChange={(value) =>
                  updateSection("appliances", "partial_loads", value)
                }
              />
              <SelectField
                label="How often does someone work from home?"
                value={answers.appliances.work_from_home_frequency}
                options={["No", "1-2 days/week", "3-4", "5+"]}
                onChange={(value) =>
                  updateSection("appliances", "work_from_home_frequency", value)
                }
              />
              <SelectField
                label="Are TVs, computers or gaming equipment left on when nobody is using them?"
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
                label="How are outdoor or security lights controlled?"
                value={answers.appliances.outdoor_security_lighting}
                options={["Dusk-to-dawn", "Motion", "Manual", "No", "Not sure"]}
                onChange={(value) =>
                  updateSection("appliances", "outdoor_security_lighting", value)
                }
              />
            </div>

            <div className="mt-6 grid gap-6">
              <CheckboxGroup
                label="Where is the extra fridge or freezer?"
                values={answers.appliances.extra_cold_storage_location}
                options={COLD_STORAGE_LOCATIONS}
                onChange={(values) =>
                  updateSection("appliances", "extra_cold_storage_location", values)
                }
              />
              <CheckboxGroup
                label="Do you use any other fridges or freezers?"
                values={answers.appliances.other_cold_storage}
                options={OTHER_COLD_STORAGE}
                onChange={(values) =>
                  updateSection("appliances", "other_cold_storage", values)
                }
              />
              <CheckboxGroup
                label="What do you cook with most often?"
                values={answers.appliances.main_cooking_equipment}
                options={COOKING_EQUIPMENT}
                onChange={(values) =>
                  updateSection("appliances", "main_cooking_equipment", values)
                }
              />
              <CheckboxGroup
                label="Which electronics are used a lot in your home?"
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
                label="Do any of these run for long periods or all the time?"
                values={answers.appliances.other_continuous_loads}
                options={CONTINUOUS_LOADS}
                onChange={(values) =>
                  updateSection("appliances", "other_continuous_loads", values)
                }
              />

              <div className="rounded-2xl border border-dashed border-[#59b9ec] bg-[#f7fbff] p-5">
                <h3 className="font-black text-[#17356f]">
                  Optional appliance or equipment photos
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You can add up to 5 clear photos of appliance labels or equipment nameplates. We’ll use readable details to improve the report. A photo will never trigger a replacement recommendation on its own.
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
            title="Pool, Spa & Outdoor"
            description="These can use a lot of energy in some homes, so we’ll only ask about what you actually have."
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
                label="Do you have a garage?-door use"
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
                label="Do you have a garage? equipment"
                values={answers.outdoor.garage_equipment}
                options={GARAGE_EQUIPMENT}
                onChange={(values) =>
                  updateSection("outdoor", "garage_equipment", values)
                }
              />
              <CheckboxGroup
                label="Do you have any of these larger or unusual energy users?"
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
            description="We’ll only suggest looking at solar when your answers make it relevant. We won’t guess at system size or savings."
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
                label="Are you interested in rooftop solar?"
                value={answers.solar_battery_ev.solar_interest}
                options={["Yes", "Maybe", "No"]}
                onChange={(value) =>
                  updateSection("solar_battery_ev", "solar_interest", value)
                }
              />
              <SelectField
                label="Can you personally approve rooftop solar for this home?"
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
                  label="Which direction does most usable roof space face?"
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
                  label="How shaded is the roof?"
                  value={answers.solar_battery_ev.roof_shading}
                  options={["Little/none", "Some", "Heavy", "Not sure"]}
                  onChange={(value) =>
                    updateSection("solar_battery_ev", "roof_shading", value)
                  }
                />
                <SelectField
                  label="How much usable roof space is available?"
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
                label="What would you want a home battery to do?"
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
                label="Do you have an electric or plug-in hybrid vehicle?"
                value={answers.solar_battery_ev.ev_phev}
                options={["Yes", "No", "Planning"]}
                onChange={updateEv}
              />
            </div>

            {hasEv && (
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <SelectField
                  label="How do you usually charge at home?"
                  value={answers.solar_battery_ev.home_charging_type}
                  options={["120V/Level 1", "Level 2", "Mostly public", "Not sure"]}
                  onChange={(value) =>
                    updateSection("solar_battery_ev", "home_charging_type", value)
                  }
                />
                <SelectField
                  label="When do you usually charge?"
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
                  label="Does your electric plan offer cheaper hours for EV charging?"
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
            title="Your Energy Bills & Habits"
            description="Your bills help us understand where the money is going. Add the numbers you know and leave the rest blank."
          >
            <div className="grid gap-6">
              <CheckboxGroup
                label="Which energy sources does your home use?"
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
                  label="Typical monthly electric bill"
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
                  label="Highest monthly electric bill"
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
                  label="Typical monthly electricity use, if shown on your bill"
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
                  label="Annual electricity use, if known"
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
                  label="Electricity price per kWh, if known"
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
                    label="About how much do you spend on heating oil each year?"
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
                    label="About how many gallons of heating oil do you use each year?"
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
                    label="Heating-oil price per gallon, if known"
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
                  label="When are your energy bills usually highest?"
                  value={answers.bills_behaviour.bills_highest}
                  options={["Summer", "Winter", "Similar all year", "Varies", "Not sure"]}
                  onChange={(value) =>
                    updateSection("bills_behaviour", "bills_highest", value)
                  }
                />
                <SelectField
                  label="Have your energy bills risen noticeably?"
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
                  label="Is someone usually home during the day?"
                  value={answers.bills_behaviour.daytime_occupancy}
                  options={["Most days", "Several days/week", "Rarely", "Varies"]}
                  onChange={(value) =>
                    updateSection("bills_behaviour", "daytime_occupancy", value)
                  }
                />
                <SelectField
                  label="Is the home lived in year-round?"
                  value={answers.bills_behaviour.occupied_year_round}
                  options={["Yes", "Seasonal", "Away for long periods", "Varies"]}
                  onChange={(value) =>
                    updateSection("bills_behaviour", "occupied_year_round", value)
                  }
                />
                <SelectField
                  label="Do you heat or cool rooms that are rarely used?"
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
                  label="Are doors or windows left open while heating or cooling is running?"
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
                  label="When do you think your electricity use is highest?"
                  value={answers.bills_behaviour.electricity_use_peak}
                  options={["Morning", "Afternoon", "Evening", "Overnight", "Not sure"]}
                  onChange={(value) =>
                    updateSection("bills_behaviour", "electricity_use_peak", value)
                  }
                />
                <SelectField
                  label="Does your electricity price change by time of day?"
                  value={answers.bills_behaviour.time_of_use_pricing}
                  options={["Yes", "No", "Not sure"]}
                  onChange={(value) =>
                    updateSection("bills_behaviour", "time_of_use_pricing", value)
                  }
                />
                {answers.bills_behaviour.time_of_use_pricing === "Yes" && (
                  <TextField
                    label="If you know them, what are the expensive peak hours?"
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
                Ready for your plan
              </p>
              <h2 className="mt-2 text-3xl font-black text-black">
                See what to do first in your home
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                We’ll compare your answers with the home-energy rules, put the most useful actions first, and use AI to turn the results into a clear report. If you uploaded photos, AI will also read useful label details.
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
                ? "Building your home energy plan..."
                : "Create My Home Energy Plan"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
