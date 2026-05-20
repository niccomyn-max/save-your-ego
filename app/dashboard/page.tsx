import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-4xl px-6 py-10">
          <p>Loading dashboard...</p>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
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

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <Image
            src="/save-your-ego-logo.png"
            alt="Save Your EGO"
            width={260}
            height={100}
            priority
          />

          <p className="mt-3 text-sm text-gray-600">
            View your saved home energy assessments and reports.
          </p>
        </div>

        <Link
          href="/assessment"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Start assessment
        </Link>
      </div>

      {!assessments || assessments.length === 0 ? (
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">No assessments yet</h2>
          <p className="mt-2 text-gray-600">
            Start your first Save Your EGO assessment.
          </p>

          <Link
            href="/assessment"
            className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Start assessment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="rounded-lg border p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold">Assessment</h2>
                  <p className="text-sm text-gray-600">
                    Completed on{" "}
                    {new Date(assessment.created_at).toLocaleDateString()}
                  </p>
                </div>

                <Link
                  href={`/report/${assessment.id}`}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  View report
                </Link>
              </div>

              {assessment.scores?.sectionAverages && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {Object.entries(assessment.scores.sectionAverages).map(
                    ([section, score]) => (
                      <div key={section} className="rounded-md bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {section}
                        </p>
                        <p className="mt-1 text-2xl font-bold">
                          {String(score)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="mt-4 rounded-md border p-3 text-sm text-gray-700">
                <p>
                  <strong>Overall score:</strong>{" "}
                  {assessment.scores?.averageScore ?? "N/A"}
                </p>
                <p>
                  <strong>Questions answered:</strong>{" "}
                  {assessment.scores?.answeredQuestions ?? "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}