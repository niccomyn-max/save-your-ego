"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateReportButton({
  assessmentId,
}: {
  assessmentId: string;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleGenerateReport() {
    setLoading(true);
    setErrorMessage("");

    const response = await fetch("/api/generate-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ assessmentId }),
    });

    const result = await response.json();

    if (!response.ok) {
      setLoading(false);
      setErrorMessage(result.error || "Failed to generate report.");
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="text-xl font-semibold">AI energy report</h2>

      <p className="mt-2 text-sm text-gray-600">
        Generate a personalised Save Your EGO report using the saved home
        details, bills, fabric inputs, appliance estimates and rule-based
        analysis.
      </p>

      {errorMessage && (
        <p className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={handleGenerateReport}
        className="mt-4 rounded-md bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Generating report..." : "Generate AI report"}
      </button>
    </div>
  );
}