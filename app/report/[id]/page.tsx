import "../report-intelligence.css";
import "../report-graphics.css";
import "../report-print-refinements.css";
import Image from "next/image";
import { ReportIntelligenceCover, ReportEnergyAnalysis } from "@/components/report-intelligence-cover";
import ReportProgressRoadmap from "@/components/report-progress-roadmap";
import ReportBillExplanation from "@/components/report-bill-explanation";
import ReportTechnicalGraphic from "@/components/report-technical-graphic";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GenerateReportButton } from "@/components/generate-report-button";
import { PrintReportButton } from "@/components/print-report-button";
import { EnergyTipsLibrary } from "@/components/energy-tips-library";

type ReportPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type JsonRecord = Record<string, unknown>;

type DetailedAction = {
  action?: string;
  why_it_matters?: string;
  estimated_cost_range?: string;
  estimated_annual_saving_range?: string;
  effort_level?: string;
  likely_payback?: string;
  priority?: string;
  suggested_next_step?: string;
  question_to_ask?: string;
};

type AiReport = {
  photo_summary?: string;
  bottom_line?: string;
  executive_summary?: string;
  estimated_annual_energy_cost_profile?: string;
  unusual_usage_warning?: string;
  top_5_priorities?: string[];

  top_energy_drains?: string[];
  top_recommended_actions?: string[];
  quick_wins?: string[];
  bigger_upgrades?: string[];
  extra_insights?: string[];

  priority_action_plan?: DetailedAction[];
  low_cost_quick_wins?: DetailedAction[];
  medium_cost_improvements?: DetailedAction[];
  higher_cost_upgrades?: DetailedAction[];

  electricity_specific_advice?: string[];
  gas_specific_advice?: string[];
  oil_specific_advice?: string[];
  appliance_findings?: string[];
  behaviour_changes?: string[];
  contractor_questions?: string[];
  what_to_check_next?: string[];
  important_assumptions?: string[];
  general_energy_saving_tips?: string[];
};

export default function ReportPage(props: ReportPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-sm font-semibold text-slate-600">
            Opening your report...
          </p>
        </main>
      }
    >
      <ReportContent {...props} />
    </Suspense>
  );
}

function safeParseReport(reportText?: string | null): AiReport | null {
  if (!reportText) {
    return null;
  }

  try {
    return JSON.parse(reportText) as AiReport;
  } catch {
    return null;
  }
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function displayValue(value: unknown, fallback = "Unknown") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function customerText(value: unknown, fallback = "Unknown") {
  return displayValue(value, fallback)
    .replace(/\bsolar PV\b/gi, "solar panels")
    .replace(/\bkWh\/year\b/gi, "kilowatt-hours a year")
    .replace(/\bkWh\b/gi, "kilowatt-hours")
    .replace(/\bindicative\b/gi, "a guide")
    .replace(/\btariffs?\b/gi, "energy plans")
    .replace(/\bstanding charge\b/gi, "fixed daily charge")
    .replace(/\bunit rate\b/gi, "price per unit")
    .replace(/\bcontractors?\b/gi, "experts")
    .replace(/\bqualified installer\b/gi, "qualified expert")
    .replace(/\bannual generation\b/gi, "electricity it may make each year")
    .replace(/\blikely demand profile\b/gi, "electricity habits")
    .replace(/\binverter limits\b/gi, "equipment limits")
    .replace(/\bexport limits\b/gi, "limits on sending spare power back to the grid")
    .replace(/\bexport rules\b/gi, "rules for sending spare power back to the grid")
    .replace(/\busable roof area\b/gi, "roof space that can be used")
    .replace(/\broof orientation\b/gi, "the direction your roof faces")
    .replace(/\bif your solar and usage patterns? fit it\b/gi, "if solar suits when you use electricity")
    .replace(/\busage patterns?\b/gi, "electricity habits")
    .replace(/\bself-consumption\b/gi, "how much solar power you use at home")
    .replace(/\bPV expansion\b/gi, "adding more solar panels")
    .replace(/\bpayback period\b/gi, "time to earn the cost back")
    .replace(/\b(\d+(?:-\d+)?)\s*kW\+?\b/gi, "$1 kilowatts (kW)");
}

function positiveEstimate(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const numeric = Number(value);
  return value !== "" && Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}


const REPORT_BILL_FREQUENCIES: Record<string, number> = {
  Monthly: 12,
  "Bi-monthly": 6,
  Quarterly: 4,
  Annual: 1,
};

function yearlyBillSpend(average: unknown, frequency: unknown, override: unknown): number | null {
  const enteredAnnual = positiveEstimate(override);
  if (enteredAnnual !== null) return enteredAnnual;
  const perBill = positiveEstimate(average);
  const periods = REPORT_BILL_FREQUENCIES[String(frequency ?? "")];
  if (perBill === null || !periods) return null;
  return perBill * periods;
}

function reportMoney(amount: number, symbol: string): string {
  return symbol + Math.round(amount).toLocaleString("en-US");
}

function prepareRoadmapAction(item: DetailedAction): DetailedAction {
  return {
    ...item,
    action: customerText(item.action, "Recommended action"),
    why_it_matters: item.why_it_matters ? customerText(item.why_it_matters) : undefined,
    estimated_cost_range: item.estimated_cost_range ? customerText(item.estimated_cost_range) : undefined,
    estimated_annual_saving_range: item.estimated_annual_saving_range ? customerText(item.estimated_annual_saving_range) : undefined,
    effort_level: item.effort_level ? customerText(item.effort_level) : undefined,
    suggested_next_step: item.suggested_next_step ? customerText(item.suggested_next_step) : undefined,
  };
}

function shouldShowEstimatedCost(item: DetailedAction) {
  const costText = item.estimated_cost_range?.trim();

  if (!costText) {
    return false;
  }

  const normalisedCost = costText.toLowerCase();

  const looksFreeOrBehavioural =
    normalisedCost.includes("no purchase") ||
    normalisedCost.includes("no cost") ||
    normalisedCost.includes("free") ||
    normalisedCost.includes("behaviour") ||
    normalisedCost.includes("behavior") ||
    /^[$£€]?0(|\s|-|–)/.test(normalisedCost);

  if (looksFreeOrBehavioural) {
    return false;
  }

  const actionText = [
    item.action,
    item.why_it_matters,
    item.suggested_next_step,
    item.effort_level,
    item.likely_payback,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const looksLikeBehaviourChange =
    actionText.includes("behaviour") ||
    actionText.includes("behavior") ||
    actionText.includes("habit") ||
    actionText.includes("routine") ||
    actionText.includes("turn off") ||
    actionText.includes("switch off") ||
    actionText.includes("unplug") ||
    actionText.includes("standby") ||
    actionText.includes("thermostat") ||
    actionText.includes("shorter shower") ||
    actionText.includes("full load") ||
    actionText.includes("lower temperature") ||
    actionText.includes("wash at") ||
    actionText.includes("air dry") ||
    actionText.includes("reduce use") ||
    actionText.includes("use less") ||
    actionText.includes("schedule") ||
    actionText.includes("timer");

  const looksLikePurchaseOrUpgrade =
    actionText.includes("install") ||
    actionText.includes("replace") ||
    actionText.includes("upgrade") ||
    actionText.includes("buy") ||
    actionText.includes("purchase") ||
    actionText.includes("fit ") ||
    actionText.includes("contractor");

  return !(looksLikeBehaviourChange && !looksLikePurchaseOrUpgrade);
}

function TextSection({
  title,
  children,
  accent = "blue",
}: {
  title: string;
  children: React.ReactNode;
  accent?: "yellow" | "blue" | "black" | "navy";
}) {
  const accentClass =
    accent === "yellow"
      ? "border-l-[#ffd600]"
      : accent === "black"
        ? "border-l-black"
        : accent === "navy"
          ? "border-l-[#17356f]"
          : "border-l-[#59b9ec]";

  return (
    <section
      className={`report-section rounded-3xl border border-[#dbe8f2] border-l-8 ${accentClass} bg-white p-6 shadow-sm print:break-inside-avoid`}
    >
      <h2 className="text-2xl font-black text-[#17356f]">{title}</h2>
      <div className="mt-4 text-sm leading-7 text-slate-700">{children}</div>
    </section>
  );
}

function ReportList({
  title,
  items,
  accent = "blue",
}: {
  title: string;
  items?: string[];
  accent?: "yellow" | "blue" | "black" | "navy";
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <TextSection title={title} accent={accent}>
      <ul className="list-disc space-y-2 pl-5">
        {items.map((item, index) => (
          <li key={`${title}-${index}-${item}`}>{customerText(item)}</li>
        ))}
      </ul>
    </TextSection>
  );
}

function TopPrioritiesSection({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="report-section rounded-3xl border border-[#dbe8f2] border-t-8 border-t-[#17356f] bg-white p-6 shadow-sm print:break-inside-avoid">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        Customer action summary
      </p>

      <h2 className="mt-1 text-2xl font-black text-[#17356f]">
        Top 5 priorities
      </h2>

      <div className="mt-5 grid gap-3">
        {items.slice(0, 5).map((item, index) => (
          <div
            key={`priority-${index}-${item}`}
            className="flex gap-4 rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffd600] text-sm font-black text-black">
              {index + 1}
            </div>

            <p className="text-sm font-semibold leading-6 text-slate-700">
              {customerText(item)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function UsageWarningSection({ warning }: { warning?: string }) {
  if (!warning) {
    return null;
  }

  return (
    <section className="report-section rounded-3xl border border-[#ffe76a] bg-[#fff6bf] p-6 shadow-sm print:break-inside-avoid">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6b5200]">
        Usage check
      </p>

      <h2 className="mt-1 text-2xl font-black text-black">
        Check unusually high usage
      </h2>

      <p className="mt-4 text-sm font-semibold leading-7 text-slate-800">
        {customerText(warning)}
      </p>
    </section>
  );
}

function MetricCard({
  label,
  value,
  colour = "navy",
}: {
  label: string;
  value: string;
  colour?: "yellow" | "blue" | "navy" | "black" | "white";
}) {
  const colourClass =
    colour === "yellow"
      ? "bg-[#fff6bf] text-[#6b5200] border-[#ffe76a]"
      : colour === "blue"
        ? "bg-[#e9f6fe] text-[#17356f] border-[#bde8ff]"
        : colour === "black"
          ? "bg-slate-100 text-black border-slate-200"
          : colour === "white"
            ? "bg-white text-[#17356f] border-[#dbe8f2]"
            : "bg-[#17356f] text-white border-[#17356f]";

  return (
    <div className={`rounded-2xl border p-4 ${colourClass}`}>
      <p className="text-xs font-black uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black leading-tight">{value}</p>
    </div>
  );
}

function DetailPill({
  label,
  value,
  colour = "blue",
}: {
  label: string;
  value?: string;
  colour?: "yellow" | "blue" | "black" | "navy";
}) {
  if (!value) {
    return null;
  }

  const className =
    colour === "yellow"
      ? "bg-[#fff6bf] text-[#6b5200] border-[#ffe76a]"
      : colour === "black"
        ? "bg-slate-100 text-black border-slate-200"
        : colour === "navy"
          ? "bg-[#17356f] text-white border-[#17356f]"
          : "bg-[#e9f6fe] text-[#17356f] border-[#bde8ff]";

  return (
    <div className={`rounded-2xl border p-3 ${className}`}>
      <p className="text-[11px] font-black uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-sm font-black leading-6">{value}</p>
    </div>
  );
}

function ActionPlanSection({
  title,
  description,
  actions,
  accent = "blue",
  costMarker,
  ranked = false,
}: {
  title: string;
  description?: string;
  actions?: DetailedAction[];
  accent?: "yellow" | "blue" | "black" | "navy";
  costMarker?: "$" | "$$" | "$$$";
  ranked?: boolean;
}) {
  if (!actions || actions.length === 0) {
    return null;
  }

  const accentClass =
    accent === "yellow"
      ? "border-t-[#ffd600]"
      : accent === "black"
        ? "border-t-black"
        : accent === "navy"
          ? "border-t-[#17356f]"
          : "border-t-[#59b9ec]";

  return (
    <section
      className={`ri-action-group report-section rounded-3xl border border-[#dbe8f2] border-t-8 ${accentClass} bg-white p-6 shadow-sm`}
    >
      <h2 className="text-2xl font-black text-[#17356f]">{title}</h2>

      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      )}

      <div className="ri-action-grid-online mt-5 grid gap-4 lg:grid-cols-2 print:hidden">
        {actions.map((item, index) => (
          <article
            key={`${title}-${index}-${item.action}`}
            className={`rounded-3xl border p-4 print:break-inside-avoid ${ranked && index < 3 ? "border-[#ffe76a] bg-[#fffdf0]" : "border-[#dbe8f2] bg-[#f7fbff]"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {ranked ? `Priority ${index + 1} of ${actions.length}` : `Action ${index + 1}`}
                  </p>
                  {costMarker && (
                    <span className="rounded-full bg-[#fff6bf] px-2 py-0.5 text-[11px] font-black text-black">
                      {costMarker}
                    </span>
                  )}
                </div>

                <h3 className="mt-1 text-lg font-black leading-6 text-black">
                  {customerText(item.action, "Recommended action")}
                </h3>
              </div>

              {item.priority && (
                <span className="shrink-0 rounded-full bg-[#ffd600] px-3 py-1 text-[11px] font-black text-black">
                  {item.priority}
                </span>
              )}
            </div>

            {item.why_it_matters && (
              <div className="mt-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-[#17356f]/60">
                  Why
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {customerText(item.why_it_matters)}
                </p>
              </div>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {shouldShowEstimatedCost(item) && (
                <DetailPill
                  label="Likely cost"
                  value={item.estimated_cost_range}
                  colour="yellow"
                />
              )}

              <DetailPill
                label="Could save each year"
                value={item.estimated_annual_saving_range}
                colour="blue"
              />

              <DetailPill
                label="What it takes"
                value={item.effort_level}
                colour="black"
              />

              <DetailPill
                label="When it may pay back"
                value={item.likely_payback}
                colour="navy"
              />
            </div>

            {item.suggested_next_step && (
              <div className="mt-3 rounded-2xl border border-[#dbe8f2] bg-white p-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  What to do next
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {customerText(item.suggested_next_step)}
                </p>
              </div>
            )}

            {item.question_to_ask && (
              <div className="mt-3 rounded-2xl border border-[#bde8ff] bg-[#e9f6fe] p-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-[#17356f]/60">
                  Ask the Expert
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {customerText(item.question_to_ask)}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="ri-print-action-grid hidden print:grid">
        {actions.map((item, index) => (
          <article className="ri-print-action-card" key={"print-" + title + "-" + index}>
            <div className="ri-print-action-card-heading">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{title} / Action {index + 1}</p>
                <h3>{customerText(item.action, "Recommended action")}</h3>
              </div>
            </div>
            {item.why_it_matters && <p><b>Why:</b> {customerText(item.why_it_matters)}</p>}
            <div className="ri-print-action-facts">
              {shouldShowEstimatedCost(item) && <span><b>Cost:</b> {customerText(item.estimated_cost_range)}</span>}
              {item.estimated_annual_saving_range && <span><b>Could save/year:</b> {customerText(item.estimated_annual_saving_range)}</span>}
              {item.effort_level && <span><b>Effort:</b> {customerText(item.effort_level)}</span>}
              {item.likely_payback && <span><b>May pay back:</b> {customerText(item.likely_payback)}</span>}
            </div>
            {item.suggested_next_step && <p><b>Next:</b> {customerText(item.suggested_next_step)}</p>}
            {item.question_to_ask && <p className="ri-print-expert"><b>Ask the Expert:</b> {customerText(item.question_to_ask)}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function InputCard({
  title,
  colour,
  children,
}: {
  title: string;
  colour: "yellow" | "blue" | "black";
  children: React.ReactNode;
}) {
  const className =
    colour === "yellow"
      ? "border-l-[#ffd600] bg-[#fffdf0]"
      : colour === "blue"
        ? "border-l-[#59b9ec] bg-[#f1faff]"
        : "border-l-black bg-slate-50";

  return (
    <div
      className={`rounded-2xl border border-[#dbe8f2] border-l-8 p-4 ${className}`}
    >
      <h3 className="font-black text-black">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-slate-700">{children}</div>
    </div>
  );
}

function SolarPVSection({ solar }: { solar?: JsonRecord | null }) {
  if (!solar) {
    return null;
  }

  const rawRating = displayValue(solar.rating);

  if (rawRating === "Not applicable") {
    return null;
  }

  const needsMoreInformation =
    rawRating === "Unknown" || rawRating === "Needs more information";

  const customerRating = needsMoreInformation
    ? "Needs more information"
    : rawRating;

  const installerQuestions = Array.isArray(solar.installer_questions)
    ? solar.installer_questions
    : [];

  const cautions = Array.isArray(solar.cautions) ? solar.cautions : [];

  return (
    <section id="report-solar" className="report-section rounded-3xl border border-[#dbe8f2] border-t-8 border-t-[#ffd600] bg-white p-6 shadow-sm print:break-inside-avoid">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6b5200]">
            Solar check
          </p>

          <div className="grid gap-4 lg:grid-cols-[1fr_230px] lg:items-center">
            <div>
              <h2 className="mt-1 text-2xl font-black text-[#17356f]">
                Is solar worth looking at?
              </h2>
            </div>
            <div className="ri-graphic-aside ri-print-decor"><ReportTechnicalGraphic kind="solar" /></div>
          </div>

          <div className="mt-3 max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-wide text-[#17356f]/60">
              Why
            </p>
            <p className="mt-1 text-sm leading-7 text-slate-700">
              {customerText(solar.reason)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#ffd600] px-5 py-4 text-black">
          <p className="text-xs font-black uppercase opacity-70">Our view</p>
          <p className="mt-1 text-2xl font-black">
            {customerRating}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#ffe76a] bg-[#fff6bf] p-5">
          <p className="text-xs font-black uppercase tracking-wide text-[#6b5200]">
            Possible solar size
          </p>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-800">
            {needsMoreInformation
  ? "Not estimated until roof orientation, shading and usable roof area are confirmed."
  : customerText(solar.suggested_system_size)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#bde8ff] bg-[#e9f6fe] p-5">
          <p className="text-xs font-black uppercase tracking-wide text-[#17356f]/70">
            Battery
          </p>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-800">
            {customerText(solar.battery_view)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            A home battery stores spare electricity, often from solar panels, so you can use it later in the day. Some systems can also keep selected circuits running during a power cut, but only when backup has been included in the system design.
          </p>
        </div>
      </div>

      {(installerQuestions.length > 0 || cautions.length > 0) && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {installerQuestions.length > 0 && (
            <div className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-5">
              <h3 className="font-black text-[#17356f]">
                Ask the Expert about solar
              </h3>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {installerQuestions.slice(0, 5).map((item, index) => (
                  <li key={`solar-question-${index}`}>{customerText(item)}</li>
                ))}
              </ul>
            </div>
          )}

          {cautions.length > 0 && (
            <div className="rounded-2xl border border-[#dbe8f2] bg-white p-5">
              <h3 className="font-black text-[#17356f]">Before you spend money on solar</h3>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {cautions.slice(0, 5).map((item, index) => (
                  <li key={`solar-caution-${index}`}>{String(item)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

async function ReportContent({ params }: ReportPageProps) {
  await connection();

  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: assessment, error } = await supabase
    .from("assessments")
    .select("id, answers, scores, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !assessment) {
    notFound();
  }

  const { data: report } = await supabase
    .from("reports")
    .select("id, report_text, created_at")
    .eq("assessment_id", assessment.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const aiReport = safeParseReport(report?.report_text);

  const answers = (assessment.answers ?? {}) as JsonRecord;
  const scores = (assessment.scores ?? {}) as JsonRecord;

  const quickScores =
  typeof scores.quickScores === "object" &&
  scores.quickScores !== null &&
  !Array.isArray(scores.quickScores)
    ? (scores.quickScores as JsonRecord)
    : null;

  const usesGas = Boolean(answers.uses_gas);
const usesOil = Boolean(answers.uses_oil);

const isApartment =
  String(answers.property_type ?? "").toLowerCase() === "apartment";

const solarSuitability = isApartment
  ? null
  : ((scores.solarSuitability ?? null) as JsonRecord | null);

  const hasDetailedReport =
    Boolean(aiReport?.priority_action_plan?.length) ||
    Boolean(aiReport?.low_cost_quick_wins?.length) ||
    Boolean(aiReport?.medium_cost_improvements?.length) ||
    Boolean(aiReport?.higher_cost_upgrades?.length);

  const electricityEstimate = positiveEstimate(scores.estimatedBillKwh);
  const applianceEstimate = positiveEstimate(scores.applianceKwh);
  const heatLossArea = customerText(scores.biggestLossArea, "Not enough information");
  const insulationOverview = customerText(scores.fabricBand, "Not enough information");
  const fuelNames = ["Electricity", ...(usesGas ? ["Gas"] : []), ...(usesOil ? ["Oil"] : [])];
  const firstPriorities = (aiReport?.top_5_priorities ?? []).slice(0, 3).map((item) => customerText(item));

  const currencySymbol = String(answers.country ?? "") === "US" ? "$" : String(answers.country ?? "") === "UK" ? "£" : "€";
  const annualElectricitySpend = yearlyBillSpend(answers.avg_electricity_bill, answers.bill_frequency, answers.annual_bill_override);
  const annualGasSpend = usesGas ? yearlyBillSpend(answers.avg_gas_bill, answers.gas_bill_frequency, answers.annual_gas_spend) : null;
  const oilVolume = positiveEstimate(answers.oil_litres_per_year);
  const oilPrice = positiveEstimate(answers.oil_price_per_litre);
  const annualOilSpend = usesOil ? positiveEstimate(answers.annual_oil_spend) ?? (oilVolume !== null && oilPrice !== null ? oilVolume * oilPrice : null) : null;
  const knownFuelCosts = [
    { fuel: "electricity", amount: annualElectricitySpend },
    ...(usesGas ? [{ fuel: "gas", amount: annualGasSpend }] : []),
    ...(usesOil ? [{ fuel: "oil", amount: annualOilSpend }] : []),
  ].filter((item): item is { fuel: string; amount: number } => item.amount !== null && item.amount > 0);
  const totalKnownCost = knownFuelCosts.reduce((sum, item) => sum + item.amount, 0);
  const hasPhotoAnalysis = Boolean(aiReport?.photo_summary) && !/^no (home or equipment )?photos? (were )?analysed\.?$/i.test(String(aiReport?.photo_summary).trim());

  return (
    <main className="ri-report-page report-page min-h-screen bg-[#f7fbff] px-5 py-6 sm:px-8 lg:px-10">


      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
          <Link
            href="/dashboard"
            className="rounded-full border border-[#dbe8f2] bg-white px-4 py-2 text-sm font-bold text-[#17356f] shadow-sm"
          >
            Back to dashboard
          </Link>

          <PrintReportButton />
        </div>

        <nav className="ri-report-nav print:hidden" aria-label="Jump to report sections">
          <div className="ri-report-nav-inner">
            <span className="ri-report-nav-label">YOUR REPORT /</span>
            <a href="#report-overview">Overview</a>
            <a href="#report-energy">Energy analysis</a>
            <a href="#report-inputs">Your bills</a>
            {aiReport && <a href="#report-actions">Recommendations</a>}
            {aiReport?.priority_action_plan?.length ? <a href="#report-roadmap">Action roadmap</a> : null}
            {solarSuitability && displayValue(solarSuitability.rating) !== "Not applicable" ? <a href="#report-solar">Solar</a> : null}
          </div>
        </nav>

        <ReportIntelligenceCover
          assessmentDate={formatDate(assessment.created_at)}
          propertyType={customerText(answers.property_type, "Your home")}
          fuels={fuelNames}
          electricityKwh={electricityEstimate}
          applianceKwh={applianceEstimate}
          biggestLossArea={heatLossArea}
          fabricBand={insulationOverview}
          priorities={firstPriorities}
        />

        <ReportEnergyAnalysis
          electricityKwh={electricityEstimate}
          applianceKwh={applianceEstimate}
          biggestLossArea={heatLossArea}
          fabricBand={insulationOverview}
        />

        {quickScores && (
          <section className="report-section mt-6 rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm">
            <p className="ri-section-kicker">ASSESSMENT DETAILS</p>
            <h2 className="text-2xl font-black text-[#17356f]">More about your home</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {Object.entries(quickScores).map(([label, score]) => (
                <MetricCard key={label} label={label} value={String(score)} colour="white" />
              ))}
            </div>
          </section>
        )}

        <section id="report-inputs" className="report-section mt-6 rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_250px] lg:items-center">
            <div>
              <h2 className="text-2xl font-black text-[#17356f]">
                What you told us about your bills
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The figures you entered give the report its starting point.
              </p>
            </div>
            <div className="ri-graphic-aside ri-print-decor"><ReportTechnicalGraphic kind="bills" /></div>
          </div>

          <div className={`mt-5 grid gap-4 ${usesGas && usesOil ? "md:grid-cols-3" : usesGas || usesOil ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
            <InputCard title="Electricity" colour="yellow">
              <p>Average bill: {currencySymbol}{displayValue(answers.avg_electricity_bill, "0")} ({String(answers.bill_frequency ?? "billing period not specified")})</p>
              <p>Price per kilowatt-hour: {currencySymbol}{displayValue(answers.unit_rate, "Not specified")}</p>
              <p>Fixed charge per bill: {currencySymbol}{displayValue(answers.standing_charge, "0")}</p>
              <p>Estimated yearly spend: {annualElectricitySpend !== null ? reportMoney(annualElectricitySpend, currencySymbol) : "Not available"}</p>
            </InputCard>

            {usesGas && <InputCard title="Gas" colour="blue">
              <p>Used in home: Yes</p>
              {usesGas && (
                <>
                  <p>
                    Average bill: {currencySymbol}{displayValue(answers.avg_gas_bill, "0")} ({String(answers.gas_bill_frequency ?? "billing period not specified")})
                  </p>
                  <p>Boiler age: {displayValue(answers.gas_boiler_age)}</p>
                </>
              )}
            </InputCard>}

            {usesOil && <InputCard title="Oil" colour="black">
              <p>Used in home: Yes</p>
              {usesOil && (
                <>
                  <p>
                    {String(answers.country ?? "") === "US"
                      ? `Gallons/year: ${Math.round(Number(answers.oil_litres_per_year ?? 0) / 3.78541)}`
                      : `Litres/year: ${displayValue(answers.oil_litres_per_year, "0")}`}
                  </p>
                  <p>Boiler age: {displayValue(answers.oil_boiler_age)}</p>
                </>
              )}
            </InputCard>}
          </div>

          <ReportBillExplanation
            currencySymbol={currencySymbol}
            averageBill={positiveEstimate(answers.avg_electricity_bill)}
            billingFrequency={String(answers.bill_frequency ?? "")}
            annualSpendOverride={positiveEstimate(answers.annual_bill_override)}
            fixedChargePerBill={positiveEstimate(answers.standing_charge)}
            unitRate={positiveEstimate(answers.unit_rate)}
            estimatedYearlyKwh={electricityEstimate}
          />
        </section>

        {aiReport ? (
          <div id="report-actions" className="mt-6 space-y-5">
            {aiReport.bottom_line && (
              <section className="report-section rounded-3xl border border-[#dbe8f2] bg-[#fff6bf] p-6 shadow-sm print:break-inside-avoid">
                <h2 className="text-2xl font-black text-black">
                  Bottom line
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-800">
                  {customerText(aiReport.bottom_line)}
                </p>
              </section>
            )}

            {aiReport.executive_summary && (
              <TextSection title="Your home at a glance" accent="navy">
                <p>{customerText(aiReport.executive_summary)}</p>
              </TextSection>
            )}

            {aiReport.estimated_annual_energy_cost_profile && (
              <TextSection
                title="What your energy costs look like"
                accent="yellow"
              >
                {knownFuelCosts.length > 0 ? (
                  <>
                    <p>
                      Based on the bills entered, the estimated yearly energy spend is about{" "}
                      <strong>{reportMoney(totalKnownCost, currencySymbol)}</strong>.
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Included:{" "}
                      {knownFuelCosts.map((item) => reportMoney(item.amount, currencySymbol) + " for " + item.fuel).join("; ")}.
                      {" "}This estimate depends on the bill periods and fuel details you entered.
                      Amounts for any fuels without bill data are not included.
                    </p>
                  </>
                ) : (
                  <p>{customerText(aiReport.estimated_annual_energy_cost_profile)}</p>
                )}
              </TextSection>
            )}

            <UsageWarningSection warning={aiReport.unusual_usage_warning} />

            <TopPrioritiesSection items={aiReport.top_5_priorities} />

            {hasPhotoAnalysis && (
              <TextSection title="What we noticed in your photos" accent="blue">
                <p>{customerText(aiReport.photo_summary)}</p>
              </TextSection>
            )}

            <ReportList
              title="Where your energy may be going"
              items={aiReport.top_energy_drains}
              accent="yellow"
            />

            <ReportList
              title="Best places to start"
              items={aiReport.top_recommended_actions}
              accent="blue"
            />

            <section className="ri-investment-preface report-section rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm print:hidden">
              <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#17356f]/60">
                    Your improvement choices
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#17356f]">
                    Start small, then build up
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    We have split the ideas into low, medium and higher-cost options so you can see what is realistic now and what may be worth planning for later.
                  </p>
                </div>
                <div className="ri-upgrade-spectrum">
                    <div className="ri-upgrade-tier"><span>01</span><div><strong>Low-cost quick wins</strong><small>Start with practical changes.</small></div></div>
                    <div className="ri-upgrade-tier"><span>02</span><div><strong>Medium-cost improvements</strong><small>Consider what suits your home.</small></div></div>
                    <div className="ri-upgrade-tier"><span>03</span><div><strong>Higher-cost upgrades</strong><small>Investigate bigger investments first.</small></div></div>
                  </div>
              </div>
            </section>

            <ActionPlanSection
              title="Low-cost quick wins"
              description="Start here. Free fixes first, then the low-cost wins. Small changes add up."
              actions={aiReport.low_cost_quick_wins}
              accent="yellow"
              costMarker="$"
            />

            <EnergyTipsLibrary />

            <ActionPlanSection
              title="Medium-cost improvements"
              description="Spend a little more only where it makes sense for your home."
              actions={aiReport.medium_cost_improvements}
              accent="blue"
              costMarker="$$"
            />

            <ActionPlanSection
              title="Higher-cost upgrades"
              description="Big spending later, only if it still makes sense. Ask the Expert before you commit."
              actions={aiReport.higher_cost_upgrades}
              accent="black"
              costMarker="$$$"
            />


            <section className="ri-roadmap-preface report-section overflow-hidden rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm print:hidden">
              <p className="ri-section-kicker">YOUR PLAN</p>
              <h2 className="text-2xl font-black text-[#17356f]">From first win to lasting improvements</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">You have seen the options. Here is the order we suggest tackling them. Progress is easier when you focus on one useful change at a time.</p>
              <div className="ri-roadmap-preview mt-5">
                <div><b>01</b><span>Understand the opportunity</span></div>
                <div><b>02</b><span>Choose a practical next step</span></div>
                <div><b>03</b><span>Track what you have completed</span></div>
              </div>
            </section>

            <ReportProgressRoadmap
              reportId={assessment.id}
              actions={(aiReport.priority_action_plan ?? []).map(prepareRoadmapAction)}
              lowCostActions={(aiReport.low_cost_quick_wins ?? []).map(prepareRoadmapAction)}
              mediumCostActions={(aiReport.medium_cost_improvements ?? []).map(prepareRoadmapAction)}
              higherCostActions={(aiReport.higher_cost_upgrades ?? []).map(prepareRoadmapAction)}
            />

            <SolarPVSection solar={solarSuitability} />

            {hasDetailedReport ? (
              <>
                <div className="grid gap-5 lg:grid-cols-3">
                  <section className="report-section rounded-3xl border border-[#dbe8f2] border-l-8 border-l-[#ffd600] bg-white p-6 shadow-sm print:break-inside-avoid">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffd600] text-lg font-black text-black">E</div>
                      <h2 className="text-2xl font-black text-[#17356f]">Electricity advice</h2>
                    </div>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                      {(aiReport.electricity_specific_advice ?? []).map((item, index) => <li key={`electricity-${index}`}>{customerText(item)}</li>)}
                    </ul>
                  </section>

                  {usesGas && (aiReport.gas_specific_advice ?? []).length > 0 && <section className="report-section rounded-3xl border border-[#dbe8f2] border-l-8 border-l-[#59b9ec] bg-white p-6 shadow-sm print:break-inside-avoid">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#59b9ec] text-lg font-black text-[#17356f]">G</div>
                      <h2 className="text-2xl font-black text-[#17356f]">Gas advice</h2>
                    </div>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                      {(aiReport.gas_specific_advice ?? []).map((item, index) => <li key={`gas-${index}`}>{customerText(item)}</li>)}
                    </ul>
                  </section>}

                  {usesOil && (aiReport.oil_specific_advice ?? []).length > 0 && <section className="report-section rounded-3xl border border-[#dbe8f2] border-l-8 border-l-black bg-white p-6 shadow-sm print:break-inside-avoid">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-lg font-black text-white">O</div>
                      <h2 className="text-2xl font-black text-[#17356f]">Oil advice</h2>
                    </div>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                      {(aiReport.oil_specific_advice ?? []).map((item, index) => <li key={`oil-${index}`}>{customerText(item)}</li>)}
                    </ul>
                  </section>}
                </div>

                <section className="report-section rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm print:break-inside-avoid">
                  <div className="grid gap-5 lg:grid-cols-[240px_1fr] lg:items-center">
                    <div className="ri-graphic-aside ri-print-decor"><ReportTechnicalGraphic kind="appliances" /></div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#17356f]/60">
                        Everyday energy
                      </p>
                      <h2 className="mt-1 text-2xl font-black text-[#17356f]">
                        Appliances and daily habits
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        Small appliances are not always the biggest part of the bill, but the way larger equipment is used can make a noticeable difference over a year.
                      </p>
                    </div>
                  </div>
                </section>

                <div className="grid gap-5 lg:grid-cols-2">
                  <ReportList
                    title="What we noticed about your appliances"
                    items={aiReport.appliance_findings}
                    accent="blue"
                  />

                  <ReportList
                    title="Everyday changes"
                    items={aiReport.behaviour_changes}
                    accent="yellow"
                  />
                </div>

                <ReportList
                  title="What to check next"
                  items={aiReport.what_to_check_next}
                  accent="blue"
                />

                <ReportList
                  title="A few things to keep in mind"
                  items={aiReport.important_assumptions}
                  accent="black"
                />

                <ReportList
                  title="More easy ways to save energy"
                  items={aiReport.general_energy_saving_tips}
                  accent="yellow"
                />
              </>
            ) : (
              <>
                <ReportList title="Quick wins" items={aiReport.quick_wins} />

                <ReportList
                  title="Bigger upgrades"
                  items={aiReport.bigger_upgrades}
                  accent="black"
                />

                <ReportList
                  title="Extra insights"
                  items={aiReport.extra_insights}
                  accent="blue"
                />

                <ReportList
                  title="More easy ways to save energy"
                  items={aiReport.general_energy_saving_tips}
                  accent="yellow"
                />
              </>
            )}
          </div>
        ) : (
          <section className="mt-6 rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm print:hidden">
            <h2 className="text-2xl font-black text-[#17356f]">
              Get your personalised report
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Create the full Save Your EGO report with your personalised
              assessment, action plan and practical recommendations.
            </p>

            <div className="mt-5">
              <GenerateReportButton assessmentId={assessment.id} />
            </div>
          </section>
        )}

        <section className="report-disclaimer mt-6 rounded-3xl border border-[#dbe8f2] bg-white p-6 text-sm leading-6 text-slate-600 shadow-sm print:break-inside-avoid">
          <h2 className="font-black text-[#17356f]">Important note</h2>
          <p className="mt-2">
            This report is a guide based on the answers you gave us. It does not replace a qualified expert.
            Costs, savings and the time to earn money back are estimates, not promises.
          </p>
        </section>

        <footer className="mt-6 rounded-3xl bg-[#17356f] p-6 text-white print:break-inside-avoid">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xl font-black">Save Your EGO</p>
              <p className="mt-1 text-sm font-semibold text-white/70">
                Electricity. Gas. Oil.
              </p>
            </div>

            <p className="text-sm font-semibold text-white/70">
              Report generated{" "}
              {formatDate(report?.created_at ?? assessment.created_at)}
            </p>
          </div>
        </footer>

        
      </div>
    </main>
  );
}