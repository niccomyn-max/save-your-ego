export const US_ASSESSMENT_VERSION = "usa-v1" as const;

export type USAssessmentVersion = typeof US_ASSESSMENT_VERSION;

export const US_HOME_TYPES = [
  "Detached house",
  "Townhouse/row house",
  "Condo",
  "Apartment",
  "Manufactured/mobile home",
  "Other",
] as const;

export const US_BUILD_YEAR_BANDS = [
  "Before 1950",
  "1950-1969",
  "1970-1989",
  "1990-2009",
  "2010-2019",
  "2020+",
  "Not sure",
] as const;

export const US_HOME_SIZE_BANDS = [
  "Under 1,000",
  "1,000-1,499",
  "1,500-1,999",
  "2,000-2,499",
  "2,500-2,999",
  "3,000-3,999",
  "4,000+ sq ft",
  "Not sure",
] as const;

export const US_OCCUPANT_BANDS = ["1", "2", "3-4", "5-6", "7+"] as const;

export const US_FOUNDATION_TYPES = [
  "Concrete slab",
  "Crawlspace",
  "Basement",
  "Combination",
  "Not sure",
] as const;

export const US_GARAGE_TYPES = [
  "No garage",
  "Attached",
  "Detached",
  "Carport",
] as const;

export const US_WINDOW_TYPES = [
  "Single-pane",
  "Double-pane",
  "Triple-pane",
  "Mixed",
  "Not sure",
] as const;

export const US_WINDOW_AGE_BANDS = [
  "Under 10",
  "10-20",
  "20-30",
  "30+ years",
  "Not sure",
] as const;

export const US_HEATING_TYPES = [
  "Gas furnace",
  "Electric furnace",
  "Heat pump",
  "Boiler",
  "Electric baseboard/resistance",
  "Mini-split/ductless",
  "Wood/pellet",
  "Other",
  "Not sure",
] as const;

export const US_COOLING_TYPES = [
  "Central AC",
  "Heat pump",
  "Mini-split",
  "Window AC",
  "Portable AC",
  "Evaporative cooler",
  "Ceiling fans only",
  "None",
  "Not sure",
] as const;

export const US_SYSTEM_AGE_BANDS = [
  "Under 5",
  "5-10",
  "10-15",
  "15-20",
  "20+ years",
  "Not sure",
] as const;

export const US_WATER_HEATING_TYPES = [
  "Electric storage tank",
  "Gas storage tank",
  "Heat-pump water heater",
  "Gas tankless",
  "Electric tankless",
  "Boiler/indirect",
  "Solar thermal",
  "Other",
  "Not sure",
] as const;

export const US_ENERGY_SOURCES = [
  "Electricity",
  "Natural gas",
  "Propane",
  "Heating oil",
  "Wood/pellets",
  "Other",
  "Not sure",
] as const;

export const US_CLIMATE_CONTEXTS = [
  "Hot-Humid",
  "Hot-Dry",
  "Mixed-Humid",
  "Mixed-Dry",
  "Marine",
  "Cold",
  "Very Cold / Subarctic",
] as const;

export type USHomeType = (typeof US_HOME_TYPES)[number];
export type USHeatingType = (typeof US_HEATING_TYPES)[number];
export type USCoolingType = (typeof US_COOLING_TYPES)[number];
export type USWaterHeatingType = (typeof US_WATER_HEATING_TYPES)[number];
export type USEnergySource = (typeof US_ENERGY_SOURCES)[number];
export type USClimateContext = (typeof US_CLIMATE_CONTEXTS)[number];

export type USRecommendationGroup =
  | "Do Now"
  | "Low-Cost Fixes"
  | "Investigate Next"
  | "Consider Later";

export type USRecommendationType =
  | "No-Cost Action"
  | "Low-Cost Fix"
  | "Maintenance"
  | "Investigation"
  | "Moderate Upgrade"
  | "Major Upgrade"
  | "Comfort / Resilience";

export type USRecommendationConfidence = "High" | "Medium" | "Low";

export type USRecommendationImpact = 0 | 1 | 2 | 3 | 4;

export type USSavingsEvidenceLevel =
  | "Direct"
  | "Calculated"
  | "Indicative"
  | "Insufficient";

export type USPaybackBand =
  | "Immediate"
  | "Under 1 year"
  | "About 1-3 years"
  | "About 3-7 years"
  | "About 7-15 years"
  | "15+ years"
  | "Cannot be estimated reliably";

export type USMoneyRange = {
  min: number | null;
  max: number | null;
  currency: "USD";
};

export type USEnergySavings = {
  annual_cost_savings: USMoneyRange;
  electricity_kwh?: { min: number | null; max: number | null };
  natural_gas_therms?: { min: number | null; max: number | null };
  propane_gallons?: { min: number | null; max: number | null };
  heating_oil_gallons?: { min: number | null; max: number | null };
};

export type USRecommendation = {
  id: string;
  title: string;
  summary: string;
  group: USRecommendationGroup;
  type: USRecommendationType;
  end_use_category: string;
  confidence: USRecommendationConfidence;
  estimated_impact: USRecommendationImpact;
  cost: USMoneyRange;
  savings: USEnergySavings | null;
  savings_evidence_level: USSavingsEvidenceLevel;
  payback: USPaybackBand;
  overlap_group: string | null;
  control_relevance:
    | "Occupant controlled"
    | "Owner controlled"
    | "Shared/HOA/building controlled"
    | "Not applicable";
  directly_addresses_stated_problem: boolean;
  trigger_answer_ids: string[];
  why_this_appeared: string[];
  benefits: {
    bill_savings: boolean;
    comfort: boolean;
    resilience: boolean;
    reliability: boolean;
    maintenance: boolean;
  };
};

export type USAssessmentAnswers = {
  assessment_version: USAssessmentVersion;

  home: {
    zip_code: string;
    state: string | null;
    home_type: USHomeType;
    build_year_band: (typeof US_BUILD_YEAR_BANDS)[number];
    home_size_band: (typeof US_HOME_SIZE_BANDS)[number];
    occupants: (typeof US_OCCUPANT_BANDS)[number];
    foundation: (typeof US_FOUNDATION_TYPES)[number];
    garage_type: (typeof US_GARAGE_TYPES)[number];
    rooms_above_or_beside_attached_garage: "Yes" | "No" | "Not sure" | "N/A";
    windows: (typeof US_WINDOW_TYPES)[number];
    window_age_band: (typeof US_WINDOW_AGE_BANDS)[number];
    window_door_issues: string[];
    sunny_window_coverings:
      | "Curtains"
      | "Blinds/shades"
      | "Exterior shutters/awnings"
      | "Solar screens/window film"
      | "Nothing"
      | "Mixture";
    closes_coverings_for_summer_sun:
      | "Usually"
      | "Sometimes"
      | "Rarely"
      | "Never"
      | "N/A or not sure";
    rooms_consistently_hot_or_cold: "No" | "Yes" | "Not sure";
    hot_or_cold_room_locations: string[];
  };

  hvac: {
    main_heating: USHeatingType;
    main_cooling: USCoolingType;
    system_age_band: (typeof US_SYSTEM_AGE_BANDS)[number];
    thermostat_type:
      | "Manual"
      | "Programmable"
      | "Smart"
      | "Multiple thermostats/zones"
      | "Not sure";
    summer_setpoint_f: number | null;
    winter_setpoint_f: number | null;
    setback_when_away_or_sleeping:
      | "Automatically"
      | "Usually"
      | "Sometimes"
      | "Rarely"
      | "Never";
    filter_frequency:
      | "Monthly"
      | "Every 2-3 months"
      | "A few times/year"
      | "Rarely"
      | "Not sure";
    blocked_supply_or_return_vents: "Yes" | "No" | "Not sure";
    duct_location:
      | "Conditioned space"
      | "Attic"
      | "Crawlspace"
      | "Basement"
      | "Garage"
      | "Combination"
      | "Not sure";
    symptoms: string[];
    ceiling_fan_use: "Regularly" | "Sometimes" | "Rarely" | "No";
    turns_off_fans_in_empty_rooms: "Usually" | "Sometimes" | "Rarely" | "Never" | "N/A";
    portable_space_heater_use:
      | "Never"
      | "Occasionally"
      | "Regularly"
      | "Several rooms";
    heat_pump_aux_heat_frequency:
      | "Rarely"
      | "Sometimes"
      | "Frequently"
      | "Not sure"
      | "N/A";
  };

  water_heating: {
    type: USWaterHeatingType;
    age_band: "Under 5" | "5-10" | "10-15" | "15+ years" | "Not sure";
    temperature_band:
      | "Below 120F"
      | "Around 120F"
      | "121-130F"
      | "Above 130F"
      | "Not sure";
    showers_per_day: "1-2" | "3-4" | "5-6" | "7+" | "Not sure";
    shower_length:
      | "Under 5 min"
      | "5-10"
      | "10-15"
      | "Over 15"
      | "Varies";
    showers_or_baths: "Showers" | "Baths" | "Mixture";
    low_flow_showerheads: "Yes" | "No" | "Some" | "Not sure";
    dripping_hot_water_fixtures: "Yes" | "No" | "Not sure";
    long_hot_water_wait: "Yes" | "No" | "Not sure";
    recirculation_pump:
      | "Continuous"
      | "Scheduled"
      | "Demand-activated"
      | "Yes but unsure"
      | "No"
      | "Not sure";
    accessible_hot_water_pipes_insulated: "Yes" | "Some" | "No" | "Not sure";
    water_heater_location:
      | "Conditioned space"
      | "Basement"
      | "Garage"
      | "Attic"
      | "Crawlspace"
      | "Utility room"
      | "Outdoors"
      | "Not sure";
    runs_out_of_hot_water: "Frequently" | "Occasionally" | "Rarely" | "Never";
  };

  appliances: {
    refrigerators_in_regular_use: "1" | "2" | "3+" | "Not sure";
    extra_cold_storage_location: string[];
    extra_cold_storage_age_band: string | null;
    other_cold_storage: string[];
    clothes_dryer_type:
      | "Electric dryer"
      | "Gas dryer"
      | "Heat-pump dryer"
      | "Mostly air dry"
      | "Mixture";
    dryer_loads_per_week: "<3" | "3-5" | "6-10" | "10+";
    multiple_drying_cycles: "Often" | "Sometimes" | "Rarely" | "Never";
    dishwasher_heated_dry: "Always" | "Sometimes" | "Rarely" | "Never/air dry" | "Not sure";
    dishwasher_frequency: "<1/day" | "About 1/day" | ">1/day";
    laundry_wash_temperature: "Cold" | "Warm" | "Hot" | "Mixed";
    partial_loads: "Yes" | "Sometimes" | "Rarely" | "No";
    main_cooking_equipment: string[];
    high_use_computing_entertainment: string[];
    work_from_home_frequency: "No" | "1-2 days/week" | "3-4" | "5+";
    entertainment_left_on_unnecessarily: "Often" | "Sometimes" | "Rarely" | "Never";
    other_continuous_loads: string[];
    outdoor_security_lighting: "Dusk-to-dawn" | "Motion" | "Manual" | "No" | "Not sure";
    electric_vehicle: "Yes" | "No" | "Planning soon";
    time_of_use_electricity_pricing: "Yes" | "No" | "Not sure";
  };

  outdoor: {
    swimming_pool: boolean;
    pool_pump_type: "Single-speed" | "Two-speed" | "Variable-speed" | "Not sure" | "N/A";
    pool_pump_runtime: "Under 4" | "4-8" | "8-12" | ">12 hours/day" | "Not sure" | "N/A";
    pool_heating: "None" | "Gas" | "Electric resistance" | "Heat pump" | "Solar" | "Not sure" | "N/A";
    pool_cover_use: "Yes" | "Sometimes" | "No" | "N/A";
    hot_tub_spa: boolean;
    hot_tub_use_frequency: string | null;
    hot_tub_cover: "Yes" | "No" | "Not sure" | "N/A";
    hot_tub_kept_hot_continuously: "Yes" | "No" | "Not sure" | "N/A";
    garage_equipment: string[];
    garage_door_use: "Several times/day" | "Once/twice/day" | "Occasionally" | "N/A";
    outdoor_lighting_control: "Motion" | "Dusk-to-dawn" | "Timer" | "Manual" | "None";
    landscape_lighting: "LED" | "Mostly LED" | "Older/non-LED" | "Not sure" | "None";
    private_well: "Yes" | "No" | "Not sure";
    well_pump_cycles_unusually_often: "Yes" | "No" | "Not sure" | "N/A";
    irrigation_system: boolean;
    unusual_loads: string[];
  };

  solar_battery_ev: {
    rooftop_solar: boolean;
    solar_size_kw: number | null;
    solar_install_year: number | null;
    solar_interest: "Yes" | "Maybe" | "No";
    roof_orientation:
      | "Mostly south"
      | "Mostly east/west"
      | "Mostly north"
      | "Multiple directions"
      | "Flat"
      | "Not sure";
    roof_shading: "Little/none" | "Some" | "Heavy" | "Not sure";
    usable_roof_space: "Plenty" | "Limited" | "Very limited" | "Not sure";
    authority_to_install_solar: "Yes" | "No" | "Shared/HOA/condo" | "Not sure";
    home_battery_installed: boolean;
    battery_goal:
      | "Backup power"
      | "Peak-rate reduction"
      | "Use more solar"
      | "Energy independence"
      | "Not interested"
      | "Not sure";
    ev_phev: "Yes" | "No" | "Planning";
    home_charging_type: "120V/Level 1" | "Level 2" | "Mostly public" | "Not sure" | "N/A";
    ev_charging_time:
      | "Overnight"
      | "Daytime"
      | "Whenever plugged in"
      | "Scheduled off-peak"
      | "Not sure"
      | "N/A";
    cheaper_off_peak_ev_rate: "Yes" | "No" | "Not sure" | "N/A";
  };

  bills_behaviour: {
    energy_sources: USEnergySource[];
    typical_monthly_electricity_bill: number | null;
    highest_electricity_bill: number | null;
    electricity_usage_kwh_monthly: number | null;
    electricity_usage_kwh_annual: number | null;
    electricity_unit_rate_per_kwh: number | null;
    natural_gas_typical_bill: number | null;
    natural_gas_therms: number | null;
    natural_gas_unit_rate_per_therm: number | null;
    propane_annual_spend: number | null;
    propane_gallons: number | null;
    propane_unit_rate_per_gallon: number | null;
    heating_oil_annual_spend: number | null;
    heating_oil_gallons: number | null;
    heating_oil_unit_rate_per_gallon: number | null;
    bills_highest: "Summer" | "Winter" | "Similar all year" | "Varies" | "Not sure";
    bills_increased_noticeably: "Yes" | "No" | "Not sure";
    changes_when_bills_increased: string[];
    daytime_occupancy: "Most days" | "Several days/week" | "Rarely" | "Varies";
    occupied_year_round: "Yes" | "Seasonal" | "Away for long periods" | "Varies";
    heats_or_cools_rarely_used_rooms: "Yes" | "Sometimes" | "No" | "Not sure";
    doors_windows_open_while_hvac_runs: "Often" | "Sometimes" | "Rarely" | "Never";
    electricity_use_peak: "Morning" | "Afternoon" | "Evening" | "Overnight" | "Not sure";
    time_of_use_pricing: "Yes" | "No" | "Not sure";
    known_peak_hours: string | null;
  };

  hidden_context: {
    climate_context: USClimateContext | null;
    climate_source: "zip-derived" | null;
  };
};

export type USAuditResult = {
  assessment_version: USAssessmentVersion;
  recommendations: USRecommendation[];
  assumptions: string[];
  positive_findings: string[];
  suppressed_recommendation_ids: string[];
  climate_context: USClimateContext | null;
};
