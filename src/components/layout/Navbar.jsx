import React from 'react';
import { useApp } from '../../context/AppContext';
import { Droplets, Utensils, Dumbbell, Sparkles, BarChart2 } from 'lucide-react';

export default function Navbar() {
  const { activeTab, setActiveTab, data } = useApp();

  // Calculate quick notification / completion badges
  const waterDone = data.water.current >= data.water.target;
  const pillsPending = data.care.pills.filter(p => !p.taken).length;
  const workoutsCount = data.workout.todayWorkouts.length;

  const tabs = [
    {
      id: 'water',
      label: 'Water',
      icon: Droplets,
      badge: waterDone ? '✓' : null,
      badgeType: 'success'
    },
    {
      id: 'diet',
      label: 'Diet',
      icon: Utensils,
      badge: null
    },
    {
      id: 'workout',
      label: 'Workout',
      icon: Dumbbell,
      badge: workoutsCount > 0 ? workoutsCount : null,
      badgeType: 'neutral'
    },
    {
      id: 'care',
      label: 'Care & Pills',
      icon: Sparkles,
      badge: pillsPending > 0 ? pillsPending : null,
      badgeType: 'warning'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart2,
      badge: null
    }
  ];

  return (
    <nav className="bottom-navbar modern-floating-dock-navbar" role="navigation" aria-label="Main Navigation">
      <div className="floating-dock-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              className={`floating-dock-tab-btn ${isActive ? `active-dock-tab active-tab-${tab.id}` : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={isActive}
              title={tab.label}
              aria-label={tab.label}
            >
              <div className="dock-icon-wrapper">
                <Icon size={20} className="dock-tab-icon" />
                {tab.badge && (
                  <span className={`dock-badge ${tab.badgeType || ''}`}>
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

