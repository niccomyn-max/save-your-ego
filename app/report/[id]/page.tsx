import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GenerateReportButton } from "@/components/generate-report-button";
import { PrintReportButton } from "@/components/print-report-button";

type ReportPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type JsonRecord = Record<string, any>;

type DetailedAction = {
  action?: string;
  why_it_matters?: string;
  estimated_cost_range?: string;
  estimated_annual_saving_range?: string;
  effort_level?: string;
  likely_payback?: string;
  priority?: string;
  suggested_next_step?: string;
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
};

export default function ReportPage(props: ReportPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-sm font-semibold text-slate-600">
            Loading report...
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
          <li key={`${title}-${index}-${item}`}>{item}</li>
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
              {item}
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
        {warning}
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
}: {
  title: string;
  description?: string;
  actions?: DetailedAction[];
  accent?: "yellow" | "blue" | "black" | "navy";
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
      className={`report-section rounded-3xl border border-[#dbe8f2] border-t-8 ${accentClass} bg-white p-6 shadow-sm print:break-inside-avoid`}
    >
      <h2 className="text-2xl font-black text-[#17356f]">{title}</h2>

      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {actions.map((item, index) => (
          <article
            key={`${title}-${index}-${item.action}`}
            className="rounded-3xl border border-[#dbe8f2] bg-[#f7fbff] p-4 print:break-inside-avoid"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Action {index + 1}
                </p>

                <h3 className="mt-1 text-lg font-black leading-6 text-black">
                  {displayValue(item.action, "Recommended action")}
                </h3>
              </div>

              {item.priority && (
                <span className="shrink-0 rounded-full bg-[#ffd600] px-3 py-1 text-[11px] font-black text-black">
                  {item.priority}
                </span>
              )}
            </div>

            {item.why_it_matters && (
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {item.why_it_matters}
              </p>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <DetailPill
                label="Estimated cost"
                value={item.estimated_cost_range}
                colour="yellow"
              />

              <DetailPill
                label="Estimated saving"
                value={item.estimated_annual_saving_range}
                colour="blue"
              />

              <DetailPill
                label="Effort"
                value={item.effort_level}
                colour="black"
              />

              <DetailPill
                label="Payback"
                value={item.likely_payback}
                colour="navy"
              />
            </div>

            {item.suggested_next_step && (
              <div className="mt-3 rounded-2xl border border-[#dbe8f2] bg-white p-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                  Suggested next step
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {item.suggested_next_step}
                </p>
              </div>
            )}
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

  const installerQuestions = Array.isArray(solar.installer_questions)
    ? solar.installer_questions
    : [];

  const cautions = Array.isArray(solar.cautions) ? solar.cautions : [];

  return (
    <section className="report-section rounded-3xl border border-[#dbe8f2] border-t-8 border-t-[#ffd600] bg-white p-6 shadow-sm print:break-inside-avoid">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6b5200]">
            Solar review
          </p>

          <h2 className="mt-1 text-2xl font-black text-[#17356f]">
            Solar PV suitability
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
            {displayValue(solar.reason)}
          </p>
        </div>

        <div className="rounded-2xl bg-[#ffd600] px-5 py-4 text-black">
          <p className="text-xs font-black uppercase opacity-70">Suitability</p>
          <p className="mt-1 text-2xl font-black">
            {displayValue(solar.rating)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#ffe76a] bg-[#fff6bf] p-5">
          <p className="text-xs font-black uppercase tracking-wide text-[#6b5200]">
            Suggested system size
          </p>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-800">
            {displayValue(solar.suggested_system_size)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#bde8ff] bg-[#e9f6fe] p-5">
          <p className="text-xs font-black uppercase tracking-wide text-[#17356f]/70">
            Battery view
          </p>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-800">
            {displayValue(solar.battery_view)}
          </p>
        </div>
      </div>

      {(installerQuestions.length > 0 || cautions.length > 0) && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {installerQuestions.length > 0 && (
            <div className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-5">
              <h3 className="font-black text-[#17356f]">
                Questions to ask a solar installer
              </h3>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {installerQuestions.slice(0, 5).map((item, index) => (
                  <li key={`solar-question-${index}`}>{String(item)}</li>
                ))}
              </ul>
            </div>
          )}

          {cautions.length > 0 && (
            <div className="rounded-2xl border border-[#dbe8f2] bg-white p-5">
              <h3 className="font-black text-[#17356f]">Solar cautions</h3>

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

  const usesGas = Boolean(answers.uses_gas);
  const usesOil = Boolean(answers.uses_oil);
  const solarSuitability = (scores.solarSuitability ?? null) as JsonRecord | null;

  const hasDetailedReport =
    Boolean(aiReport?.priority_action_plan?.length) ||
    Boolean(aiReport?.low_cost_quick_wins?.length) ||
    Boolean(aiReport?.medium_cost_improvements?.length) ||
    Boolean(aiReport?.higher_cost_upgrades?.length);

  return (
    <main className="report-page min-h-screen bg-[#f7fbff] px-5 py-6 sm:px-8 lg:px-10">
      <style>{`
        @media print {
          body {
            background: white !important;
          }

          .report-page {
            background: white !important;
            padding: 0 !important;
          }

          .report-section,
          .report-cover,
          .report-disclaimer {
            box-shadow: none !important;
            page-break-inside: avoid;
          }

          .print-break-before {
            page-break-before: always;
          }
        }
      `}</style>

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

        <section className="report-cover overflow-hidden rounded-[2rem] border border-[#dbe8f2] bg-white shadow-xl shadow-[#17356f]/10">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
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
                Covering Electricity, Gas and Oil
              </p>

              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-[#050505] sm:text-5xl">
                Home Energy Report
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                A practical Save Your EGO assessment covering household energy
                use, likely waste areas, appliance insights, improvement costs,
                savings potential and priority actions.
              </p>

              <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f7fbff] p-4">
                  <p className="font-bold text-slate-500">Assessment date</p>
                  <p className="mt-1 font-black text-[#17356f]">
                    {formatDate(assessment.created_at)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f7fbff] p-4">
                  <p className="font-bold text-slate-500">Report type</p>
                  <p className="mt-1 font-black text-[#17356f]">
                    AI-assisted home energy assessment
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#17356f] via-[#0d4f78] to-black p-7 text-white sm:p-10">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#ffd600]">
                Energy snapshot
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
                  <p className="text-xs font-bold uppercase text-white/60">
                    Main heat-loss area
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {displayValue(scores.biggestLossArea)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-[#ffd600] p-5 text-black">
                    <p className="text-xs font-black uppercase opacity-70">
                      Fabric
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      {displayValue(scores.fabricBand)}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-[#59b9ec] p-5 text-[#17356f]">
                    <p className="text-xs font-black uppercase opacity-70">
                      Appliances
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      {Math.round(Number(scores.applianceKwh ?? 0))} kWh
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 text-black">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Fuel coverage
                  </p>
                  <p className="mt-2 text-xl font-black">
                    Electricity{usesGas ? ", Gas" : ""}
                    {usesOil ? ", Oil" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="report-section mt-6 rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-[#17356f]">
            Energy snapshot
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <MetricCard
              label="Electricity estimate"
              value={`${Math.round(Number(scores.estimatedBillKwh ?? 0))} kWh`}
              colour="yellow"
            />

            <MetricCard
              label="Appliance use"
              value={`${Math.round(Number(scores.applianceKwh ?? 0))} kWh`}
              colour="blue"
            />

            <MetricCard
              label="Heat-loss area"
              value={displayValue(scores.biggestLossArea)}
              colour="navy"
            />

            <MetricCard
              label="Fabric profile"
              value={displayValue(scores.fabricBand)}
              colour="black"
            />
          </div>

          {scores.quickScores && (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {Object.entries(scores.quickScores).map(([label, score]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-4"
                >
                  <p className="text-sm font-bold text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-black text-[#17356f]">
                    {String(score)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="report-section mt-6 rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-[#17356f]">
            Electricity, Gas and Oil inputs
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <InputCard title="Electricity" colour="yellow">
              <p>
                Average bill:{" "}
                {displayValue(answers.avg_electricity_bill, "0")}
              </p>
              <p>Unit rate: {displayValue(answers.unit_rate)}</p>
              <p>
                Annual spend:{" "}
                {answers.annual_bill_override
                  ? answers.annual_bill_override
                  : "Estimated from bill"}
              </p>
            </InputCard>

            <InputCard title="Gas" colour="blue">
              <p>Used in home: {usesGas ? "Yes" : "No"}</p>
              {usesGas && (
                <>
                  <p>
                    Average bill: {displayValue(answers.avg_gas_bill, "0")}
                  </p>
                  <p>Boiler age: {displayValue(answers.gas_boiler_age)}</p>
                </>
              )}
            </InputCard>

            <InputCard title="Oil" colour="black">
              <p>Used in home: {usesOil ? "Yes" : "No"}</p>
              {usesOil && (
                <>
                  <p>
                    Litres/year:{" "}
                    {displayValue(answers.oil_litres_per_year, "0")}
                  </p>
                  <p>Boiler age: {displayValue(answers.oil_boiler_age)}</p>
                </>
              )}
            </InputCard>
          </div>
        </section>

        {aiReport ? (
          <div className="mt-6 space-y-5">
            {aiReport.bottom_line && (
              <section className="report-section rounded-3xl border border-[#dbe8f2] bg-[#fff6bf] p-6 shadow-sm print:break-inside-avoid">
                <h2 className="text-2xl font-black text-black">
                  Bottom line
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-800">
                  {aiReport.bottom_line}
                </p>
              </section>
            )}

            {aiReport.executive_summary && (
              <TextSection title="Executive summary" accent="navy">
                <p>{aiReport.executive_summary}</p>
              </TextSection>
            )}

            {aiReport.estimated_annual_energy_cost_profile && (
              <TextSection
                title="Estimated annual energy cost profile"
                accent="yellow"
              >
                <p>{aiReport.estimated_annual_energy_cost_profile}</p>
              </TextSection>
            )}

            <UsageWarningSection warning={aiReport.unusual_usage_warning} />

            <TopPrioritiesSection items={aiReport.top_5_priorities} />

            <SolarPVSection solar={solarSuitability} />

            {aiReport.photo_summary && (
              <TextSection title="Photo notes" accent="blue">
                <p>{aiReport.photo_summary}</p>
              </TextSection>
            )}

            <ReportList
              title="Top likely energy drains"
              items={aiReport.top_energy_drains}
              accent="yellow"
            />

            <ReportList
              title="Top recommended actions"
              items={aiReport.top_recommended_actions}
              accent="blue"
            />

            <ActionPlanSection
              title="Priority action plan"
              description="These are the most useful actions to consider first, with indicative cost, saving, effort and payback guidance."
              actions={aiReport.priority_action_plan}
              accent="navy"
            />

            <ActionPlanSection
              title="Low-cost quick wins"
              description="Lower-cost actions that are usually easier to test before committing to larger upgrades."
              actions={aiReport.low_cost_quick_wins}
              accent="yellow"
            />

            <ActionPlanSection
              title="Medium-cost improvements"
              description="Moderate improvements that may need products, trades or more planning, but can still be practical."
              actions={aiReport.medium_cost_improvements}
              accent="blue"
            />

            <ActionPlanSection
              title="Higher-cost upgrades"
              description="Larger upgrades that may improve comfort and efficiency but should usually be checked with a qualified professional."
              actions={aiReport.higher_cost_upgrades}
              accent="black"
            />

            {hasDetailedReport ? (
              <>
                <div className="grid gap-5 lg:grid-cols-3">
                  <ReportList
                    title="Electricity-specific advice"
                    items={aiReport.electricity_specific_advice}
                    accent="yellow"
                  />

                  <ReportList
                    title="Gas-specific advice"
                    items={aiReport.gas_specific_advice}
                    accent="blue"
                  />

                  <ReportList
                    title="Oil-specific advice"
                    items={aiReport.oil_specific_advice}
                    accent="black"
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <ReportList
                    title="Appliance findings"
                    items={aiReport.appliance_findings}
                    accent="blue"
                  />

                  <ReportList
                    title="Behaviour changes"
                    items={aiReport.behaviour_changes}
                    accent="yellow"
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <ReportList
                    title="Questions to ask a contractor"
                    items={aiReport.contractor_questions}
                    accent="navy"
                  />

                  <ReportList
                    title="What to check next"
                    items={aiReport.what_to_check_next}
                    accent="blue"
                  />
                </div>

                <ReportList
                  title="Important assumptions"
                  items={aiReport.important_assumptions}
                  accent="black"
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
              </>
            )}
          </div>
        ) : (
          <section className="mt-6 rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm print:hidden">
            <h2 className="text-2xl font-black text-[#17356f]">
              Generate AI report
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Generate the customer-facing Save Your EGO report to add the AI
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
            This Save Your EGO report provides indicative home energy guidance
            only. It is not a substitute for a qualified energy assessment,
            electrician, retrofit designer, heating engineer, gas technician,
            oil heating specialist, structural professional, grant advisor or
            building compliance expert. Estimated costs, estimated savings and
            payback figures should be treated as broad guidance, not guarantees.
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

        <section className="mt-6 rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm print:hidden">
          <h2 className="text-xl font-black text-[#17356f]">
            Saved assessment data
          </h2>

          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-bold">
              Show raw saved answers
            </summary>

            <pre className="mt-4 overflow-auto rounded-2xl bg-slate-50 p-4 text-xs">
              {JSON.stringify(assessment.answers, null, 2)}
            </pre>
          </details>
        </section>
      </div>
    </main>
  );
}