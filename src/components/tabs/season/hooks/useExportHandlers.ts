import { copyImageToClipboard, copyTextToClipboard } from "../../../../lib/clipboard";
import { domToDataUrl } from "modern-screenshot";
import { expandNodeForCapture } from "../../../../lib/dom-utils";
import { trackEvent } from "../../../../lib/analytics/trackEvent";

export const performImageCopy = async (
  ref: React.RefObject<HTMLDivElement>,
  setCopyingState: (state: any) => void,
  copyStateValue: any = true,
  chartName: string = "unknown"
) => {
  if (!ref.current) return;
  setCopyingState(copyStateValue);
  const restore = expandNodeForCapture(ref.current);
  try {
    const processCopy = async () => {
      const dataUrl = await domToDataUrl(ref.current!, {
        scale: 3,
        backgroundColor: '#ffffff',
        style: { overflow: "visible", textRendering: "optimizeLegibility" },
      });
      const response = await fetch(dataUrl);
      return await response.blob();
    };
    await copyImageToClipboard(processCopy(), "export.png");
    trackEvent("export", { type: "image_copy", item: chartName });
    setTimeout(() => setCopyingState(false), 2000);
  } catch (err) {
    console.warn("Error during copy fallback", err);
  } finally {
    restore();
  }
};

export const performImageDownload = async (
  ref: React.RefObject<HTMLDivElement>,
  filename: string,
  chartName: string = "unknown"
) => {
  if (!ref.current) return;
  const restore = expandNodeForCapture(ref.current);
  try {
    const dataUrl = await domToDataUrl(ref.current, {
      scale: 3,
      backgroundColor: '#ffffff',
      style: { overflow: "visible", textRendering: "optimizeLegibility" },
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
    trackEvent("export", { type: "image_download", item: chartName });
  } catch (err) {
    console.error("Error downloading chart:", err);
  } finally {
    restore();
  }
};

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
  trackEvent("export", { type: "text_copy", item: chartName });
  setTimeout(() => setCopyingState(false), 2000);
};
