import { USClimateContext } from "./schema";
import { ZIP_CLIMATE_DATA } from "./zip-climate-data";

const CODE_TO_CLIMATE: Record<string, USClimateContext> = {
  HH: "Hot-Humid",
  HD: "Hot-Dry",
  MH: "Mixed-Humid",
  MD: "Mixed-Dry",
  MR: "Marine",
  C: "Cold",
  VC: "Very Cold / Subarctic",
};

export type USZipClimateResult = {
  zip_code: string;
  state: string | null;
  climate_context: USClimateContext | null;
  source: "zip-derived" | null;
};

/**
 * Climate source:
 * - ZIP -> county FIPS crosswalk (primary county per ZIP)
 * - County FIPS -> Building America 2021 climate region
 * - County climate data corresponds to PNNL-33270 / 2021 IECC updates.
 *
 * Climate context is used for recommendation weighting, not code compliance.
 */
export function deriveUSClimateFromZip(zipInput: string): USZipClimateResult {
  const zip = zipInput.replace(/\D/g, "").slice(0, 5);

  if (zip.length !== 5) {
    return {
      zip_code: zip,
      state: null,
      climate_context: null,
      source: null,
    };
  }

  const encoded = ZIP_CLIMATE_DATA[zip];

  if (!encoded) {
    return {
      zip_code: zip,
      state: null,
      climate_context: null,
      source: null,
    };
  }

  const [state, climateCode] = encoded.split("|");
  const climate = CODE_TO_CLIMATE[climateCode] ?? null;

  return {
    zip_code: zip,
    state: state || null,
    climate_context: climate,
    source: climate ? "zip-derived" : null,
  };
}

export type USClimateWeights = {
  heating: number;
  cooling: number;
  humidity: number;
  solar_gain: number;
  air_sealing: number;
  insulation: number;
  ducts: number;
  pools: number;
  auxiliary_heat: number;
};

export function getUSClimateWeights(
  climate: USClimateContext | null
): USClimateWeights {
  switch (climate) {
    case "Hot-Humid":
      return {
        heating: 0,
        cooling: 4,
        humidity: 4,
        solar_gain: 3,
        air_sealing: 2,
        insulation: 2,
        ducts: 4,
        pools: 3,
        auxiliary_heat: 0,
      };
    case "Hot-Dry":
      return {
        heating: 1,
        cooling: 4,
        humidity: 0,
        solar_gain: 4,
        air_sealing: 2,
        insulation: 3,
        ducts: 3,
        pools: 3,
        auxiliary_heat: 0,
      };
    case "Mixed-Humid":
      return {
        heating: 3,
        cooling: 3,
        humidity: 2,
        solar_gain: 2,
        air_sealing: 3,
        insulation: 3,
        ducts: 3,
        pools: 1,
        auxiliary_heat: 2,
      };
    case "Mixed-Dry":
      return {
        heating: 3,
        cooling: 3,
        humidity: 0,
        solar_gain: 3,
        air_sealing: 3,
        insulation: 3,
        ducts: 2,
        pools: 1,
        auxiliary_heat: 2,
      };
    case "Marine":
      return {
        heating: 3,
        cooling: 1,
        humidity: 2,
        solar_gain: 1,
        air_sealing: 4,
        insulation: 3,
        ducts: 2,
        pools: 0,
        auxiliary_heat: 1,
      };
    case "Cold":
      return {
        heating: 4,
        cooling: 1,
        humidity: 1,
        solar_gain: 1,
        air_sealing: 4,
        insulation: 4,
        ducts: 2,
        pools: 0,
        auxiliary_heat: 4,
      };
    case "Very Cold / Subarctic":
      return {
        heating: 4,
        cooling: 0,
        humidity: 0,
        solar_gain: 0,
        air_sealing: 4,
        insulation: 4,
        ducts: 2,
        pools: 0,
        auxiliary_heat: 4,
      };
    default:
      return {
        heating: 2,
        cooling: 2,
        humidity: 1,
        solar_gain: 2,
        air_sealing: 2,
        insulation: 2,
        ducts: 2,
        pools: 1,
        auxiliary_heat: 1,
      };
  }
}
