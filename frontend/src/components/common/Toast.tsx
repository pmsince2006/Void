import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
          info: <Info className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
        }[toast.type];

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[#F4F2ED] border-2 border-[#111111] shadow-2xl p-4 flex items-start gap-3 animate-fade-in"
            role="alert"
          >
            {icons}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <p className="font-heading font-bold text-xs uppercase tracking-wider text-[#111111]">
                  {toast.title}
                </p>
              )}
              <p className="font-mono text-xs text-[#111111]/90 break-words mt-0.5">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#777777] hover:text-[#111111] p-0.5 shrink-0 transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
