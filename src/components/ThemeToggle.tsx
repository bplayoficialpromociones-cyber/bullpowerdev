import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'full' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ variant = 'full', size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'text-xs gap-1.5 px-2.5 py-1.5',
    md: 'text-sm gap-2 px-3 py-2',
    lg: 'text-base gap-2.5 px-4 py-3',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleTheme}
        className={`${sizeClasses[size]} rounded-lg hover:bg-[var(--accent-hover)] transition-all hover:scale-105`}
        aria-label="Toggle theme"
        title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      >
        {theme === 'light' ? (
          <Moon className={`${iconSizes[size]} text-[var(--text-secondary)]`} />
        ) : (
          <Sun className={`${iconSizes[size]} text-[var(--text-secondary)]`} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        rounded-lg
        bg-[var(--bg-primary)]
        hover:bg-[var(--accent-hover)]
        border border-[var(--border-color)]
        transition-all
        hover:scale-105
        hover:shadow-md
        flex items-center justify-center
        font-medium
        text-[var(--text-primary)]
      `}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <>
          <Moon className={iconSizes[size]} />
          <span>Modo Oscuro</span>
        </>
      ) : (
        <>
          <Sun className={iconSizes[size]} />
          <span>Modo Claro</span>
        </>
      )}
    </button>
  );
}
