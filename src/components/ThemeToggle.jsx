import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`theme-toggle ${compact ? 'theme-toggle-compact' : ''}`}
    >
      {isDark ? <Sun size={25} /> : <Moon size={25} />}
      {!compact && <span>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}
