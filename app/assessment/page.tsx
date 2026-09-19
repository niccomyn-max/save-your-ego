"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createDefaultUSAssessmentAnswers } from "@/lib/assessment/usa/defaults";
import {
  USAssessmentAnswers,
  US_BUILD_YEAR_BANDS,
  US_COOLING_TYPES,
  US_ENERGY_SOURCES,
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

type USNarrativeReport = {
  bottom_line?: string;
  home_energy_snapshot?: string;
  fuel_specific_findings?: string[];
  solar_battery_ev_findings?: string[];
  positive_findings?: string[];
  what_to_check_next?: string[];
  assumptions_and_limits?: string[];
};

const WINDOW_DOOR_ISSUES = [
  "Drafts",
  "Visible gaps/worn seals",
  "Condensation",
  "Hot sun-facing rooms",
  "Cold areas near windows",
  "None",
  "Not sure",
];

const HOT_COLD_LOCATIONS = [
  "Bedroom",
  "Upstairs",
  "Room over garage",
  "Basement",
  "Addition",
  "Sun-facing room",
  "Other",
];

const HVAC_SYMPTOMS = [
  "Hot rooms",
  "Cold rooms",
  "Weak airflow",
  "Long runtimes",
  "Short cycling",
  "High summer bills",
  "High winter bills",
  "None",
  "Not sure",
];

const EXTRA_COLD_STORAGE = [
  "Refrigerator",
  "Freezer",
  "Both",
  "No",
  "Not sure",
];

const OTHER_COLD_STORAGE = [
  "Chest freezer",
  "Wine cooler",
  "Beverage fridge",
  "Ice maker",
  "Mini fridge",
  "None",
];

const COOKING_EQUIPMENT = [
  "Electric range",
  "Gas range",
  "Induction",
  "Wall oven",
  "Toaster oven",
  "Air fryer",
  "Microwave",
  "Mixed",
];

const COMPUTING_LOADS = [
  "Gaming PC",
  "Multiple consoles",
  "Large TV/home theater",
  "Multiple monitors",
  "Home server/NAS",
  "None",
];

const CONTINUOUS_LOADS = [
  "Space heaters",
  "Dehumidifiers",
  "Humidifiers",
  "Air purifiers",
  "Aquarium equipment",
  "Heated bedding",
  "None",
];

const GARAGE_EQUIPMENT = [
  "Refrigerator",
  "Freezer",
  "EV charger",
  "Workshop equipment",
  "Water heater",
  "Laundry",
  "HVAC",
  "None",
];

const UNUSUAL_LOADS = [
  "Heated driveway",
  "Roof/gutter heat cables",
  "Outdoor electric heaters",
  "Heated garage",
  "Detached workshop",
  "Large fountain/water feature",
  "None",
];

const BILL_CHANGE_REASONS = [
  "New appliance",
  "HVAC",
  "EV",
  "Pool/spa",
  "More people",
  "Work from home",
  "Addition",
  "Utility rates",
  "Nothing obvious",
  "Other",
];

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-[#dbe8f2] border-t-8 border-t-[#17356f] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#17356f] text-sm font-black text-white">
          {number}
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#17356f]">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
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
        className="rounded-xl border border-[#dbe8f2] bg-white px-3 py-3 font-normal text-slate-900 shadow-sm outline-none focus:border-[#59b9ec]"
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
  min,
  max,
  step = 1,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
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
        className="rounded-xl border border-[#dbe8f2] bg-white px-3 py-3 font-normal text-slate-900 shadow-sm outline-none focus:border-[#59b9ec]"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        type="text"
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[#dbe8f2] bg-white px-3 py-3 font-normal text-slate-900 shadow-sm outline-none focus:border-[#59b9ec]"
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

function MultiCheck({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}) {
  function toggle(option: string) {
    const exclusive = option === "None" || option === "No" || option === "Not sure";
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
      return;
    }
    if (exclusive) {
      onChange([option]);
      return;
    }
    onChange(
      [...value.filter((item) => !["None", "No", "Not sure"].includes(item)), option]
    );
  }

  return (
    <fieldset className="rounded-2xl border border-[#dbe8f2] bg-[#fbfdff] p-4">
      <legend className="px-1 text-sm font-black text-slate-700">{label}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 rounded-xl border border-[#dbe8f2] bg-white px-3 py-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={() => toggle(option)}
              className="accent-[#17356f]"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function subsection(title: string) {
  return (
    <h3 className="mt-2 text-lg font-black text-black first:mt-0">{title}</h3>
  );
}

export default function AssessmentPage() {
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

  function updateSection(
    section: keyof USAssessmentAnswers,
    key: string,
    value: unknown
  ) {
    setAnswers((current) => ({
      ...current,
      [section]: {
        ...(current[section] as Record<string, unknown>),
        [key]: value,
      },
    }));
  }

  function updateHome(key: string, value: unknown) {
    updateSection("home", key, value);
  }
  function updateHvac(key: string, value: unknown) {
    updateSection("hvac", key, value);
  }
  function updateWater(key: string, value: unknown) {
    updateSection("water_heating", key, value);
  }
  function updateAppliances(key: string, value: unknown) {
    updateSection("appliances", key, value);
  }
  function updateOutdoor(key: string, value: unknown) {
    updateSection("outdoor", key, value);
  }
  function updateSolar(key: string, value: unknown) {
    updateSection("solar_battery_ev", key, value);
  }
  function updateBills(key: string, value: unknown) {
    updateSection("bills_behaviour", key, value);
  }

  async function compressImage(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new window.Image();

        image.onload = () => {
          const max = 1200;
          let width = image.width;
          let height = image.height;

          if (width > max || height > max) {
            const scale = Math.min(max / width, max / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Unable to process image"));
            return;
          }

          context.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };

        image.onerror = () => reject(new Error("Unable to read image"));
        image.src = String(reader.result);
      };

      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotos(files: FileList | null) {
    if (!files) return;

    const selected = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 5);

    const converted: UploadedPhoto[] = [];

    for (const file of selected) {
      try {
        converted.push({
          name: file.name,
          mimeType: "image/jpeg",
          dataUrl: await compressImage(file),
        });
      } catch {
        // Ignore unreadable optional photos.
      }
    }

    setUploadedPhotos(converted);
  }

  async function handleSubmit() {
    if (saving) return;

    const zip = answers.home.zip_code.replace(/\D/g, "");
    if (zip.length !== 5) {
      setErrorMessage("Enter a valid 5-digit ZIP code before generating the report.");
      return;
    }

    if (!hasPaidAccess) {
      setErrorMessage("Paid access is required to save and view a report.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("You need to be signed in to save an assessment.");
        return;
      }

      const aiResponse = await fetch("/api/generate-assessment-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: {
            ...answers,
            home: {
              ...answers.home,
              zip_code: zip,
            },
          },
          photos: uploadedPhotos,
        }),
      });

      const aiData = (await aiResponse.json()) as {
        error?: string;
        reportText?: string;
        report?: USNarrativeReport;
        analysis?: Record<string, unknown>;
      };

      if (!aiResponse.ok || !aiData.analysis) {
        setErrorMessage(aiData.error || "Failed to generate the USA assessment.");
        return;
      }

      const { data: savedAssessment, error: saveError } = await supabase
        .from("assessments")
        .insert({
          user_id: user.id,
          answers: {
            ...answers,
            home: {
              ...answers.home,
              zip_code: zip,
            },
            uploaded_photo_count: uploadedPhotos.length,
          },
          scores: aiData.analysis,
        })
        .select("id")
        .single();

      if (saveError || !savedAssessment) {
        setErrorMessage(saveError?.message || "Failed to save assessment.");
        return;
      }

      if (aiData.reportText) {
        const { error: reportError } = await supabase.from("reports").insert({
          user_id: user.id,
          assessment_id: savedAssessment.id,
          report_text: aiData.reportText,
        });

        if (reportError) {
          setErrorMessage(reportError.message);
          return;
        }
      }

      router.push(`/report/${savedAssessment.id}`);
      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while generating the assessment. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (checkingAccess) {
    return (
      <main className="min-h-screen bg-[#f7fbff] px-5 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="font-black text-[#17356f]">Checking access...</p>
        </div>
      </main>
    );
  }

  if (!hasPaidAccess) {
    return (
      <main className="min-h-screen bg-[#f7fbff] px-5 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-black text-[#17356f]">
            Paid access required
          </h1>
          <p className="mt-4 text-slate-600">
            Sign in with the email used at checkout, or complete payment to unlock
            the Save Your EGO assessment.
          </p>
          <a
            href="https://www.saveyourego.com/"
            className="mt-6 inline-flex rounded-full bg-[#17356f] px-7 py-3 font-black text-white"
          >
            Unlock My Report
          </a>
        </div>
      </main>
    );
  }

  const isAttachedGarage = answers.home.garage_type === "Attached";
  const isHeatPump = answers.hvac.main_heating === "Heat pump";
  const hasExtraFridge =
    answers.appliances.refrigerators_in_regular_use === "2" ||
    answers.appliances.refrigerators_in_regular_use === "3+";
  const apartmentOrCondo =
    answers.home.home_type === "Apartment" || answers.home.home_type === "Condo";
  const showSolarRoof =
    answers.solar_battery_ev.solar_interest !== "No" &&
    answers.home.home_type !== "Apartment" &&
    answers.solar_battery_ev.authority_to_install_solar !== "No";
  const showEV =
    answers.solar_battery_ev.ev_phev === "Yes" ||
    answers.solar_battery_ev.ev_phev === "Planning";
  const energySources = answers.bills_behaviour.energy_sources;

  return (
    <main className="min-h-screen bg-[#f7fbff] px-4 py-6 text-[#050505] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-[#dbe8f2] bg-white shadow-xl shadow-[#17356f]/10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-9">
              <Image
                src="/save-your-ego-logo.png"
                alt="Save Your EGO"
                width={300}
                height={115}
                priority
                className="h-auto w-64"
              />
              <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-[#17356f]">
                USA home energy assessment
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-black sm:text-5xl">
                Find the waste before you buy the upgrade
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                We look for no-cost actions, controls, maintenance, hidden loads
                and targeted checks before recommending major spending.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#17356f] via-[#0d4f78] to-black p-7 text-white sm:p-9">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ffd600]">
                Core rule
              </p>
              <p className="mt-5 text-3xl font-black leading-tight">
                Fix the $20 problem before the $20,000 solution.
              </p>
              <div className="mt-7 rounded-2xl bg-white/10 p-5 text-sm leading-6 text-white/85">
                Your ZIP is used behind the scenes to adjust climate weighting.
                Equipment age alone never triggers replacement.
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-6">
          <Section
            number="1"
            title="Your Home"
            description="Home type, size, windows, garage and comfort patterns establish what you can control and where losses may occur."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <TextField
                label="ZIP code"
                value={answers.home.zip_code}
                required
                placeholder="e.g. 85001"
                onChange={(value) => updateHome("zip_code", value.replace(/\D/g, "").slice(0, 5))}
              />
              <SelectField
                label="Home type"
                value={answers.home.home_type}
                options={US_HOME_TYPES}
                onChange={(value) => {
                  updateHome("home_type", value);
                  if (value === "Apartment") {
                    updateSolar("authority_to_install_solar", "No");
                    updateSolar("solar_interest", "No");
                  } else if (value === "Condo") {
                    updateSolar("authority_to_install_solar", "Shared/HOA/condo");
                  }
                }}
              />
              <SelectField
                label="When was the home built?"
                value={answers.home.build_year_band}
                options={US_BUILD_YEAR_BANDS}
                onChange={(value) => updateHome("build_year_band", value)}
              />
              <SelectField
                label="Approximate home size"
                value={answers.home.home_size_band}
                options={US_HOME_SIZE_BANDS}
                onChange={(value) => updateHome("home_size_band", value)}
              />
              <SelectField
                label="People in the home"
                value={answers.home.occupants}
                options={US_OCCUPANT_BANDS}
                onChange={(value) => updateHome("occupants", value)}
              />
              <SelectField
                label="What is underneath most of the home?"
                value={answers.home.foundation}
                options={US_FOUNDATION_TYPES}
                onChange={(value) => updateHome("foundation", value)}
              />
              <SelectField
                label="Garage"
                value={answers.home.garage_type}
                options={US_GARAGE_TYPES}
                onChange={(value) => {
                  updateHome("garage_type", value);
                  if (value !== "Attached") {
                    updateHome("rooms_above_or_beside_attached_garage", "N/A");
                  }
                }}
              />
              {isAttachedGarage && (
                <SelectField
                  label="Conditioned room above/beside garage?"
                  value={answers.home.rooms_above_or_beside_attached_garage}
                  options={["Yes", "No", "Not sure"]}
                  onChange={(value) =>
                    updateHome("rooms_above_or_beside_attached_garage", value)
                  }
                />
              )}
              <SelectField
                label="Windows"
                value={answers.home.windows}
                options={US_WINDOW_TYPES}
                onChange={(value) => updateHome("windows", value)}
              />
              <SelectField
                label="Age of most windows"
                value={answers.home.window_age_band}
                options={US_WINDOW_AGE_BANDS}
                onChange={(value) => updateHome("window_age_band", value)}
              />
              <SelectField
                label="Sunny-window coverings"
                value={answers.home.sunny_window_coverings}
                options={[
                  "Curtains",
                  "Blinds/shades",
                  "Exterior shutters/awnings",
                  "Solar screens/window film",
                  "Nothing",
                  "Mixture",
                ]}
                onChange={(value) => updateHome("sunny_window_coverings", value)}
              />
              <SelectField
                label="Close coverings to block strong summer sun?"
                value={answers.home.closes_coverings_for_summer_sun}
                options={["Usually", "Sometimes", "Rarely", "Never", "N/A or not sure"]}
                onChange={(value) =>
                  updateHome("closes_coverings_for_summer_sun", value)
                }
              />
              <SelectField
                label="Any rooms consistently hotter or colder?"
                value={answers.home.rooms_consistently_hot_or_cold}
                options={["No", "Yes", "Not sure"]}
                onChange={(value) => {
                  updateHome("rooms_consistently_hot_or_cold", value);
                  if (value !== "Yes") updateHome("hot_or_cold_room_locations", []);
                }}
              />
            </div>

            <div className="mt-5 grid gap-5">
              <MultiCheck
                label="Window or exterior-door issues"
                value={answers.home.window_door_issues}
                options={WINDOW_DOOR_ISSUES}
                onChange={(value) => updateHome("window_door_issues", value)}
              />
              {answers.home.rooms_consistently_hot_or_cold === "Yes" && (
                <MultiCheck
                  label="Where are the hot/cold rooms?"
                  value={answers.home.hot_or_cold_room_locations}
                  options={HOT_COLD_LOCATIONS}
                  onChange={(value) =>
                    updateHome("hot_or_cold_room_locations", value)
                  }
                />
              )}
            </div>
          </Section>

          <Section
            number="2"
            title="Heating, Air Conditioning & Comfort"
            description="Controls, airflow and symptoms come before equipment replacement."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="Main heating"
                value={answers.hvac.main_heating}
                options={US_HEATING_TYPES}
                onChange={(value) => {
                  updateHvac("main_heating", value);
                  if (value !== "Heat pump") {
                    updateHvac("heat_pump_aux_heat_frequency", "N/A");
                  }
                }}
              />
              <SelectField
                label="Main cooling"
                value={answers.hvac.main_cooling}
                options={US_COOLING_TYPES}
                onChange={(value) => updateHvac("main_cooling", value)}
              />
              <SelectField
                label="Age of main heating/cooling system"
                value={answers.hvac.system_age_band}
                options={US_SYSTEM_AGE_BANDS}
                onChange={(value) => updateHvac("system_age_band", value)}
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
                onChange={(value) => updateHvac("thermostat_type", value)}
              />
              <NumberField
                label="Typical summer setting while home (°F)"
                value={answers.hvac.summer_setpoint_f}
                min={55}
                max={90}
                onChange={(value) => updateHvac("summer_setpoint_f", value)}
              />
              <NumberField
                label="Typical winter setting while home (°F)"
                value={answers.hvac.winter_setpoint_f}
                min={50}
                max={85}
                onChange={(value) => updateHvac("winter_setpoint_f", value)}
              />
              <SelectField
                label="Change thermostat when away/sleeping?"
                value={answers.hvac.setback_when_away_or_sleeping}
                options={["Automatically", "Usually", "Sometimes", "Rarely", "Never"]}
                onChange={(value) =>
                  updateHvac("setback_when_away_or_sleeping", value)
                }
              />
              <SelectField
                label="HVAC filter checked/replaced"
                value={answers.hvac.filter_frequency}
                options={[
                  "Monthly",
                  "Every 2-3 months",
                  "A few times/year",
                  "Rarely",
                  "Not sure",
                ]}
                onChange={(value) => updateHvac("filter_frequency", value)}
              />
              <SelectField
                label="Supply or return vents blocked?"
                value={answers.hvac.blocked_supply_or_return_vents}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) =>
                  updateHvac("blocked_supply_or_return_vents", value)
                }
              />
              <SelectField
                label="Where does most ductwork run?"
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
                onChange={(value) => updateHvac("duct_location", value)}
              />
              <SelectField
                label="Ceiling fan use"
                value={answers.hvac.ceiling_fan_use}
                options={["Regularly", "Sometimes", "Rarely", "No"]}
                onChange={(value) => updateHvac("ceiling_fan_use", value)}
              />
              {answers.hvac.ceiling_fan_use !== "No" && (
                <SelectField
                  label="Turn fans off in empty rooms?"
                  value={answers.hvac.turns_off_fans_in_empty_rooms}
                  options={["Usually", "Sometimes", "Rarely", "Never", "N/A"]}
                  onChange={(value) =>
                    updateHvac("turns_off_fans_in_empty_rooms", value)
                  }
                />
              )}
              <SelectField
                label="Portable space heaters"
                value={answers.hvac.portable_space_heater_use}
                options={["Never", "Occasionally", "Regularly", "Several rooms"]}
                onChange={(value) =>
                  updateHvac("portable_space_heater_use", value)
                }
              />
              {isHeatPump && (
                <SelectField
                  label="Auxiliary/emergency heat runs"
                  value={answers.hvac.heat_pump_aux_heat_frequency}
                  options={["Rarely", "Sometimes", "Frequently", "Not sure"]}
                  onChange={(value) =>
                    updateHvac("heat_pump_aux_heat_frequency", value)
                  }
                />
              )}
            </div>
            <div className="mt-5">
              <MultiCheck
                label="HVAC symptoms"
                value={answers.hvac.symptoms}
                options={HVAC_SYMPTOMS}
                onChange={(value) => updateHvac("symptoms", value)}
              />
            </div>
          </Section>

          <Section
            number="3"
            title="Water Heating"
            description="Usage, controls and simple losses are checked before replacement recommendations."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="Water heating"
                value={answers.water_heating.type}
                options={US_WATER_HEATING_TYPES}
                onChange={(value) => updateWater("type", value)}
              />
              <SelectField
                label="Water-heater age"
                value={answers.water_heating.age_band}
                options={["Under 5", "5-10", "10-15", "15+ years", "Not sure"]}
                onChange={(value) => updateWater("age_band", value)}
              />
              <SelectField
                label="Temperature setting"
                value={answers.water_heating.temperature_band}
                options={["Below 120F", "Around 120F", "121-130F", "Above 130F", "Not sure"]}
                onChange={(value) => updateWater("temperature_band", value)}
              />
              <SelectField
                label="Showers per day"
                value={answers.water_heating.showers_per_day}
                options={["1-2", "3-4", "5-6", "7+", "Not sure"]}
                onChange={(value) => updateWater("showers_per_day", value)}
              />
              <SelectField
                label="Typical shower length"
                value={answers.water_heating.shower_length}
                options={["Under 5 min", "5-10", "10-15", "Over 15", "Varies"]}
                onChange={(value) => updateWater("shower_length", value)}
              />
              <SelectField
                label="Mostly showers or baths?"
                value={answers.water_heating.showers_or_baths}
                options={["Showers", "Baths", "Mixture"]}
                onChange={(value) => updateWater("showers_or_baths", value)}
              />
              <SelectField
                label="Low-flow showerheads"
                value={answers.water_heating.low_flow_showerheads}
                options={["Yes", "No", "Some", "Not sure"]}
                onChange={(value) => updateWater("low_flow_showerheads", value)}
              />
              <SelectField
                label="Hot-water faucets/showerheads drip?"
                value={answers.water_heating.dripping_hot_water_fixtures}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) =>
                  updateWater("dripping_hot_water_fixtures", value)
                }
              />
              <SelectField
                label="Hot water takes a long time to arrive?"
                value={answers.water_heating.long_hot_water_wait}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) => updateWater("long_hot_water_wait", value)}
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
                onChange={(value) => updateWater("recirculation_pump", value)}
              />
              <SelectField
                label="Accessible hot-water pipes insulated?"
                value={answers.water_heating.accessible_hot_water_pipes_insulated}
                options={["Yes", "Some", "No", "Not sure"]}
                onChange={(value) =>
                  updateWater("accessible_hot_water_pipes_insulated", value)
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
                onChange={(value) => updateWater("water_heater_location", value)}
              />
              <SelectField
                label="Run out of hot water?"
                value={answers.water_heating.runs_out_of_hot_water}
                options={["Frequently", "Occasionally", "Rarely", "Never"]}
                onChange={(value) => updateWater("runs_out_of_hot_water", value)}
              />
            </div>
          </Section>

          <Section
            number="4"
            title="Appliances, Laundry, Kitchen & Hidden Electrical Loads"
            description="We focus on material loads and avoid over-prioritising tiny standby usage."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="Refrigerators in regular use"
                value={answers.appliances.refrigerators_in_regular_use}
                options={["1", "2", "3+", "Not sure"]}
                onChange={(value) =>
                  updateAppliances("refrigerators_in_regular_use", value)
                }
              />
              {hasExtraFridge && (
                <SelectField
                  label="Age of extra refrigerator/freezer"
                  value={answers.appliances.extra_cold_storage_age_band ?? "Not sure"}
                  options={["Under 5", "5-10", "10-15", "15+ years", "Not sure"]}
                  onChange={(value) =>
                    updateAppliances("extra_cold_storage_age_band", value)
                  }
                />
              )}
              <SelectField
                label="How do you dry clothes?"
                value={answers.appliances.clothes_dryer_type}
                options={[
                  "Electric dryer",
                  "Gas dryer",
                  "Heat-pump dryer",
                  "Mostly air dry",
                  "Mixture",
                ]}
                onChange={(value) => updateAppliances("clothes_dryer_type", value)}
              />
              <SelectField
                label="Dryer loads per week"
                value={answers.appliances.dryer_loads_per_week}
                options={["<3", "3-5", "6-10", "10+"]}
                onChange={(value) =>
                  updateAppliances("dryer_loads_per_week", value)
                }
              />
              <SelectField
                label="Need more than one drying cycle?"
                value={answers.appliances.multiple_drying_cycles}
                options={["Often", "Sometimes", "Rarely", "Never"]}
                onChange={(value) =>
                  updateAppliances("multiple_drying_cycles", value)
                }
              />
              <SelectField
                label="Dishwasher heated dry"
                value={answers.appliances.dishwasher_heated_dry}
                options={["Always", "Sometimes", "Rarely", "Never/air dry", "Not sure"]}
                onChange={(value) =>
                  updateAppliances("dishwasher_heated_dry", value)
                }
              />
              <SelectField
                label="Dishwasher frequency"
                value={answers.appliances.dishwasher_frequency}
                options={["<1/day", "About 1/day", ">1/day"]}
                onChange={(value) =>
                  updateAppliances("dishwasher_frequency", value)
                }
              />
              <SelectField
                label="Laundry wash temperature"
                value={answers.appliances.laundry_wash_temperature}
                options={["Cold", "Warm", "Hot", "Mixed"]}
                onChange={(value) =>
                  updateAppliances("laundry_wash_temperature", value)
                }
              />
              <SelectField
                label="Regularly run partial loads?"
                value={answers.appliances.partial_loads}
                options={["Yes", "Sometimes", "Rarely", "No"]}
                onChange={(value) => updateAppliances("partial_loads", value)}
              />
              <SelectField
                label="Work from home"
                value={answers.appliances.work_from_home_frequency}
                options={["No", "1-2 days/week", "3-4", "5+"]}
                onChange={(value) =>
                  updateAppliances("work_from_home_frequency", value)
                }
              />
              <SelectField
                label="Entertainment/computing left on unnecessarily?"
                value={answers.appliances.entertainment_left_on_unnecessarily}
                options={["Often", "Sometimes", "Rarely", "Never"]}
                onChange={(value) =>
                  updateAppliances("entertainment_left_on_unnecessarily", value)
                }
              />
              <SelectField
                label="Outdoor/security lighting"
                value={answers.appliances.outdoor_security_lighting}
                options={["Dusk-to-dawn", "Motion", "Manual", "No", "Not sure"]}
                onChange={(value) =>
                  updateAppliances("outdoor_security_lighting", value)
                }
              />
              <SelectField
                label="Electric vehicle"
                value={answers.appliances.electric_vehicle}
                options={["Yes", "No", "Planning soon"]}
                onChange={(value) => updateAppliances("electric_vehicle", value)}
              />
              <SelectField
                label="Time-of-use electricity pricing"
                value={answers.appliances.time_of_use_electricity_pricing}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) =>
                  updateAppliances("time_of_use_electricity_pricing", value)
                }
              />
            </div>

            <div className="mt-5 grid gap-5">
              {hasExtraFridge && (
                <MultiCheck
                  label="Extra refrigerator/freezer location/type"
                  value={answers.appliances.extra_cold_storage_location}
                  options={EXTRA_COLD_STORAGE}
                  onChange={(value) =>
                    updateAppliances("extra_cold_storage_location", value)
                  }
                />
              )}
              <MultiCheck
                label="Other cold-storage appliances"
                value={answers.appliances.other_cold_storage}
                options={OTHER_COLD_STORAGE}
                onChange={(value) => updateAppliances("other_cold_storage", value)}
              />
              <MultiCheck
                label="Main cooking equipment"
                value={answers.appliances.main_cooking_equipment}
                options={COOKING_EQUIPMENT}
                onChange={(value) =>
                  updateAppliances("main_cooking_equipment", value)
                }
              />
              <MultiCheck
                label="High-use computing/entertainment"
                value={answers.appliances.high_use_computing_entertainment}
                options={COMPUTING_LOADS}
                onChange={(value) =>
                  updateAppliances("high_use_computing_entertainment", value)
                }
              />
              <MultiCheck
                label="Other continuous/regular loads"
                value={answers.appliances.other_continuous_loads}
                options={CONTINUOUS_LOADS}
                onChange={(value) =>
                  updateAppliances("other_continuous_loads", value)
                }
              />
            </div>
          </Section>

          <Section
            number="5"
            title="Pool, Spa, Garage, Outdoor & Other Loads"
            description="These questions only matter when the home actually has these loads."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleField
                label="Swimming pool"
                value={answers.outdoor.swimming_pool}
                onChange={(value) => {
                  updateOutdoor("swimming_pool", value);
                  if (!value) {
                    updateOutdoor("pool_pump_type", "N/A");
                    updateOutdoor("pool_pump_runtime", "N/A");
                    updateOutdoor("pool_heating", "N/A");
                    updateOutdoor("pool_cover_use", "N/A");
                  }
                }}
              />
              <ToggleField
                label="Hot tub / spa"
                value={answers.outdoor.hot_tub_spa}
                onChange={(value) => {
                  updateOutdoor("hot_tub_spa", value);
                  if (!value) {
                    updateOutdoor("hot_tub_cover", "N/A");
                    updateOutdoor("hot_tub_kept_hot_continuously", "N/A");
                  }
                }}
              />
              <ToggleField
                label="Irrigation / sprinkler system"
                value={answers.outdoor.irrigation_system}
                onChange={(value) => updateOutdoor("irrigation_system", value)}
              />
            </div>

            {answers.outdoor.swimming_pool && (
              <>
                {subsection("Pool")}
                <div className="mt-3 grid gap-5 md:grid-cols-4">
                  <SelectField
                    label="Pool pump"
                    value={answers.outdoor.pool_pump_type}
                    options={["Single-speed", "Two-speed", "Variable-speed", "Not sure"]}
                    onChange={(value) => updateOutdoor("pool_pump_type", value)}
                  />
                  <SelectField
                    label="Pump runtime"
                    value={answers.outdoor.pool_pump_runtime}
                    options={["Under 4", "4-8", "8-12", ">12 hours/day", "Not sure"]}
                    onChange={(value) => updateOutdoor("pool_pump_runtime", value)}
                  />
                  <SelectField
                    label="Pool heating"
                    value={answers.outdoor.pool_heating}
                    options={["None", "Gas", "Electric resistance", "Heat pump", "Solar", "Not sure"]}
                    onChange={(value) => updateOutdoor("pool_heating", value)}
                  />
                  <SelectField
                    label="Pool cover"
                    value={answers.outdoor.pool_cover_use}
                    options={["Yes", "Sometimes", "No", "N/A"]}
                    onChange={(value) => updateOutdoor("pool_cover_use", value)}
                  />
                </div>
              </>
            )}

            {answers.outdoor.hot_tub_spa && (
              <>
                {subsection("Hot tub / spa")}
                <div className="mt-3 grid gap-5 md:grid-cols-3">
                  <TextField
                    label="Use frequency"
                    value={answers.outdoor.hot_tub_use_frequency ?? ""}
                    placeholder="e.g. weekends"
                    onChange={(value) =>
                      updateOutdoor("hot_tub_use_frequency", value || null)
                    }
                  />
                  <SelectField
                    label="Cover"
                    value={answers.outdoor.hot_tub_cover}
                    options={["Yes", "No", "Not sure"]}
                    onChange={(value) => updateOutdoor("hot_tub_cover", value)}
                  />
                  <SelectField
                    label="Kept hot continuously?"
                    value={answers.outdoor.hot_tub_kept_hot_continuously}
                    options={["Yes", "No", "Not sure"]}
                    onChange={(value) =>
                      updateOutdoor("hot_tub_kept_hot_continuously", value)
                    }
                  />
                </div>
              </>
            )}

            {subsection("Garage and outdoor")}
            <div className="mt-3 grid gap-5 md:grid-cols-3">
              <SelectField
                label="Garage door use"
                value={
                  answers.home.garage_type === "No garage" ||
                  answers.home.garage_type === "Carport"
                    ? "N/A"
                    : answers.outdoor.garage_door_use
                }
                options={
                  answers.home.garage_type === "No garage" ||
                  answers.home.garage_type === "Carport"
                    ? ["N/A"]
                    : ["Several times/day", "Once/twice/day", "Occasionally"]
                }
                onChange={(value) => updateOutdoor("garage_door_use", value)}
              />
              <SelectField
                label="Outdoor lighting control"
                value={answers.outdoor.outdoor_lighting_control}
                options={["Motion", "Dusk-to-dawn", "Timer", "Manual", "None"]}
                onChange={(value) =>
                  updateOutdoor("outdoor_lighting_control", value)
                }
              />
              <SelectField
                label="Landscape/decorative lighting"
                value={answers.outdoor.landscape_lighting}
                options={["LED", "Mostly LED", "Older/non-LED", "Not sure", "None"]}
                onChange={(value) => updateOutdoor("landscape_lighting", value)}
              />
              <SelectField
                label="Private well"
                value={answers.outdoor.private_well}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) => {
                  updateOutdoor("private_well", value);
                  if (value !== "Yes") {
                    updateOutdoor("well_pump_cycles_unusually_often", "N/A");
                  }
                }}
              />
              {answers.outdoor.private_well === "Yes" && (
                <SelectField
                  label="Well pump cycles unusually often?"
                  value={answers.outdoor.well_pump_cycles_unusually_often}
                  options={["Yes", "No", "Not sure"]}
                  onChange={(value) =>
                    updateOutdoor("well_pump_cycles_unusually_often", value)
                  }
                />
              )}
            </div>

            <div className="mt-5 grid gap-5">
              {answers.home.garage_type !== "No garage" && (
                <MultiCheck
                  label="Garage equipment"
                  value={answers.outdoor.garage_equipment}
                  options={GARAGE_EQUIPMENT}
                  onChange={(value) => updateOutdoor("garage_equipment", value)}
                />
              )}
              <MultiCheck
                label="Other unusual loads"
                value={answers.outdoor.unusual_loads}
                options={UNUSUAL_LOADS}
                onChange={(value) => updateOutdoor("unusual_loads", value)}
              />
            </div>
          </Section>

          <Section
            number="6"
            title="Solar, Battery & EV"
            description="Solar is optional and will only appear in the report when roof control, roof information and the household context support it."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="Already have rooftop solar?"
                value={answers.solar_battery_ev.rooftop_solar ? "Yes" : "No"}
                options={["Yes", "No"]}
                onChange={(value) => updateSolar("rooftop_solar", value === "Yes")}
              />
              <SelectField
                label="Interested in solar?"
                value={answers.solar_battery_ev.solar_interest}
                options={["Yes", "Maybe", "No"]}
                onChange={(value) => updateSolar("solar_interest", value)}
              />
              <SelectField
                label="Authority to install rooftop solar"
                value={answers.solar_battery_ev.authority_to_install_solar}
                options={
                  apartmentOrCondo
                    ? ["No", "Shared/HOA/condo", "Not sure", "Yes"]
                    : ["Yes", "No", "Not sure"]
                }
                onChange={(value) =>
                  updateSolar("authority_to_install_solar", value)
                }
              />
              {answers.solar_battery_ev.rooftop_solar && (
                <>
                  <NumberField
                    label="Approx. solar size (kW), if known"
                    value={answers.solar_battery_ev.solar_size_kw}
                    min={0}
                    max={100}
                    step={0.1}
                    onChange={(value) => updateSolar("solar_size_kw", value)}
                  />
                  <NumberField
                    label="Solar install year, if known"
                    value={answers.solar_battery_ev.solar_install_year}
                    min={1990}
                    max={2035}
                    onChange={(value) => updateSolar("solar_install_year", value)}
                  />
                </>
              )}
              <SelectField
                label="Home battery installed?"
                value={answers.solar_battery_ev.home_battery_installed ? "Yes" : "No"}
                options={["Yes", "No"]}
                onChange={(value) =>
                  updateSolar("home_battery_installed", value === "Yes")
                }
              />
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
                onChange={(value) => updateSolar("battery_goal", value)}
              />
              <SelectField
                label="EV / PHEV"
                value={answers.solar_battery_ev.ev_phev}
                options={["Yes", "No", "Planning"]}
                onChange={(value) => {
                  updateSolar("ev_phev", value);
                  if (value === "No") {
                    updateSolar("home_charging_type", "N/A");
                    updateSolar("ev_charging_time", "N/A");
                    updateSolar("cheaper_off_peak_ev_rate", "N/A");
                  }
                }}
              />
            </div>

            {showSolarRoof && (
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
                  onChange={(value) => updateSolar("roof_orientation", value)}
                />
                <SelectField
                  label="Roof shading"
                  value={answers.solar_battery_ev.roof_shading}
                  options={["Little/none", "Some", "Heavy", "Not sure"]}
                  onChange={(value) => updateSolar("roof_shading", value)}
                />
                <SelectField
                  label="Usable roof space"
                  value={answers.solar_battery_ev.usable_roof_space}
                  options={["Plenty", "Limited", "Very limited", "Not sure"]}
                  onChange={(value) => updateSolar("usable_roof_space", value)}
                />
              </div>
            )}

            {showEV && (
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <SelectField
                  label="Home charging"
                  value={answers.solar_battery_ev.home_charging_type}
                  options={["120V/Level 1", "Level 2", "Mostly public", "Not sure"]}
                  onChange={(value) => updateSolar("home_charging_type", value)}
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
                  onChange={(value) => updateSolar("ev_charging_time", value)}
                />
                <SelectField
                  label="Cheaper off-peak EV rate?"
                  value={answers.solar_battery_ev.cheaper_off_peak_ev_rate}
                  options={["Yes", "No", "Not sure"]}
                  onChange={(value) =>
                    updateSolar("cheaper_off_peak_ev_rate", value)
                  }
                />
              </div>
            )}
          </Section>

          <Section
            number="7"
            title="Bills, Energy Use & Household Behaviour"
            description="Actual usage is preferred over bill amounts where available, and changes in occupancy or utility rates are separated from efficiency problems."
          >
            <MultiCheck
              label="Energy sources used in the home"
              value={answers.bills_behaviour.energy_sources}
              options={[...US_ENERGY_SOURCES]}
              onChange={(value) => updateBills("energy_sources", value)}
            />

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <NumberField
                label="Typical monthly electricity bill ($)"
                value={answers.bills_behaviour.typical_monthly_electricity_bill}
                min={0}
                step={1}
                onChange={(value) =>
                  updateBills("typical_monthly_electricity_bill", value)
                }
              />
              <NumberField
                label="Highest electricity bill ($)"
                value={answers.bills_behaviour.highest_electricity_bill}
                min={0}
                onChange={(value) => updateBills("highest_electricity_bill", value)}
              />
              <NumberField
                label="Electricity unit rate ($/kWh), if known"
                value={answers.bills_behaviour.electricity_unit_rate_per_kwh}
                min={0}
                step={0.001}
                onChange={(value) =>
                  updateBills("electricity_unit_rate_per_kwh", value)
                }
              />
              <NumberField
                label="Monthly electricity use (kWh), if known"
                value={answers.bills_behaviour.electricity_usage_kwh_monthly}
                min={0}
                onChange={(value) =>
                  updateBills("electricity_usage_kwh_monthly", value)
                }
              />
              <NumberField
                label="Annual electricity use (kWh), if known"
                value={answers.bills_behaviour.electricity_usage_kwh_annual}
                min={0}
                onChange={(value) =>
                  updateBills("electricity_usage_kwh_annual", value)
                }
              />

              {energySources.includes("Natural gas") && (
                <>
                  <NumberField
                    label="Typical monthly natural-gas bill ($)"
                    value={answers.bills_behaviour.natural_gas_typical_bill}
                    min={0}
                    onChange={(value) =>
                      updateBills("natural_gas_typical_bill", value)
                    }
                  />
                  <NumberField
                    label="Natural gas therms, if known"
                    value={answers.bills_behaviour.natural_gas_therms}
                    min={0}
                    onChange={(value) => updateBills("natural_gas_therms", value)}
                  />
                  <NumberField
                    label="Gas rate ($/therm), if known"
                    value={answers.bills_behaviour.natural_gas_unit_rate_per_therm}
                    min={0}
                    step={0.01}
                    onChange={(value) =>
                      updateBills("natural_gas_unit_rate_per_therm", value)
                    }
                  />
                </>
              )}

              {energySources.includes("Propane") && (
                <>
                  <NumberField
                    label="Approx. annual propane spend ($)"
                    value={answers.bills_behaviour.propane_annual_spend}
                    min={0}
                    onChange={(value) =>
                      updateBills("propane_annual_spend", value)
                    }
                  />
                  <NumberField
                    label="Propane gallons/year, if known"
                    value={answers.bills_behaviour.propane_gallons}
                    min={0}
                    onChange={(value) => updateBills("propane_gallons", value)}
                  />
                  <NumberField
                    label="Propane rate ($/gallon), if known"
                    value={answers.bills_behaviour.propane_unit_rate_per_gallon}
                    min={0}
                    step={0.01}
                    onChange={(value) =>
                      updateBills("propane_unit_rate_per_gallon", value)
                    }
                  />
                </>
              )}

              {energySources.includes("Heating oil") && (
                <>
                  <NumberField
                    label="Approx. annual heating-oil spend ($)"
                    value={answers.bills_behaviour.heating_oil_annual_spend}
                    min={0}
                    onChange={(value) =>
                      updateBills("heating_oil_annual_spend", value)
                    }
                  />
                  <NumberField
                    label="Heating-oil gallons/year, if known"
                    value={answers.bills_behaviour.heating_oil_gallons}
                    min={0}
                    onChange={(value) =>
                      updateBills("heating_oil_gallons", value)
                    }
                  />
                  <NumberField
                    label="Heating-oil rate ($/gallon), if known"
                    value={answers.bills_behaviour.heating_oil_unit_rate_per_gallon}
                    min={0}
                    step={0.01}
                    onChange={(value) =>
                      updateBills("heating_oil_unit_rate_per_gallon", value)
                    }
                  />
                </>
              )}

              <SelectField
                label="When are bills highest?"
                value={answers.bills_behaviour.bills_highest}
                options={["Summer", "Winter", "Similar all year", "Varies", "Not sure"]}
                onChange={(value) => updateBills("bills_highest", value)}
              />
              <SelectField
                label="Bills increased noticeably?"
                value={answers.bills_behaviour.bills_increased_noticeably}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) => {
                  updateBills("bills_increased_noticeably", value);
                  if (value !== "Yes") updateBills("changes_when_bills_increased", []);
                }}
              />
              <SelectField
                label="Someone home during the day"
                value={answers.bills_behaviour.daytime_occupancy}
                options={["Most days", "Several days/week", "Rarely", "Varies"]}
                onChange={(value) => updateBills("daytime_occupancy", value)}
              />
              <SelectField
                label="Occupied year-round?"
                value={answers.bills_behaviour.occupied_year_round}
                options={["Yes", "Seasonal", "Away for long periods", "Varies"]}
                onChange={(value) => updateBills("occupied_year_round", value)}
              />
              <SelectField
                label="Heat/AC rooms rarely used?"
                value={answers.bills_behaviour.heats_or_cools_rarely_used_rooms}
                options={["Yes", "Sometimes", "No", "Not sure"]}
                onChange={(value) =>
                  updateBills("heats_or_cools_rarely_used_rooms", value)
                }
              />
              <SelectField
                label="Doors/windows open while HVAC runs?"
                value={answers.bills_behaviour.doors_windows_open_while_hvac_runs}
                options={["Often", "Sometimes", "Rarely", "Never"]}
                onChange={(value) =>
                  updateBills("doors_windows_open_while_hvac_runs", value)
                }
              />
              <SelectField
                label="Electricity use highest"
                value={answers.bills_behaviour.electricity_use_peak}
                options={["Morning", "Afternoon", "Evening", "Overnight", "Not sure"]}
                onChange={(value) => updateBills("electricity_use_peak", value)}
              />
              <SelectField
                label="Time-of-use pricing?"
                value={answers.bills_behaviour.time_of_use_pricing}
                options={["Yes", "No", "Not sure"]}
                onChange={(value) => updateBills("time_of_use_pricing", value)}
              />
              {answers.bills_behaviour.time_of_use_pricing === "Yes" && (
                <TextField
                  label="Peak hours, if known"
                  value={answers.bills_behaviour.known_peak_hours ?? ""}
                  placeholder="e.g. 4pm-9pm"
                  onChange={(value) =>
                    updateBills("known_peak_hours", value || null)
                  }
                />
              )}
            </div>

            {answers.bills_behaviour.bills_increased_noticeably === "Yes" && (
              <div className="mt-5">
                <MultiCheck
                  label="What changed around the same time?"
                  value={answers.bills_behaviour.changes_when_bills_increased}
                  options={BILL_CHANGE_REASONS}
                  onChange={(value) =>
                    updateBills("changes_when_bills_increased", value)
                  }
                />
              </div>
            )}
          </Section>

          <section className="rounded-[1.75rem] border border-[#dbe8f2] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-[#17356f]">
              Optional appliance photos
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Photos can support the assessment but will not override your answers
              or be used to invent unreadable model specifications.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => handlePhotos(event.target.files)}
              className="mt-4 block w-full rounded-xl border border-[#dbe8f2] bg-[#f7fbff] p-3 text-sm"
            />
            {uploadedPhotos.length > 0 && (
              <p className="mt-2 text-sm font-bold text-[#17356f]">
                {uploadedPhotos.length} photo(s) ready for supporting analysis.
              </p>
            )}
          </section>

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
              {errorMessage}
            </div>
          )}

          <section className="rounded-[2rem] bg-[#17356f] p-6 text-white shadow-xl sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd600]">
                  Ready to analyse
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  Build my US home energy report
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                  Recommendations are ranked from no-cost actions through
                  investigation and only then larger upgrades.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                className="rounded-full bg-[#ffd600] px-8 py-4 text-base font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Analysing home..." : "Generate My Report"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
