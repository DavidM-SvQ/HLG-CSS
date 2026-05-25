import React, { useState } from 'react';
import { useTableScreenshot } from '../../../../hooks/useTableScreenshot';

export function useDraftElectionsExports(draftTableRef: React.RefObject<HTMLDivElement | null>) {
  const { handleCopyImage: copyDraftTableImage, handleDownloadImage: downloadDraftTableImage, isCopying, isDownloading } = useTableScreenshot(draftTableRef);
  const [isDraftTableCopying, setIsDraftTableCopying] = useState<string | false>(false);
  
  const isDraftTableCopyingState = isCopying || isDownloading;

  const prepareTableForCopy = (container: HTMLElement, subset?: string) => {
    container.classList.add('copying-table-mode');
  };
  
  const resetTableAfterCopy = (container: HTMLElement, originalClass: string) => {
    container.classList.remove('copying-table-mode');
  };

  const handleCopyDraftTableImage = async (subset?: string) => {
    setIsDraftTableCopying(subset || 'full');
    const container = draftTableRef?.current;
    if (!container) return;
    const originalClass = container.className;
    try {
      await copyDraftTableImage({
        fileName: 'export.png',
        scale: 2,
        width: container.scrollWidth,
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
      scale: 2,
      width: container.scrollWidth,
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