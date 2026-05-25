import React, { useState } from "react";
import { Maximize2, Minimize2, Copy, CheckCircle2, UploadCloud, ClipboardList, Camera } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTableScreenshot } from "../../hooks/useTableScreenshot";
import { Button } from "./button";

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

  // Extra buttons for subsets
  customImageButtons?: React.ReactNode;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  isExpanded,
  onExpand,
  onCopyText,
  isTextCopying,
  textCopyLabel,
  useClipboardIconForText = false,
  onCopyImage,
  isImageCopying,
  imagePageCount = 1,
  onDownloadImage,
  targetRef,
  filename = "export",
  customImageButtons,
}) => {
  const [internalIsCopying, setInternalIsCopying] = useState<boolean | string | null>(false);

  // We explicitly type generic any for generic hook ref
  const { handleCopyImage: autoCopyImage, handleDownloadImage: autoDownloadImage, isCopying: isHookCopying } = useTableScreenshot(targetRef as React.RefObject<any>);

  const _isImageCopying = isImageCopying !== undefined ? isImageCopying : (internalIsCopying || isHookCopying);

  const handleAutoCopy = async (range?: string) => {
    if (!targetRef?.current || _isImageCopying) return;
    setInternalIsCopying(range || true);
    try {
      await autoCopyImage({
        fileName: `${filename}.png`,
        scale: 3,
        filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
        style: { overflow: "visible" }
      });
    } finally {
      setInternalIsCopying(false);
    }
  };

  const handleAutoDownload = async () => {
    if (!targetRef?.current) return;
    await autoDownloadImage({
      fileName: `${filename}.png`,
      scale: 3,
      filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      style: { overflow: "visible" }
    });
  };

  const _onCopyImage = onCopyImage || (targetRef ? handleAutoCopy : undefined);
  const _onDownloadImage = onDownloadImage || (targetRef ? handleAutoDownload : undefined);

  const renderImageButtons = () => {
    return (
      <div className="flex items-center gap-1">
        <Button variant="outline"
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
          {_isImageCopying === 'full' || _isImageCopying === true || (imagePageCount <= 1 && !!_isImageCopying) ? <CheckCircle2 className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
        </Button>

        {imagePageCount > 1 && (
          <div className="flex border-l border-neutral-200 pl-1.5 gap-1 ml-1">
            {Array.from({ length: imagePageCount }, (_, i) => `p${i + 1}`).map((p) => (
              <Button variant="outline"
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
                {_isImageCopying === p ? <CheckCircle2 className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                {p}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-1.5 copy-button-ignore">
      {onExpand && (
        <Button variant="ghost" size="sm"
          onClick={onExpand}
          className="p-1.5 bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 rounded-md text-neutral-600 transition-colors"
          title={isExpanded ? "Contraer" : "Ampliar"}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      )}

      {_onCopyImage && renderImageButtons()}
      {customImageButtons}

      {onCopyText && (
        <Button variant="outline"
          onClick={onCopyText}
          disabled={isTextCopying}
          className={cn(
            "transition-colors border shadow-sm rounded-md",
            textCopyLabel ? "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium" : "p-1.5 flex items-center justify-center",
            isTextCopying
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
          )}
          title={textCopyLabel || "Copiar texto"}
        >
          {isTextCopying ? (
            <CheckCircle2 className={textCopyLabel ? "w-3.5 h-3.5" : "w-4 h-4"} />
          ) : useClipboardIconForText ? (
            <ClipboardList className={textCopyLabel ? "w-3.5 h-3.5" : "w-4 h-4"} />
          ) : (
            <Copy className={textCopyLabel ? "w-3.5 h-3.5" : "w-4 h-4"} />
          )}
          {textCopyLabel && <span className="hidden sm:inline">{textCopyLabel}</span>}
        </Button>
      )}

      {_onDownloadImage && (
        <Button variant="outline"
          onClick={() => _onDownloadImage()}
          className="p-1.5 bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 rounded-md text-neutral-600 transition-colors"
          title="Descargar imagen"
        >
          <UploadCloud className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

