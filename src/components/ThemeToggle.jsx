import { useTheme } from '../theme/ThemeContext';
import splashIconBlack from '../assets/splash-icon-black.png';
import splashIconWhite from '../assets/splash-icon-white.png';

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
      <img
        src={isDark ? splashIconWhite : splashIconBlack}
        alt=""
        aria-hidden="true"
        style={{ width: 25, height: 25, objectFit: 'contain' }}
      />
      {!compact && <span>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}

