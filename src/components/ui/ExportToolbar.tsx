import React, { useState } from "react";
import { Maximize2, Minimize2, Copy, CheckCircle2, UploadCloud, ClipboardList } from "lucide-react";
import { cn } from "../../lib/utils";
import { copyImageToClipboard, copyTextToClipboard } from "../../lib/clipboard";
import { domToDataUrl } from "modern-screenshot";

interface ExportToolbarProps {
  isExpanded?: boolean;
  onExpand?: () => void;
  
  onCopyText?: () => void;
  isTextCopying?: boolean;
  textCopyLabel?: string;
  useClipboardIconForText?: boolean;
  
  onCopyImage?: (range?: string) => void;
  isImageCopying?: boolean | string | null;
  imagePageCount?: number;
  
  onDownloadImage?: (range?: string) => void;

  // Auto-export props
  targetRef?: React.RefObject<HTMLElement>;
  filename?: string;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  isExpanded,
  onExpand,
  onCopyText,
  isTextCopying,
  textCopyLabel = "Copiar texto",
  useClipboardIconForText = false,
  onCopyImage,
  isImageCopying,
  imagePageCount = 1,
  onDownloadImage,
  targetRef,
  filename = "export",
}) => {
  const [internalIsCopying, setInternalIsCopying] = useState<boolean | string | null>(false);

  const _isImageCopying = isImageCopying !== undefined ? isImageCopying : internalIsCopying;

  const handleAutoCopy = async (range?: string) => {
    if (!targetRef?.current || _isImageCopying) return;
    setInternalIsCopying(range || true);
    try {
      const dataUrl = await domToDataUrl(targetRef.current, {
        scale: 3,
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
        backgroundColor: "#ffffff",
        style: { overflow: "visible" },
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await copyImageToClipboard(Promise.resolve(blob), `${filename}.png`);
    } catch (err) {
      console.warn("Error copying image", err);
    } finally {
      setTimeout(() => setInternalIsCopying(false), 2000);
    }
  };

  const handleAutoDownload = async () => {
    if (!targetRef?.current) return;
    try {
      const dataUrl = await domToDataUrl(targetRef.current, {
        scale: 3,
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
        backgroundColor: "#ffffff",
        style: { overflow: "visible" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${filename}.png`;
      link.click();
    } catch (err) {
      console.warn("Error downloading image", err);
    }
  };

  const _onCopyImage = onCopyImage || (targetRef ? handleAutoCopy : undefined);
  const _onDownloadImage = onDownloadImage || (targetRef ? handleAutoDownload : undefined);

  const renderImageButtons = () => {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => _onCopyImage?.(imagePageCount > 1 ? 'full' : undefined)}
          disabled={!!_isImageCopying}
          className={cn(
            "p-1.5 rounded-md transition-colors border shadow-sm",
            _isImageCopying === 'full' || _isImageCopying === true || (imagePageCount <= 1 && !!_isImageCopying)
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
          )}
          title={imagePageCount > 1 ? "Copiar imagen completa" : "Copiar imagen"}
        >
          {_isImageCopying === 'full' || _isImageCopying === true || (imagePageCount <= 1 && !!_isImageCopying) ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>

        {imagePageCount > 1 && (
          <div className="flex border-l border-neutral-200 pl-1.5 gap-1 ml-1">
            {Array.from({ length: imagePageCount }, (_, i) => `p${i + 1}`).map((p) => (
              <button
                key={p}
                onClick={() => _onCopyImage?.(p)}
                disabled={!!_isImageCopying}
                className={cn(
                  "px-2 py-1 text-[10px] font-bold rounded-md border shadow-sm flex items-center gap-1 transition-colors uppercase tracking-wider",
                  _isImageCopying === p
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                  _isImageCopying && _isImageCopying !== p && "opacity-50 cursor-not-allowed"
                )}
                title={`Copiar ${p}`}
              >
                {_isImageCopying === p ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-1.5 copy-button-ignore">
      {onCopyText && (
        <button
          onClick={onCopyText}
          disabled={isTextCopying}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors border shadow-sm",
            isTextCopying
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
          )}
          title="Copiar texto"
        >
          {isTextCopying ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : useClipboardIconForText ? (
            <ClipboardList className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{textCopyLabel}</span>
        </button>
      )}

      {onExpand && (
        <button
          onClick={onExpand}
          className="p-1.5 bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 rounded-md text-neutral-600 transition-colors"
          title={isExpanded ? "Contraer" : "Ampliar"}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      )}

      {onCopyImage && renderImageButtons()}

      {onDownloadImage && (
        <button
          onClick={() => onDownloadImage()}
          className="p-1.5 bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 rounded-md text-neutral-600 transition-colors"
          title="Descargar imagen"
        >
          <UploadCloud className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

