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
      className="inline-flex items-center justify-center rounded-full bg-[#17356f] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-black print:hidden"
    >
      Save / Print PDF
    </button>
  );
}