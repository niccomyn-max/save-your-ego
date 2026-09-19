import { createDefaultUSAssessmentAnswers } from "./defaults";
import { analyseUSAssessment } from "./engine";
import { USAssessmentAnswers, USClimateContext } from "./schema";

export type USRegressionScenario = {
  id: string;
  name: string;
  answers: USAssessmentAnswers;
  expectedClimate?: USClimateContext;
  expectedRecommendationIds?: string[];
  forbiddenRecommendationIds?: string[];
  notes: string[];
};

function base() {
  return createDefaultUSAssessmentAnswers();
}

function clone(answers: USAssessmentAnswers): USAssessmentAnswers {
  return JSON.parse(JSON.stringify(answers)) as USAssessmentAnswers;
}

const phoenix = clone(base());
phoenix.home.zip_code = "85001";
phoenix.home.rooms_consistently_hot_or_cold = "Yes";
phoenix.home.hot_or_cold_room_locations = ["Sun-facing room"];
phoenix.home.closes_coverings_for_summer_sun = "Never";
phoenix.hvac.main_cooling = "Central AC";
phoenix.hvac.duct_location = "Attic";
phoenix.hvac.symptoms = ["Hot rooms", "Long runtimes", "High summer bills"];
phoenix.outdoor.swimming_pool = true;
phoenix.outdoor.pool_pump_type = "Single-speed";
phoenix.outdoor.pool_pump_runtime = "8-12";
phoenix.outdoor.pool_heating = "None";
phoenix.outdoor.pool_cover_use = "N/A";
phoenix.bills_behaviour.bills_highest = "Summer";

const miami = clone(base());
miami.home.zip_code = "33101";
miami.hvac.main_cooling = "Central AC";
miami.hvac.duct_location = "Attic";
miami.hvac.symptoms = ["Long runtimes", "High summer bills"];
miami.appliances.other_continuous_loads = ["Dehumidifiers"];
miami.outdoor.swimming_pool = true;
miami.outdoor.pool_pump_type = "Variable-speed";
miami.outdoor.pool_pump_runtime = "8-12";
miami.outdoor.pool_heating = "None";
miami.outdoor.pool_cover_use = "N/A";
miami.bills_behaviour.bills_highest = "Summer";

const minnesota = clone(base());
minnesota.home.zip_code = "55401";
minnesota.home.foundation = "Basement";
minnesota.hvac.main_heating = "Heat pump";
minnesota.hvac.main_cooling = "Heat pump";
minnesota.hvac.heat_pump_aux_heat_frequency = "Frequently";
minnesota.hvac.symptoms = ["High winter bills", "Cold rooms"];
minnesota.bills_behaviour.bills_highest = "Winter";

const chicago = clone(base());
chicago.home.zip_code = "60601";
chicago.hvac.main_heating = "Gas furnace";
chicago.hvac.main_cooling = "Central AC";
chicago.hvac.setback_when_away_or_sleeping = "Never";
chicago.hvac.symptoms = ["High summer bills", "High winter bills"];
chicago.bills_behaviour.bills_highest = "Varies";

const seattle = clone(base());
seattle.home.zip_code = "98101";
seattle.home.window_door_issues = ["Drafts"];
seattle.hvac.main_heating = "Heat pump";
seattle.hvac.main_cooling = "None";
seattle.bills_behaviour.bills_highest = "Winter";

const apartment = clone(base());
apartment.home.zip_code = "10001";
apartment.home.home_type = "Apartment";
apartment.solar_battery_ev.solar_interest = "Yes";
apartment.solar_battery_ev.authority_to_install_solar = "No";
apartment.solar_battery_ev.roof_orientation = "Mostly south";
apartment.solar_battery_ev.roof_shading = "Little/none";
apartment.solar_battery_ev.usable_roof_space = "Plenty";

const condo = clone(base());
condo.home.zip_code = "33101";
condo.home.home_type = "Condo";
condo.solar_battery_ev.solar_interest = "Yes";
condo.solar_battery_ev.authority_to_install_solar = "Shared/HOA/condo";
condo.solar_battery_ev.roof_orientation = "Mostly south";
condo.solar_battery_ev.roof_shading = "Little/none";
condo.solar_battery_ev.usable_roof_space = "Plenty";

const garageFridge = clone(base());
garageFridge.home.zip_code = "75201";
garageFridge.appliances.refrigerators_in_regular_use = "2";
garageFridge.appliances.extra_cold_storage_location = ["Refrigerator"];
garageFridge.appliances.extra_cold_storage_age_band = "15+ years";
garageFridge.home.garage_type = "Attached";

const evTou = clone(base());
evTou.home.zip_code = "94102";
evTou.solar_battery_ev.ev_phev = "Yes";
evTou.solar_battery_ev.home_charging_type = "Level 2";
evTou.solar_battery_ev.ev_charging_time = "Whenever plugged in";
evTou.solar_battery_ev.cheaper_off_peak_ev_rate = "Yes";
evTou.bills_behaviour.time_of_use_pricing = "Yes";

const oldHvacGood = clone(base());
oldHvacGood.home.zip_code = "30301";
oldHvacGood.hvac.system_age_band = "20+ years";
oldHvacGood.hvac.symptoms = ["None"];
oldHvacGood.hvac.blocked_supply_or_return_vents = "No";
oldHvacGood.hvac.filter_frequency = "Every 2-3 months";

const oldWindowsGood = clone(base());
oldWindowsGood.home.zip_code = "02108";
oldWindowsGood.home.windows = "Double-pane";
oldWindowsGood.home.window_age_band = "30+ years";
oldWindowsGood.home.window_door_issues = ["None"];
oldWindowsGood.home.rooms_consistently_hot_or_cold = "No";

const roomOverGarage = clone(base());
roomOverGarage.home.zip_code = "80202";
roomOverGarage.home.garage_type = "Attached";
roomOverGarage.home.rooms_above_or_beside_attached_garage = "Yes";
roomOverGarage.home.rooms_consistently_hot_or_cold = "Yes";
roomOverGarage.home.hot_or_cold_room_locations = ["Room over garage"];

export const US_REGRESSION_SCENARIOS: USRegressionScenario[] = [
  {
    id: "phoenix-detached",
    name: "Phoenix detached home",
    answers: phoenix,
    expectedClimate: "Hot-Dry",
    expectedRecommendationIds: [
      "close-sunny-window-coverings",
      "review-pool-pump-runtime",
      "inspect-visible-duct-condition",
    ],
    notes: [
      "Expect shading, AC/duct and pool emphasis.",
      "Do not surface cold-climate auxiliary-heat advice.",
    ],
  },
  {
    id: "miami-detached",
    name: "Miami detached home",
    answers: miami,
    expectedClimate: "Hot-Humid",
    expectedRecommendationIds: [
      "investigate-humidity-load",
      "inspect-visible-duct-condition",
      "review-pool-pump-runtime",
    ],
    notes: ["Expect AC, humidity, hot-attic duct and pool emphasis."],
  },
  {
    id: "minnesota-detached",
    name: "Minnesota detached home",
    answers: minnesota,
    expectedClimate: "Cold",
    expectedRecommendationIds: ["investigate-frequent-aux-heat"],
    notes: ["Expect winter heating and auxiliary-heat emphasis."],
  },
  {
    id: "chicago-mixed",
    name: "Chicago mixed-climate home",
    answers: chicago,
    expectedClimate: "Cold",
    expectedRecommendationIds: ["use-existing-thermostat-schedule"],
    notes: ["Heating and cooling evidence should both remain relevant."],
  },
  {
    id: "seattle-marine",
    name: "Seattle marine home",
    answers: seattle,
    expectedClimate: "Marine",
    expectedRecommendationIds: ["weatherstrip-window-door-leaks"],
    notes: ["Heating, moisture and air leakage should outrank extreme cooling."],
  },
  {
    id: "apartment-renter",
    name: "Apartment renter",
    answers: apartment,
    forbiddenRecommendationIds: ["consider-solar-after-demand-review"],
    notes: ["No individual rooftop-solar recommendation."],
  },
  {
    id: "condo-hoa",
    name: "Condo with HOA",
    answers: condo,
    forbiddenRecommendationIds: ["consider-solar-after-demand-review"],
    notes: ["Shared roof control suppresses private rooftop-solar action."],
  },
  {
    id: "garage-fridge",
    name: "Old garage refrigerator",
    answers: garageFridge,
    expectedRecommendationIds: ["review-extra-refrigerator-necessity"],
    notes: ["Do not recommend buying an energy monitor."],
  },
  {
    id: "ev-tou",
    name: "High EV use on time-of-use tariff",
    answers: evTou,
    expectedRecommendationIds: ["shift-ev-charging-off-peak"],
    notes: ["Existing scheduling capability should produce a $0 immediate action."],
  },
  {
    id: "old-hvac-good",
    name: "Older HVAC but otherwise well-performing",
    answers: oldHvacGood,
    forbiddenRecommendationIds: ["consider-hvac-replacement-after-diagnosis"],
    notes: ["Age alone must not trigger replacement."],
  },
  {
    id: "old-windows-good",
    name: "Old windows with no drafts or comfort issues",
    answers: oldWindowsGood,
    forbiddenRecommendationIds: ["weatherstrip-window-door-leaks"],
    notes: ["Window age alone must not create a priority."],
  },
  {
    id: "room-over-garage",
    name: "Hot/cold room over garage",
    answers: roomOverGarage,
    expectedRecommendationIds: ["investigate-room-over-garage"],
    forbiddenRecommendationIds: ["consider-hvac-replacement-after-diagnosis"],
    notes: ["Investigate insulation, air sealing and airflow before HVAC replacement."],
  },
];

export type USScenarioValidation = {
  id: string;
  name: string;
  passed: boolean;
  failures: string[];
};

export function validateUSRegressionScenario(
  scenario: USRegressionScenario
): USScenarioValidation {
  const analysis = analyseUSAssessment(scenario.answers);
  const ids = new Set(analysis.recommendations.map((item) => item.id));
  const failures: string[] = [];

  if (
    scenario.expectedClimate &&
    analysis.climate_context !== scenario.expectedClimate
  ) {
    failures.push(
      `Expected climate ${scenario.expectedClimate}, received ${analysis.climate_context ?? "null"}.`
    );
  }

  for (const id of scenario.expectedRecommendationIds ?? []) {
    if (!ids.has(id)) {
      failures.push(`Expected recommendation ${id} was not selected.`);
    }
  }

  for (const id of scenario.forbiddenRecommendationIds ?? []) {
    if (ids.has(id)) {
      failures.push(`Forbidden recommendation ${id} was selected.`);
    }
  }

  for (const item of analysis.recommendations) {
    if (
      item.type === "No-Cost Action" &&
      (item.cost.min !== 0 || item.cost.max !== 0 || item.payback !== "Immediate")
    ) {
      failures.push(
        `No-cost action ${item.id} does not render as $0 / Immediate.`
      );
    }

    if (item.type === "Investigation" && item.payback === "Immediate") {
      failures.push(
        `Investigation ${item.id} was incorrectly given Immediate payback.`
      );
    }
  }

  return {
    id: scenario.id,
    name: scenario.name,
    passed: failures.length === 0,
    failures,
  };
}

export function validateAllUSRegressionScenarios() {
  return US_REGRESSION_SCENARIOS.map(validateUSRegressionScenario);
}
