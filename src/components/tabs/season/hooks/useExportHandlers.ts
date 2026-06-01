import React from 'react';
import { copyTextToClipboard } from "../../../../lib/clipboard";
import { trackEvent } from "../../../../lib/analytics/trackEvent";

export const performTextCopy = async (
  ref: React.RefObject<HTMLDivElement>, 
  setCopyingState: (val: boolean) => void,
  chartName: string = "unknown"
) => {
  if (!ref.current || !setCopyingState) return;
  setCopyingState(true);
  const table = ref.current.querySelector("table");
  if (!table) {
    setCopyingState(false);
    return;
  }
  const rows = Array.from(table.rows);
  const text = rows
    .map((row: any) =>
      Array.from(row.cells)
        .map((cell: any) => cell.innerText.trim())
        .join("\t")
    )
    .join("\n");
  await copyTextToClipboard(text, "export.txt");
  setTimeout(() => setCopyingState(false), 2000);
};
