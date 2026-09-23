import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Sparkles, User } from 'lucide-react';

export default function Header() {
  const { data, openProfilePage, currentPage } = useApp();

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
          <span>{data.water?.streak || 0}d Streak</span>
        </div>

        {/* Profile DP Button navigating to dedicated Profile Page or Auth Modal */}
        <button
          className={`header-profile-dp ${currentPage === 'profile' ? 'active' : ''}`}
          onClick={openProfilePage}
          aria-label={data.auth?.isLoggedIn ? 'Open Profile' : 'Sign in or explore as guest'}
          title={data.auth?.isLoggedIn ? (data.profile?.name || 'Profile') : 'Sign In with Google'}
          id="header-profile-btn"
        >
          <div className="header-avatar-circle">
            {data.profile?.avatarUrl ? (
              data.profile.avatarUrl.startsWith('http') || data.profile.avatarUrl.startsWith('data:') ? (
                <img src={data.profile.avatarUrl} alt="Avatar" className="header-avatar-img" />
              ) : (
                <span className="header-avatar-emoji">{data.profile.avatarUrl}</span>
              )
            ) : (
              <User size={16} className="header-avatar-icon" />
            )}
          </div>
        </button>
      </div>
    </header>
  );
}

