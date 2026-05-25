import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { GenerateReportButton } from "@/components/generate-report-button";
import { PrintReportButton } from "@/components/print-report-button";

type ReportPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type AiReport = {
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
        <main className="mx-auto max-w-4xl px-6 py-10">
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
}: {
  title: string;
  items?: string[];
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border bg-white p-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
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

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between gap-4 print:hidden">
  <Link href="/dashboard" className="text-sm underline">
    Back to dashboard
  </Link>

  <PrintReportButton />
</div>

      <div className="mt-6">
        <Image
          src="/save-your-ego-logo.png"
          alt="Save Your EGO"
          width={280}
          height={110}
          priority
        />
      </div>

      <h1 className="mt-6 text-3xl font-bold">Home energy report</h1>

      <p className="mt-2 text-gray-600">
        Assessment completed on{" "}
        {new Date(assessment.created_at).toLocaleDateString()}.
      </p>

      <section className="mt-8 rounded-lg border bg-white p-6">
        <h2 className="text-xl font-semibold">Energy snapshot</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Bill-based annual use
            </p>
            <p className="mt-1 text-2xl font-bold">
              {Math.round(assessment.scores?.estimatedBillKwh ?? 0)} kWh
            </p>
          </div>

          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Appliance estimate
            </p>
            <p className="mt-1 text-2xl font-bold">
              {Math.round(assessment.scores?.applianceKwh ?? 0)} kWh
            </p>
          </div>

          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Main heat-loss area
            </p>
            <p className="mt-1 text-2xl font-bold">
              {assessment.scores?.biggestLossArea ?? "Unknown"}
            </p>
          </div>

          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Fabric profile
            </p>
            <p className="mt-1 text-2xl font-bold">
              {assessment.scores?.fabricBand ?? "Unknown"}
            </p>
          </div>
        </div>

        {assessment.scores?.quickScores && (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {Object.entries(assessment.scores.quickScores).map(
              ([label, score]) => (
                <div key={label} className="rounded-md border p-3">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-1 text-2xl font-bold">{String(score)}</p>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-lg border bg-white p-6">
        <h2 className="text-xl font-semibold">Rule-based findings</h2>

        {assessment.scores?.recommendations?.length ? (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
            {assessment.scores.recommendations.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            No rule-based findings available for this assessment.
          </p>
        )}
      </section>

      <div className="mt-6">
        <GenerateReportButton assessmentId={assessment.id} />
      </div>

      {aiReport && (
        <div className="mt-6 space-y-5">
          <section className="rounded-lg border bg-green-50 p-5">
            <h2 className="text-xl font-semibold">Bottom line</h2>
            <p className="mt-2 text-gray-800">{aiReport.bottom_line}</p>
          </section>

          <ReportList
            title="Top 3 likely energy drains"
            items={aiReport.top_energy_drains}
          />

          <ReportList
            title="Top 3 recommended actions"
            items={aiReport.top_recommended_actions}
          />

          <ReportList title="Quick wins" items={aiReport.quick_wins} />

          <ReportList
            title="Bigger upgrades"
            items={aiReport.bigger_upgrades}
          />

          <ReportList
            title="Extra insights"
            items={aiReport.extra_insights}
          />
        </div>
      )}

      <section className="mt-6 rounded-lg border bg-white p-6">
        <h2 className="text-xl font-semibold">Saved assessment data</h2>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium">
            Show raw saved answers
          </summary>

          <pre className="mt-4 overflow-auto rounded bg-gray-50 p-4 text-xs">
            {JSON.stringify(assessment.answers, null, 2)}
          </pre>
        </details>
      </section>
    </main>
  );
}