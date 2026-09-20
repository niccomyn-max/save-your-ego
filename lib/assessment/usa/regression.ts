import { createDefaultUSAssessmentAnswers } from "./defaults";
import { analyseUSAssessment } from "./engine";
import { USAssessmentAnswers } from "./schema";

export type USRegressionScenario = {
  id: string;
  description: string;
  build: () => USAssessmentAnswers;
  validate: (result: ReturnType<typeof analyseUSAssessment>) => string[];
};

function withZip(
  answers: USAssessmentAnswers,
  zip: string
): USAssessmentAnswers {
  return {
    ...answers,
    home: {
      ...answers.home,
      zip_code: zip,
    },
  };
}

function hasRecommendation(
  result: ReturnType<typeof analyseUSAssessment>,
  id: string
) {
  return result.recommendations.some((item) => item.id === id);
}

function missingRecommendation(
  result: ReturnType<typeof analyseUSAssessment>,
  id: string
) {
  return !hasRecommendation(result, id);
}

export const US_REGRESSION_SCENARIOS: USRegressionScenario[] = [
  {
    id: "hot-humid-afternoon-solar-gain",
    description:
      "Hot-Humid detached home with a hot sun-facing room and unused afternoon blinds should surface the no-cost solar-gain action.",
    build: () => {
      const base = withZip(createDefaultUSAssessmentAnswers(), "33602");
      return {
        ...base,
        home: {
          ...base.home,
          rooms_consistently_hot_or_cold: "Yes",
          hot_or_cold_room_locations: ["Sun-facing room"],
          closes_coverings_for_summer_sun: "Never",
        },
        bills_behaviour: {
          ...base.bills_behaviour,
          bills_highest: "Summer",
        },
      };
    },
    validate: (result) => {
      const errors: string[] = [];
      if (result.climate_context !== "Hot-Humid") {
        errors.push("Expected Hot-Humid climate context.");
      }
      if (!hasRecommendation(result, "close-sunny-window-coverings")) {
        errors.push("Expected close-sunny-window-coverings recommendation.");
      }
      const item = result.recommendations.find(
        (candidate) => candidate.id === "close-sunny-window-coverings"
      );
      if (item && (item.cost.min !== 0 || item.cost.max !== 0)) {
        errors.push("No-cost solar-gain action must show $0 cost.");
      }
      if (item && item.payback !== "Immediate") {
        errors.push("No-cost solar-gain action must show Immediate payback.");
      }
      return errors;
    },
  },
  {
    id: "cold-climate-heat-pump-aux-heat",
    description:
      "Cold-climate heat-pump home with frequent auxiliary heat should trigger investigation rather than automatic replacement.",
    build: () => {
      const base = withZip(createDefaultUSAssessmentAnswers(), "55401");
      return {
        ...base,
        hvac: {
          ...base.hvac,
          main_heating: "Heat pump",
          main_cooling: "Heat pump",
          system_age_band: "20+ years",
          heat_pump_aux_heat_frequency: "Frequently",
          symptoms: ["High winter bills"],
          filter_frequency: "Every 2-3 months",
          blocked_supply_or_return_vents: "No",
        },
        bills_behaviour: {
          ...base.bills_behaviour,
          bills_highest: "Winter",
        },
      };
    },
    validate: (result) => {
      const errors: string[] = [];
      if (!hasRecommendation(result, "investigate-frequent-aux-heat")) {
        errors.push("Expected frequent auxiliary-heat investigation.");
      }
      const replacement = result.recommendations.find(
        (candidate) => candidate.id === "consider-hvac-replacement-after-diagnosis"
      );
      if (replacement && replacement.group !== "Consider Later") {
        errors.push("HVAC replacement must remain in Consider Later.");
      }
      return errors;
    },
  },
  {
    id: "apartment-solar-suppression",
    description:
      "Apartment user must not receive rooftop solar purchase recommendations.",
    build: () => {
      const base = withZip(createDefaultUSAssessmentAnswers(), "10001");
      return {
        ...base,
        home: {
          ...base.home,
          home_type: "Apartment",
        },
        solar_battery_ev: {
          ...base.solar_battery_ev,
          solar_interest: "Yes",
          authority_to_install_solar: "Shared/HOA/condo",
          roof_orientation: "Mostly south",
          roof_shading: "Little/none",
          usable_roof_space: "Plenty",
        },
      };
    },
    validate: (result) => {
      const errors: string[] = [];
      if (!missingRecommendation(result, "consider-solar-after-demand-review")) {
        errors.push("Apartment must not receive rooftop solar recommendation.");
      }
      return errors;
    },
  },
  {
    id: "older-equipment-no-automatic-replacement",
    description:
      "Older HVAC equipment with no performance symptoms must not trigger replacement.",
    build: () => {
      const base = withZip(createDefaultUSAssessmentAnswers(), "30303");
      return {
        ...base,
        hvac: {
          ...base.hvac,
          system_age_band: "20+ years",
          symptoms: ["None"],
          filter_frequency: "Every 2-3 months",
          blocked_supply_or_return_vents: "No",
        },
      };
    },
    validate: (result) => {
      const errors: string[] = [];
      if (!missingRecommendation(result, "consider-hvac-replacement-after-diagnosis")) {
        errors.push("Equipment age alone must not trigger replacement.");
      }
      return errors;
    },
  },
  {
    id: "pool-pump-long-runtime",
    description:
      "Pool with long pump runtime should produce a no-cost scheduling/runtime check.",
    build: () => {
      const base = withZip(createDefaultUSAssessmentAnswers(), "85001");
      return {
        ...base,
        outdoor: {
          ...base.outdoor,
          swimming_pool: true,
          pool_pump_type: "Single-speed",
          pool_pump_runtime: ">12 hours/day",
          pool_heating: "None",
          pool_cover_use: "No",
        },
        bills_behaviour: {
          ...base.bills_behaviour,
          bills_highest: "Summer",
        },
      };
    },
    validate: (result) => {
      const errors: string[] = [];
      if (!hasRecommendation(result, "review-pool-pump-runtime")) {
        errors.push("Expected pool-pump runtime recommendation.");
      }
      const item = result.recommendations.find(
        (candidate) => candidate.id === "review-pool-pump-runtime"
      );
      if (item && item.payback !== "Immediate") {
        errors.push("No-cost pool runtime action must have Immediate payback.");
      }
      return errors;
    },
  },
  {
    id: "dryer-multiple-cycles-investigate-first",
    description:
      "Multiple dryer cycles should trigger airflow/vent investigation before replacement.",
    build: () => {
      const base = withZip(createDefaultUSAssessmentAnswers(), "60601");
      return {
        ...base,
        appliances: {
          ...base.appliances,
          multiple_drying_cycles: "Often",
        },
      };
    },
    validate: (result) => {
      const errors: string[] = [];
      if (!hasRecommendation(result, "check-dryer-airflow-before-replacement")) {
        errors.push("Expected dryer airflow investigation.");
      }
      return errors;
    },
  },
  {
    id: "ev-off-peak-shift",
    description:
      "EV household with cheaper off-peak pricing and unscheduled charging should get a no-cost schedule change.",
    build: () => {
      const base = withZip(createDefaultUSAssessmentAnswers(), "94103");
      return {
        ...base,
        solar_battery_ev: {
          ...base.solar_battery_ev,
          ev_phev: "Yes",
          home_charging_type: "Level 2",
          ev_charging_time: "Whenever plugged in",
          cheaper_off_peak_ev_rate: "Yes",
        },
      };
    },
    validate: (result) => {
      const errors: string[] = [];
      if (!hasRecommendation(result, "shift-ev-charging-off-peak")) {
        errors.push("Expected off-peak EV charging recommendation.");
      }
      return errors;
    },
  },
  {
    id: "unknowns-no-false-precision",
    description:
      "Unknown and missing bill inputs must not create fabricated savings or payback.",
    build: () => {
      const base = withZip(createDefaultUSAssessmentAnswers(), "02108");
      return {
        ...base,
        bills_behaviour: {
          ...base.bills_behaviour,
          typical_monthly_electricity_bill: null,
          electricity_usage_kwh_monthly: null,
          electricity_usage_kwh_annual: null,
          electricity_unit_rate_per_kwh: null,
        },
        home: {
          ...base.home,
          window_door_issues: ["Drafts"],
        },
      };
    },
    validate: (result) => {
      const errors: string[] = [];
      const weatherstrip = result.recommendations.find(
        (candidate) => candidate.id === "weatherstrip-window-door-leaks"
      );
      if (!weatherstrip) {
        errors.push("Expected targeted low-cost draft-sealing recommendation.");
      } else if (
        weatherstrip.savings?.annual_cost_savings.min !== undefined &&
        weatherstrip.savings?.annual_cost_savings.min !== null
      ) {
        errors.push("Unknown bills must not create fabricated savings.");
      }
      return errors;
    },
  },
];

export function runUSRegressionScenarios() {
  return US_REGRESSION_SCENARIOS.map((scenario) => {
    const result = analyseUSAssessment(scenario.build());
    const errors = scenario.validate(result);

    return {
      id: scenario.id,
      description: scenario.description,
      passed: errors.length === 0,
      errors,
    };
  });
}
