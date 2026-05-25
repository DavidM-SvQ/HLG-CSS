import React, { useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2, Copy, CheckCircle2, UploadCloud, ClipboardList, Camera, ChevronDown } from "lucide-react";
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
  
  onDownloadImage?: (range?: string) => void;

  // Auto-export props
  targetRef?: React.RefObject<HTMLElement>;
  filename?: string;

  // Blocks support
  numBlocks?: number;
  onCopyImageBlock?: (blockId: string) => void;

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
  onDownloadImage,
  targetRef,
  filename = "export",
  numBlocks,
  onCopyImageBlock,
  customImageButtons,
}) => {
  const [internalIsCopying, setInternalIsCopying] = useState<boolean | string | null>(false);
  const [isBlocksOpen, setIsBlocksOpen] = useState(false);

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

  const handleAutoDownload = async (range?: string) => {
    if (!targetRef?.current) return;
    await autoDownloadImage({
      fileName: `${filename}${range && range !== 'full' ? `-${range}` : ''}.png`,
      scale: 3,
      filter: (node: any) => !(node.classList && node.classList.contains("copy-button-ignore")),
      style: { overflow: "visible" }
    });
  };

  const _onCopyImage = onCopyImage || (targetRef ? handleAutoCopy : undefined);
  const _onDownloadImage = onDownloadImage || (targetRef ? handleAutoDownload : undefined);

  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBlocksOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBlockCopy = (blockId: string) => {
    setIsBlocksOpen(false);
    if (onCopyImageBlock) {
      onCopyImageBlock(blockId);
    } else {
      _onCopyImage?.(blockId);
    }
  };

  const renderImageButtons = () => {
    const hasBlocks = numBlocks && numBlocks > 1;

    return (
      <div className="flex items-center" ref={dropdownRef}>
        <div className={cn("flex items-center", hasBlocks ? "rounded-md border shadow-sm border-neutral-200" : "")}>
          <Button variant="outline"
            onClick={() => _onCopyImage?.(undefined)}
            disabled={!!_isImageCopying}
            className={cn(
              "transition-colors",
              hasBlocks ? "border-0 shadow-none rounded-r-none border-r border-r-neutral-200 px-2 py-1.5 h-auto text-xs" : "p-1.5 rounded-md border shadow-sm text-sm",
              _isImageCopying === 'full' || _isImageCopying === true 
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-white text-neutral-600 hover:bg-neutral-50"
            )}
            title="Copiar imagen"
          >
            {_isImageCopying === 'full' || _isImageCopying === true ? <CheckCircle2 className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {hasBlocks && <span className="ml-1 font-medium hidden sm:inline">Tabla</span>}
          </Button>
          
          {hasBlocks && (
            <div className="relative flex">
              <Button
                variant="outline"
                className="rounded-l-none border-0 shadow-none px-1.5 py-1.5 h-auto bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                onClick={() => setIsBlocksOpen(!isBlocksOpen)}
                disabled={!!_isImageCopying}
                title="Copiar por bloques"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              
              {isBlocksOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-neutral-100 mb-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Copiar Partes</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto w-full flex flex-col">
                    {Array.from({ length: numBlocks }).map((_, i) => {
                      const s = `p${i + 1}`;
                      const start = i * 50 + 1;
                      const end = (i + 1) * 50; // We don't have total length here easily, so just show ranges like 1-50
                      const label = `${start}-${end}`;
                      const isCopyingThis = _isImageCopying === s;
                      
                      return (
                        <button
                          key={s}
                          onClick={() => handleBlockCopy(s)}
                          disabled={!!_isImageCopying}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between",
                            isCopyingThis ? "bg-green-50 text-green-700" : "hover:bg-neutral-50 text-neutral-700",
                            _isImageCopying && !isCopyingThis && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <span className="font-mono">Rango {label}</span>
                          {isCopyingThis && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDownloadButtons = () => {
    const hasBlocks = numBlocks && numBlocks > 1;

    return (
      <div className="flex flex-wrap items-center gap-1 border-l border-neutral-200 pl-1.5 ml-1" ref={downloadRef}>
        <div className={cn("flex items-center", hasBlocks ? "rounded-md border shadow-sm border-neutral-200" : "")}>
          <Button variant="outline"
            onClick={() => _onDownloadImage?.(undefined)}
            className={cn(
              "transition-colors bg-white hover:bg-neutral-50 text-neutral-600",
              hasBlocks ? "border-0 shadow-none rounded-r-none border-r border-r-neutral-200 px-2 py-1.5 h-auto text-xs" : "p-1.5 rounded-md border shadow-sm text-sm border-neutral-200"
            )}
            title="Descargar imagen"
          >
            <UploadCloud className="w-4 h-4" />
          </Button>

          {hasBlocks && (
            <div className="relative flex">
              <Button
                variant="outline"
                className="rounded-l-none border-0 shadow-none px-1.5 py-1.5 h-auto bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                title="Descargar por partes"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>

              {isDownloadOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-neutral-100 mb-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Descargar Partes</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto w-full flex flex-col">
                    {Array.from({ length: numBlocks }).map((_, i) => {
                      const s = `p${i + 1}`;
                      const start = i * 50 + 1;
                      const end = (i + 1) * 50;
                      const label = `${start}-${end}`;

                      return (
                        <button
                          key={s}
                          onClick={() => {
                            setIsDownloadOpen(false);
                            _onDownloadImage?.(s);
                          }}
                          className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-neutral-50 text-neutral-700 flex items-center justify-between"
                        >
                          <span className="font-mono">Rango {label}</span>
                          <UploadCloud className="w-3 h-3 text-neutral-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 copy-button-ignore">
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

      {_onDownloadImage && renderDownloadButtons()}
    </div>
  );
};


