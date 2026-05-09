import { useState } from "react";
import { copyImageToClipboard, copyTextToClipboard } from "../clipboard";
import { domToBlob, domToDataUrl } from "modern-screenshot";
import { expandNodeForCapture } from "../dom-utils";

export const useExportSeasonCharts = (refs: Record<string, React.RefObject<HTMLDivElement | null>>) => {
  // We'll return the export states and the handle functions
  // To keep it simple, we define generic functions
  // This will require modifying SeasonView.tsx to provide generic generic handle functions or just porting everything over exactly.
};
