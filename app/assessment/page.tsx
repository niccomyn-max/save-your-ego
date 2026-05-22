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
  USAGE_LEVELS,
  analyseEnergyAssessment,
} from "@/lib/assessment/energy-model";

const defaultAnswers: EnergyAssessmentAnswers = {
  country: "Ireland",
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
  notes: "",

  bill_frequency: "Monthly",
  avg_electricity_bill: 180,
  unit_rate: 0.34,
  standing_charge: 25,
  annual_bill_override: 0,

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
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border px-3 py-2 font-normal"
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
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-md border px-3 py-2 font-normal"
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
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border px-3 py-2 font-normal"
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
    <label className="flex items-center gap-3 rounded-md border p-3 text-sm font-medium">
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

export default function AssessmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [answers, setAnswers] =
    useState<EnergyAssessmentAnswers>(defaultAnswers);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const analysis = useMemo(() => analyseEnergyAssessment(answers), [answers]);
  const countryDefaults =
    COUNTRY_DEFAULTS[answers.country] ?? COUNTRY_DEFAULTS.Ireland;

  function updateAnswer<K extends keyof EnergyAssessmentAnswers>(
    key: K,
    value: EnergyAssessmentAnswers[K]
  ) {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateFabricMeta(key: string, value: string) {
    setAnswers((current) => ({
      ...current,
      fabric_meta: {
        ...current.fabric_meta,
        [key]: value,
      },
    }));
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

    const { error } = await supabase.from("assessments").insert({
      user_id: user.id,
      answers,
      scores: analysis,
    });

    if (error) {
      setSaving(false);
      setErrorMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <Image
            src="/save-your-ego-logo.png"
            alt="Save Your EGO"
            width={300}
            height={115}
            priority
          />
          <p className="mt-4 max-w-3xl text-gray-600">
            A practical home energy analyser for identifying likely energy
            drains, reducing waste and improving household efficiency across
            Electricity, Gas and Oil.
          </p>
        </div>

        <div className="rounded-xl border bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Assessment focus
          </p>
          <p className="mt-1 font-bold">Energy, cost and waste</p>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
        This tool provides an indicative home energy assessment only. It is not
        a substitute for a qualified energy assessment, electrician, retrofit
        designer, heating engineer, structural professional, grant advisor or
        building compliance expert.
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">1. Home details</h2>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <SelectField
            label="Country"
            value={answers.country}
            options={COUNTRY_OPTIONS}
            onChange={(value) => {
              const defaults = COUNTRY_DEFAULTS[value] ?? COUNTRY_DEFAULTS.Ireland;
              setAnswers((current) => ({
                ...current,
                country: value,
                unit_rate: defaults.electricity_price,
              }));
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
            label="Solar PV installed"
            value={answers.has_solar}
            onChange={(value) => updateAnswer("has_solar", value)}
          />

          <ToggleField
            label="Battery installed"
            value={answers.has_battery}
            onChange={(value) => updateAnswer("has_battery", value)}
          />
        </div>

        <label className="mt-5 grid gap-2 text-sm font-medium">
          Anything else worth knowing?
          <textarea
            value={answers.notes}
            placeholder="Optional"
            onChange={(event) => updateAnswer("notes", event.target.value)}
            className="min-h-24 rounded-md border px-3 py-2 font-normal"
          />
        </label>
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">2. Bills and energy costs</h2>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <SelectField
            label="Billing frequency"
            value={answers.bill_frequency}
            options={BILLING_FREQUENCIES}
            onChange={(value) => updateAnswer("bill_frequency", value)}
          />

          <NumberField
            label={`Average electricity bill (${countryDefaults.currency})`}
            value={answers.avg_electricity_bill}
            min={0}
            step={10}
            onChange={(value) => updateAnswer("avg_electricity_bill", value)}
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
            label={`Standing charge per bill (${countryDefaults.currency})`}
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
            onChange={(value) => updateAnswer("annual_bill_override", value)}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">3. Advanced home fabric details</h2>
        <p className="mt-2 text-sm text-gray-600">
          Keep this simple with Poor, Medium or Good, or enter manual U-values
          if you know them.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
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
          <div className="rounded-xl border p-4">
            <SelectField
              label="Wall insulation level"
              value={answers.wall_rating}
              options={INSULATION_LEVELS}
              onChange={(value) => updateAnswer("wall_rating", value)}
            />
            {answers.wall_rating === "I know the U-value" && (
              <div className="mt-4">
                <NumberField
                  label="Wall U-value, W/m²K"
                  value={answers.wall_u_manual}
                  min={0}
                  step={0.01}
                  onChange={(value) => updateAnswer("wall_u_manual", value)}
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <SelectField
              label="Window performance"
              value={answers.window_rating}
              options={INSULATION_LEVELS}
              onChange={(value) => updateAnswer("window_rating", value)}
            />
            {answers.window_rating === "I know the U-value" && (
              <div className="mt-4">
                <NumberField
                  label="Window U-value, W/m²K"
                  value={answers.window_u_manual}
                  min={0}
                  step={0.01}
                  onChange={(value) => updateAnswer("window_u_manual", value)}
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <SelectField
              label="Floor insulation level"
              value={answers.floor_rating}
              options={INSULATION_LEVELS}
              onChange={(value) => updateAnswer("floor_rating", value)}
            />
            {answers.floor_rating === "I know the U-value" && (
              <div className="mt-4">
                <NumberField
                  label="Floor U-value, W/m²K"
                  value={answers.floor_u_manual}
                  min={0}
                  step={0.01}
                  onChange={(value) => updateAnswer("floor_u_manual", value)}
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <SelectField
              label="Roof insulation level"
              value={answers.roof_rating}
              options={INSULATION_LEVELS}
              onChange={(value) => updateAnswer("roof_rating", value)}
            />
            {answers.roof_rating === "I know the U-value" && (
              <div className="mt-4">
                <NumberField
                  label="Roof U-value, W/m²K"
                  value={answers.roof_u_manual}
                  min={0}
                  step={0.01}
                  onChange={(value) => updateAnswer("roof_u_manual", value)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">4. Appliances and usage</h2>
        <p className="mt-2 text-sm text-gray-600">
          Select the appliances in the home, then set age, usage level and
          quantity.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {Object.entries(APPLIANCE_LIBRARY).map(([category, appliances]) => (
            <div key={category} className="rounded-xl border p-4">
              <h3 className="font-bold">{category}</h3>

              <div className="mt-3 grid gap-2">
                {appliances.map((appliance) => {
                  const checked = answers.appliances.some(
                    (item) => item.appliance === appliance
                  );

                  return (
                    <label
                      key={appliance}
                      className="flex items-center gap-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAppliance(category, appliance)}
                      />
                      {appliance}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {answers.appliances.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-bold">Selected appliances</h3>

            {answers.appliances.map((item) => (
              <div
                key={item.appliance}
                className="grid gap-4 rounded-xl border p-4 md:grid-cols-4"
              >
                <div>
                  <p className="font-bold">{item.appliance}</p>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>

                <SelectField
                  label="Age"
                  value={item.age_band}
                  options={AGE_BANDS}
                  onChange={(value) =>
                    updateAppliance(item.appliance, "age_band", value)
                  }
                />

                <SelectField
                  label="Usage"
                  value={item.usage}
                  options={USAGE_LEVELS}
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
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">5. Assessment preview</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase text-gray-500">
              Bill-based annual use
            </p>
            <p className="mt-1 text-2xl font-bold">
              {analysis.estimatedBillKwh.toFixed(0)} kWh
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase text-gray-500">
              Appliance estimate
            </p>
            <p className="mt-1 text-2xl font-bold">
              {analysis.applianceKwh.toFixed(0)} kWh/yr
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase text-gray-500">
              Main heat-loss area
            </p>
            <p className="mt-1 text-2xl font-bold">
              {analysis.biggestLossArea}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase text-gray-500">
              Fabric profile
            </p>
            <p className="mt-1 text-2xl font-bold">{analysis.fabricBand}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {Object.entries(analysis.quickScores).map(([label, score]) => (
            <div key={label} className="rounded-xl border p-4">
              <p className="text-sm font-bold">{label}</p>
              <p className="mt-1 text-2xl font-bold">{score}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border p-4">
          <h3 className="font-bold">Rule-based view</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
            {analysis.recommendations.slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {errorMessage && (
        <p className="mt-6 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-md border px-5 py-3 text-sm font-medium"
        >
          Back to dashboard
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={handleSubmit}
          className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save assessment"}
        </button>
      </div>
    </main>
  );
}