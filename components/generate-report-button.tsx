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
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      if (!assessmentId) {
        setErrorMessage("Missing assessment ID. Please go back and start a new assessment.");
        return;
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => {
        controller.abort();
      }, 60000);

      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assessmentId }),
        signal: controller.signal,
      });

      window.clearTimeout(timeout);

      let result: { error?: string; reportId?: string; id?: string } = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        setErrorMessage("Something went wrong on our end. Try again in a moment.");
        return;
      }

      const reportId = result.reportId || result.id;

      if (reportId) {
        router.push(`/report/${reportId}`);
        return;
      }

      router.refresh();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setErrorMessage(
          "This is taking longer than expected. Try again in a moment.",
        );
        return;
      }

      setErrorMessage("Something went wrong on our end. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="text-xl font-semibold">Your personalised report</h2>

      <p className="mt-2 text-sm text-gray-600">
        We’ll use the answers you already gave us and build your plan.
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
        {loading ? "Looking at your answers now…" : "Get my report"}
      </button>
    </div>
  );
}