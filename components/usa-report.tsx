import Image from "next/image";
import Link from "next/link";
import { PrintReportButton } from "@/components/print-report-button";

type JsonRecord = Record<string, unknown>;

type PhotoEvidenceFinding = {
  photo_number?: number;
  finding?: string;
  confidence?: "High" | "Medium";
};

type NarrativeReport = {
  bottom_line?: string;
  home_energy_snapshot?: string;
  fuel_specific_findings?: string[];
  solar_battery_ev_findings?: string[];
  photo_evidence?: PhotoEvidenceFinding[];
  photo_evidence_limitations?: string;
  positive_findings?: string[];
  what_to_check_next?: string[];
  assumptions_and_limits?: string[];
};

type Recommendation = {
  id: string;
  title: string;
  summary: string;
  group: "Do Now" | "Low-Cost Fixes" | "Investigate Next" | "Consider Later";
  type:
    | "No-Cost Action"
    | "Low-Cost Fix"
    | "Maintenance"
    | "Investigation"
    | "Moderate Upgrade"
    | "Major Upgrade"
    | "Comfort / Resilience";
  end_use_category: string;
  confidence: "High" | "Medium" | "Low";
  estimated_impact: number;
  cost: {
    min: number | null;
    max: number | null;
    currency: "USD";
  };
  savings: {
    annual_cost_savings: {
      min: number | null;
      max: number | null;
      currency: "USD";
    };
  } | null;
  savings_evidence_level: string;
  payback: string;
  overlap_group: string | null;
  control_relevance: string;
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

function parseNarrative(value?: string | null): NarrativeReport | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as NarrativeReport;
  } catch {
    return null;
  }
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function asRecommendations(value: unknown): Recommendation[] {
  return Array.isArray(value) ? (value as Recommendation[]) : [];
}

function cleanStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function cleanPhotoEvidence(value: unknown): PhotoEvidenceFinding[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => asRecord(item))
    .map((item) => ({
      photo_number:
        typeof item.photo_number === "number" ? item.photo_number : undefined,
      finding:
        typeof item.finding === "string" ? item.finding.trim() : undefined,
      confidence:
        item.confidence === "High"
          ? ("High" as const)
          : item.confidence === "Medium"
            ? ("Medium" as const)
            : undefined,
    }))
    .filter(
      (item) =>
        typeof item.photo_number === "number" &&
        Boolean(item.finding) &&
        Boolean(item.confidence)
    );
}

function mergeAssumptions(
  deterministic: string[],
  narrative: string[]
) {
  const result = [...deterministic];

  for (const item of narrative) {
    const lower = item.toLowerCase();

    const duplicatesDeterministicRule =
      lower.includes("climate weighting") ||
      lower.includes("equipment age") ||
      lower.includes("standalone replacement") ||
      lower.includes("no-cost action") ||
      lower.includes("immediate payback") ||
      lower.includes("payback is not invented") ||
      lower.includes("savings are not calculated");

    if (!duplicatesDeterministicRule) result.push(item);
  }

  return result.filter(
    (value, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() ===
          value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
      ) === index
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCost(item: Recommendation) {
  if (item.type === "No-Cost Action") return "$0";
  if (
    item.type === "Investigation" &&
    item.cost.min === 0 &&
    item.cost.max === 0
  ) {
    return "$0 homeowner check";
  }
  if (item.cost.min === null || item.cost.max === null) {
    return "Not enough data to estimate";
  }
  if (item.cost.min === item.cost.max) return money(item.cost.min);
  return `${money(item.cost.min)}–${money(item.cost.max)}`;
}

function formatSavings(item: Recommendation) {
  const range = item.savings?.annual_cost_savings;
  if (!range || range.min === null || range.max === null) {
    return "Not enough data to estimate";
  }
  if (range.min === range.max) return `${money(range.min)}/year`;
  return `${money(range.min)}–${money(range.max)}/year`;
}

function benefitLabels(item: Recommendation) {
  const labels: string[] = [];
  if (item.benefits.bill_savings) labels.push("Bill savings");
  if (item.benefits.comfort) labels.push("Comfort");
  if (item.benefits.resilience) labels.push("Resilience");
  if (item.benefits.reliability) labels.push("Reliability");
  if (item.benefits.maintenance) labels.push("Maintenance");
  return labels;
}

function confidenceLabel(confidence: Recommendation["confidence"]) {
  if (confidence === "High") return "Strong evidence";
  if (confidence === "Medium") return "Some evidence";
  return "Limited evidence";
}

function groupLabel(group: Recommendation["group"]) {
  if (group === "Do Now") return "Start here";
  if (group === "Low-Cost Fixes") return "Small fix";
  if (group === "Investigate Next") return "Check first";
  return "Later option";
}

function paybackLabel(item: Recommendation) {
  if (item.type === "Investigation") return null;
  if (item.payback === "Cannot be estimated reliably") return null;
  return item.payback;
}

function recommendationMetrics(item: Recommendation) {
  const metrics: Array<{
    label: string;
    value: string;
    className: string;
    labelClassName: string;
    valueClassName: string;
  }> = [];

  const costKnown =
    item.type === "No-Cost Action" ||
    (item.cost.min !== null && item.cost.max !== null) ||
    (item.type === "Investigation" && item.cost.min === 0 && item.cost.max === 0);

  if (costKnown) {
    metrics.push({
      label: "Likely cost",
      value: formatCost(item),
      className: "border-[#ffe76a] bg-[#fff6bf]",
      labelClassName: "text-[#6b5200]",
      valueClassName: "text-black",
    });
  }

  const savings = item.savings?.annual_cost_savings;
  if (savings?.min !== null && savings?.min !== undefined && savings?.max !== null && savings?.max !== undefined) {
    metrics.push({
      label: "Possible bill savings",
      value: formatSavings(item),
      className: "border-[#bde8ff] bg-[#e9f6fe]",
      labelClassName: "text-[#17356f]/70",
      valueClassName: "text-[#17356f]",
    });
  }

  const payback = paybackLabel(item);
  if (payback) {
    metrics.push({
      label: "Payback",
      value: payback,
      className: "border-[#dbe8f2] bg-white",
      labelClassName: "text-slate-400",
      valueClassName: "text-black",
    });
  }

  return metrics;
}

function RecommendationCard({
  item,
  index,
}: {
  item: Recommendation;
  index: number;
}) {
  const benefits = benefitLabels(item);

  return (
    <article className="rounded-3xl border border-[#dbe8f2] bg-[#f7fbff] p-5 print:break-inside-avoid print:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Step {index + 1}
          </p>
          <h3 className="mt-1 text-lg font-black leading-6 text-black">
            {item.title}
          </h3>
        </div>
        <span className="whitespace-nowrap rounded-full bg-[#ffd600] px-3 py-1 text-[11px] font-black text-black">
          {confidenceLabel(item.confidence)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-700">{item.summary}</p>

      {recommendationMetrics(item).length > 0 && (
        <div className={`mt-4 grid gap-2 ${recommendationMetrics(item).length === 1 ? "grid-cols-1 sm:max-w-xs" : recommendationMetrics(item).length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          {recommendationMetrics(item).map((metric) => (
            <div
              key={metric.label}
              className={`rounded-2xl border p-3 ${metric.className}`}
            >
              <p className={`text-[10px] font-black uppercase tracking-wide ${metric.labelClassName}`}>
                {metric.label}
              </p>
              <p className={`mt-1 text-sm font-black ${metric.valueClassName}`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {item.why_this_appeared.length > 0 && (
        <div className="mt-4 rounded-2xl border border-[#dbe8f2] bg-white p-4">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            Why we picked this
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
            {item.why_this_appeared.slice(0, 3).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {benefits.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {benefits.map((benefit) => (
            <span
              key={benefit}
              className="rounded-full border border-[#dbe8f2] bg-white px-3 py-1 text-xs font-bold text-[#17356f]"
            >
              {benefit}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function TopPrioritiesSummary({
  items,
}: {
  items: Recommendation[];
}) {
  if (items.length < 2) return null;

  return (
    <section className="report-section rounded-3xl border border-[#dbe8f2] border-t-8 border-t-[#17356f] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-[#17356f]">Your Action Plan</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Start with the first item and work down the list. The full explanation for
        each action appears below.
      </p>
      <ol className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="flex items-start gap-4 rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#17356f] text-sm font-black text-white">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-black">{item.title}</h3>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#17356f] ring-1 ring-[#dbe8f2]">
                  {groupLabel(item.group)}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {item.summary}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function RecommendationGroup({
  title,
  description,
  items,
  accent = "navy",
}: {
  title: string;
  description: string;
  items: Recommendation[];
  accent?: "yellow" | "blue" | "navy" | "black";
}) {
  if (items.length === 0) return null;

  const accentClass =
    accent === "yellow"
      ? "border-t-[#ffd600]"
      : accent === "blue"
        ? "border-t-[#59b9ec]"
        : accent === "black"
          ? "border-t-black"
          : "border-t-[#17356f]";

  return (
    <section
      className={`report-section rounded-3xl border border-[#dbe8f2] border-t-8 ${accentClass} bg-white p-6 shadow-sm`}
    >
      <h2 className="text-2xl font-black text-[#17356f]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <div className={`mt-5 grid gap-4 ${items.length === 1 ? "grid-cols-1" : "lg:grid-cols-2"}`}>
        {items.map((item, index) => (
          <RecommendationCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

function TextList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  const visibleItems = cleanStrings(items);
  if (visibleItems.length === 0) return null;

  return (
    <section className="report-section rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-[#17356f]">{title}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
        {visibleItems.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function PhotoEvidenceSection({
  photoCount,
  findings,
  limitations,
}: {
  photoCount: number;
  findings: PhotoEvidenceFinding[];
  limitations: string;
}) {
  if (photoCount <= 0) return null;

  const groupedFindings = Array.from(
    findings.reduce(
      (groups, item) => {
        if (
          typeof item.photo_number !== "number" ||
          !item.finding ||
          !item.confidence
        ) {
          return groups;
        }

        const existing = groups.get(item.photo_number) ?? {
          photoNumber: item.photo_number,
          confidence: item.confidence,
          findings: [] as string[],
        };

        if (item.confidence === "High") {
          existing.confidence = "High";
        }

        existing.findings.push(item.finding);
        groups.set(item.photo_number, existing);
        return groups;
      },
      new Map<
        number,
        {
          photoNumber: number;
          confidence: "High" | "Medium";
          findings: string[];
        }
      >()
    ).values()
  ).sort((a, b) => a.photoNumber - b.photoNumber);

  return (
    <section className="report-section rounded-3xl border border-[#dbe8f2] border-t-8 border-t-[#59b9ec] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#17356f]">What We Could Read From Your Photos</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            We reviewed your uploaded photos for useful details such as model
            numbers, labels and settings. A photo can support a finding, but it
            will never create a new recommendation by itself.
          </p>
        </div>
        <span className="rounded-full bg-[#e9f6fe] px-4 py-2 text-xs font-black text-[#17356f]">
          Photos reviewed: {photoCount}
        </span>
      </div>

      {groupedFindings.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {groupedFindings.map((group) => (
            <div
              key={`photo-evidence-${group.photoNumber}`}
              className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#17356f] px-3 py-1 text-[11px] font-black text-white">
                  Photo {group.photoNumber}
                </span>
                <span className="rounded-full bg-[#ffd600] px-3 py-1 text-[11px] font-black text-black">
                  {group.confidence} confidence
                </span>
              </div>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-slate-700">
                {group.findings.map((finding, index) => (
                  <li key={`photo-${group.photoNumber}-finding-${index}`}>
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-4 text-sm leading-6 text-slate-700">
          {limitations ||
            "The uploaded photos were reviewed, but they did not provide reliable additional evidence beyond the assessment answers."}
        </div>
      )}

      {groupedFindings.length > 0 && limitations && (
        <p className="mt-4 text-xs leading-5 text-slate-500">{limitations}</p>
      )}
    </section>
  );
}

export function USAReport({
  assessmentId,
  createdAt,
  answers,
  scores,
  reportText,
}: {
  assessmentId: string;
  createdAt: string;
  answers: JsonRecord;
  scores: JsonRecord;
  reportText?: string | null;
}) {
  const narrative = parseNarrative(reportText);
  const recommendations = asRecommendations(scores.recommendations);
  const climate = String(scores.climate_context ?? "Not available");
  const annualSpend =
    typeof scores.annual_energy_spend === "number"
      ? money(scores.annual_energy_spend as number)
      : "Not enough information";

  const doNow = recommendations.filter(
    (item) => item.group === "Do Now" && item.type === "No-Cost Action"
  );
  const lowCost = recommendations.filter(
    (item) => item.group === "Low-Cost Fixes"
  );
  const investigate = recommendations.filter(
    (item) => item.group === "Investigate Next"
  );
  const considerLater = recommendations.filter(
    (item) => item.group === "Consider Later"
  );
  const topPriorities = recommendations.slice(0, 5);

  const home = asRecord(answers.home);
  const bills = asRecord(answers.bills_behaviour);
  const narrativePositive = cleanStrings(narrative?.positive_findings);
  const deterministicPositive = cleanStrings(scores.positive_findings);
  const positiveFindings =
    narrativePositive.length > 0 ? narrativePositive : deterministicPositive;

  const deterministicAssumptions = cleanStrings(scores.assumptions);
  const narrativeAssumptions = cleanStrings(narrative?.assumptions_and_limits);
  const assumptions = mergeAssumptions(
    deterministicAssumptions,
    narrativeAssumptions
  );

  const solarBatteryEvFindings = cleanStrings(
    narrative?.solar_battery_ev_findings
  );
  const photoCount =
    typeof answers.uploaded_photo_count === "number"
      ? Math.max(0, Math.min(5, Math.round(answers.uploaded_photo_count)))
      : 0;
  const photoEvidence = cleanPhotoEvidence(narrative?.photo_evidence);
  const photoEvidenceLimitations =
    typeof narrative?.photo_evidence_limitations === "string"
      ? narrative.photo_evidence_limitations.trim()
      : "";
  const solarRelevant =
    solarBatteryEvFindings.length > 0 ||
    recommendations.some((item) =>
      ["Solar", "EV", "Battery"].includes(item.end_use_category)
    );

  return (
    <main className="report-page min-h-screen bg-[#f7fbff] px-5 py-6 sm:px-8 lg:px-10">
      <style>{`
        @page { margin: 10mm; }
        @media print {
          body { background: white !important; }
          .report-page { background: white !important; padding: 0 !important; }
          .report-section, .report-cover { box-shadow: none !important; }
          .report-section { margin-top: 10px !important; }
          .report-section h2 { font-size: 18px !important; line-height: 1.25 !important; }
          .report-section p, .report-section li { line-height: 1.45 !important; }
          .report-cover { break-after: page; }
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
          <Link
            href="/dashboard"
            className="rounded-full border border-[#dbe8f2] bg-white px-4 py-2 text-sm font-bold text-[#17356f]"
          >
            Back to dashboard
          </Link>
          <PrintReportButton />
        </div>

        <section className="report-cover overflow-hidden rounded-[2rem] border border-[#dbe8f2] bg-white shadow-xl shadow-[#17356f]/10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-7 sm:p-10">
              <Image
                src="/save-your-ego-logo.png"
                alt="Save Your EGO"
                width={310}
                height={120}
                priority
                className="h-auto w-64"
              />
              <p className="mt-8 text-sm font-black uppercase tracking-[0.18em] text-[#17356f]">
                USA Home Energy Report
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-black sm:text-5xl">
                Find the waste before you buy the upgrade
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {narrative?.bottom_line ||
                  "Start with the simple actions first. Bigger upgrades only appear when your answers support taking a closer look."}
              </p>
              <p className="mt-6 text-sm font-semibold text-slate-500">
                Assessment {assessmentId.slice(0, 8)} · {formatDate(createdAt)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#17356f] via-[#0d4f78] to-black p-7 text-white sm:p-10">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#ffd600]">
                Your home snapshot
              </p>
              <div className="mt-7 grid gap-4">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-xs font-bold uppercase text-white/60">Climate</p>
                  <p className="mt-2 text-2xl font-black">{climate}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-[#ffd600] p-5 text-black">
                    <p className="text-xs font-black uppercase opacity-70">Home</p>
                    <p className="mt-2 text-lg font-black">
                      {String(home.home_type ?? "Not provided")}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#59b9ec] p-5 text-[#17356f]">
                    <p className="text-xs font-black uppercase opacity-70">Size</p>
                    <p className="mt-2 text-lg font-black">
                      {String(home.home_size_band ?? "Not provided")} sq ft
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-5 text-black">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Annual energy spend
                  </p>
                  <p className="mt-2 text-xl font-black">{annualSpend}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-5">
          <section className="report-section rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm print:p-5">
            <h2 className="text-2xl font-black text-[#17356f]">
              Your Home at a Glance
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              {narrative?.home_energy_snapshot ||
                "This summary uses the answers you gave us, your local climate and the issues you noticed around the home to decide what is worth your attention first."}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f7fbff] p-4">
                <p className="text-xs font-black uppercase text-slate-400">ZIP</p>
                <p className="mt-1 font-black text-[#17356f]">
                  {String(home.zip_code ?? "Not provided")}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f7fbff] p-4">
                <p className="text-xs font-black uppercase text-slate-400">
                  Highest bills
                </p>
                <p className="mt-1 font-black text-[#17356f]">
                  {String(bills.bills_highest ?? "Not sure")}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f7fbff] p-4">
                <p className="text-xs font-black uppercase text-slate-400">
                  Actions found
                </p>
                <p className="mt-1 font-black text-[#17356f]">
                  {recommendations.length}
                </p>
              </div>
            </div>
          </section>

          <TopPrioritiesSummary items={topPriorities} />

          <RecommendationGroup
            title="Start Here — $0 Actions"
            description="These cost nothing and use what you already have. They are the easiest place to start."
            items={doNow}
            accent="yellow"
          />

          <RecommendationGroup
            title="Small Fixes Worth Doing"
            description="Simple maintenance or low-cost repairs that make sense before you consider anything expensive."
            items={lowCost}
            accent="blue"
          />

          <RecommendationGroup
            title="Check This Before Spending"
            description="These are things to look into before you pay for repairs or replacement equipment."
            items={investigate}
            accent="black"
          />

          <RecommendationGroup
            title="Bigger Upgrades to Consider Later"
            description="These are not first steps. They are options to revisit only after the simpler actions and checks are done."
            items={considerLater}
            accent="navy"
          />

          <PhotoEvidenceSection
            photoCount={photoCount}
            findings={photoEvidence}
            limitations={photoEvidenceLimitations}
          />

          <TextList
            title="What Your Energy Use Tells Us"
            items={cleanStrings(narrative?.fuel_specific_findings)}
          />

          {solarRelevant && (
            <TextList
              title="Solar, Battery & EV"
              items={solarBatteryEvFindings}
            />
          )}

          <TextList title="What’s Already Working Well" items={positiveFindings} />

          <TextList
            title="Your Next Steps"
            items={cleanStrings(narrative?.what_to_check_next)}
          />

          <TextList title="What This Report Can and Can’t Tell You" items={assumptions.slice(0, 8)} />
        </div>
      </div>
    </main>
  );
}
