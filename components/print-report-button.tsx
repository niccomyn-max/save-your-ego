"use client";

export function PrintReportButton() {
  function handlePrint() {
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white print:hidden"
    >
      Download / Save PDF report
    </button>
  );
}