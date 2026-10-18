import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionTo?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'NO PIECES DISCOVERED',
  description = 'The query yielded zero archive silhouettes in this frequency band.',
  actionText = 'VIEW ALL SILHOUETTES',
  onAction,
  actionTo,
  icon,
  className = '',
}) => {
  return (
    <div className={`border border-[#111111]/30 p-12 text-center max-w-lg mx-auto my-8 ${className}`}>
      <div className="w-12 h-12 border border-[#111111] flex items-center justify-center mx-auto mb-4 bg-transparent text-[#111111]">
        {icon || <PackageOpen className="w-6 h-6 stroke-1" />}
      </div>
      <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-[#111111] mb-2">
        {title}
      </h3>
      <p className="text-xs font-mono text-[#777777] max-w-sm mx-auto mb-6">
        {description}
      </p>
      {(actionTo || onAction) && (
        <Button
          variant="outline"
          size="sm"
          to={actionTo}
          onClick={onAction}
          className="font-mono"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};
