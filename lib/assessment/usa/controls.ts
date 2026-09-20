import {
  USAssessmentAnswers,
  USHomeType,
  USRecommendation,
} from "./schema";

export type USControlProfile = {
  homeType: USHomeType;
  canControlPrivateRoof: boolean;
  canControlEnvelope: boolean;
  canControlSharedSystems: boolean;
  solarAuthority:
    | "Yes"
    | "No"
    | "Shared/HOA/condo"
    | "Not sure";
};

export function getUSControlProfile(
  answers: USAssessmentAnswers
): USControlProfile {
  const homeType = answers.home.home_type;
  const solarAuthority = answers.solar_battery_ev.authority_to_install_solar;

  const apartment = homeType === "Apartment";
  const condo = homeType === "Condo";

  return {
    homeType,
    canControlPrivateRoof:
      !apartment &&
      solarAuthority === "Yes",
    canControlEnvelope: !apartment && !condo,
    canControlSharedSystems: false,
    solarAuthority,
  };
}

export function shouldShowPoolQuestions(answers: USAssessmentAnswers) {
  return answers.outdoor.swimming_pool;
}

export function shouldShowHotTubQuestions(answers: USAssessmentAnswers) {
  return answers.outdoor.hot_tub_spa;
}

export function shouldShowAttachedGarageQuestions(
  answers: USAssessmentAnswers
) {
  return answers.home.garage_type === "Attached";
}

export function shouldShowHeatPumpAuxHeatQuestion(
  answers: USAssessmentAnswers
) {
  return answers.hvac.main_heating === "Heat pump";
}

export function shouldShowEVQuestions(answers: USAssessmentAnswers) {
  return (
    answers.solar_battery_ev.ev_phev === "Yes" ||
    answers.solar_battery_ev.ev_phev === "Planning"
  );
}

export function shouldShowSolarRoofQuestions(
  answers: USAssessmentAnswers
) {
  const profile = getUSControlProfile(answers);

  return (
    answers.solar_battery_ev.solar_interest !== "No" &&
    profile.homeType !== "Apartment" &&
    profile.solarAuthority !== "No"
  );
}

export function suppressForControl(
  recommendation: USRecommendation,
  answers: USAssessmentAnswers
) {
  const profile = getUSControlProfile(answers);

  if (
    recommendation.end_use_category === "Solar" &&
    !profile.canControlPrivateRoof
  ) {
    return true;
  }

  if (
    recommendation.control_relevance === "Owner controlled" &&
    answers.home.home_type === "Apartment"
  ) {
    return true;
  }

  if (
    recommendation.control_relevance ===
      "Shared/HOA/building controlled" &&
    profile.homeType !== "Condo" &&
    profile.homeType !== "Apartment"
  ) {
    return true;
  }

  return false;
}
