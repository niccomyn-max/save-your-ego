import {
  USAuditResult,
  USAssessmentAnswers,
  USMoneyRange,
  USRecommendation,
  USRecommendationConfidence,
  USRecommendationImpact,
  USRecommendationType,
} from "./schema";
import {
  USD_ZERO_COST,
  applyOverlapAdjustment,
  applyWholeHomeSavingsSanityCheck,
  calculateSimplePaybackBand,
  enforceNoCostDisplay,
  normaliseUsdRange,
} from "./finance";
import {
  getUSControlProfile,
  suppressForControl,
} from "./controls";
import {
  deriveUSClimateFromZip,
  getUSClimateWeights,
} from "./climate";

type CandidateInput = Omit<
  USRecommendation,
  "cost" | "payback" | "savings"
> & {
  cost?: USMoneyRange;
  savings?: USRecommendation["savings"];
};

function moneyRange(min: number | null, max: number | null): USMoneyRange {
  return normaliseUsdRange(min, max);
}

function noCostCandidate(
  input: Omit<CandidateInput, "type" | "cost"> & {
    type?: Extract<USRecommendationType, "No-Cost Action">;
  }
): USRecommendation {
  return enforceNoCostDisplay({
    ...input,
    type: "No-Cost Action",
    cost: USD_ZERO_COST,
    payback: "Immediate",
    savings: input.savings ?? null,
  });
}

function makeCandidate(input: CandidateInput): USRecommendation {
  const cost = input.cost ?? moneyRange(null, null);
  const annualSavings = input.savings?.annual_cost_savings ?? null;

  return {
    ...input,
    cost,
    savings: input.savings ?? null,
    payback: calculateSimplePaybackBand({
      cost,
      annualSavings,
      isNoCostAction: input.type === "No-Cost Action",
    }),
  };
}

function annualElectricitySpend(answers: USAssessmentAnswers) {
  const bill = answers.bills_behaviour.typical_monthly_electricity_bill;
  if (bill !== null && bill >= 0) return bill * 12;

  const annualKwh = answers.bills_behaviour.electricity_usage_kwh_annual;
  const monthlyKwh = answers.bills_behaviour.electricity_usage_kwh_monthly;
  const rate = answers.bills_behaviour.electricity_unit_rate_per_kwh;

  if (rate !== null && rate > 0 && annualKwh !== null && annualKwh >= 0) {
    return annualKwh * rate;
  }

  if (rate !== null && rate > 0 && monthlyKwh !== null && monthlyKwh >= 0) {
    return monthlyKwh * 12 * rate;
  }

  return null;
}

function annualGasSpend(answers: USAssessmentAnswers) {
  const typical = answers.bills_behaviour.natural_gas_typical_bill;
  if (typical !== null && typical >= 0) return typical * 12;

  const therms = answers.bills_behaviour.natural_gas_therms;
  const rate = answers.bills_behaviour.natural_gas_unit_rate_per_therm;
  if (therms !== null && rate !== null && therms >= 0 && rate > 0) {
    return therms * rate;
  }

  return null;
}

function annualTotalSpend(answers: USAssessmentAnswers) {
  const values = [
    annualElectricitySpend(answers),
    annualGasSpend(answers),
    answers.bills_behaviour.propane_annual_spend,
    answers.bills_behaviour.heating_oil_annual_spend,
  ].filter((value): value is number => value !== null && value >= 0);

  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

function confidenceScore(confidence: USRecommendationConfidence) {
  if (confidence === "High") return 4;
  if (confidence === "Medium") return 2.5;
  return 1;
}

function lowCostAdvantage(type: USRecommendationType) {
  switch (type) {
    case "No-Cost Action":
      return 3;
    case "Investigation":
      return 3;
    case "Low-Cost Fix":
    case "Maintenance":
      return 2;
    case "Moderate Upgrade":
      return 1;
    default:
      return 0;
  }
}

function easeScore(type: USRecommendationType) {
  switch (type) {
    case "No-Cost Action":
      return 2;
    case "Investigation":
    case "Low-Cost Fix":
    case "Maintenance":
      return 1.5;
    case "Moderate Upgrade":
      return 0.5;
    default:
      return 0;
  }
}

export function scoreUSRecommendation(recommendation: USRecommendation) {
  return (
    recommendation.estimated_impact +
    confidenceScore(recommendation.confidence) +
    lowCostAdvantage(recommendation.type) +
    easeScore(recommendation.type) +
    (recommendation.directly_addresses_stated_problem ? 3 : 0)
  );
}

function dedupeRecommendations(items: USRecommendation[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function issueListIncludes(answers: USAssessmentAnswers, value: string) {
  return answers.home.window_door_issues.includes(value);
}

function symptomsInclude(answers: USAssessmentAnswers, value: string) {
  return answers.hvac.symptoms.includes(value);
}

function climateImpact(
  base: USRecommendationImpact,
  modifier: number
): USRecommendationImpact {
  return Math.max(0, Math.min(4, base + modifier)) as USRecommendationImpact;
}

function candidateRules(
  answers: USAssessmentAnswers
): USRecommendation[] {
  const derivedClimate = deriveUSClimateFromZip(answers.home.zip_code);
  const climate = derivedClimate.climate_context;
  const weights = getUSClimateWeights(climate);
  const items: USRecommendation[] = [];

  const hasHotRoom =
    answers.home.rooms_consistently_hot_or_cold === "Yes" &&
    (answers.home.hot_or_cold_room_locations.includes("Sun-facing room") ||
      symptomsInclude(answers, "Hot rooms"));

  if (
    hasHotRoom &&
    ["Rarely", "Never"].includes(
      answers.home.closes_coverings_for_summer_sun
    )
  ) {
    items.push(
      noCostCandidate({
        id: "close-sunny-window-coverings",
        title: "Close blinds or shades before the afternoon sun heats the room",
        summary:
          "This is a free way to keep a hot room cooler before you spend money on cooling equipment.",
        group: "Do Now",
        end_use_category: "Cooling",
        confidence: "High",
        estimated_impact: climateImpact(2, weights.solar_gain >= 3 ? 1 : 0),
        savings: null,
        savings_evidence_level: "Indicative",
        overlap_group: "cooling-load",
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: true,
        trigger_answer_ids: [
          "home.rooms_consistently_hot_or_cold",
          "home.hot_or_cold_room_locations",
          "home.closes_coverings_for_summer_sun",
        ],
        why_this_appeared: [
          "You reported a hot or sun-facing room.",
          "Existing blinds or curtains are not normally closed before strong summer sun.",
          climate
            ? `Your area has a ${climate} climate, so afternoon sun can have a bigger effect on cooling.`
            : "Climate context was not available, so the recommendation is not climate-boosted.",
        ],
        benefits: {
          bill_savings: true,
          comfort: true,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (
    ["Rarely", "Never"].includes(answers.hvac.setback_when_away_or_sleeping)
  ) {
    items.push(
      noCostCandidate({
        id: "use-existing-thermostat-schedule",
        title: "Use your thermostat schedule when nobody is home or while you sleep",
        summary:
          "Let the thermostat ease back when you do not need full heating or cooling. You can do this with the controls you already have.",
        group: "Do Now",
        end_use_category: "HVAC controls",
        confidence: "High",
        estimated_impact: climateImpact(
          2,
          Math.max(weights.heating, weights.cooling) >= 4 ? 1 : 0
        ),
        savings: null,
        savings_evidence_level: "Indicative",
        overlap_group: "hvac-runtime",
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem:
          answers.bills_behaviour.bills_highest === "Summer" ||
          answers.bills_behaviour.bills_highest === "Winter",
        trigger_answer_ids: ["hvac.setback_when_away_or_sleeping"],
        why_this_appeared: [
          "Your thermostat is rarely or never adjusted when the home is empty or while people are sleeping.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (answers.hvac.blocked_supply_or_return_vents === "Yes") {
    items.push(
      noCostCandidate({
        id: "clear-blocked-vents",
        title: "Move furniture or rugs away from heating and cooling vents",
        summary:
          "Give the system a clear path for air first. Blocked vents can make rooms uncomfortable even when the equipment itself is fine.",
        group: "Do Now",
        end_use_category: "HVAC airflow",
        confidence: "High",
        estimated_impact: 2,
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "hvac-airflow",
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem:
          symptomsInclude(answers, "Weak airflow") ||
          symptomsInclude(answers, "Hot rooms") ||
          symptomsInclude(answers, "Cold rooms"),
        trigger_answer_ids: ["hvac.blocked_supply_or_return_vents"],
        why_this_appeared: ["You reported blocked supply or return vents."],
        benefits: {
          bill_savings: false,
          comfort: true,
          resilience: false,
          reliability: true,
          maintenance: true,
        },
      })
    );
  }

  if (
    answers.hvac.ceiling_fan_use !== "No" &&
    ["Rarely", "Never"].includes(answers.hvac.turns_off_fans_in_empty_rooms)
  ) {
    items.push(
      noCostCandidate({
        id: "turn-off-empty-room-fans",
        title: "Turn ceiling fans off when nobody is in the room",
        summary:
          "Ceiling fans make people feel cooler; they do not cool an empty room. Turn them off when you leave.",
        group: "Do Now",
        end_use_category: "Fans",
        confidence: "High",
        estimated_impact: 1,
        savings: null,
        savings_evidence_level: "Indicative",
        overlap_group: null,
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: [
          "hvac.ceiling_fan_use",
          "hvac.turns_off_fans_in_empty_rooms",
        ],
        why_this_appeared: [
          "Ceiling fans are used and are rarely or never turned off in empty rooms.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (
    answers.hvac.filter_frequency === "Rarely" ||
    answers.hvac.filter_frequency === "Not sure"
  ) {
    items.push(
      makeCandidate({
        id: "check-hvac-filter",
        title: "Check or replace the heating and cooling air filter",
        summary:
          "A clogged filter can restrict airflow and make the system work harder. Check this simple maintenance item before assuming there is a bigger problem.",
        group: "Low-Cost Fixes",
        type: "Maintenance",
        end_use_category: "HVAC maintenance",
        confidence: "High",
        estimated_impact: 2,
        cost: moneyRange(10, 40),
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "hvac-airflow",
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem:
          symptomsInclude(answers, "Weak airflow") ||
          symptomsInclude(answers, "Long runtimes"),
        trigger_answer_ids: ["hvac.filter_frequency"],
        why_this_appeared: [
          "The HVAC filter is checked rarely or its maintenance interval is unknown.",
        ],
        benefits: {
          bill_savings: false,
          comfort: true,
          resilience: false,
          reliability: true,
          maintenance: true,
        },
      })
    );
  }

  if (
    answers.hvac.main_heating === "Heat pump" &&
    answers.hvac.heat_pump_aux_heat_frequency === "Frequently"
  ) {
    items.push(
      makeCandidate({
        id: "investigate-frequent-aux-heat",
        title: "Check why AUX or Emergency Heat is coming on so often",
        summary:
          "Backup heat can use a lot of electricity. If AUX or Emergency Heat appears often, have the settings and heat-pump performance checked before thinking about replacement.",
        group: "Investigate Next",
        type: "Investigation",
        end_use_category: "Heating",
        confidence: "High",
        estimated_impact: climateImpact(3, weights.auxiliary_heat >= 4 ? 1 : 0),
        cost: USD_ZERO_COST,
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "heating-load",
        control_relevance: "Owner controlled",
        directly_addresses_stated_problem:
          answers.bills_behaviour.bills_highest === "Winter" ||
          symptomsInclude(answers, "High winter bills"),
        trigger_answer_ids: [
          "hvac.main_heating",
          "hvac.heat_pump_aux_heat_frequency",
        ],
        why_this_appeared: [
          "You reported a heat pump.",
          "Auxiliary or emergency heat runs frequently.",
          climate
            ? `Your area has a ${climate} climate, so backup heat is especially important to understand.`
            : "ZIP-derived climate context was unavailable.",
        ],
        benefits: {
          bill_savings: true,
          comfort: true,
          resilience: false,
          reliability: true,
          maintenance: true,
        },
      })
    );
  }

  const ductsInHarshSpace = ["Attic", "Crawlspace", "Garage"].includes(
    answers.hvac.duct_location
  );
  const ductSymptoms =
    symptomsInclude(answers, "Weak airflow") ||
    symptomsInclude(answers, "Hot rooms") ||
    symptomsInclude(answers, "Cold rooms") ||
    symptomsInclude(answers, "Long runtimes");

  if (ductsInHarshSpace && ductSymptoms) {
    items.push(
      makeCandidate({
        id: "inspect-visible-duct-condition",
        title: "Look for obvious duct damage before paying for repairs",
        summary:
          "If you can safely see your ducts, look for sections that are disconnected, crushed or badly damaged. A simple problem may explain the comfort issue.",
        group: "Investigate Next",
        type: "Investigation",
        end_use_category: "Ducts",
        confidence: "Medium",
        estimated_impact: climateImpact(2, weights.ducts >= 4 ? 1 : 0),
        cost: USD_ZERO_COST,
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "hvac-airflow",
        control_relevance: "Owner controlled",
        directly_addresses_stated_problem: true,
        trigger_answer_ids: ["hvac.duct_location", "hvac.symptoms"],
        why_this_appeared: [
          `Most ducts run through the ${answers.hvac.duct_location.toLowerCase()}.`,
          "You reported an airflow, comfort or runtime symptom.",
        ],
        benefits: {
          bill_savings: false,
          comfort: true,
          resilience: false,
          reliability: true,
          maintenance: true,
        },
      })
    );
  }

  if (
    answers.water_heating.temperature_band === "Above 130F"
  ) {
    items.push(
      noCostCandidate({
        id: "review-water-heater-temperature",
        title: "Check whether your water heater is set hotter than you need",
        summary:
          "You reported a setting above 130°F. Check the manufacturer guidance and whether a lower safe setting would meet your needs.",
        group: "Do Now",
        end_use_category: "Water heating",
        confidence: "High",
        estimated_impact: 1,
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "water-heating",
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: ["water_heating.temperature_band"],
        why_this_appeared: [
          "You reported a water-heater temperature above 130F.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (
    answers.water_heating.shower_length === "Over 15" ||
    answers.water_heating.showers_per_day === "7+"
  ) {
    items.push(
      noCostCandidate({
        id: "reduce-hot-water-shower-runtime",
        title: "Cut back very long showers where practical",
        summary:
          "Long or very frequent showers can drive hot-water use. Try the easy habit change before spending on the water heater.",
        group: "Do Now",
        end_use_category: "Water heating",
        confidence: "High",
        estimated_impact: 2,
        savings: null,
        savings_evidence_level: "Indicative",
        overlap_group: "water-heating",
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: [
          "water_heating.shower_length",
          "water_heating.showers_per_day",
        ],
        why_this_appeared: [
          "Your reported shower duration or number of daily showers indicates relatively high hot-water demand.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (answers.water_heating.recirculation_pump === "Continuous") {
    items.push(
      noCostCandidate({
        id: "review-recirculation-schedule",
        title: "Put the hot-water recirculation system on a schedule if you can",
        summary:
          "If your controls allow it, avoid running hot-water circulation all day and night when nobody needs it.",
        group: "Do Now",
        end_use_category: "Water heating",
        confidence: "High",
        estimated_impact: 2,
        savings: null,
        savings_evidence_level: "Indicative",
        overlap_group: "water-heating",
        control_relevance: "Owner controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: ["water_heating.recirculation_pump"],
        why_this_appeared: [
          "The hot-water recirculation pump is reported as running continuously.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (answers.water_heating.dripping_hot_water_fixtures === "Yes") {
    items.push(
      makeCandidate({
        id: "repair-hot-water-drip",
        title: "Fix a dripping hot-water faucet or shower",
        summary:
          "A hot-water drip wastes water and also wastes the energy used to heat that water.",
        group: "Low-Cost Fixes",
        type: "Low-Cost Fix",
        end_use_category: "Water heating",
        confidence: "High",
        estimated_impact: 1,
        cost: moneyRange(10, 150),
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "water-heating",
        control_relevance: "Owner controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: ["water_heating.dripping_hot_water_fixtures"],
        why_this_appeared: ["You reported a hot-water faucet or showerhead drip."],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: true,
          maintenance: true,
        },
      })
    );
  }

  if (
    answers.appliances.multiple_drying_cycles === "Often" ||
    answers.appliances.multiple_drying_cycles === "Sometimes"
  ) {
    items.push(
      makeCandidate({
        id: "check-dryer-airflow-before-replacement",
        title: "Check the dryer vent if clothes need more than one cycle",
        summary:
          "If clothes often need a second cycle, first check the lint screen and vent path. Poor airflow can make drying take much longer.",
        group: "Investigate Next",
        type: "Investigation",
        end_use_category: "Laundry",
        confidence: "High",
        estimated_impact: 2,
        cost: USD_ZERO_COST,
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "dryer-runtime",
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: ["appliances.multiple_drying_cycles"],
        why_this_appeared: [
          "Clothes sometimes or often need more than one drying cycle.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: true,
          maintenance: true,
        },
      })
    );
  }

  if (answers.appliances.dishwasher_heated_dry === "Always") {
    items.push(
      noCostCandidate({
        id: "disable-heated-dry",
        title: "Try the dishwasher's air-dry setting",
        summary:
          "If your dishes dry well enough without heated dry, switching the setting costs nothing.",
        group: "Do Now",
        end_use_category: "Dishwasher",
        confidence: "High",
        estimated_impact: 1,
        savings: null,
        savings_evidence_level: "Indicative",
        overlap_group: null,
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: ["appliances.dishwasher_heated_dry"],
        why_this_appeared: ["Heated dry is used on every dishwasher cycle."],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (answers.appliances.laundry_wash_temperature === "Hot") {
    items.push(
      noCostCandidate({
        id: "use-cooler-laundry-wash",
        title: "Use a cooler wash for clothes that do not need hot water",
        summary:
          "Heating wash water uses energy. Choose cold or warm for everyday loads when the clothing care instructions allow it.",
        group: "Do Now",
        end_use_category: "Laundry",
        confidence: "High",
        estimated_impact: 1,
        savings: null,
        savings_evidence_level: "Indicative",
        overlap_group: "water-heating",
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: ["appliances.laundry_wash_temperature"],
        why_this_appeared: ["Laundry is normally washed hot."],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (
    answers.appliances.partial_loads === "Yes" ||
    answers.appliances.partial_loads === "Sometimes"
  ) {
    items.push(
      noCostCandidate({
        id: "run-fuller-appliance-loads",
        title: "Wait for a fuller dishwasher or laundry load when practical",
        summary:
          "Running fewer, fuller loads can cut repeated machine cycles and hot-water use.",
        group: "Do Now",
        end_use_category: "Appliances",
        confidence: "High",
        estimated_impact: 1,
        savings: null,
        savings_evidence_level: "Indicative",
        overlap_group: null,
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: ["appliances.partial_loads"],
        why_this_appeared: ["Partial appliance loads are run regularly."],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (
    answers.appliances.entertainment_left_on_unnecessarily === "Often" ||
    answers.appliances.entertainment_left_on_unnecessarily === "Sometimes"
  ) {
    items.push(
      noCostCandidate({
        id: "switch-off-unused-entertainment",
        title: "Turn off TVs, computers and gaming equipment when nobody is using them",
        summary:
          "You told us some equipment is left on when it is not being used. Switching it off is a free first step.",
        group: "Do Now",
        end_use_category: "Plug loads",
        confidence: "High",
        estimated_impact: 1,
        savings: null,
        savings_evidence_level: "Indicative",
        overlap_group: null,
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: [
          "appliances.entertainment_left_on_unnecessarily",
        ],
        why_this_appeared: [
          "Computing or entertainment equipment is sometimes or often left on unnecessarily.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (
    ["2", "3+"].includes(answers.appliances.refrigerators_in_regular_use) &&
    answers.appliances.extra_cold_storage_location.length > 0
  ) {
    items.push(
      noCostCandidate({
        id: "review-extra-refrigerator-necessity",
        title: "Decide whether you still need the extra fridge or freezer",
        summary:
          "A second fridge or freezer runs all day. If it is rarely useful, turning it off can be simpler than replacing it.",
        group: "Do Now",
        end_use_category: "Refrigeration",
        confidence: "Medium",
        estimated_impact: 2,
        savings: null,
        savings_evidence_level: "Indicative",
        overlap_group: null,
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: [
          "appliances.refrigerators_in_regular_use",
          "appliances.extra_cold_storage_location",
        ],
        why_this_appeared: [
          "More than one refrigerator/freezer is in regular use.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (
    climate === "Hot-Humid" &&
    answers.appliances.other_continuous_loads.includes("Dehumidifier")
  ) {
    items.push(
      makeCandidate({
        id: "investigate-humidity-load",
        title: "Find out why the home needs so much dehumidifying",
        summary:
          "Regular dehumidifier use can add to electricity use. In a humid climate, it is worth checking where the moisture is coming from before adding more equipment.",
        group: "Investigate Next",
        type: "Investigation",
        end_use_category: "Humidity",
        confidence: "Medium",
        estimated_impact: 3,
        cost: USD_ZERO_COST,
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "cooling-humidity",
        control_relevance: "Owner controlled",
        directly_addresses_stated_problem:
          answers.bills_behaviour.bills_highest === "Summer",
        trigger_answer_ids: [
          "appliances.other_continuous_loads",
          "hidden_context.climate_context",
        ],
        why_this_appeared: [
          "A dehumidifier is used regularly.",
          "Your area is hot and humid, so moisture control can add noticeably to cooling-related electricity use.",
        ],
        benefits: {
          bill_savings: true,
          comfort: true,
          resilience: false,
          reliability: false,
          maintenance: true,
        },
      })
    );
  }

  if (
    answers.outdoor.outdoor_lighting_control === "Dusk-to-dawn"
  ) {
    items.push(
      noCostCandidate({
        id: "review-all-night-outdoor-lighting",
        title: "Shorten the hours outdoor lights stay on",
        summary:
          "If the lights do not need to stay on from dusk to dawn, use the timer or controls you already have to shorten the schedule.",
        group: "Do Now",
        end_use_category: "Outdoor lighting",
        confidence: "High",
        estimated_impact: 1,
        savings: null,
        savings_evidence_level: "Indicative",
        overlap_group: null,
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: ["outdoor.outdoor_lighting_control"],
        why_this_appeared: [
          "Outdoor lighting is controlled dusk-to-dawn.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (
    answers.outdoor.swimming_pool &&
    answers.outdoor.pool_pump_runtime !== "N/A" &&
    ["8-12", ">12 hours/day"].includes(answers.outdoor.pool_pump_runtime)
  ) {
    items.push(
      noCostCandidate({
        id: "review-pool-pump-runtime",
        title: "Check whether the pool pump is running longer than it needs to",
        summary:
          "Pool pumps can use a meaningful amount of electricity. Compare the current schedule with the manufacturer's filtration guidance before changing it.",
        group: "Do Now",
        end_use_category: "Pool",
        confidence: "High",
        estimated_impact: climateImpact(3, weights.pools >= 3 ? 1 : 0),
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "pool",
        control_relevance: "Owner controlled",
        directly_addresses_stated_problem:
          answers.bills_behaviour.bills_highest === "Summer",
        trigger_answer_ids: [
          "outdoor.swimming_pool",
          "outdoor.pool_pump_runtime",
        ],
        why_this_appeared: [
          "A swimming pool is present.",
          `Pool-pump runtime is reported as ${answers.outdoor.pool_pump_runtime}.`,
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (
    answers.outdoor.hot_tub_spa &&
    answers.outdoor.hot_tub_kept_hot_continuously === "Yes" &&
    answers.outdoor.hot_tub_cover !== "Yes"
  ) {
    items.push(
      makeCandidate({
        id: "improve-hot-tub-cover",
        title: "Make sure the hot tub has a good, well-fitting cover",
        summary:
          "A hot tub that stays hot all the time can lose a lot of heat through the top. A good cover is the first thing to check.",
        group: "Low-Cost Fixes",
        type: "Low-Cost Fix",
        end_use_category: "Spa",
        confidence: "High",
        estimated_impact: 3,
        cost: moneyRange(100, 700),
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "spa",
        control_relevance: "Owner controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: [
          "outdoor.hot_tub_spa",
          "outdoor.hot_tub_kept_hot_continuously",
          "outdoor.hot_tub_cover",
        ],
        why_this_appeared: [
          "The spa is kept hot continuously.",
          "An effective cover is not confirmed.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: true,
        },
      })
    );
  }

  if (
    answers.outdoor.private_well === "Yes" &&
    answers.outdoor.well_pump_cycles_unusually_often === "Yes"
  ) {
    items.push(
      makeCandidate({
        id: "investigate-well-pump-cycling",
        title: "Find out why the well pump is switching on so often",
        summary:
          "A well pump that starts very frequently may have a pressure, leak or control problem. Check the cause before replacing the pump.",
        group: "Investigate Next",
        type: "Investigation",
        end_use_category: "Well pump",
        confidence: "High",
        estimated_impact: 2,
        cost: USD_ZERO_COST,
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: null,
        control_relevance: "Owner controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: [
          "outdoor.private_well",
          "outdoor.well_pump_cycles_unusually_often",
        ],
        why_this_appeared: [
          "A private well is present.",
          "The pump appears to cycle unusually often.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: true,
          reliability: true,
          maintenance: true,
        },
      })
    );
  }

  if (
    answers.bills_behaviour.doors_windows_open_while_hvac_runs === "Often" ||
    answers.bills_behaviour.doors_windows_open_while_hvac_runs === "Sometimes"
  ) {
    items.push(
      noCostCandidate({
        id: "avoid-open-windows-with-hvac",
        title: "Keep doors and windows closed while heating or cooling is running",
        summary:
          "Open doors and windows make the system heat or cool outdoor air. Closing them is a free way to avoid that waste.",
        group: "Do Now",
        end_use_category: "HVAC behaviour",
        confidence: "High",
        estimated_impact: 2,
        savings: null,
        savings_evidence_level: "Indicative",
        overlap_group: "hvac-runtime",
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: true,
        trigger_answer_ids: [
          "bills_behaviour.doors_windows_open_while_hvac_runs",
        ],
        why_this_appeared: [
          "Doors or windows are sometimes or often left open while heating or cooling is operating.",
        ],
        benefits: {
          bill_savings: true,
          comfort: true,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (
    answers.bills_behaviour.heats_or_cools_rarely_used_rooms === "Yes"
  ) {
    items.push(
      noCostCandidate({
        id: "reduce-conditioning-unused-rooms",
        title: "Use less heating or cooling in rooms you rarely use — if your system allows it",
        summary:
          "If you already have zoning or room controls, use them for little-used rooms. Do not close vents if your system is not designed for it.",
        group: "Do Now",
        end_use_category: "HVAC controls",
        confidence: "Medium",
        estimated_impact: 1,
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "hvac-runtime",
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: [
          "bills_behaviour.heats_or_cools_rarely_used_rooms",
        ],
        why_this_appeared: [
          "Rarely used rooms are routinely heated or cooled.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  if (
    answers.solar_battery_ev.ev_phev === "Yes" &&
    answers.solar_battery_ev.cheaper_off_peak_ev_rate === "Yes" &&
    answers.solar_battery_ev.ev_charging_time !== "Scheduled off-peak"
  ) {
    items.push(
      noCostCandidate({
        id: "shift-ev-charging-off-peak",
        title: "Charge your EV during the cheaper off-peak hours",
        summary:
          "Use the scheduling feature in your car or charger so the same charging happens when electricity costs less.",
        group: "Do Now",
        end_use_category: "EV",
        confidence: "High",
        estimated_impact: 3,
        savings: null,
        savings_evidence_level: "Calculated",
        overlap_group: null,
        control_relevance: "Occupant controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: [
          "solar_battery_ev.ev_phev",
          "solar_battery_ev.cheaper_off_peak_ev_rate",
          "solar_battery_ev.ev_charging_time",
        ],
        why_this_appeared: [
          "An EV/PHEV is charged at home.",
          "A cheaper off-peak rate is available.",
          "Charging is not already scheduled off-peak.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  const windowProblems =
    issueListIncludes(answers, "Drafts") ||
    issueListIncludes(answers, "Visible gaps/worn seals");

  if (windowProblems) {
    items.push(
      makeCandidate({
        id: "weatherstrip-window-door-leaks",
        title: "Seal obvious drafts around windows and doors before replacing them",
        summary:
          "A draft or worn seal may be fixable for a small cost. Try sealing the obvious gaps before thinking about new windows.",
        group: "Low-Cost Fixes",
        type: "Low-Cost Fix",
        end_use_category: "Envelope",
        confidence: "High",
        estimated_impact: climateImpact(2, weights.air_sealing >= 4 ? 1 : 0),
        cost: moneyRange(10, 150),
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "heating-cooling-envelope",
        control_relevance: "Owner controlled",
        directly_addresses_stated_problem: true,
        trigger_answer_ids: ["home.window_door_issues"],
        why_this_appeared: [
          "You reported drafts or visible gaps/worn seals around windows or exterior doors.",
        ],
        benefits: {
          bill_savings: true,
          comfort: true,
          resilience: false,
          reliability: false,
          maintenance: true,
        },
      })
    );
  }

  if (
    answers.home.rooms_consistently_hot_or_cold === "Yes" &&
    answers.home.hot_or_cold_room_locations.includes("Room over garage") &&
    answers.home.garage_type === "Attached"
  ) {
    items.push(
      makeCandidate({
        id: "investigate-room-over-garage",
        title: "Check why the room over the garage is hotter or colder than the rest of the home",
        summary:
          "Rooms over garages can be uncomfortable because of insulation, air leaks or airflow. Check those basics before assuming the heating or cooling system is the problem.",
        group: "Investigate Next",
        type: "Investigation",
        end_use_category: "Envelope",
        confidence: "High",
        estimated_impact: 3,
        cost: USD_ZERO_COST,
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "heating-cooling-envelope",
        control_relevance: "Owner controlled",
        directly_addresses_stated_problem: true,
        trigger_answer_ids: [
          "home.rooms_consistently_hot_or_cold",
          "home.hot_or_cold_room_locations",
          "home.garage_type",
        ],
        why_this_appeared: [
          "A room over the garage is consistently hotter or colder than the rest of the home.",
          "The garage is attached.",
        ],
        benefits: {
          bill_savings: false,
          comfort: true,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  const severeHvacSymptoms =
    symptomsInclude(answers, "Long runtimes") ||
    symptomsInclude(answers, "Short cycling") ||
    symptomsInclude(answers, "Weak airflow");

  if (
    answers.hvac.system_age_band === "20+ years" &&
    severeHvacSymptoms &&
    answers.hvac.blocked_supply_or_return_vents === "No" &&
    answers.hvac.filter_frequency !== "Rarely" &&
    answers.hvac.filter_frequency !== "Not sure"
  ) {
    items.push(
      makeCandidate({
        id: "consider-hvac-replacement-after-diagnosis",
        title: "Have the heating and cooling system checked before thinking about replacement",
        summary:
          "The system is older and you also reported performance problems. A proper check is the next step; age by itself is not a reason to replace it.",
        group: "Consider Later",
        type: "Major Upgrade",
        end_use_category: "HVAC",
        confidence: "Medium",
        estimated_impact: 4,
        cost: moneyRange(7000, 25000),
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: "heating-cooling-equipment",
        control_relevance: "Owner controlled",
        directly_addresses_stated_problem: true,
        trigger_answer_ids: [
          "hvac.system_age_band",
          "hvac.symptoms",
          "hvac.blocked_supply_or_return_vents",
          "hvac.filter_frequency",
        ],
        why_this_appeared: [
          "The main HVAC equipment is reported as 20+ years old.",
          "You also reported performance symptoms.",
          "The recommendation remains conditional because equipment age alone does not justify replacement.",
        ],
        benefits: {
          bill_savings: true,
          comfort: true,
          resilience: false,
          reliability: true,
          maintenance: false,
        },
      })
    );
  }

  const control = getUSControlProfile(answers);
  const hasSolarInputs =
    answers.solar_battery_ev.roof_orientation !== "Not sure" &&
    answers.solar_battery_ev.roof_shading !== "Not sure" &&
    answers.solar_battery_ev.usable_roof_space !== "Not sure";

  if (
    !answers.solar_battery_ev.rooftop_solar &&
    answers.solar_battery_ev.solar_interest !== "No" &&
    control.canControlPrivateRoof &&
    hasSolarInputs &&
    answers.solar_battery_ev.roof_shading !== "Heavy" &&
    answers.solar_battery_ev.usable_roof_space !== "Very limited"
  ) {
    items.push(
      makeCandidate({
        id: "consider-solar-after-demand-review",
        title: "Solar may be worth a closer look",
        summary:
          "You are interested in solar and your roof answers look promising enough for a proper quote or feasibility check. We have not guessed at system size, savings or payback.",
        group: "Consider Later",
        type: "Major Upgrade",
        end_use_category: "Solar",
        confidence: "Medium",
        estimated_impact: 3,
        cost: moneyRange(null, null),
        savings: null,
        savings_evidence_level: "Insufficient",
        overlap_group: null,
        control_relevance: "Owner controlled",
        directly_addresses_stated_problem: false,
        trigger_answer_ids: [
          "solar_battery_ev.solar_interest",
          "solar_battery_ev.authority_to_install_solar",
          "solar_battery_ev.roof_orientation",
          "solar_battery_ev.roof_shading",
          "solar_battery_ev.usable_roof_space",
        ],
        why_this_appeared: [
          "You are interested in solar.",
          "You reported authority to install it.",
          "Basic roof orientation, shading and usable-space information is available.",
        ],
        benefits: {
          bill_savings: true,
          comfort: false,
          resilience: false,
          reliability: false,
          maintenance: false,
        },
      })
    );
  }

  return items;
}

function suppressTrivialOrUnsupported(
  recommendation: USRecommendation
) {
  if (
    recommendation.estimated_impact === 0 &&
    !recommendation.benefits.comfort &&
    !recommendation.benefits.resilience &&
    !recommendation.benefits.reliability &&
    !recommendation.benefits.maintenance
  ) {
    return true;
  }

  if (
    recommendation.confidence === "Low" &&
    ["Moderate Upgrade", "Major Upgrade"].includes(recommendation.type)
  ) {
    return true;
  }

  return false;
}

function groupLimits(group: USRecommendation["group"]) {
  if (group === "Do Now") return 5;
  if (group === "Low-Cost Fixes") return 5;
  if (group === "Investigate Next") return 3;
  return 3;
}

function selectRecommendations(
  items: USRecommendation[]
): USRecommendation[] {
  const ordered = [...items].sort(
    (a, b) => scoreUSRecommendation(b) - scoreUSRecommendation(a)
  );

  const counts: Record<USRecommendation["group"], number> = {
    "Do Now": 0,
    "Low-Cost Fixes": 0,
    "Investigate Next": 0,
    "Consider Later": 0,
  };

  return ordered.filter((item) => {
    const limit = groupLimits(item.group);
    if (counts[item.group] >= limit) return false;
    counts[item.group] += 1;
    return true;
  });
}

function positiveFindings(answers: USAssessmentAnswers) {
  const positives: string[] = [];

  if (answers.hvac.blocked_supply_or_return_vents === "No") {
    positives.push("No blocked supply or return vents were reported.");
  }

  if (
    answers.hvac.filter_frequency === "Monthly" ||
    answers.hvac.filter_frequency === "Every 2-3 months"
  ) {
    positives.push("HVAC filter maintenance appears reasonably regular.");
  }

  if (answers.water_heating.temperature_band === "Around 120F") {
    positives.push("The reported water-heater setting is around 120F.");
  }

  if (
    answers.appliances.entertainment_left_on_unnecessarily === "Rarely" ||
    answers.appliances.entertainment_left_on_unnecessarily === "Never"
  ) {
    positives.push("Unnecessary entertainment/computing runtime appears limited.");
  }

  if (answers.bills_behaviour.doors_windows_open_while_hvac_runs === "Never") {
    positives.push("You reported that doors/windows are not left open while HVAC runs.");
  }

  if (answers.solar_battery_ev.ev_charging_time === "Scheduled off-peak") {
    positives.push("EV charging is already scheduled off-peak.");
  }

  return positives.slice(0, 5);
}

export function analyseUSAssessment(
  input: USAssessmentAnswers
): USAuditResult & {
  annual_energy_spend: number | null;
  climate_weights: ReturnType<typeof getUSClimateWeights>;
  savings_sanity_check: ReturnType<typeof applyWholeHomeSavingsSanityCheck>;
} {
  const climateResult = deriveUSClimateFromZip(input.home.zip_code);
  const answers: USAssessmentAnswers = {
    ...input,
    home: {
      ...input.home,
      state: climateResult.state ?? input.home.state,
    },
    hidden_context: {
      climate_context: climateResult.climate_context,
      climate_source: climateResult.source,
    },
  };

  const generated = dedupeRecommendations(candidateRules(answers));
  const controlSuppressed = generated.filter((item) =>
    suppressForControl(item, answers)
  );
  const materiallySupported = generated.filter(
    (item) =>
      !suppressForControl(item, answers) &&
      !suppressTrivialOrUnsupported(item)
  );

  const selected = selectRecommendations(materiallySupported);

  const savingsCandidates = selected
    .filter(
      (item) =>
        item.savings !== null &&
        item.savings.annual_cost_savings.min !== null &&
        item.savings.annual_cost_savings.max !== null
    )
    .map((item) => ({
      id: item.id,
      overlapGroup: item.overlap_group,
      minAnnualSavings: item.savings!.annual_cost_savings.min ?? 0,
      maxAnnualSavings: item.savings!.annual_cost_savings.max ?? 0,
    }));

  const overlapAdjusted = applyOverlapAdjustment(savingsCandidates);
  const totalSpend = annualTotalSpend(answers);
  const savingsSanity = applyWholeHomeSavingsSanityCheck({
    candidates: overlapAdjusted,
    annualHouseholdEnergySpend: totalSpend,
  });

  return {
    assessment_version: answers.assessment_version,
    recommendations: selected,
    assumptions: [
      ...(climateResult.climate_context
        ? [
            `Climate weighting is derived from ZIP code ${climateResult.zip_code} using county-level Building America 2021 climate data.`,
          ]
        : [
            "ZIP-derived climate context was unavailable, so neutral climate weighting was used.",
          ]),
      "Equipment age is treated as context and never as a standalone replacement trigger.",
      "Where savings evidence is weak, no payback is invented.",
      "No-cost actions use existing equipment or behaviour and are shown as Cost $0 / Payback Immediate.",
    ],
    positive_findings: positiveFindings(answers),
    suppressed_recommendation_ids: controlSuppressed.map((item) => item.id),
    climate_context: climateResult.climate_context,
    annual_energy_spend: totalSpend,
    climate_weights: getUSClimateWeights(climateResult.climate_context),
    savings_sanity_check: savingsSanity,
  };
}
