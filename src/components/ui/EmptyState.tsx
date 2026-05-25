import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  className,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px] w-full border border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50", className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-neutral-100/60 text-neutral-400">
          <Icon className="w-8 h-8" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-lg font-bold text-neutral-900 tracking-tight">{title}</h3>
      {description && <p className="text-sm text-neutral-500 mt-2 max-w-sm">{description}</p>}
    </div>
  );
};
