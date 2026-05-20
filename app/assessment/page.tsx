"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  calculateScores,
  saveYourEgoQuestions,
} from "@/lib/assessment/questions";

export default function AssessmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function setAnswer(questionId: string, value: number) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  }

  async function handleSubmit() {
    setSaving(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      setErrorMessage("You need to be signed in to save an assessment.");
      return;
    }

    const scores = calculateScores(answers);

    const { error } = await supabase.from("assessments").insert({
      user_id: user.id,
      answers,
      scores,
    });

    if (error) {
      setSaving(false);
      setErrorMessage(error.message);
      return;
    }

    router.push("/dashboard");
  }

  const allAnswered = saveYourEgoQuestions.every(
    (question) => typeof answers[question.id] === "number"
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold">Save Your EGO Assessment</h1>
      <p className="mt-2 text-gray-600">
        Answer these questions to build a first-pass picture of your home’s
        Electricity, Gas and Oil efficiency opportunities.
      </p>

      <div className="mt-8 space-y-6">
        {saveYourEgoQuestions.map((question, index) => (
          <div key={question.id} className="rounded-lg border p-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {question.section}
            </div>

            <h2 className="font-semibold">
              {index + 1}. {question.text}
            </h2>

            {question.helpText && (
              <p className="mt-2 text-sm text-gray-600">{question.helpText}</p>
            )}

            <div className="mt-4 grid gap-2">
              {question.options.map((option) => (
                <label
                  key={option.label}
                  className="flex cursor-pointer items-center gap-3 rounded-md border p-3"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={answers[question.id] === option.value}
                    onChange={() => setAnswer(question.id, option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {errorMessage && (
        <p className="mt-6 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        disabled={!allAnswered || saving}
        onClick={handleSubmit}
        className="mt-8 rounded-md bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save assessment"}
      </button>
    </main>
  );
}