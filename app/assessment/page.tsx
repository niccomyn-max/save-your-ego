"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AGE_BANDS,
  APPLIANCE_LIBRARY,
  BILLING_FREQUENCIES,
  COUNTRY_DEFAULTS,
  COUNTRY_OPTIONS,
  EnergyAssessmentAnswers,
  FABRIC_TYPES,
  GLAZING_TYPES,
  HEATING_SYSTEMS,
  INSULATION_LEVELS,
  PROPERTY_TYPES,
  SOLAR_DAYTIME_USE,
  SOLAR_EV_STATUS,
  SOLAR_INTEREST,
  SOLAR_ROOF_ORIENTATIONS,
  SOLAR_ROOF_SHADING,
  SOLAR_ROOF_SPACE,
  USAGE_LEVELS,
  analyseEnergyAssessment,
} from "@/lib/assessment/energy-model";

const defaultAnswers: EnergyAssessmentAnswers = {
  country: "US",
  property_type: "Detached",
  bedrooms: 3,
  year_built: 1995,
  floor_area: 140,
  glazing: "Double glazing",
  main_heating: "Heat pump",
  energy_rating: "",
  occupants: 4,
  has_solar: false,
  has_battery: false,

  solar_roof_orientation: "Unknown / Don't know",
  solar_roof_shading: "Unknown / Don't know",
  solar_roof_space: "Unknown / Don't know",
  solar_daytime_use: "Unknown / Don't know",
  solar_ev_status: "No",
  solar_interest: "Maybe",

  notes: "",

  bill_frequency: "Monthly",
  avg_electricity_bill: 180,
  unit_rate: 0.18,
  standing_charge: 25,
  annual_bill_override: 0,

  uses_gas: false,
  avg_gas_bill: 0,
  gas_bill_frequency: "Monthly",
  gas_unit_rate: 0.12,
  annual_gas_spend: 0,
  gas_boiler_age: "Unknown",
  gas_heating_usage: "Medium",

  uses_oil: false,
  oil_litres_per_year: 0,
  oil_price_per_litre: 1.1,
  annual_oil_spend: 0,
  oil_boiler_age: "Unknown",
  oil_heating_usage: "Medium",

  fabric_meta: {
    "Wall type": "Unknown",
    "Roof type": "Unknown",
    "Floor type": "Unknown",
    "Window frame type": "Unknown",
  },
  wall_rating: "Medium",
  wall_u_manual: 0,
  window_rating: "Medium",
  window_u_manual: 0,
  floor_rating: "Medium",
  floor_u_manual: 0,
  roof_rating: "Good",
  roof_u_manual: 0,

  appliances: [],
};

const UNKNOWN_OPTION = "Unknown / Don't know";

const INSULATION_LEVEL_OPTIONS = [
  UNKNOWN_OPTION,
  ...INSULATION_LEVELS.filter((option) => option !== UNKNOWN_OPTION),
];

const AGE_BAND_OPTIONS = [
  "Unknown",
  ...AGE_BANDS.filter((option) => option !== "Unknown"),
];

const USAGE_LEVEL_OPTIONS = [UNKNOWN_OPTION, ...USAGE_LEVELS];

type AiAssessment = {
  photo_summary?: string;
  top_energy_drains?: string[];
  top_recommended_actions?: string[];
  quick_wins?: string[];
  bigger_upgrades?: string[];
  extra_insights?: string[];
  bottom_line?: string;
};

type UploadedPhoto = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

function AiList({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#dbe8f2] bg-white p-5 shadow-sm">
      <h3 className="font-black text-[#17356f]">{title}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SectionShell({
  number,
  title,
  description,
  children,
  accent = "blue",
}: {
  number: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  accent?: "yellow" | "blue" | "navy" | "black";
}) {
  const accentClass =
    accent === "yellow"
      ? "border-t-[#ffd600]"
      : accent === "black"
        ? "border-t-black"
        : accent === "navy"
          ? "border-t-[#17356f]"
          : "border-t-[#59b9ec]";

  return (
    <section
      className={`rounded-[1.75rem] border border-[#dbe8f2] border-t-8 ${accentClass} bg-white p-5 shadow-sm sm:p-6`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#17356f] text-sm font-black text-white">
          {number}
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#17356f]">
            {title}
          </h2>

          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          )}
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
        className="rounded-xl border border-[#dbe8f2] bg-white px-3 py-3 font-normal text-slate-900 shadow-sm outline-none transition focus:border-[#59b9ec] focus:ring-2 focus:ring-[#59b9ec]/20"
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
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onFocus={(event) => event.target.select()}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-xl border border-[#dbe8f2] bg-white px-3 py-3 font-normal text-slate-900 shadow-sm outline-none transition focus:border-[#59b9ec] focus:ring-2 focus:ring-[#59b9ec]/20"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[#dbe8f2] bg-white px-3 py-3 font-normal text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#59b9ec] focus:ring-2 focus:ring-[#59b9ec]/20"
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
    <label className="flex items-center gap-3 rounded-xl border border-[#dbe8f2] bg-[#f7fbff] p-4 text-sm font-bold text-slate-700 shadow-sm">
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

function PreviewCard({
  label,
  value,
  colour = "white",
}: {
  label: string;
  value: string;
  colour?: "white" | "yellow" | "blue" | "navy";
}) {
  const className =
    colour === "yellow"
      ? "border-[#ffe76a] bg-[#fff6bf] text-black"
      : colour === "blue"
        ? "border-[#bde8ff] bg-[#e9f6fe] text-[#17356f]"
        : colour === "navy"
          ? "border-[#17356f] bg-[#17356f] text-white"
          : "border-[#dbe8f2] bg-white text-[#17356f]";

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${className}`}>
      <p className="text-xs font-black uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black leading-tight">{value}</p>
    </div>
  );
}

export default function AssessmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [answers, setAnswers] =
    useState<EnergyAssessmentAnswers>(defaultAnswers);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiErrorMessage, setAiErrorMessage] = useState("");
  const [aiReportText, setAiReportText] = useState("");
  const [aiReport, setAiReport] = useState<AiAssessment | null>(null);

  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [photoErrorMessage, setPhotoErrorMessage] = useState("");
  const [otherApplianceName, setOtherApplianceName] = useState("");

  const analysis = useMemo(() => analyseEnergyAssessment(answers), [answers]);
  const countryDefaults =
    COUNTRY_DEFAULTS[answers.country] ?? COUNTRY_DEFAULTS.US;

  function clearAiReport() {
    setAiReport(null);
    setAiReportText("");
    setAiErrorMessage("");
  }

  function updateAnswer<K extends keyof EnergyAssessmentAnswers>(
    key: K,
    value: EnergyAssessmentAnswers[K]
  ) {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));

    clearAiReport();
  }

  function updateFabricMeta(key: string, value: string) {
    setAnswers((current) => ({
      ...current,
      fabric_meta: {
        ...current.fabric_meta,
        [key]: value,
      },
    }));

    clearAiReport();
  }

  function toggleAppliance(category: string, appliance: string) {
    setAnswers((current) => {
      const alreadySelected = current.appliances.some(
        (item) => item.appliance === appliance
      );

      if (alreadySelected) {
        return {
          ...current,
          appliances: current.appliances.filter(
            (item) => item.appliance !== appliance
          ),
        };
      }

      return {
        ...current,
        appliances: [
          ...current.appliances,
          {
            appliance,
            category,
            age_band: "Mid-life (5-10 years)",
            usage: "Medium",
            qty: 1,
          },
        ],
      };
    });

    clearAiReport();
  }

  function addOtherAppliance() {
    const applianceName = otherApplianceName.trim();

    if (!applianceName) {
      return;
    }

    setAnswers((current) => {
      const alreadySelected = current.appliances.some(
        (item) =>
          item.appliance.toLowerCase() === applianceName.toLowerCase()
      );

      if (alreadySelected) {
        return current;
      }

      return {
        ...current,
        appliances: [
          ...current.appliances,
          {
            appliance: applianceName,
            category: "Other",
            age_band: "Unknown",
            usage: "Medium",
            qty: 1,
          },
        ],
      };
    });

    setOtherApplianceName("");
    clearAiReport();
  }

  function updateAppliance(
    appliance: string,
    field: "age_band" | "usage" | "qty",
    value: string | number
  ) {
    setAnswers((current) => ({
      ...current,
      appliances: current.appliances.map((item) =>
        item.appliance === appliance ? { ...item, [field]: value } : item
      ),
    }));

    clearAiReport();
  }

  function compressImageToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new window.Image();

        image.onload = () => {
          const maxWidth = 1200;
          const maxHeight = 1200;

          let { width, height } = image;

          if (width > height && width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Could not compress image."));
            return;
          }

          context.drawImage(image, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.72);

          resolve(compressedDataUrl);
        };

        image.onerror = () => reject(new Error("Could not load image."));

        if (typeof reader.result === "string") {
          image.src = reader.result;
        } else {
          reject(new Error("Could not read image file."));
        }
      };

      reader.onerror = () => reject(new Error("Could not read image file."));
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoUpload(files: FileList | null) {
    setPhotoErrorMessage("");

    if (!files || files.length === 0) {
      setUploadedPhotos([]);
      clearAiReport();
      return;
    }

    const selectedFiles = Array.from(files).slice(0, 3);

    const invalidFile = selectedFiles.find(
      (file) => !["image/jpeg", "image/png", "image/jpg"].includes(file.type)
    );

    if (invalidFile) {
      setPhotoErrorMessage("Please upload JPG or PNG appliance photos only.");
      return;
    }

    const tooLarge = selectedFiles.find((file) => file.size > 10_000_000);

    if (tooLarge) {
      setPhotoErrorMessage(
        "Please keep each photo under 10 MB. Clear appliance label photos work best."
      );
      return;
    }

    try {
      const convertedPhotos = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          mimeType: "image/jpeg",
          dataUrl: await compressImageToDataUrl(file),
        }))
      );

      setUploadedPhotos(convertedPhotos);
      clearAiReport();
    } catch {
      setPhotoErrorMessage(
        "One or more photos could not be processed. Try using a clearer, smaller photo."
      );
    }
  }

  async function handleGenerateAiAssessment() {
    setGeneratingAi(true);
    setAiErrorMessage("");

    try {
      const response = await fetch("/api/generate-assessment-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          scores: analysis,
          photos: uploadedPhotos,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setGeneratingAi(false);
        setAiErrorMessage(result.error || "Failed to generate AI assessment.");
        return;
      }

      setAiReportText(result.reportText);
      setAiReport(result.report);
      setGeneratingAi(false);
    } catch {
      setGeneratingAi(false);
      setAiErrorMessage("Failed to generate AI assessment.");
    }
  }

  async function handleSubmit() {
    setSaving(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      setErrorMessage("You need to be signed in to save an assessment.");
      return;
    }

    const { data: savedAssessment, error } = await supabase
      .from("assessments")
      .insert({
        user_id: user.id,
        answers: {
          ...answers,
          uploaded_photo_count: uploadedPhotos.length,
        },
        scores: analysis,
      })
      .select("id")
      .single();

    if (error || !savedAssessment) {
      setSaving(false);
      setErrorMessage(error?.message || "Failed to save assessment.");
      return;
    }

    if (aiReportText) {
      const { error: reportError } = await supabase.from("reports").insert({
        user_id: user.id,
        assessment_id: savedAssessment.id,
        report_text: aiReportText,
      });

      if (reportError) {
        setSaving(false);
        setErrorMessage(reportError.message);
        return;
      }
    }

    router.push(`/report/${savedAssessment.id}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7fbff] px-5 py-6 text-[#050505] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-[#dbe8f2] bg-white shadow-xl shadow-[#17356f]/10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
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
                Home energy assessment
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-black sm:text-5xl">
                Build your Save Your EGO report
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                A practical home energy analyser for identifying likely energy
                drains, reducing waste and improving household efficiency
                across Electricity, Gas and Oil.
              </p>

              <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#17356f]">
                Covering Electricity, Gas and Oil
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#17356f] via-[#0d4f78] to-black p-6 text-white sm:p-8 lg:p-10">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#ffd600]">
                Assessment focus
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-[1.5rem] bg-white/10 p-5 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-wide text-white/60">
                    Default market
                  </p>
                  <p className="mt-2 text-3xl font-black">US</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[1.5rem] bg-[#ffd600] p-5 text-black">
                    <p className="text-xs font-black uppercase opacity-70">
                      Sections
                    </p>
                    <p className="mt-2 text-3xl font-black">7</p>
                  </div>

                  <div className="rounded-[1.5rem] bg-[#59b9ec] p-5 text-[#17356f]">
                    <p className="text-xs font-black uppercase opacity-70">
                      Output
                    </p>
                    <p className="mt-2 text-lg font-black">AI report</p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-white p-5 text-black">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Solar review
                  </p>
                  <p className="mt-2 text-xl font-black">
                    Diagnostic, not default
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
          This tool provides an indicative home energy assessment only. It is
          not a substitute for a qualified energy assessment, electrician,
          retrofit designer, heating engineer, structural professional, grant
          advisor or building compliance expert.
        </div>

        <div className="mt-6 space-y-6">
          <SectionShell
            number="1"
            title="Home details"
            description="Start with the basic property details. If the customer does not know a technical answer, use the unknown option where available."
            accent="navy"
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="Country"
                value={answers.country}
                options={COUNTRY_OPTIONS}
                onChange={(value) => {
                  const defaults =
                    COUNTRY_DEFAULTS[value] ?? COUNTRY_DEFAULTS.US;

                  setAnswers((current) => ({
                    ...current,
                    country: value,
                    unit_rate: defaults.electricity_price,
                  }));

                  clearAiReport();
                }}
              />

              <SelectField
                label="Property type"
                value={answers.property_type}
                options={PROPERTY_TYPES}
                onChange={(value) => updateAnswer("property_type", value)}
              />

              <NumberField
                label="Number of bedrooms"
                value={answers.bedrooms}
                min={1}
                max={12}
                onChange={(value) => updateAnswer("bedrooms", value)}
              />

              <NumberField
                label="Year built"
                value={answers.year_built}
                min={1800}
                max={2030}
                onChange={(value) => updateAnswer("year_built", value)}
              />

              <NumberField
                label="Approx. floor area, m²"
                value={answers.floor_area}
                min={20}
                max={1000}
                onChange={(value) => updateAnswer("floor_area", value)}
              />

              <SelectField
                label="Glazing type"
                value={answers.glazing}
                options={GLAZING_TYPES}
                onChange={(value) => updateAnswer("glazing", value)}
              />

              <SelectField
                label="Main heating system"
                value={answers.main_heating}
                options={HEATING_SYSTEMS}
                onChange={(value) => updateAnswer("main_heating", value)}
              />

              <TextField
                label="Energy use intensity if known"
                value={answers.energy_rating}
                placeholder="e.g. 227 kWh/m²/yr"
                onChange={(value) => updateAnswer("energy_rating", value)}
              />

              <NumberField
                label="Number of occupants"
                value={answers.occupants}
                min={1}
                max={12}
                onChange={(value) => updateAnswer("occupants", value)}
              />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <ToggleField
                label="Solar PV already installed"
                value={answers.has_solar}
                onChange={(value) => updateAnswer("has_solar", value)}
              />

              <ToggleField
                label="Battery already installed"
                value={answers.has_battery}
                onChange={(value) => updateAnswer("has_battery", value)}
              />
            </div>

            <label className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
              Anything else worth knowing?
              <textarea
                value={answers.notes}
                placeholder="Optional notes about the home, lifestyle, energy concerns or planned upgrades."
                onChange={(event) => updateAnswer("notes", event.target.value)}
                className="min-h-28 rounded-xl border border-[#dbe8f2] bg-white px-3 py-3 font-normal text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#59b9ec] focus:ring-2 focus:ring-[#59b9ec]/20"
              />
            </label>
          </SectionShell>

          <SectionShell
            number="2"
            title="Solar suitability"
            description="Solar should not be recommended by default. These details help the app judge whether solar PV is a strong candidate, a possible option, or not the first priority."
            accent="blue"
          >
            <div className="grid gap-5 md:grid-cols-3">
              <SelectField
                label="Roof orientation"
                value={answers.solar_roof_orientation}
                options={SOLAR_ROOF_ORIENTATIONS}
                onChange={(value) =>
                  updateAnswer("solar_roof_orientation", value)
                }
              />

              <SelectField
                label="Roof shading"
                value={answers.solar_roof_shading}
                options={SOLAR_ROOF_SHADING}
                onChange={(value) => updateAnswer("solar_roof_shading", value)}
              />

              <SelectField
                label="Available roof space"
                value={answers.solar_roof_space}
                options={SOLAR_ROOF_SPACE}
                onChange={(value) => updateAnswer("solar_roof_space", value)}
              />

              <SelectField
                label="Main daytime electricity use"
                value={answers.solar_daytime_use}
                options={SOLAR_DAYTIME_USE}
                onChange={(value) => updateAnswer("solar_daytime_use", value)}
              />

              <SelectField
                label="EV status"
                value={answers.solar_ev_status}
                options={SOLAR_EV_STATUS}
                onChange={(value) => updateAnswer("solar_ev_status", value)}
              />

              <SelectField
                label="Interested in solar?"
                value={answers.solar_interest}
                options={SOLAR_INTEREST}
                onChange={(value) => updateAnswer("solar_interest", value)}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-[#bde8ff] bg-[#e9f6fe] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#17356f]/70">
                    Solar preview
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-[#17356f]">
                    {analysis.solarSuitability.rating}
                  </h3>
                </div>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#17356f]">
                  Indicative only
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-700">
                {analysis.solarSuitability.reason}
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Suggested system size
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-700">
                    {analysis.solarSuitability.suggested_system_size}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Battery view
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-700">
                    {analysis.solarSuitability.battery_view}
                  </p>
                </div>
              </div>
            </div>
          </SectionShell>

          <SectionShell
            number="3"
            title="Electricity, Gas and Oil costs"
            description="Save Your EGO means Electricity, Gas and Oil. Add what is known. Unknown values can be left at zero."
            accent="yellow"
          >
            <div className="rounded-2xl border border-[#dbe8f2] bg-[#fffdf0] p-5">
              <h3 className="text-lg font-black text-black">Electricity</h3>

              <div className="mt-4 grid gap-5 md:grid-cols-3">
                <SelectField
                  label="Electricity billing frequency"
                  value={answers.bill_frequency}
                  options={BILLING_FREQUENCIES}
                  onChange={(value) => updateAnswer("bill_frequency", value)}
                />

                <NumberField
                  label={`Average electricity bill (${countryDefaults.currency})`}
                  value={answers.avg_electricity_bill}
                  min={0}
                  step={10}
                  onChange={(value) =>
                    updateAnswer("avg_electricity_bill", value)
                  }
                />

                <NumberField
                  label={`Electricity unit rate (${countryDefaults.currency}/kWh)`}
                  value={answers.unit_rate}
                  min={0.05}
                  max={2}
                  step={0.01}
                  onChange={(value) => updateAnswer("unit_rate", value)}
                />

                <NumberField
                  label={`Standing charge per electricity bill (${countryDefaults.currency})`}
                  value={answers.standing_charge}
                  min={0}
                  step={1}
                  onChange={(value) => updateAnswer("standing_charge", value)}
                />

                <NumberField
                  label={`Annual electricity spend if known (${countryDefaults.currency})`}
                  value={answers.annual_bill_override}
                  min={0}
                  step={50}
                  onChange={(value) =>
                    updateAnswer("annual_bill_override", value)
                  }
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#dbe8f2] bg-[#f1faff] p-5">
              <h3 className="text-lg font-black text-[#17356f]">Gas</h3>

              <div className="mt-4">
                <ToggleField
                  label="Gas used in this home"
                  value={answers.uses_gas}
                  onChange={(value) => updateAnswer("uses_gas", value)}
                />
              </div>

              {answers.uses_gas && (
                <div className="mt-4 grid gap-5 md:grid-cols-3">
                  <SelectField
                    label="Gas billing frequency"
                    value={answers.gas_bill_frequency}
                    options={BILLING_FREQUENCIES}
                    onChange={(value) =>
                      updateAnswer("gas_bill_frequency", value)
                    }
                  />

                  <NumberField
                    label={`Average gas bill (${countryDefaults.currency})`}
                    value={answers.avg_gas_bill}
                    min={0}
                    step={10}
                    onChange={(value) => updateAnswer("avg_gas_bill", value)}
                  />

                  <NumberField
                    label={`Gas unit rate if known (${countryDefaults.currency}/kWh)`}
                    value={answers.gas_unit_rate}
                    min={0}
                    step={0.01}
                    onChange={(value) => updateAnswer("gas_unit_rate", value)}
                  />

                  <NumberField
                    label={`Annual gas spend if known (${countryDefaults.currency})`}
                    value={answers.annual_gas_spend}
                    min={0}
                    step={50}
                    onChange={(value) =>
                      updateAnswer("annual_gas_spend", value)
                    }
                  />

                  <SelectField
                    label="Gas boiler age"
                    value={answers.gas_boiler_age}
                    options={AGE_BAND_OPTIONS}
                    onChange={(value) =>
                      updateAnswer("gas_boiler_age", value)
                    }
                  />

                  <SelectField
                    label="Gas heating usage"
                    value={answers.gas_heating_usage}
                    options={USAGE_LEVEL_OPTIONS}
                    onChange={(value) =>
                      updateAnswer("gas_heating_usage", value)
                    }
                  />
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-[#dbe8f2] bg-slate-50 p-5">
              <h3 className="text-lg font-black text-black">Oil</h3>

              <div className="mt-4">
                <ToggleField
                  label="Oil used in this home"
                  value={answers.uses_oil}
                  onChange={(value) => updateAnswer("uses_oil", value)}
                />
              </div>

              {answers.uses_oil && (
                <div className="mt-4 grid gap-5 md:grid-cols-3">
                  <NumberField
                    label="Oil litres used per year if known"
                    value={answers.oil_litres_per_year}
                    min={0}
                    step={50}
                    onChange={(value) =>
                      updateAnswer("oil_litres_per_year", value)
                    }
                  />

                  <NumberField
                    label={`Oil price per litre if known (${countryDefaults.currency})`}
                    value={answers.oil_price_per_litre}
                    min={0}
                    step={0.01}
                    onChange={(value) =>
                      updateAnswer("oil_price_per_litre", value)
                    }
                  />

                  <NumberField
                    label={`Annual oil spend if known (${countryDefaults.currency})`}
                    value={answers.annual_oil_spend}
                    min={0}
                    step={50}
                    onChange={(value) =>
                      updateAnswer("annual_oil_spend", value)
                    }
                  />

                  <SelectField
                    label="Oil boiler age"
                    value={answers.oil_boiler_age}
                    options={AGE_BAND_OPTIONS}
                    onChange={(value) =>
                      updateAnswer("oil_boiler_age", value)
                    }
                  />

                  <SelectField
                    label="Oil heating usage"
                    value={answers.oil_heating_usage}
                    options={USAGE_LEVEL_OPTIONS}
                    onChange={(value) =>
                      updateAnswer("oil_heating_usage", value)
                    }
                  />
                </div>
              )}
            </div>
          </SectionShell>

          <SectionShell
            number="4"
            title="Advanced home fabric details"
            description="Keep this simple with Poor, Medium, Good or Unknown. Manual U-values can be added where known."
            accent="blue"
          >
            <div className="grid gap-5 md:grid-cols-2">
              {Object.entries(FABRIC_TYPES).map(([label, options]) => (
                <SelectField
                  key={label}
                  label={label}
                  value={answers.fabric_meta[label] ?? "Unknown"}
                  options={options}
                  onChange={(value) => updateFabricMeta(label, value)}
                />
              ))}
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-5">
                <SelectField
                  label="Wall insulation level"
                  value={answers.wall_rating}
                  options={INSULATION_LEVEL_OPTIONS}
                  onChange={(value) => updateAnswer("wall_rating", value)}
                />
                {answers.wall_rating === "I know the U-value" && (
                  <div className="mt-4">
                    <NumberField
                      label="Wall U-value, W/m²K"
                      value={answers.wall_u_manual}
                      min={0}
                      step={0.01}
                      onChange={(value) =>
                        updateAnswer("wall_u_manual", value)
                      }
                    />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-5">
                <SelectField
                  label="Window performance"
                  value={answers.window_rating}
                  options={INSULATION_LEVEL_OPTIONS}
                  onChange={(value) => updateAnswer("window_rating", value)}
                />
                {answers.window_rating === "I know the U-value" && (
                  <div className="mt-4">
                    <NumberField
                      label="Window U-value, W/m²K"
                      value={answers.window_u_manual}
                      min={0}
                      step={0.01}
                      onChange={(value) =>
                        updateAnswer("window_u_manual", value)
                      }
                    />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-5">
                <SelectField
                  label="Floor insulation level"
                  value={answers.floor_rating}
                  options={INSULATION_LEVEL_OPTIONS}
                  onChange={(value) => updateAnswer("floor_rating", value)}
                />
                {answers.floor_rating === "I know the U-value" && (
                  <div className="mt-4">
                    <NumberField
                      label="Floor U-value, W/m²K"
                      value={answers.floor_u_manual}
                      min={0}
                      step={0.01}
                      onChange={(value) =>
                        updateAnswer("floor_u_manual", value)
                      }
                    />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-5">
                <SelectField
                  label="Roof insulation level"
                  value={answers.roof_rating}
                  options={INSULATION_LEVEL_OPTIONS}
                  onChange={(value) => updateAnswer("roof_rating", value)}
                />
                {answers.roof_rating === "I know the U-value" && (
                  <div className="mt-4">
                    <NumberField
                      label="Roof U-value, W/m²K"
                      value={answers.roof_u_manual}
                      min={0}
                      step={0.01}
                      onChange={(value) =>
                        updateAnswer("roof_u_manual", value)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </SectionShell>

          <SectionShell
            number="5"
            title="Appliances and usage"
            description="Select the appliances in the home, or add another appliance if it is not listed."
            accent="black"
          >
            <div className="grid gap-5 md:grid-cols-2">
              {Object.entries(APPLIANCE_LIBRARY).map(
                ([category, appliances]) => (
                  <div
                    key={category}
                    className="rounded-2xl border border-[#dbe8f2] bg-white p-5 shadow-sm"
                  >
                    <h3 className="font-black text-[#17356f]">{category}</h3>

                    <div className="mt-3 grid gap-2">
                      {appliances.map((appliance) => {
                        const checked = answers.appliances.some(
                          (item) => item.appliance === appliance
                        );

                        return (
                          <label
                            key={appliance}
                            className="flex items-center gap-3 rounded-xl bg-[#f7fbff] px-3 py-2 text-sm font-semibold text-slate-700"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleAppliance(category, appliance)
                              }
                              className="h-4 w-4 accent-[#17356f]"
                            />
                            {appliance}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-5">
              <h3 className="font-black text-[#17356f]">
                Other appliance not listed
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add anything unusual or specific, such as a heated towel rail,
                pond pump, dehumidifier, workshop equipment, hot tub, second
                freezer or home office setup.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={otherApplianceName}
                  placeholder="e.g. Heated towel rail"
                  onChange={(event) =>
                    setOtherApplianceName(event.target.value)
                  }
                  className="rounded-xl border border-[#dbe8f2] bg-white px-3 py-3 text-sm shadow-sm outline-none transition focus:border-[#59b9ec] focus:ring-2 focus:ring-[#59b9ec]/20"
                />

                <button
                  type="button"
                  onClick={addOtherAppliance}
                  className="rounded-xl bg-[#17356f] px-5 py-3 text-sm font-black text-white transition hover:bg-black"
                >
                  Add appliance
                </button>
              </div>
            </div>

            {answers.appliances.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-black text-[#17356f]">
                  Selected appliances
                </h3>

                {answers.appliances.map((item) => (
                  <div
                    key={item.appliance}
                    className="grid gap-4 rounded-2xl border border-[#dbe8f2] bg-white p-5 shadow-sm md:grid-cols-4"
                  >
                    <div>
                      <p className="font-black text-black">{item.appliance}</p>
                      <p className="text-sm font-semibold text-slate-500">
                        {item.category}
                      </p>
                    </div>

                    <SelectField
                      label="Age"
                      value={item.age_band}
                      options={AGE_BAND_OPTIONS}
                      onChange={(value) =>
                        updateAppliance(item.appliance, "age_band", value)
                      }
                    />

                    <SelectField
                      label="Usage"
                      value={item.usage}
                      options={USAGE_LEVEL_OPTIONS}
                      onChange={(value) =>
                        updateAppliance(item.appliance, "usage", value)
                      }
                    />

                    <NumberField
                      label="Quantity"
                      value={item.qty}
                      min={1}
                      max={10}
                      onChange={(value) =>
                        updateAppliance(item.appliance, "qty", value)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </SectionShell>

          <SectionShell
            number="6"
            title="Assessment preview"
            description="This is the rule-based assessment view before the AI report is generated."
            accent="yellow"
          >
            <div className="grid gap-4 md:grid-cols-4">
              <PreviewCard
                label="Bill-based annual electricity use"
                value={`${analysis.estimatedBillKwh.toFixed(0)} kWh`}
                colour="yellow"
              />

              <PreviewCard
                label="Appliance estimate"
                value={`${analysis.applianceKwh.toFixed(0)} kWh/yr`}
                colour="blue"
              />

              <PreviewCard
                label="Main heat-loss area"
                value={analysis.biggestLossArea}
                colour="white"
              />

              <PreviewCard
                label="Solar suitability"
                value={analysis.solarSuitability.rating}
                colour="navy"
              />
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {Object.entries(analysis.quickScores).map(([label, score]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-5"
                >
                  <p className="text-sm font-black text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-black text-[#17356f]">
                    {score}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[#dbe8f2] bg-white p-5">
              <h3 className="font-black text-[#17356f]">Rule-based view</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {analysis.recommendations.slice(0, 6).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </SectionShell>

          <SectionShell
            number="7"
            title="AI assessment"
            description="Generate a personalised Save Your EGO AI assessment before saving. This uses the home details, bills, fabric inputs, appliance estimates, solar suitability, optional photos and rule-based findings."
            accent="blue"
          >
            <div className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-5">
              <h3 className="font-black text-[#17356f]">
                Optional appliance photos
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Upload up to 3 appliance photos, rating plates, labels or
                controls. The photos are compressed before analysis so they
                work better on mobile connections. These photos are used for
                this AI assessment only and are not stored permanently yet.
              </p>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                multiple
                onChange={(event) => handlePhotoUpload(event.target.files)}
                className="mt-4 block w-full rounded-xl border border-[#dbe8f2] bg-white p-3 text-sm"
              />

              {photoErrorMessage && (
                <p className="mt-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                  {photoErrorMessage}
                </p>
              )}

              {uploadedPhotos.length > 0 && (
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {uploadedPhotos.map((photo) => (
                    <div
                      key={photo.name}
                      className="rounded-xl border border-[#dbe8f2] bg-white p-3"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.dataUrl}
                        alt={photo.name}
                        className="h-36 w-full rounded-lg object-cover"
                      />
                      <p className="mt-2 truncate text-xs text-slate-600">
                        {photo.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {aiErrorMessage && (
              <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {aiErrorMessage}
              </p>
            )}

            <div className="mt-5 rounded-3xl border border-[#ffd600] bg-[#fff6bf] p-5">
              <h3 className="text-xl font-black text-black">
                Step 1: Generate the AI assessment
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                This creates the detailed recommendations used in the final
                report, including likely costs, savings, payback guidance and
                next steps.
              </p>

              <button
                type="button"
                disabled={generatingAi}
                onClick={handleGenerateAiAssessment}
                className="mt-4 rounded-full bg-[#17356f] px-7 py-4 text-sm font-black text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingAi
                  ? "Generating AI assessment..."
                  : aiReportText
                    ? "Regenerate AI assessment"
                    : "Generate AI assessment"}
              </button>
            </div>

            {aiReport && (
              <div className="mt-6 space-y-5">
                <div className="rounded-2xl border border-[#ffe76a] bg-[#fff6bf] p-5">
                  <h3 className="font-black text-black">Bottom line</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-800">
                    {aiReport.bottom_line}
                  </p>
                </div>

                {aiReport.photo_summary && (
                  <div className="rounded-2xl border border-[#bde8ff] bg-[#e9f6fe] p-5">
                    <h3 className="font-black text-[#17356f]">Photo notes</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-800">
                      {aiReport.photo_summary}
                    </p>
                  </div>
                )}

                <AiList
                  title="Top 3 likely energy drains"
                  items={aiReport.top_energy_drains}
                />

                <AiList
                  title="Top 3 recommended actions"
                  items={aiReport.top_recommended_actions}
                />

                <AiList title="Quick wins" items={aiReport.quick_wins} />

                <AiList
                  title="Bigger upgrades"
                  items={aiReport.bigger_upgrades}
                />

                <AiList
                  title="Extra insights"
                  items={aiReport.extra_insights}
                />
              </div>
            )}
          </SectionShell>
        </div>

        {errorMessage && (
          <p className="mt-6 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <section className="mt-8 rounded-[1.75rem] border border-[#ffd600] bg-[#fff6bf] p-6 shadow-lg shadow-[#17356f]/10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6b5200]">
                Final step
              </p>

              <h2 className="mt-2 text-2xl font-black text-black">
                Ready to view the customer report?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                Generate the AI assessment first for the strongest report, then
                save the assessment to open the full Save Your EGO results page.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="rounded-full border border-[#dbe8f2] bg-white px-6 py-4 text-sm font-black text-[#17356f] shadow-sm transition hover:bg-[#e9f6fe]"
              >
                Back to dashboard
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                className="rounded-full bg-[#17356f] px-7 py-4 text-sm font-black text-white shadow-lg shadow-[#17356f]/20 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : aiReportText
                    ? "Save AI report and view results"
                    : "Save assessment and view report"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}