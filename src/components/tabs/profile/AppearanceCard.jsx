import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function AppearanceCard({ theme, onToggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <div className="section-block">
      <div className="section-heading-outside">
        <h3 className="section-outside-title">Appearance</h3>
      </div>
      <div className="theme-toggle-compact-card glass-card">
        <div className="theme-compact-left">
          <div
            className={`theme-icon-circle ${
              isDark ? 'dark-circle' : 'light-circle'
            }`}
          >
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
          </div>
          <div className="theme-compact-text">
            <span className="theme-compact-title">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            <span className="theme-compact-sub">
              {isDark
                ? 'Deep carbon & neon accents'
                : 'Crisp white & daylight vibrance'}
            </span>
          </div>
        </div>

        {/* Single iOS-style Toggle Switch */}
        <button
          className={`ios-toggle-switch ${isDark ? 'active' : ''}`}
          onClick={onToggleTheme}
          aria-label="Toggle dark/light theme"
          role="switch"
          aria-checked={isDark}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        >
          <span className="ios-toggle-knob" />
        </button>
      </div>
    </div>
  );
}
