"use client";

export function PrintReportButton() {
  function handlePrint() {
    const originalTitle = document.title;

    document.title = "Save Your EGO Home Energy Report";

    const restoreTitle = () => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };

    window.addEventListener("afterprint", restoreTitle);
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