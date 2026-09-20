"use client";

export function StartNewAssessmentButton({
  children = "Start new assessment",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  function startFreshAssessment() {
    const freshId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    window.location.assign(`/assessment?new=${freshId}`);
  }

  return (
    <button
      type="button"
      onClick={startFreshAssessment}
      className={className}
    >
      {children}
    </button>
  );
}
