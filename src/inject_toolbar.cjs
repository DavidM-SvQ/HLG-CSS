const fs = require('fs');

let code = fs.readFileSync('src/MonthlyReportView.tsx', 'utf8');

// 1. Add imports to MonthlyReportView.tsx
if (!code.includes('domToDataUrl')) {
  code = code.replace(
    /import \{[^\}]+\} from "lucide-react";/,
    (match) => match + '\nimport { domToDataUrl } from "modern-screenshot";\nimport { Copy, FileText, Download, CheckCircle2, Maximize2, Minimize2, ClipboardList, UploadCloud } from "lucide-react";'
  );
}

// 2. Add ExportWrapper component
const exportWrapperCode = `
const expandNodeForCapture = (element: HTMLElement) => {
    const originalStyles: any[] = [];
    const targets = element.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-x-auto, [style*="max-height"]');
    targets.forEach((node: any) => {
      originalStyles.push({
        node,
        maxHeight: node.style.maxHeight,
        height: node.style.height,
        overflowY: node.style.overflowY,
        overflowX: node.style.overflowX,
        overflow: node.style.overflow
      });
      node.style.setProperty('max-height', 'none', 'important');
      node.style.setProperty('height', 'auto', 'important');
      node.style.setProperty('overflow-y', 'visible', 'important');
      node.style.setProperty('overflow-x', 'visible', 'important');
      node.style.setProperty('overflow', 'visible', 'important');
    });

    const originalElementStyle = {
      display: element.style.display,
      width: element.style.width,
      height: element.style.height,
      maxHeight: element.style.maxHeight,
      minWidth: element.style.minWidth,
      background: element.style.background
    };
    
    element.style.setProperty('display', 'inline-block', 'important');
    element.style.setProperty('width', 'auto', 'important');
    element.style.setProperty('height', 'auto', 'important');
    element.style.setProperty('max-height', 'none', 'important');
    element.style.setProperty('min-width', '100%', 'important');
    if (!element.style.background && !element.style.backgroundColor) {
      element.style.setProperty('background', '#ffffff', 'important');
    }

    return () => {
      originalStyles.forEach(({ node, maxHeight, height, overflowY, overflowX, overflow }: any) => {
        node.style.maxHeight = maxHeight;
        node.style.height = height;
        node.style.overflowY = overflowY;
        node.style.overflowX = overflowX;
        node.style.overflow = overflow;
      });
      
      element.style.display = originalElementStyle.display;
      element.style.width = originalElementStyle.width;
      element.style.height = originalElementStyle.height;
      element.style.maxHeight = originalElementStyle.maxHeight;
      element.style.minWidth = originalElementStyle.minWidth;
      element.style.background = originalElementStyle.background;
    };
};

const ExportToolbar = ({ targetRef, filename }: { targetRef: React.RefObject<HTMLElement>, filename: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isCopyingText, setIsCopyingText] = useState(false);

  const toggleExpand = () => {
    if (!targetRef.current) return;
    const scrollContainers = targetRef.current.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-x-auto, [style*="max-height"]');
    scrollContainers.forEach((node: any) => {
      if (isExpanded) {
        node.style.maxHeight = node.dataset.originalMaxHeight || '';
        node.style.overflowY = node.dataset.originalOverflowY || '';
        node.style.overflowX = node.dataset.originalOverflowX || '';
        node.dataset.expanded = 'false';
      } else {
        node.dataset.originalMaxHeight = node.style.maxHeight;
        node.dataset.originalOverflowY = node.style.overflowY;
        node.dataset.originalOverflowX = node.style.overflowX;
        node.style.setProperty('max-height', 'none', 'important');
        node.style.setProperty('overflow-y', 'visible', 'important');
        node.style.setProperty('overflow-x', 'visible', 'important');
        node.dataset.expanded = 'true';
      }
    });
    setIsExpanded(!isExpanded);
  };

  const handleCopyText = async () => {
    if (!targetRef.current) return;
    setIsCopyingText(true);
    let text = "";
    const tables = targetRef.current.querySelectorAll("table");
    if (tables.length > 0) {
      tables.forEach(table => {
        const rows = table.querySelectorAll("tr");
        rows.forEach(row => {
          const cols = row.querySelectorAll("th, td");
          const rowData = Array.from(cols).map((c: any) => c.innerText.trim()).join("\\t");
          text += rowData + "\\n";
        });
        text += "\\n";
      });
    } else {
      text = targetRef.current.innerText;
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch(e) {}
    setTimeout(() => setIsCopyingText(false), 2000);
  };

  const handleCopyImage = async () => {
    if (!targetRef.current) return;
    setIsCopyingImage(true);
    const container = targetRef.current;
    
    // Si ya está expandido manualmente por el botón "Ampliar", lo dejamos
    // Puesto que expandNodeForCapture expande "a lo bestia" todo
    let restore = () => {};
    if (!isExpanded) {
        restore = expandNodeForCapture(container);
    }

    try {
      if (typeof ClipboardItem !== "undefined") {
        const clipboardItem = new ClipboardItem({
          "image/png": (async () => {
            const dataUrl = await domToDataUrl(container, {
              scale: 2,
              style: { overflow: "visible" },
              filter: (node) =>
                node instanceof Element
                  ? !node.classList.contains("copy-button-ignore")
                  : true,
            });
            const response = await fetch(dataUrl);
            return await response.blob();
          })() as Promise<Blob>,
        });
        await navigator.clipboard.write([clipboardItem]);
      }
    } catch(e) {
        console.error(e);
    } finally {
      if (!isExpanded) {
         restore();
      }
      setTimeout(() => setIsCopyingImage(false), 2000);
    }
  };

  const handleDownloadImage = async () => {
    if (!targetRef.current) return;
    const container = targetRef.current;
    let restore = () => {};
    if (!isExpanded) {
        restore = expandNodeForCapture(container);
    }

    try {
      const dataUrl = await domToDataUrl(container, {
        scale: 2,
        style: { overflow: "visible" },
        filter: (node) =>
          node instanceof Element
            ? !node.classList.contains("copy-button-ignore")
            : true,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename + ".png";
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      if (!isExpanded) {
         restore();
      }
    }
  };

  return (
    <div className="flex items-center gap-1.5 ml-auto copy-button-ignore">
      <button
        onClick={handleCopyText}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm border",
          isCopyingText
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
        )}
        title="Copiar texto"
      >
        {isCopyingText ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <ClipboardList className="w-4 h-4" />}
      </button>
      
      <button
        onClick={toggleExpand}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
        title="Ampliar"
      >
        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      <button
        onClick={handleCopyImage}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm border",
          isCopyingImage
            ? "bg-green-50 text-green-600 border-green-200"
            : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
        )}
        title="Copiar imagen"
      >
        {isCopyingImage ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      </button>

      <button
        onClick={handleDownloadImage}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100 transition-all shadow-sm"
        title="Descargar imagen"
      >
        <UploadCloud className="w-4 h-4 rotate-180" />
      </button>
    </div>
  );
};
`;

if (!code.includes('expandNodeForCapture')) {
  // insert after imports
  code = code.replace(/export const MonthlyReportView/, exportWrapperCode + '\\nexport const MonthlyReportView');
}

fs.writeFileSync('src/MonthlyReportView.tsx', code);
console.log('Script done');
