import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
  };

  const Icon = icons[type];

  return (
    <div
      className="fixed top-6 right-6 z-[100] animate-slide-in-right"
      role="alert"
      aria-live="assertive"
    >
      <div className={`
        min-w-[320px] max-w-md
        bg-[var(--bg-surface)]
        border-2
        rounded-xl
        shadow-2xl
        p-4
        backdrop-blur-sm
        ${type === 'success' ? 'border-emerald-500 dark:border-emerald-400' : ''}
        ${type === 'error' ? 'border-red-500 dark:border-red-400' : ''}
        ${type === 'warning' ? 'border-yellow-500 dark:border-yellow-400' : ''}
      `}>
        <div className="flex items-start gap-3">
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-full
            flex items-center justify-center
            ${type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' : ''}
            ${type === 'error' ? 'bg-red-100 dark:bg-red-900/30' : ''}
            ${type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}
          `}>
            <Icon className={`
              w-5 h-5
              ${type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : ''}
              ${type === 'error' ? 'text-red-600 dark:text-red-400' : ''}
              ${type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : ''}
            `} />
          </div>

          <div className="flex-1 pt-0.5">
            <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-[var(--bg-primary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
