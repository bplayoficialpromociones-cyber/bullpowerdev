import { useTheme } from '../contexts/ThemeContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withBackground?: boolean;
}

const sizeClasses = {
  sm: 'w-12',
  md: 'w-20',
  lg: 'w-[270px]',
};

export function Logo({ className = '', size = 'lg', withBackground = false }: LogoProps) {
  const { theme } = useTheme();

  const logoSrc = theme === 'dark'
    ? '/logos/dark/logoh4_(2).png'
    : '/logos/light/logoh3_(2).png';

  return (
    <img
      src={logoSrc}
      alt="Bull Power Logo"
      className={`${sizeClasses[size]} h-auto ${className}`}
      style={{ display: 'block', margin: 0, padding: 0 }}
    />
  );
}
