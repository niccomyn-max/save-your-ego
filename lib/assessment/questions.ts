export type AssessmentOption = {
  label: string;
  value: number;
};

export type AssessmentQuestion = {
  id: string;
  section: "electricity" | "gas" | "oil" | "home" | "behaviour";
  text: string;
  helpText?: string;
  options: AssessmentOption[];
};

export const standardOptions: AssessmentOption[] = [
  { label: "Not sure", value: 0 },
  { label: "Never / very low", value: 1 },
  { label: "Sometimes / moderate", value: 2 },
  { label: "Often / high", value: 3 },
  { label: "Very often / very high", value: 4 },
];

export const yesNoUnknownOptions: AssessmentOption[] = [
  { label: "Yes", value: 4 },
  { label: "No", value: 1 },
  { label: "Not sure", value: 0 },
];

export const saveYourEgoQuestions: AssessmentQuestion[] = [
  {
    id: "electricity_bill_awareness",
    section: "electricity",
    text: "Do you know roughly how much electricity your home uses each month?",
    helpText:
      "This helps estimate how aware the household is of electricity consumption.",
    options: yesNoUnknownOptions,
  },
  {
    id: "high_use_appliances",
    section: "electricity",
    text: "How often are high-use appliances such as tumble dryers, ovens, immersion heaters or electric showers used?",
    options: standardOptions,
  },
  {
    id: "standby_usage",
    section: "electricity",
    text: "How often are devices left on standby or plugged in when not being used?",
    options: standardOptions,
  },
  {
    id: "lighting_efficiency",
    section: "electricity",
    text: "Has your home mostly switched to LED lighting?",
    options: yesNoUnknownOptions,
  },
  {
    id: "gas_heating_usage",
    section: "gas",
    text: "If your home uses gas heating, how often is the heating on for long periods?",
    helpText:
      "Choose 'Not sure' if your home does not use gas or you do not know.",
    options: standardOptions,
  },
  {
    id: "gas_boiler_age",
    section: "gas",
    text: "Is your gas boiler modern, serviced regularly and working efficiently?",
    options: yesNoUnknownOptions,
  },
  {
    id: "oil_heating_usage",
    section: "oil",
    text: "If your home uses oil heating, how often is the heating on for long periods?",
    helpText:
      "Choose 'Not sure' if your home does not use oil or you do not know.",
    options: standardOptions,
  },
  {
    id: "oil_system_awareness",
    section: "oil",
    text: "Do you know roughly how much oil your home uses across the year?",
    options: yesNoUnknownOptions,
  },
  {
    id: "thermostat_control",
    section: "home",
    text: "Does your home use thermostat controls, timers or heating zones effectively?",
    options: yesNoUnknownOptions,
  },
  {
    id: "insulation_quality",
    section: "home",
    text: "How confident are you that your home is well insulated?",
    options: [
      { label: "Not sure", value: 0 },
      { label: "Not well insulated", value: 1 },
      { label: "Partly insulated", value: 2 },
      { label: "Mostly insulated", value: 3 },
      { label: "Very well insulated", value: 4 },
    ],
  },
  {
    id: "draughts",
    section: "home",
    text: "How often do you notice draughts, cold spots or rooms that are hard to heat?",
    options: standardOptions,
  },
  {
    id: "energy_habits",
    section: "behaviour",
    text: "How often does the household actively try to reduce unnecessary energy use?",
    options: [
      { label: "Not sure", value: 0 },
      { label: "Rarely", value: 1 },
      { label: "Sometimes", value: 2 },
      { label: "Often", value: 3 },
      { label: "Consistently", value: 4 },
    ],
  },
];

export function calculateScores(answers: Record<string, number>) {
  const sectionTotals: Record<string, number> = {
    electricity: 0,
    gas: 0,
    oil: 0,
    home: 0,
    behaviour: 0,
  };

  const sectionCounts: Record<string, number> = {
    electricity: 0,
    gas: 0,
    oil: 0,
    home: 0,
    behaviour: 0,
  };

  for (const question of saveYourEgoQuestions) {
    const value = answers[question.id];

    if (typeof value === "number") {
      sectionTotals[question.section] += value;
      sectionCounts[question.section] += 1;
    }
  }

  const sectionAverages = Object.fromEntries(
    Object.keys(sectionTotals).map((section) => {
      const count = sectionCounts[section];
      const total = sectionTotals[section];

      return [section, count > 0 ? Number((total / count).toFixed(2)) : 0];
    })
  );

  const answeredValues = Object.values(answers);
  const totalScore = answeredValues.reduce((sum, value) => sum + value, 0);
  const averageScore =
    answeredValues.length > 0
      ? Number((totalScore / answeredValues.length).toFixed(2))
      : 0;

  return {
    totalScore,
    averageScore,
    answeredQuestions: answeredValues.length,
    sectionAverages,
  };
}