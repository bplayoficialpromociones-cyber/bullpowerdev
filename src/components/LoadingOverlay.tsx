import React from 'react';
import { Loader2 } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface LoadingOverlayProps {
  message?: string;
  progress?: number;
  showProgress?: boolean;
}

export function LoadingOverlay({
  message = 'Cargando...',
  progress,
  showProgress = false
}: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 min-w-[300px] max-w-md">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-teal-600 dark:text-teal-500 animate-spin" />
          <div className="text-center">
            <p className="text-gray-900 dark:text-white font-medium mb-2">{message}</p>
            {showProgress && progress !== undefined && (
              <ProgressBar progress={progress} showPercentage />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
