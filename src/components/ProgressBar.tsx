import React from 'react';

interface ProgressBarProps {
  progress: number;
  message?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'green' | 'red' | 'blue';
}

export function ProgressBar({ progress, message, showPercentage = true, color = 'primary' }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const colorMap = {
    primary: 'var(--color-primary)',
    green: '#10b981',
    red: '#ef4444',
    blue: '#3b82f6',
  };

  return (
    <div className="w-full">
      {message && (
        <div className="text-sm mb-2 text-gray-700 dark:text-gray-300">
          {message}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: colorMap[color]
          }}
        />
      </div>
      {showPercentage && (
        <div className="text-xs mt-1 text-gray-600 dark:text-gray-400 text-right">
          {clampedProgress}%
        </div>
      )}
    </div>
  );
}
