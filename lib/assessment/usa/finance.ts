import {
  USMoneyRange,
  USPaybackBand,
  USRecommendation,
} from "./schema";

export const USD_ZERO_COST: USMoneyRange = {
  min: 0,
  max: 0,
  currency: "USD",
};

export function normaliseUsdRange(
  min: number | null,
  max: number | null
): USMoneyRange {
  if (min === null || max === null) {
    return { min, max, currency: "USD" };
  }

  const safeMin = Math.max(0, Math.min(min, max));
  const safeMax = Math.max(0, Math.max(min, max));

  return {
    min: Math.round(safeMin),
    max: Math.round(safeMax),
    currency: "USD",
  };
}

export function isTrueNoCostRecommendation(
  recommendation: Pick<USRecommendation, "type" | "cost">
) {
  return (
    recommendation.type === "No-Cost Action" &&
    recommendation.cost.min === 0 &&
    recommendation.cost.max === 0
  );
}

export function calculateSimplePaybackBand(input: {
  cost: USMoneyRange;
  annualSavings: USMoneyRange | null;
  isNoCostAction?: boolean;
}): USPaybackBand {
  if (
    input.isNoCostAction ||
    (input.cost.min === 0 && input.cost.max === 0)
  ) {
    return "Immediate";
  }

  if (
    input.cost.min === null ||
    input.cost.max === null ||
    !input.annualSavings ||
    input.annualSavings.min === null ||
    input.annualSavings.max === null ||
    input.annualSavings.max <= 0
  ) {
    return "Cannot be estimated reliably";
  }

  const representativeCost = (input.cost.min + input.cost.max) / 2;
  const representativeSavings =
    (input.annualSavings.min + input.annualSavings.max) / 2;

  if (representativeSavings <= 0) {
    return "Cannot be estimated reliably";
  }

  const years = representativeCost / representativeSavings;

  if (years < 1) return "Under 1 year";
  if (years <= 3) return "About 1-3 years";
  if (years <= 7) return "About 3-7 years";
  if (years <= 15) return "About 7-15 years";
  return "15+ years";
}

export function capBehaviourSavings(input: {
  proposedAnnualSavings: number;
  annualAffectedEnergySpend: number | null;
  maxShareOfAffectedSpend: number;
}) {
  const proposed = Math.max(0, input.proposedAnnualSavings);

  if (
    input.annualAffectedEnergySpend === null ||
    input.annualAffectedEnergySpend <= 0
  ) {
    return proposed;
  }

  const cappedShare = Math.min(Math.max(input.maxShareOfAffectedSpend, 0), 1);

  return Math.min(
    proposed,
    input.annualAffectedEnergySpend * cappedShare
  );
}

export type OverlapSavingsCandidate = {
  id: string;
  overlapGroup: string | null;
  minAnnualSavings: number;
  maxAnnualSavings: number;
};

export function applyOverlapAdjustment(
  candidates: OverlapSavingsCandidate[],
  secondaryMeasureCredit = 0.5
) {
  const credit = Math.min(Math.max(secondaryMeasureCredit, 0), 1);
  const groups = new Map<string, OverlapSavingsCandidate[]>();
  const independent: OverlapSavingsCandidate[] = [];

  for (const item of candidates) {
    if (!item.overlapGroup) {
      independent.push(item);
      continue;
    }

    const existing = groups.get(item.overlapGroup) ?? [];
    existing.push(item);
    groups.set(item.overlapGroup, existing);
  }

  const adjusted = [...independent];

  for (const groupItems of groups.values()) {
    const sorted = [...groupItems].sort(
      (a, b) => b.maxAnnualSavings - a.maxAnnualSavings
    );

    sorted.forEach((item, index) => {
      const factor = index === 0 ? 1 : credit;

      adjusted.push({
        ...item,
        minAnnualSavings: item.minAnnualSavings * factor,
        maxAnnualSavings: item.maxAnnualSavings * factor,
      });
    });
  }

  return adjusted;
}

export function applyWholeHomeSavingsSanityCheck(input: {
  candidates: OverlapSavingsCandidate[];
  annualHouseholdEnergySpend: number | null;
  maxShareOfAnnualSpend?: number;
}) {
  const maxShare = Math.min(
    Math.max(input.maxShareOfAnnualSpend ?? 0.8, 0),
    1
  );

  const totalMin = input.candidates.reduce(
    (sum, item) => sum + Math.max(0, item.minAnnualSavings),
    0
  );
  const totalMax = input.candidates.reduce(
    (sum, item) => sum + Math.max(0, item.maxAnnualSavings),
    0
  );

  if (
    input.annualHouseholdEnergySpend === null ||
    input.annualHouseholdEnergySpend <= 0
  ) {
    return {
      totalMin,
      totalMax,
      capped: false,
      cap: null,
    };
  }

  const cap = input.annualHouseholdEnergySpend * maxShare;

  if (totalMax <= cap) {
    return {
      totalMin,
      totalMax,
      capped: false,
      cap,
    };
  }

  const scale = totalMax > 0 ? cap / totalMax : 1;

  return {
    totalMin: totalMin * scale,
    totalMax: cap,
    capped: true,
    cap,
  };
}

export function enforceNoCostDisplay(
  recommendation: USRecommendation
): USRecommendation {
  if (recommendation.type !== "No-Cost Action") {
    return recommendation;
  }

  return {
    ...recommendation,
    cost: USD_ZERO_COST,
    payback: "Immediate",
  };
}
