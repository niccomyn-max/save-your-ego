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
    <button
      type="button"
      onClick={handlePrint}
      disabled={isPreparing}
      className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white transition disabled:cursor-wait disabled:opacity-70 print:hidden"
    >
      {isPreparing ? "Preparing PDF..." : "Download / Save PDF report"}
    </button>
  );
}
