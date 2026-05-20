import React, { useRef, forwardRef, useImperativeHandle, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { ExportToolbar } from "./ExportToolbar";

interface ReportCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  filename?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  children: ReactNode;
  
  // Custom header content (like filters)
  headerExtra?: ReactNode;
  
  // Custom toolbar props
  toolbarProps?: any;
}

export const ReportCard = forwardRef<HTMLDivElement, ReportCardProps>(({
  title,
  subtitle,
  icon,
  filename = "export",
  className,
  headerClassName,
  bodyClassName,
  children,
  headerExtra,
  toolbarProps
}, ref) => {
  const innerRef = useRef<HTMLDivElement>(null);
  
  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  return (
    <div 
      className={cn("bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm flex flex-col relative", className)} 
      ref={innerRef}
    >
      <div className={cn("px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full", headerClassName)}>
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2 min-w-0">
            {icon && <span className="flex-shrink-0 text-blue-600 [&>svg]:w-5 [&>svg]:h-5">{icon}</span>}
            <span className="truncate">{title}</span>
          </h3>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {headerExtra && (
            <div className="flex items-center gap-2">
              {headerExtra}
            </div>
          )}
          <ExportToolbar 
            targetRef={innerRef} 
            filename={filename} 
            {...toolbarProps} 
          />
        </div>
      </div>
      <div className={cn("w-full relative", bodyClassName)}>
        {children}
      </div>
    </div>
  );
});

ReportCard.displayName = "ReportCard";
