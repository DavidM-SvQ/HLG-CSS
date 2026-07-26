import React, { useState, useRef } from 'react';
import { domToDataUrl } from 'modern-screenshot';
import { copyImageToClipboard, copyTextToClipboard } from '../lib/clipboard';
import { expandNodeForCapture } from '../lib/dom-utils';

export interface ScreenshotOptions {
  fileName?: string;
  scale?: number;
  onBeforeCapture?: (el: HTMLElement) => void;
  onAfterCapture?: (el: HTMLElement) => void;
  style?: React.CSSProperties | any;
  width?: number;
  filter?: (node: any) => boolean;
  backgroundColor?: string;
}

const stripSvgForExport = (container: HTMLElement) => {
  const svgs = Array.from(container.querySelectorAll('svg'));
  const originalSvgStyles: any[] = [];
  
  svgs.forEach(svg => {
    const elements = Array.from(svg.querySelectorAll('*'));
    elements.forEach(el => {
      const htmlEl = el as HTMLElement;
      originalSvgStyles.push({
        node: htmlEl,
        clipPath: htmlEl.style.clipPath,
        mask: htmlEl.style.mask,
        clipPathAttr: htmlEl.getAttribute('clip-path'),
        maskAttr: htmlEl.getAttribute('mask'),
        strokeDasharray: htmlEl.style.strokeDasharray,
        strokeDashoffset: htmlEl.style.strokeDashoffset,
      });
      htmlEl.style.setProperty('clip-path', 'none', 'important');
      htmlEl.style.setProperty('mask', 'none', 'important');
      htmlEl.style.setProperty('stroke-dasharray', 'none', 'important');
      htmlEl.style.setProperty('stroke-dashoffset', '0', 'important');
      htmlEl.removeAttribute('clip-path');
      htmlEl.removeAttribute('mask');
    });
  });
  
  return () => {
    originalSvgStyles.forEach((styleObj) => {
      styleObj.node.style.clipPath = styleObj.clipPath;
      styleObj.node.style.mask = styleObj.mask;
      styleObj.node.style.strokeDasharray = styleObj.strokeDasharray;
      styleObj.node.style.strokeDashoffset = styleObj.strokeDashoffset;
      if (styleObj.clipPathAttr) styleObj.node.setAttribute('clip-path', styleObj.clipPathAttr);
      if (styleObj.maskAttr) styleObj.node.setAttribute('mask', styleObj.maskAttr);
    });
  };
};

export function useTableScreenshot<T extends HTMLElement>(externalRef?: React.RefObject<T>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTextCopying, setIsTextCopying] = useState(false);
  
  const internalRef = useRef<T>(null);
  const ref = externalRef || internalRef;

  const handleCopyImage = async (options: ScreenshotOptions = {}) => {
    const { fileName = 'export.png', scale = 3, onBeforeCapture, onAfterCapture, style, width, filter, backgroundColor = '#ffffff' } = options;
    if (!ref.current || isCopying) return;
    setIsCopying(true);
    
    const tableContainer = ref.current;
    if (onBeforeCapture) onBeforeCapture(tableContainer);
    
    // Expand node and add .is-exporting early so React effects can trigger during the wait
    const restore = expandNodeForCapture(tableContainer);
    
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // We measure scrollWidth after expanding
    const computedWidth = width || tableContainer.scrollWidth;
    let restoreSvg = () => {};
    
    try {
      restoreSvg = stripSvgForExport(tableContainer);
      const processCopy = async () => {
        const dataUrl = await domToDataUrl(tableContainer, {
          scale,
          backgroundColor,
          style: { overflow: "visible", ...style },
          width: computedWidth,
          filter
        });
        return await (await fetch(dataUrl)).blob();
      };
      
      await copyImageToClipboard(processCopy(), fileName);
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      setIsCopying(false);
      try {
        const dataUrl = await domToDataUrl(tableContainer, {
          scale,
          backgroundColor,
          style: { overflow: "visible", ...style },
          width: computedWidth,
          filter
        });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        link.click();
      } catch (fallbackErr) {
        console.error("Fallback export failed", fallbackErr);
      }
    } finally {
      restoreSvg();
      restore();
      if (onAfterCapture) onAfterCapture(tableContainer);
    }
  };

  const handleDownloadImage = async (options: ScreenshotOptions = {}) => {
    const { fileName = 'export.png', scale = 3, onBeforeCapture, onAfterCapture, style, width, filter, backgroundColor = '#ffffff' } = options;
    if (!ref.current || isDownloading) return;
    setIsDownloading(true);
    
    const tableContainer = ref.current;
    if (onBeforeCapture) onBeforeCapture(tableContainer);
    const restore = expandNodeForCapture(tableContainer);
    
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const computedWidth = width || tableContainer.scrollWidth;
    let restoreSvg = () => {};
    
    try {
      restoreSvg = stripSvgForExport(tableContainer);
      const dataUrl = await domToDataUrl(tableContainer, {
        scale,
        backgroundColor,
        style: { overflow: "visible", ...style },
        width: computedWidth,
        filter
      });
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => setIsDownloading(false), 2000);
    } catch (err) {
      console.error(err);
      setIsDownloading(false);
    } finally {
      restoreSvg();
      restore();
      if (onAfterCapture) onAfterCapture(tableContainer);
    }
  };

  const handleCopyText = async () => {
    if (!ref.current) return;
    setIsTextCopying(true);
    
    try {
      const table = ref.current.querySelector("table");
      if (!table) return;
      
      const ths = Array.from(table.querySelectorAll("th")).map((th) => (th as HTMLElement).textContent?.trim() || "");
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      
      const lines = [ths.join("\t")];
      
      rows.forEach((row) => {
        if ((row as HTMLElement).classList.contains("hidden")) return;
        const tds = Array.from((row as HTMLElement).querySelectorAll("td")).map((td) => (td as HTMLElement).textContent?.trim() || "");
        if (tds.length === 1) return;
        lines.push(tds.join("\t"));
      });
      
      const text = lines.join("\n");
      await copyTextToClipboard(text, 'export.txt');
      setTimeout(() => setIsTextCopying(false), 2000);
    } catch (err) {
      console.error(err);
      setIsTextCopying(false);
    }
  };

  return {
    ref,
    isExpanded,
    setIsExpanded,
    isCopying,
    isDownloading,
    isTextCopying,
    handleCopyImage,
    handleDownloadImage,
    handleCopyText,
  };
}
