import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

type Assessment = {
  id: string;
  answers: Record<string, any> | null;
  scores: Record<string, any> | null;
  created_at: string;
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7fbff] px-5 py-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-semibold text-slate-600">
              Loading dashboard...
            </p>
          </div>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Unknown date";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function displayValue(value: unknown, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function getSavingPotential(assessment: Assessment) {
  const scores = assessment.scores ?? {};
  const heatLossRisk = String(scores.heatLossRisk ?? "").toLowerCase();
  const runningCostRisk = String(scores.runningCostRisk ?? "").toLowerCase();
  const improvementPotential = String(
    scores.efficiencyImprovementPotential ?? ""
  ).toLowerCase();

  if (
    heatLossRisk.includes("high") ||
    runningCostRisk.includes("high") ||
    improvementPotential.includes("high")
  ) {
    return {
      label: "High saving potential",
      className: "bg-[#ffd600] text-black border-[#ffd600]",
    };
  }

  if (
    heatLossRisk.includes("medium") ||
    runningCostRisk.includes("medium") ||
    improvementPotential.includes("medium")
  ) {
    return {
      label: "Medium saving potential",
      className: "bg-[#e9f6fe] text-[#17356f] border-[#59b9ec]",
    };
  }

  return {
    label: "Review available",
    className: "bg-white text-[#17356f] border-[#dbe8f2]",
  };
}

function getFuelCoverage(answers: Record<string, any> | null) {
  const fuel = ["Electricity"];

  if (answers?.uses_gas) {
    fuel.push("Gas");
  }

  if (answers?.uses_oil) {
    fuel.push("Oil");
  }

  return fuel.join(", ");
}

function DashboardStat({
  label,
  value,
  colour = "white",
}: {
  label: string;
  value: string | number;
  colour?: "white" | "yellow" | "blue" | "navy";
}) {
  const className =
    colour === "yellow"
      ? "border-[#ffe76a] bg-[#fff6bf] text-black"
      : colour === "blue"
        ? "border-[#bde8ff] bg-[#e9f6fe] text-[#17356f]"
        : colour === "navy"
          ? "border-[#17356f] bg-[#17356f] text-white"
          : "border-[#dbe8f2] bg-white text-[#17356f]";

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${className}`}>
      <p className="text-xs font-black uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black leading-tight">{value}</p>
    </div>
  );
}

function AssessmentCard({ assessment }: { assessment: Assessment }) {
  const answers = assessment.answers ?? {};
  const scores = assessment.scores ?? {};
  const savingPotential = getSavingPotential(assessment);

  const propertyType = displayValue(answers.property_type, "Home");
  const bedrooms = displayValue(answers.bedrooms, "N/A");
  const mainHeating = displayValue(answers.main_heating_system, "Not provided");
  const fuelCoverage = getFuelCoverage(answers);

  const heatLossArea = displayValue(scores.biggestLossArea, "Not calculated");
  const fabricBand = displayValue(scores.fabricBand, "Not calculated");
  const electricityKwh = Math.round(Number(scores.estimatedBillKwh ?? 0));
  const applianceKwh = Math.round(Number(scores.applianceKwh ?? 0));

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-[#dbe8f2] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#17356f]/10">
      <div className="border-b border-[#dbe8f2] bg-gradient-to-br from-white via-[#f7fbff] to-[#e9f6fe] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-black ${savingPotential.className}`}
              >
                {savingPotential.label}
              </span>

              <span className="rounded-full border border-[#dbe8f2] bg-white px-3 py-1 text-xs font-black text-slate-600">
                Complete
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight text-[#17356f]">
              {propertyType} assessment
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Completed on {formatDate(assessment.created_at)}
            </p>
          </div>

          <Link
            href={`/report/${assessment.id}`}
            className="inline-flex items-center justify-center rounded-full bg-[#17356f] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-black"
          >
            View report
          </Link>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
        <div className="rounded-2xl bg-[#fff6bf] p-4">
          <p className="text-xs font-black uppercase tracking-wide text-[#6b5200]">
            Electricity
          </p>
          <p className="mt-2 text-xl font-black text-black">
            {electricityKwh > 0 ? `${electricityKwh} kWh` : "Not estimated"}
          </p>
        </div>

        <div className="rounded-2xl bg-[#e9f6fe] p-4">
          <p className="text-xs font-black uppercase tracking-wide text-[#17356f]/70">
            Appliances
          </p>
          <p className="mt-2 text-xl font-black text-[#17356f]">
            {applianceKwh > 0 ? `${applianceKwh} kWh` : "0 kWh"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Main heat-loss area
          </p>
          <p className="mt-2 text-xl font-black text-black">{heatLossArea}</p>
        </div>

        <div className="rounded-2xl bg-[#17356f] p-4 text-white">
          <p className="text-xs font-black uppercase tracking-wide text-white/60">
            Fabric profile
          </p>
          <p className="mt-2 text-xl font-black">{fabricBand}</p>
        </div>
      </div>

      <div className="grid gap-3 border-t border-[#dbe8f2] bg-[#fbfdff] p-5 text-sm sm:grid-cols-3 sm:p-6">
        <div>
          <p className="font-black text-slate-400">Bedrooms</p>
          <p className="mt-1 font-bold text-[#17356f]">{bedrooms}</p>
        </div>

        <div>
          <p className="font-black text-slate-400">Main heating</p>
          <p className="mt-1 font-bold text-[#17356f]">{mainHeating}</p>
        </div>

        <div>
          <p className="font-black text-slate-400">Fuel coverage</p>
          <p className="mt-1 font-bold text-[#17356f]">{fuelCoverage}</p>
        </div>
      </div>
    </article>
  );
}

async function DashboardContent() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: assessments, error } = await supabase
    .from("assessments")
    .select("id, answers, scores, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading assessments:", error);
  }

  const assessmentList = (assessments ?? []) as Assessment[];
  const latestAssessment = assessmentList[0];

  const highPotentialCount = assessmentList.filter((assessment) =>
    getSavingPotential(assessment).label.includes("High")
  ).length;

  return (
    <main className="min-h-screen bg-[#f7fbff] px-5 py-6 text-[#050505] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-[#dbe8f2] bg-white shadow-xl shadow-[#17356f]/10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <Image
                src="/save-your-ego-logo.png"
                alt="Save Your EGO"
                width={280}
                height={110}
                priority
                className="h-auto w-60"
              />

              <div className="mt-7 inline-flex rounded-full bg-[#17356f] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
                Customer dashboard
              </div>

              <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-black sm:text-5xl">
                Your home energy reports
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                View saved Save Your EGO assessments, open customer reports and
                generate a new Electricity, Gas and Oil review.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/assessment"
                  className="inline-flex items-center justify-center rounded-full bg-[#ffd600] px-6 py-4 text-sm font-black text-black shadow-sm transition hover:bg-[#ffec64]"
                >
                  Start new assessment
                </Link>

                {latestAssessment && (
                  <Link
                    href={`/report/${latestAssessment.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-[#dbe8f2] bg-white px-6 py-4 text-sm font-black text-[#17356f] shadow-sm transition hover:bg-[#e9f6fe]"
                  >
                    Open latest report
                  </Link>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#17356f] via-[#0d4f78] to-black p-6 text-white sm:p-8 lg:p-10">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#ffd600]">
                Dashboard snapshot
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-[1.5rem] bg-white/10 p-5 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-wide text-white/60">
                    Saved assessments
                  </p>
                  <p className="mt-2 text-5xl font-black">
                    {assessmentList.length}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[1.5rem] bg-[#ffd600] p-5 text-black">
                    <p className="text-xs font-black uppercase opacity-70">
                      High potential
                    </p>
                    <p className="mt-2 text-3xl font-black">
                      {highPotentialCount}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] bg-[#59b9ec] p-5 text-[#17356f]">
                    <p className="text-xs font-black uppercase opacity-70">
                      Latest
                    </p>
                    <p className="mt-2 text-lg font-black">
                      {latestAssessment
                        ? formatDate(latestAssessment.created_at)
                        : "None yet"}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-white p-5 text-black">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    App coverage
                  </p>
                  <p className="mt-2 text-xl font-black">
                    Electricity. Gas. Oil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {assessmentList.length > 0 && (
          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <DashboardStat
              label="Total reports"
              value={assessmentList.length}
              colour="white"
            />

            <DashboardStat
              label="High saving potential"
              value={highPotentialCount}
              colour="yellow"
            />

            <DashboardStat
              label="Latest assessment"
              value={
                latestAssessment
                  ? formatDate(latestAssessment.created_at)
                  : "None yet"
              }
              colour="blue"
            />
          </section>
        )}

        {!assessmentList || assessmentList.length === 0 ? (
          <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-[#dbe8f2] bg-white shadow-sm">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-gradient-to-br from-[#fff6bf] to-[#e9f6fe] p-6 sm:p-8">
                <h2 className="text-3xl font-black tracking-tight text-[#17356f]">
                  No assessments yet
                </h2>

                <p className="mt-3 text-base leading-7 text-slate-700">
                  Start your first Save Your EGO assessment and create a clear,
                  customer-friendly energy report covering Electricity, Gas and
                  Oil.
                </p>

                <Link
                  href="/assessment"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-[#17356f] px-6 py-4 text-sm font-black text-white shadow-sm transition hover:bg-black"
                >
                  Start first assessment
                </Link>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-black text-black">
                  What the report will include
                </h3>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-4">
                    <p className="font-black text-[#17356f]">
                      Energy snapshot
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      A clear summary of heat loss, electricity use and likely
                      improvement potential.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-4">
                    <p className="font-black text-[#17356f]">
                      AI-assisted recommendations
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Practical actions, quick wins and bigger upgrade ideas.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-4">
                    <p className="font-black text-[#17356f]">
                      Browser PDF export
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      A polished report customers can save, print or share.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-8">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Saved reports
                </p>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-[#17356f]">
                  Assessment history
                </h2>
              </div>

              <p className="text-sm font-semibold text-slate-500">
                Most recent first
              </p>
            </div>

            <div className="grid gap-5">
              {assessmentList.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}