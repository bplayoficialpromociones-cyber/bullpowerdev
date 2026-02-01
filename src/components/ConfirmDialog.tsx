import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title = 'BULLPOWERDEV.AR DICE',
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative bg-[var(--bg-surface)] rounded-xl max-w-md w-full border border-[var(--border-color)] shadow-2xl animate-scale-in">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-full
              flex items-center justify-center
              ${type === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : ''}
              ${type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}
              ${type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
            `}>
              <AlertCircle className={`
                w-6 h-6
                ${type === 'danger' ? 'text-red-600 dark:text-red-400' : ''}
                ${type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                ${type === 'info' ? 'text-blue-600 dark:text-blue-400' : ''}
              `} />
            </div>

            <div className="flex-1">
              <h3
                id="dialog-title"
                className="text-lg font-bold text-[var(--text-primary)] mb-2 tracking-wide"
              >
                {title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-[var(--bg-primary)] hover:bg-[var(--accent-hover)] text-[var(--text-primary)] rounded-lg transition-all font-medium border border-[var(--border-color)]"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`
                flex-1 px-4 py-2.5 rounded-lg transition-all font-medium text-white
                ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700' : ''}
                ${type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700' : ''}
                ${type === 'info' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700' : ''}
              `}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
