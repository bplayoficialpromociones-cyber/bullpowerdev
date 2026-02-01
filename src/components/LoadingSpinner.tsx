interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export function LoadingSpinner({ size = 40, color = '#10b981' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 50 50"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <circle
          className="opacity-25"
          cx="25"
          cy="25"
          r="20"
          stroke={color}
          strokeWidth="4"
          fill="none"
        />
        <circle
          className="opacity-75"
          cx="25"
          cy="25"
          r="20"
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeDasharray="80"
          strokeDashoffset="20"
          strokeLinecap="round"
        />
      </svg>
      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
