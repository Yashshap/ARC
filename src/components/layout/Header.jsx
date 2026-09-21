import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Sparkles, User } from 'lucide-react';

export default function Header() {
  const { data, activeTab, setActiveTab } = useApp();

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-brand">
          <div className="brand-icon">
            <Sparkles size={18} className="brand-svg" />
          </div>
          <div>
            <h1 className="brand-name">VitalSync</h1>
            <p className="header-date">{todayStr}</p>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="streak-badge" title="Consecutive days active">
          <Flame size={16} className="flame-icon" />
          <span>{data.water.streak || 5}d Streak</span>
        </div>

        {/* Profile DP Button navigating to Profile Tab */}
        <button
          className={`header-profile-dp ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          aria-label="Profile & Settings"
          title="Open Profile & Settings"
        >
          <div className="header-avatar-circle">
            <User size={16} className="header-avatar-icon" />
          </div>
        </button>
      </div>
    </header>
  );
}

