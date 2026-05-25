import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon, FileX } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileX,
  title,
  description,
  className,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px] w-full border border-dashed border-indigo-200/60 rounded-3xl bg-gradient-to-br from-white/60 to-indigo-50/30 backdrop-blur-sm relative overflow-hidden group", className)}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-100/30 rounded-full blur-[50px] pointer-events-none group-hover:bg-indigo-300/20 transition-colors duration-700" />
      
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-sm border border-indigo-100/80 text-indigo-400 group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-500 duration-300 ease-out">
        <Icon className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
      </div>
      
      <h3 className="relative z-10 text-lg font-bold text-neutral-800 tracking-tight">{title}</h3>
      {description && <p className="relative z-10 text-sm text-neutral-500 mt-2 max-w-sm">{description}</p>}
    </div>
  );
};
