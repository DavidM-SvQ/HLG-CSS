import React from "react";
import { Maximize2, Minimize2, Copy, CheckCircle2, UploadCloud, ClipboardList } from "lucide-react";
import { cn } from "../../lib/utils";

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
}) => {
  const renderImageButtons = () => {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => onCopyImage?.(imagePageCount > 1 ? 'full' : undefined)}
          disabled={!!isImageCopying}
          className={cn(
            "p-1.5 rounded-md transition-colors border shadow-sm",
            isImageCopying === 'full' || isImageCopying === true || (imagePageCount <= 1 && !!isImageCopying)
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
          )}
          title={imagePageCount > 1 ? "Copiar imagen completa" : "Copiar imagen"}
        >
          {isImageCopying === 'full' || isImageCopying === true || (imagePageCount <= 1 && !!isImageCopying) ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>

        {imagePageCount > 1 && (
          <div className="flex border-l border-neutral-200 pl-1.5 gap-1 ml-1">
            {Array.from({ length: imagePageCount }, (_, i) => `p${i + 1}`).map((p) => (
              <button
                key={p}
                onClick={() => onCopyImage?.(p)}
                disabled={!!isImageCopying}
                className={cn(
                  "px-2 py-1 text-[10px] font-bold rounded-md border shadow-sm flex items-center gap-1 transition-colors uppercase tracking-wider",
                  isImageCopying === p
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                  isImageCopying && isImageCopying !== p && "opacity-50 cursor-not-allowed"
                )}
                title={`Copiar ${p}`}
              >
                {isImageCopying === p ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
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

