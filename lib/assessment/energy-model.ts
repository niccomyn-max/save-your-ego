export const COUNTRY_OPTIONS = ["Ireland", "UK", "Other EU", "US", "Other"] as const;

export const PROPERTY_TYPES = [
  "Detached",
  "Semi-detached",
  "Terraced",
  "Apartment",
  "Bungalow",
  "Other",
] as const;

export const GLAZING_TYPES = [
  "Single glazing",
  "Double glazing",
  "Triple glazing",
  "Mixed",
  "Unknown",
] as const;

export const HEATING_SYSTEMS = [
  "Heat pump",
  "Gas boiler",
  "Oil boiler",
  "Electric heating",
  "Solid fuel",
  "District heating",
  "Other",
] as const;

export const USAGE_LEVELS = ["Low", "Medium", "High"] as const;

export const AGE_BANDS = [
  "New (<5 years)",
  "Mid-life (5-10 years)",
  "Older (10+ years)",
  "Unknown",
] as const;

export const INSULATION_LEVELS = [
  "Poor",
  "Medium",
  "Good",
  "I know the U-value",
] as const;

export const BILLING_FREQUENCIES = [
  "Monthly",
  "Bi-monthly",
  "Quarterly",
  "Annual",
] as const;

export const COUNTRY_DEFAULTS: Record<
  string,
  { currency: string; electricity_price: number }
> = {
  Ireland: { currency: "€", electricity_price: 0.34 },
  UK: { currency: "£", electricity_price: 0.28 },
  "Other EU": { currency: "€", electricity_price: 0.3 },
  US: { currency: "$", electricity_price: 0.18 },
  Other: { currency: "€", electricity_price: 0.25 },
};

export const U_VALUE_DEFAULTS: Record<string, Record<string, number>> = {
  Walls: { Poor: 1.8, Medium: 0.8, Good: 0.25 },
  Windows: { Poor: 5.0, Medium: 2.8, Good: 1.4 },
  Floors: { Poor: 1.2, Medium: 0.6, Good: 0.18 },
  Roof: { Poor: 1.5, Medium: 0.45, Good: 0.14 },
};

export const FABRIC_TYPES: Record<string, string[]> = {
  "Wall type": [
    "Cavity wall",
    "Solid wall",
    "Timber frame",
    "Insulated cavity",
    "Externally insulated",
    "Internally insulated",
    "Unknown",
  ],
  "Roof type": ["Pitched roof", "Flat roof", "Room in roof", "Mixed", "Unknown"],
  "Floor type": [
    "Solid concrete",
    "Suspended timber",
    "Insulated slab",
    "Mixed",
    "Unknown",
  ],
  "Window frame type": ["uPVC", "Aluminium", "Timber", "Mixed", "Unknown"],
};

export const APPLIANCE_LIBRARY: Record<string, string[]> = {
  Kitchen: [
    "Fridge-freezer",
    "Second fridge",
    "Second freezer / chest freezer",
    "Dishwasher",
    "Washing machine",
    "Tumble dryer",
    "Washer-dryer",
    "Electric oven",
    "Electric hob",
    "Microwave",
    "Kettle",
    "Toaster",
  ],
  "Hot water and heating": [
    "Immersion heater",
    "Electric shower",
    "Portable electric heater",
    "Heated towel rail",
    "Dehumidifier",
  ],
  "Entertainment and office": [
    "Main TV",
    "Second TV",
    "Desktop PC",
    "Laptop docking setup",
    "Gaming console",
    "Router / network gear",
  ],
  "Transport and specialist": ["EV charger", "Hot tub", "Aquarium"],
};

export const APPLIANCE_PROFILES: Record<
  string,
  {
    kwh_year: Record<string, number>;
    notes: string;
  }
> = {
  "Fridge-freezer": {
    kwh_year: { Low: 220, Medium: 300, High: 380 },
    notes: "Older units can be heavy users.",
  },
  "Second fridge": {
    kwh_year: { Low: 120, Medium: 220, High: 320 },
    notes: "Often overlooked standby load.",
  },
  "Second freezer / chest freezer": {
    kwh_year: { Low: 180, Medium: 260, High: 360 },
    notes: "Garage units can use more.",
  },
  Dishwasher: {
    kwh_year: { Low: 120, Medium: 220, High: 320 },
    notes: "Eco cycles usually cut this down.",
  },
  "Washing machine": {
    kwh_year: { Low: 70, Medium: 140, High: 240 },
    notes: "Hot washes drive usage up.",
  },
  "Tumble dryer": {
    kwh_year: { Low: 120, Medium: 260, High: 480 },
    notes: "One of the biggest appliance loads.",
  },
  "Washer-dryer": {
    kwh_year: { Low: 180, Medium: 320, High: 520 },
    notes: "Usually higher than separate washing only.",
  },
  "Electric oven": {
    kwh_year: { Low: 80, Medium: 160, High: 260 },
    notes: "Frequent batch cooking helps.",
  },
  "Electric hob": {
    kwh_year: { Low: 60, Medium: 130, High: 240 },
    notes: "Induction is usually more efficient.",
  },
  Microwave: {
    kwh_year: { Low: 20, Medium: 45, High: 80 },
    notes: "Usually minor overall.",
  },
  Kettle: {
    kwh_year: { Low: 70, Medium: 120, High: 180 },
    notes: "Boiling only what you need matters.",
  },
  Toaster: {
    kwh_year: { Low: 8, Medium: 15, High: 25 },
    notes: "Small load.",
  },
  "Immersion heater": {
    kwh_year: { Low: 600, Medium: 1500, High: 2800 },
    notes: "A major load if left on too long.",
  },
  "Electric shower": {
    kwh_year: { Low: 500, Medium: 1100, High: 1900 },
    notes: "High-power short duration load.",
  },
  "Portable electric heater": {
    kwh_year: { Low: 150, Medium: 500, High: 1400 },
    notes: "Can spike winter bills quickly.",
  },
  "Heated towel rail": {
    kwh_year: { Low: 120, Medium: 280, High: 500 },
    notes: "Often forgotten continuous load.",
  },
  Dehumidifier: {
    kwh_year: { Low: 100, Medium: 260, High: 520 },
    notes: "Useful, but can add up.",
  },
  "Main TV": {
    kwh_year: { Low: 60, Medium: 120, High: 220 },
    notes: "Size and screen tech matter.",
  },
  "Second TV": {
    kwh_year: { Low: 30, Medium: 70, High: 130 },
    notes: "Secondary sets are often on longer than expected.",
  },
  "Desktop PC": {
    kwh_year: { Low: 100, Medium: 220, High: 450 },
    notes: "Gaming or workstation use pushes this up.",
  },
  "Laptop docking setup": {
    kwh_year: { Low: 40, Medium: 90, High: 160 },
    notes: "Usually lower than desktop.",
  },
  "Gaming console": {
    kwh_year: { Low: 40, Medium: 120, High: 220 },
    notes: "Standby and downloads also count.",
  },
  "Router / network gear": {
    kwh_year: { Low: 70, Medium: 110, High: 180 },
    notes: "Always-on background load.",
  },
  "EV charger": {
    kwh_year: { Low: 1200, Medium: 2500, High: 4500 },
    notes: "One of the biggest loads in an electrified home.",
  },
  "Hot tub": {
    kwh_year: { Low: 1500, Medium: 2800, High: 4500 },
    notes: "Very high if heated year-round.",
  },
  Aquarium: {
    kwh_year: { Low: 120, Medium: 260, High: 500 },
    notes: "Heating and pumps dominate.",
  },
};

export const AGE_FACTORS: Record<string, number> = {
  "New (<5 years)": 0.9,
  "Mid-life (5-10 years)": 1.0,
  "Older (10+ years)": 1.2,
  Unknown: 1.05,
};

export const FREQUENCY_MULTIPLIER: Record<string, number> = {
  Monthly: 12,
  "Bi-monthly": 6,
  Quarterly: 4,
  Annual: 1,
};

export type ApplianceRow = {
  category: string;
  appliance: string;
  age_band: string;
  usage: string;
  qty: number;
  estimated_kwh_year: number;
  notes: string;
};

export type EnergyAssessmentAnswers = {
  country: string;
  property_type: string;
  bedrooms: number;
  year_built: number;
  floor_area: number;
  glazing: string;
  main_heating: string;
  energy_rating: string;
  occupants: number;
  has_solar: boolean;
  has_battery: boolean;
  notes: string;

  bill_frequency: string;
  avg_electricity_bill: number;
  unit_rate: number;
  standing_charge: number;
  annual_bill_override: number;

  fabric_meta: Record<string, string>;
  wall_rating: string;
  wall_u_manual: number;
  window_rating: string;
  window_u_manual: number;
  floor_rating: string;
  floor_u_manual: number;
  roof_rating: string;
  roof_u_manual: number;

  appliances: {
    appliance: string;
    category: string;
    age_band: string;
    usage: string;
    qty: number;
  }[];
};

export function getUValue(
  elementName: string,
  rating: string,
  manualValue: number
) {
  if (rating === "I know the U-value") {
    return manualValue && manualValue > 0 ? manualValue : null;
  }

  return U_VALUE_DEFAULTS[elementName]?.[rating] ?? null;
}

export function applianceEstimate(name: string, usage: string, age: string) {
  const profile = APPLIANCE_PROFILES[name];

  if (!profile) {
    return 0;
  }

  const base = profile.kwh_year[usage] ?? 0;
  const factor = AGE_FACTORS[age] ?? 1;

  return Math.round(base * factor * 10) / 10;
}

export function convertScore(points: number) {
  if (points >= 6) return "High";
  if (points >= 3) return "Medium";
  return "Low";
}

export function calculateScores(input: {
  year_built: number;
  glazing: string;
  wall_u: number | null;
  roof_u: number | null;
  floor_u: number | null;
  window_u: number | null;
  heating_system: string;
  avg_bill: number;
  top_appliances: ApplianceRow[];
  has_ev: boolean;
  has_immersion: boolean;
  has_electric_shower: boolean;
}) {
  let heatLossPoints = 0;
  let runningCostPoints = 0;
  let improvementPoints = 0;

  if (input.year_built < 1990) {
    heatLossPoints += 2;
    improvementPoints += 1;
  } else if (input.year_built < 2005) {
    heatLossPoints += 1;
  }

  if (input.glazing === "Single glazing") {
    heatLossPoints += 2;
    improvementPoints += 1;
  } else if (input.glazing === "Double glazing") {
    heatLossPoints += 1;
  }

  if (input.wall_u && input.wall_u > 0.6) {
    heatLossPoints += 2;
    improvementPoints += 2;
  } else if (input.wall_u && input.wall_u > 0.3) {
    heatLossPoints += 1;
    improvementPoints += 1;
  }

  if (input.roof_u && input.roof_u > 0.3) {
    heatLossPoints += 2;
    improvementPoints += 2;
  } else if (input.roof_u && input.roof_u > 0.18) {
    heatLossPoints += 1;
    improvementPoints += 1;
  }

  if (input.floor_u && input.floor_u > 0.5) {
    heatLossPoints += 1;
    improvementPoints += 1;
  } else if (input.floor_u && input.floor_u > 0.22) {
    heatLossPoints += 1;
  }

  if (input.window_u && input.window_u > 2.5) {
    heatLossPoints += 2;
    improvementPoints += 2;
  } else if (input.window_u && input.window_u > 1.6) {
    heatLossPoints += 1;
    improvementPoints += 1;
  }

  if (
    ["Oil boiler", "Electric heating", "Solid fuel"].includes(
      input.heating_system
    )
  ) {
    runningCostPoints += 2;
    improvementPoints += 1;
  } else if (input.heating_system === "Gas boiler") {
    runningCostPoints += 1;
  }

  if (input.avg_bill >= 250) {
    runningCostPoints += 2;
    improvementPoints += 1;
  } else if (input.avg_bill >= 150) {
    runningCostPoints += 1;
  }

  if (input.has_electric_shower) runningCostPoints += 1;
  if (input.has_ev) runningCostPoints += 2;
  if (input.has_immersion) runningCostPoints += 1;

  if (input.top_appliances.length > 0) {
    const biggestApplianceKwh = input.top_appliances[0].estimated_kwh_year;

    if (biggestApplianceKwh >= 1800) {
      runningCostPoints += 2;
      improvementPoints += 1;
    } else if (biggestApplianceKwh >= 800) {
      runningCostPoints += 1;
    }
  }

  return {
    "Heat loss risk": convertScore(heatLossPoints),
    "Running cost risk": convertScore(runningCostPoints),
    "Efficiency improvement potential": convertScore(improvementPoints),
  };
}

export function analyseEnergyAssessment(answers: EnergyAssessmentAnswers) {
  const countryDefaults = COUNTRY_DEFAULTS[answers.country] ?? COUNTRY_DEFAULTS.Ireland;

  const annualBillEstimate =
    answers.annual_bill_override > 0
      ? answers.annual_bill_override
      : answers.avg_electricity_bill *
        FREQUENCY_MULTIPLIER[answers.bill_frequency];

  const estimatedBillKwh = Math.max(
    (annualBillEstimate -
      answers.standing_charge * FREQUENCY_MULTIPLIER[answers.bill_frequency]) /
      Math.max(answers.unit_rate, 0.01),
    0
  );

  const wallU = getUValue("Walls", answers.wall_rating, answers.wall_u_manual);
  const windowU = getUValue(
    "Windows",
    answers.window_rating,
    answers.window_u_manual
  );
  const floorU = getUValue(
    "Floors",
    answers.floor_rating,
    answers.floor_u_manual
  );
  const roofU = getUValue("Roof", answers.roof_rating, answers.roof_u_manual);

  const applianceRows: ApplianceRow[] = answers.appliances.map((item) => {
    const profile = APPLIANCE_PROFILES[item.appliance];

    return {
      category: item.category,
      appliance: item.appliance,
      age_band: item.age_band,
      usage: item.usage,
      qty: item.qty,
      estimated_kwh_year:
        applianceEstimate(item.appliance, item.usage, item.age_band) * item.qty,
      notes: profile?.notes ?? "",
    };
  });

  const topAppliances = [...applianceRows].sort(
    (a, b) => b.estimated_kwh_year - a.estimated_kwh_year
  );

  const applianceKwh = applianceRows.reduce(
    (sum, row) => sum + row.estimated_kwh_year,
    0
  );

  let heatLossIndex = 0;

  const weightedValues: Array<[number | null, number]> = [
    [wallU, 0.3],
    [windowU, 0.3],
    [floorU, 0.15],
    [roofU, 0.25],
  ];

  for (const [value, weighting] of weightedValues) {
    if (value !== null) {
      heatLossIndex += value * weighting;
    }
  }

  let fabricBand = "Strong";

  if (heatLossIndex >= 2.2) {
    fabricBand = "Weak";
  } else if (heatLossIndex >= 1.0) {
    fabricBand = "Moderate";
  }

  const validUValues: Array<[string, number | null]> = [
    ["Walls", wallU],
    ["Windows / glazing", windowU],
    ["Floor", floorU],
    ["Roof", roofU],
  ].filter((item) => item[1] !== null);

  const biggestLossArea =
    validUValues.length > 0
      ? validUValues.reduce((max, current) =>
          (current[1] ?? 0) > (max[1] ?? 0) ? current : max
        )[0]
      : "Unknown";

  const quickScores = calculateScores({
    year_built: answers.year_built,
    glazing: answers.glazing,
    wall_u: wallU,
    roof_u: roofU,
    floor_u: floorU,
    window_u: windowU,
    heating_system: answers.main_heating,
    avg_bill: answers.avg_electricity_bill,
    top_appliances: topAppliances,
    has_ev: applianceRows.some((row) => row.appliance === "EV charger"),
    has_immersion: applianceRows.some(
      (row) => row.appliance === "Immersion heater"
    ),
    has_electric_shower: applianceRows.some(
      (row) => row.appliance === "Electric shower"
    ),
  });

  const recommendations = buildRecommendations({
    biggestLossArea,
    windowU,
    roofU,
    wallU,
    applianceRows,
    applianceKwh,
    estimatedBillKwh,
  });

  const priorityRows = [
    {
      area: biggestLossArea,
      why_it_matters: "Highest estimated fabric U-value among the entered elements.",
    },
    ...topAppliances.slice(0, 4).map((row) => ({
      area: row.appliance,
      why_it_matters: `Estimated ${row.estimated_kwh_year.toFixed(
        0
      )} kWh/year. ${row.notes}`,
    })),
  ];

  return {
    countryDefaults,
    annualBillEstimate,
    estimatedBillKwh,
    wallU,
    windowU,
    floorU,
    roofU,
    applianceRows,
    topAppliances,
    applianceKwh,
    heatLossIndex,
    fabricBand,
    biggestLossArea,
    quickScores,
    recommendations,
    priorityRows,
  };
}

function buildRecommendations(input: {
  biggestLossArea: string;
  windowU: number | null;
  roofU: number | null;
  wallU: number | null;
  applianceRows: ApplianceRow[];
  applianceKwh: number;
  estimatedBillKwh: number;
}) {
  const recommendations: string[] = [];

  if (
    input.biggestLossArea === "Windows / glazing" &&
    input.windowU &&
    input.windowU > 2.5
  ) {
    recommendations.push(
      "Glazing looks like a likely heat-loss weak point. Fabric-first action on windows should come before chasing small plug-load savings."
    );
  }

  if (input.biggestLossArea === "Roof" && input.roofU && input.roofU > 0.3) {
    recommendations.push(
      "Roof heat loss looks material. Attic or roof insulation is likely to beat most appliance upgrades for overall impact."
    );
  }

  if (input.biggestLossArea === "Walls" && input.wallU && input.wallU > 0.6) {
    recommendations.push(
      "Walls look like a notable weakness. Wall insulation detail and retrofit options deserve attention before fine-tuning gadgets."
    );
  }

  if (
    input.applianceRows.some(
      (row) =>
        row.appliance === "Immersion heater" &&
        ["Medium", "High"].includes(row.usage)
    )
  ) {
    recommendations.push(
      "Immersion heater use may be driving a disproportionate share of consumption. Timers, controls and hot water strategy should be checked early."
    );
  }

  if (
    input.applianceRows.some(
      (row) => row.appliance === "Electric shower" && row.usage === "High"
    )
  ) {
    recommendations.push(
      "Heavy electric shower use can materially raise bills. Shower duration and flow rate matter as much as the appliance itself."
    );
  }

  if (
    input.applianceRows.some(
      (row) => row.appliance === "EV charger" && ["Medium", "High"].includes(row.usage)
    )
  ) {
    recommendations.push(
      "EV charging is likely one of the dominant electrical loads. Smart charging and tariff timing will matter."
    );
  }

  if (
    input.applianceRows.some(
      (row) =>
        ["Tumble dryer", "Washer-dryer", "Portable electric heater", "Hot tub"].includes(
          row.appliance
        ) && row.usage === "High"
    )
  ) {
    recommendations.push(
      "One or more high-load appliances are in heavy use. These may be the biggest quick-win area after obvious fabric issues."
    );
  }

  if (
    input.estimatedBillKwh > 0 &&
    input.applianceKwh > input.estimatedBillKwh * 0.9
  ) {
    recommendations.push(
      "Your selected appliance profile is close to the full bill estimate, which suggests either a very appliance-heavy home or that some tariff assumptions need refining."
    );
  }

  if (
    input.estimatedBillKwh > 0 &&
    input.applianceKwh < input.estimatedBillKwh * 0.45
  ) {
    recommendations.push(
      "There is a sizeable gap between appliance estimates and the bill-based estimate. That usually points to heating, hot water, cooking, EV charging, tariff effects or missing appliances."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "The home looks fairly balanced on the inputs provided. The next improvement step is to sharpen the fabric details and fill out all major appliances for a more confident breakdown."
    );
  }

  return recommendations;
}