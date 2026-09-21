import { ZIP_CLIMATE_DATA } from "./usa/zip-climate-data";

export type USClimateContext =
  | "Hot-Humid"
  | "Hot-Dry"
  | "Mixed-Humid"
  | "Mixed-Dry"
  | "Marine"
  | "Cold"
  | "Very Cold / Subarctic";

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
  state: string;
  climate_context: USClimateContext | "";
  source: "zip-derived" | "";
};

export function deriveUSClimateFromZip(zipInput: string): USZipClimateResult {
  const zip = zipInput.replace(/\D/g, "").slice(0, 5);

  if (zip.length !== 5) {
    return { zip_code: zip, state: "", climate_context: "", source: "" };
  }

  const encoded = ZIP_CLIMATE_DATA[zip];
  if (!encoded) {
    return { zip_code: zip, state: "", climate_context: "", source: "" };
  }

  const [state, climateCode] = encoded.split("|");
  const climate = CODE_TO_CLIMATE[climateCode] ?? "";

  return {
    zip_code: zip,
    state: state || "",
    climate_context: climate,
    source: climate ? "zip-derived" : "",
  };
}
