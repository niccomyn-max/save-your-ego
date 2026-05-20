import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ReportPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ReportPage(props: ReportPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-6 py-10">
          <p>Loading report...</p>
        </main>
      }
    >
      <ReportContent {...props} />
    </Suspense>
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/dashboard" className="text-sm underline">
        Back to dashboard
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Save Your EGO Report</h1>

      <p className="mt-2 text-gray-600">
        Placeholder report for assessment completed on{" "}
        {new Date(assessment.created_at).toLocaleDateString()}.
      </p>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Assessment scores</h2>

        <pre className="mt-4 overflow-auto rounded bg-gray-50 p-4 text-sm">
          {JSON.stringify(assessment.scores, null, 2)}
        </pre>
      </section>

      <section className="mt-6 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Saved answers</h2>

        <pre className="mt-4 overflow-auto rounded bg-gray-50 p-4 text-sm">
          {JSON.stringify(assessment.answers, null, 2)}
        </pre>
      </section>

      <section className="mt-8 rounded-lg border p-6">
  <h2 className="text-xl font-semibold">Energy efficiency snapshot</h2>

  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
    {assessment.scores?.sectionAverages &&
      Object.entries(assessment.scores.sectionAverages).map(([section, score]) => (
        <div key={section} className="rounded-md bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {section}
          </p>
          <p className="mt-1 text-2xl font-bold">{String(score)}</p>
        </div>
      ))}
  </div>

  <div className="mt-5 rounded-md border p-4 text-sm text-gray-700">
    <p>
      <strong>Overall score:</strong>{" "}
      {assessment.scores?.averageScore ?? "N/A"}
    </p>
    <p>
      <strong>Questions answered:</strong>{" "}
      {assessment.scores?.answeredQuestions ?? "N/A"}
    </p>
  </div>
     </section>
     <section className="mt-6 rounded-lg border p-6">
      <h2 className="text-xl font-semibold">Initial recommendation</h2>
      <p className="mt-2 text-gray-600">
          Based on this first assessment, Save Your EGO will identify where the home
          may be using unnecessary Electricity, Gas or Oil and turn that into a clear
          action plan. The next version will generate this section with AI using the
          saved assessment data.
      </p>
     </section>
    </main>
  );
}