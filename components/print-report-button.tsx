"use client";

import { useState } from "react";

export function PrintReportButton() {
  const [isPreparing, setIsPreparing] = useState(false);

  function handlePrint() {
    if (isPreparing) return;

    setIsPreparing(true);

    // Let the click interaction complete and paint the feedback state before
    // opening the browser's synchronous print dialog.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(() => {
          const originalTitle = document.title;

          document.title = "Save Your EGO Home Energy Report";

          try {
            window.print();
          } finally {
            document.title = originalTitle;
            setIsPreparing(false);
          }
        }, 0);
      });
    });
  }

  return (
    <div className="flex max-w-sm flex-col items-end gap-2 print:hidden">
      <button
        type="button"
        onClick={handlePrint}
        disabled={isPreparing}
        className="rounded-xl bg-[#0B3274] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#17478D] disabled:cursor-wait disabled:opacity-70"
      >
        {isPreparing ? "Preparing print view..." : "Print / Save as PDF"}
      </button>
      <p className="ri-print-dialog-note text-right text-[11px] leading-4 text-slate-500">
        For a clean PDF, switch off <strong>Headers and footers</strong> in the
        print dialog. Enable <strong>Background graphics</strong> for the full design.
      </p>
    </div>
  );
}
