import React, { useRef, forwardRef, useImperativeHandle, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { ExportToolbar } from "./ExportToolbar";

interface ReportCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  iconClassName?: string;
  filename?: string;
  className?: string;
  style?: React.CSSProperties;
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
  iconClassName,
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
      className={cn("bg-gradient-to-br from-blue-50/80 to-white/90 backdrop-blur-xl border border-blue-100/60 rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative group transition-all duration-500", className)} 
      ref={innerRef}
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-100/40 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-200/40 transition-colors duration-700" />
      <div className={cn("px-6 py-6 border-b border-blue-100/50 bg-white/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full relative z-30 group-[.is-exporting]:justify-center group-[.is-exporting]:pb-4", headerClassName)}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0 pr-4 group-[.is-exporting]:justify-center group-[.is-exporting]:pr-0 group-[.is-exporting]:flex-none group-[.is-exporting]:w-full">
          {icon && (
            <div className={cn("p-3 bg-blue-500/10 text-blue-700 rounded-2xl shrink-0 backdrop-blur-md self-start sm:self-center shadow-sm [&>svg]:w-6 [&>svg]:h-6 group-[.is-exporting]:self-center", iconClassName)}>
              {icon}
            </div>
          )}
          <div className="group-[.is-exporting]:text-center min-w-0">
            <h3 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center min-w-0 group-[.is-exporting]:justify-center shrink-0">
              <span className="truncate group-[.is-exporting]:whitespace-normal">{title}</span>
            </h3>
            {subtitle && (
              <p className="text-sm text-neutral-600 mt-1 truncate group-[.is-exporting]:whitespace-normal group-[.is-exporting]:text-center shrink-0">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap relative z-10 group-[.is-exporting]:hidden">
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
      <div className={cn("w-full relative bg-white/60 z-10", bodyClassName)}>
        {children}
      </div>
    </div>
  );
});

ReportCard.displayName = "ReportCard";
