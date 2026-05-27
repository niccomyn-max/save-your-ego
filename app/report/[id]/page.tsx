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

type AiReport = {
  photo_summary?: string;
  top_energy_drains?: string[];
  top_recommended_actions?: string[];
  quick_wins?: string[];
  bigger_upgrades?: string[];
  extra_insights?: string[];
  bottom_line?: string;
};

export default function ReportPage(props: ReportPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-6 py-10">
          <p>Loading report...</p>
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

function ReportList({
  title,
  items,
  accent = "blue",
}: {
  title: string;
  items?: string[];
  accent?: "yellow" | "blue" | "black";
}) {
  if (!items || items.length === 0) {
    return null;
  }

  const accentClass =
    accent === "yellow"
      ? "border-l-[#ffd600]"
      : accent === "black"
        ? "border-l-black"
        : "border-l-[#59b9ec]";

  return (
    <section
      className={`report-section rounded-3xl border border-[#dbe8f2] bg-white p-6 shadow-sm ${accentClass} border-l-8`}
    >
      <h2 className="text-xl font-black text-[#17356f]">{title}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
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
  colour?: "yellow" | "blue" | "navy" | "black";
}) {
  const colourClass =
    colour === "yellow"
      ? "bg-[#fff6bf] text-[#6b5200]"
      : colour === "blue"
        ? "bg-[#e9f6fe] text-[#17356f]"
        : colour === "black"
          ? "bg-slate-100 text-black"
          : "bg-[#17356f] text-white";

  return (
    <div className={`rounded-2xl p-4 ${colourClass}`}>
      <p className="text-xs font-black uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
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

  const answers = assessment.answers ?? {};
  const scores = assessment.scores ?? {};

  const usesGas = Boolean(answers.uses_gas);
  const usesOil = Boolean(answers.uses_oil);

  return (
    <main className="report-page min-h-screen bg-[#f7fbff] px-5 py-6 sm:px-8 lg:px-10">
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

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-[#ffd600]/50 bg-[#fff6bf] px-4 py-2 text-sm font-black text-[#6b5200]">
                  Electricity
                </span>
                <span className="rounded-full border border-[#59b9ec]/50 bg-[#e9f6fe] px-4 py-2 text-sm font-black text-[#17356f]">
                  Gas
                </span>
                <span className="rounded-full border border-black/10 bg-slate-100 px-4 py-2 text-sm font-black text-black">
                  Oil
                </span>
              </div>

              <h1 className="mt-8 max-w-3xl text-4xl font-black tracking-tight text-[#050505] sm:text-5xl">
                Home Energy Report
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                A practical Save Your EGO assessment covering household energy
                use, likely waste areas, appliance insights and improvement
                priorities.
              </p>

              <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f7fbff] p-4">
                  <p className="font-bold text-slate-500">Assessment date</p>
                  <p className="mt-1 font-black text-[#17356f]">
                    {new Date(assessment.created_at).toLocaleDateString()}
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
                <div className="rounded-3xl bg-white/12 p-5 backdrop-blur">
                  <p className="text-xs font-bold uppercase text-white/60">
                    Main heat-loss area
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {scores.biggestLossArea ?? "Unknown"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-[#ffd600] p-5 text-black">
                    <p className="text-xs font-black uppercase opacity-70">
                      Fabric
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      {scores.fabricBand ?? "Unknown"}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-[#59b9ec] p-5 text-[#17356f]">
                    <p className="text-xs font-black uppercase opacity-70">
                      Appliances
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      {Math.round(scores.applianceKwh ?? 0)} kWh
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
              value={`${Math.round(scores.estimatedBillKwh ?? 0)} kWh`}
              colour="yellow"
            />

            <MetricCard
              label="Appliance use"
              value={`${Math.round(scores.applianceKwh ?? 0)} kWh`}
              colour="blue"
            />

            <MetricCard
              label="Heat-loss area"
              value={String(scores.biggestLossArea ?? "Unknown")}
              colour="navy"
            />

            <MetricCard
              label="Fabric profile"
              value={String(scores.fabricBand ?? "Unknown")}
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
            <div className="rounded-2xl border-l-8 border-l-[#ffd600] bg-[#fffdf0] p-4">
              <h3 className="font-black text-black">Electricity</h3>
              <p className="mt-2 text-sm text-slate-700">
                Average bill: {answers.avg_electricity_bill ?? 0}
              </p>
              <p className="text-sm text-slate-700">
                Unit rate: {answers.unit_rate ?? "Unknown"}
              </p>
              <p className="text-sm text-slate-700">
                Annual spend:{" "}
                {answers.annual_bill_override
                  ? answers.annual_bill_override
                  : "Estimated from bill"}
              </p>
            </div>

            <div className="rounded-2xl border-l-8 border-l-[#59b9ec] bg-[#f1faff] p-4">
              <h3 className="font-black text-[#17356f]">Gas</h3>
              <p className="mt-2 text-sm text-slate-700">
                Used in home: {usesGas ? "Yes" : "No"}
              </p>
              {usesGas && (
                <>
                  <p className="text-sm text-slate-700">
                    Average bill: {answers.avg_gas_bill ?? 0}
                  </p>
                  <p className="text-sm text-slate-700">
                    Boiler age: {answers.gas_boiler_age ?? "Unknown"}
                  </p>
                </>
              )}
            </div>

            <div className="rounded-2xl border-l-8 border-l-black bg-slate-50 p-4">
              <h3 className="font-black text-black">Oil</h3>
              <p className="mt-2 text-sm text-slate-700">
                Used in home: {usesOil ? "Yes" : "No"}
              </p>
              {usesOil && (
                <>
                  <p className="text-sm text-slate-700">
                    Litres/year: {answers.oil_litres_per_year ?? 0}
                  </p>
                  <p className="text-sm text-slate-700">
                    Boiler age: {answers.oil_boiler_age ?? "Unknown"}
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {aiReport ? (
          <div className="mt-6 space-y-5">
            <section className="report-section rounded-3xl border border-[#dbe8f2] bg-[#fff6bf] p-6 shadow-sm">
              <h2 className="text-2xl font-black text-black">Bottom line</h2>
              <p className="mt-3 text-base leading-7 text-slate-800">
                {aiReport.bottom_line}
              </p>
            </section>

            {aiReport.photo_summary && (
              <section className="report-section rounded-3xl border border-[#dbe8f2] bg-[#e9f6fe] p-6 shadow-sm">
                <h2 className="text-2xl font-black text-[#17356f]">
                  Photo notes
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-800">
                  {aiReport.photo_summary}
                </p>
              </section>
            )}

            <ReportList
              title="Top 3 likely energy drains"
              items={aiReport.top_energy_drains}
              accent="yellow"
            />

            <ReportList
              title="Top 3 recommended actions"
              items={aiReport.top_recommended_actions}
              accent="blue"
            />

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
          </div>
        ) : (
          <div className="mt-6">
            <GenerateReportButton assessmentId={assessment.id} />
          </div>
        )}

        <section className="report-disclaimer mt-6 rounded-3xl border border-[#dbe8f2] bg-white p-6 text-sm leading-6 text-slate-600 shadow-sm">
          <h2 className="font-black text-[#17356f]">Important note</h2>
          <p className="mt-2">
            This Save Your EGO report provides indicative home energy guidance
            only. It is not a substitute for a qualified energy assessment,
            electrician, retrofit designer, heating engineer, gas technician,
            oil heating specialist, structural professional, grant advisor or
            building compliance expert. Estimated savings and payback figures
            should be treated as guidance, not guarantees.
          </p>
        </section>

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