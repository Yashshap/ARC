import React from 'react';

export default function WaterHeaderHero({
  currentGoalLiters,
  onSelectGoal,
  totalPercentage,
  currentLiters,
  totalLitersTarget,
  remainingMl,
}) {
  return (
    <div className="blue-header-card">
      <div className="blue-title-row">
        <div className="blue-title-group">
          <span className="blue-kicker">HYDRATION TRACKER</span>
          <h2 className="blue-heading">Daily Water</h2>
        </div>

        <div className="blue-goal-selector">
          <span className="blue-goal-label">Goal:</span>
          <div className="blue-goal-pills">
            {[3, 4, 5].map((liters) => (
              <button
                key={liters}
                className={`blue-goal-pill ${currentGoalLiters === liters ? 'active' : ''}`}
                onClick={() => onSelectGoal(liters)}
              >
                {liters}L
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Arch Progress Card */}
      <div className="blue-hero-arch">
        <div className="blue-hero-content">
          <span className="blue-hero-percent">{totalPercentage}%</span>
          <div className="blue-hero-readout">
            <span className="blue-current-val">{currentLiters}</span>
            <span className="blue-target-val">/ {totalLitersTarget}.0 L</span>
          </div>
          <p className="blue-hero-status">
            {remainingMl === 0
              ? '✨ Daily Goal Completed'
              : `${(remainingMl / 1000).toFixed(2)}L to reach your ${totalLitersTarget}L goal`}
          </p>
        </div>
      </div>
    </div>
  );
}
