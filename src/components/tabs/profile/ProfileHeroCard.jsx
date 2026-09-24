import React from 'react';
import { User, Edit2 } from 'lucide-react';
import { calculateBMI } from '../../../utils/healthCalculations';

export default function ProfileHeroCard({ profile, onEditClick }) {
  if (!profile) return null;

  const { bmi, bmiCategory, bmiColor, bmiPositionPercent, hasBMI } = calculateBMI(
    profile.weight,
    profile.height
  );

  const hasWeight = profile.weight != null && Number(profile.weight) > 0;
  const hasHeight = profile.height != null && Number(profile.height) > 0;
  const heightFt = hasHeight ? ((Number(profile.height)) / 30.48).toFixed(1) : null;

  return (
    <div className="section-block">
      <div className="section-heading-outside">
        <h3 className="section-outside-title">User Profile</h3>
      </div>
      <div className="profile-hero-card glass-card">
        <div className="profile-header-row">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              <User size={34} className="avatar-icon" />
            </div>
          </div>

          <div className="profile-main-info">
            <h2 className="profile-name">{profile.name || 'User'}</h2>
            <span className="profile-tagline">{profile.goal || 'Health & Fitness'}</span>
            <div className="profile-badges-row">
              <span className="profile-mini-pill">{profile.age ? `${profile.age} yrs` : '-'}</span>
              <span className="profile-mini-pill">{profile.gender || '-'}</span>
            </div>
          </div>

          <button
            className="btn-icon"
            onClick={onEditClick}
            title="Edit Profile"
            aria-label="Edit Profile"
          >
            <Edit2 size={16} />
          </button>
        </div>

        {/* User Physical Stats Grid */}
        <div className="profile-stats-grid">
          <div className="p-stat-box">
            <span className="p-stat-label">Weight</span>
            <span className="p-stat-val">{hasWeight ? `${profile.weight} kg` : '-'}</span>
            <span className="p-stat-sub">
              {profile.targetWeight ? `Target: ${profile.targetWeight} kg` : 'Target: -'}
            </span>
          </div>
          <div className="p-stat-box">
            <span className="p-stat-label">Height</span>
            <span className="p-stat-val">{hasHeight ? `${profile.height} cm` : '-'}</span>
            <span className="p-stat-sub">{heightFt ? `${heightFt} ft` : '-'}</span>
          </div>
          <div className="p-stat-box">
            <span className="p-stat-label">BMI</span>
            <span className="p-stat-val" style={{ color: hasBMI ? bmiColor : 'var(--text-muted)' }}>
              {hasBMI ? bmi : '-'}
            </span>
            <span className="p-stat-sub" style={{ color: hasBMI ? bmiColor : 'var(--text-muted)' }}>
              {hasBMI ? bmiCategory : '-'}
            </span>
          </div>
        </div>

        {/* BMI Scale Bar */}
        <div className="bmi-gauge-container">
          <div className="bmi-gauge-bar">
            <div className="bmi-section bmi-under" />
            <div className="bmi-section bmi-normal" />
            <div className="bmi-section bmi-over" />
            <div className="bmi-section bmi-obese" />
            {/* Indicator Marker */}
            {hasBMI && (
              <div
                className="bmi-marker"
                style={{
                  left: `${Math.min(95, Math.max(5, bmiPositionPercent))}%`,
                }}
                title={`BMI: ${bmi} (${bmiCategory})`}
              />
            )}
          </div>
          <div className="bmi-gauge-labels">
            <span>18.5</span>
            <span>25.0</span>
            <span>30.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
