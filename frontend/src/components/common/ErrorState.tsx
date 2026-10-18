import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'SIGNAL DISRUPTED',
  message = 'A transmission error occurred while querying the VOID index.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`border border-red-900/40 bg-red-950/5 p-8 text-center max-w-lg mx-auto my-8 ${className}`}>
      <div className="w-12 h-12 border border-red-800 text-red-700 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-6 h-6 stroke-1" />
      </div>
      <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-[#111111] mb-2">
        {title}
      </h3>
      <p className="text-xs font-mono text-[#777777] max-w-sm mx-auto mb-6">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="font-mono"
        >
          RE-TRANSMIT REQUEST
        </Button>
      )}
    </div>
  );
};
