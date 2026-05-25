import React, { useState } from 'react';
import { useTableScreenshot } from '../../../../hooks/useTableScreenshot';

export function useDraftElectionsExports(draftTableRef: React.RefObject<HTMLDivElement | null>) {
  const { handleCopyImage: copyDraftTableImage, handleDownloadImage: downloadDraftTableImage, isCopying: isDraftTableCopyingState } = useTableScreenshot(draftTableRef);
  const [isDraftTableCopying, setIsDraftTableCopying] = useState<string | false>(false);

  const prepareTableForCopy = (container: HTMLElement, subset?: string) => {
    const rows = container.querySelectorAll('.draft-row');
    if (subset) {
      const start = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'].indexOf(subset) * 50;
      const end = start + 50;
      rows.forEach((row, idx) => {
        if (idx + 1 <= start || idx + 1 > end) row.classList.add('hidden');
      });
    }
    container.className = 'bg-white border border-neutral-200 rounded-xl overflow-visible shadow-sm inline-block w-auto min-w-full';
  };
  
  const resetTableAfterCopy = (container: HTMLElement, originalClass: string) => {
    container.className = originalClass;
    container.querySelectorAll('.draft-row').forEach((row) => row.classList.remove('hidden'));
  };

  const handleCopyDraftTableImage = async (subset?: string) => {
    setIsDraftTableCopying(subset || 'full');
    const container = draftTableRef?.current;
    if (!container) return;
    const originalClass = container.className;
    try {
      await copyDraftTableImage({
        fileName: 'export.png',
        scale: 3,
        style: { overflow: 'visible' },
        onBeforeCapture: (el) => prepareTableForCopy(el, subset),
        onAfterCapture: (el) => resetTableAfterCopy(el, originalClass),
      });
    } finally {
      setIsDraftTableCopying(false);
    }
  };
  
  const handleDownloadDraftTableImage = async (subset?: string) => {
    const container = draftTableRef?.current;
    if (!container) return;
    const originalClass = container.className;
    await downloadDraftTableImage({
      fileName: `draft-elecciones${subset ? `-${subset}` : ''}.png`,
      scale: 3,
      style: { overflow: 'visible' },
      onBeforeCapture: (el) => prepareTableForCopy(el, subset),
      onAfterCapture: (el) => resetTableAfterCopy(el, originalClass),
    });
  };

  return {
    isDraftTableCopyingState,
    isDraftTableCopying, setIsDraftTableCopying,
    handleCopyDraftTableImage,
    handleDownloadDraftTableImage
  };
}