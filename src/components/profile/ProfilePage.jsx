import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Settings,
  User,
  Edit2,
  Camera,
  Sparkles
} from 'lucide-react';

const PRESET_AVATARS = [
  '⚡', '💪', '🏃', '🧘', '💧', '🥗', '🔥', '🎯'
];

export default function ProfilePage() {
  const {
    data,
    updateProfile,
    closeProfilePage,
    openSettingsPage
  } = useApp();

  const { profile, auth } = data;

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(profile.name || 'Alex Rivera');
  const [goal, setGoal] = useState(profile.goal || 'Lean Muscle & Metabolic Health');
  const [age, setAge] = useState(String(profile.age || 27));
  const [height, setHeight] = useState(String(profile.height || 178));
  const [weight, setWeight] = useState(String(profile.weight || 71.5));
  const [targetWeight, setTargetWeight] = useState(String(profile.targetWeight || 69.0));
  const [gender, setGender] = useState(profile.gender || 'Athletic');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarUrl || null);

  // Avatar Picker State
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  // BMI Calculation
  const heightM = (Number(profile.height) || 178) / 100;
  const weightKg = Number(profile.weight) || 71.5;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);

  let bmiCategory = 'Normal weight';
  let bmiColor = '#10b981';
  let bmiPositionPercent = 45;

  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = '#38bdf8';
    bmiPositionPercent = 15;
  } else if (bmi >= 18.5 && bmi < 25) {
    bmiCategory = 'Normal weight';
    bmiColor = '#10b981';
    bmiPositionPercent = 45;
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = '#f59e0b';
    bmiPositionPercent = 75;
  } else {
    bmiCategory = 'Obese';
    bmiColor = '#ef4444';
    bmiPositionPercent = 92;
  }

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || profile.name,
      goal: goal.trim() || profile.goal,
      age: Number(age) || profile.age,
      height: Number(height) || profile.height,
      weight: Number(weight) || profile.weight,
      targetWeight: Number(targetWeight) || profile.targetWeight,
      gender,
      avatarUrl: selectedAvatar,
    });
    setIsEditModalOpen(false);
  };

  return (
    <div className="profile-page-container">
      {/* ================= STICKY PROFILE PAGE HEADER ================= */}
      <header className="page-header sticky-page-header">
        {/* Upper Left: Back Arrow */}
        <button
          className="page-header-btn page-header-back-btn"
          onClick={closeProfilePage}
          aria-label="Back to dashboard"
          title="Back to dashboard"
        >
          <ArrowLeft size={22} className="header-nav-icon" />
        </button>

        {/* Center: Title */}
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Profile</h1>
          <span className="page-header-sub">Personal Health Hub</span>
        </div>

        {/* Upper Right: Settings Icon */}
        <button
          className="page-header-btn page-header-settings-btn"
          onClick={openSettingsPage}
          aria-label="Open Settings"
          title="Open Settings"
        >
          <Settings size={22} className="header-nav-icon" />
        </button>
      </header>

      {/* ================= PAGE CONTENT ================= */}
      <main className="profile-page-content">
        {/* Hero Profile Card */}
        <section className="profile-hero-card glass-card">
          <div className="profile-header-row">
            {/* Avatar with quick edit trigger */}
            <div
              className="profile-avatar-wrap clickable-avatar-wrap"
              onClick={() => setIsAvatarPickerOpen(true)}
              title="Change Avatar"
              role="button"
              tabIndex={0}
            >
              <div className="profile-avatar">
                {profile.avatarUrl ? (
                  <span className="avatar-preset-emoji">{profile.avatarUrl}</span>
                ) : (
                  <User size={34} className="avatar-icon" />
                )}
              </div>
              <div className="avatar-badge-edit">
                <Camera size={13} />
              </div>
            </div>

            {/* Main Info */}
            <div className="profile-main-info">
              <div className="profile-name-row">
                <h2 className="profile-name">{profile.name}</h2>
                <span className="profile-status-badge">
                  <Sparkles size={11} /> Active Member
                </span>
              </div>
              <span className="profile-tagline">{profile.goal}</span>
              <div className="profile-badges-row">
                <span className="profile-mini-pill">{profile.age} yrs</span>
                <span className="profile-mini-pill">{profile.gender || 'Athletic'}</span>
                <span className="profile-mini-pill">{auth?.email || 'alex.rivera@vitalsync.health'}</span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              className="btn-icon profile-edit-btn"
              onClick={() => {
                setName(profile.name);
                setGoal(profile.goal);
                setAge(String(profile.age));
                setHeight(String(profile.height));
                setWeight(String(profile.weight));
                setTargetWeight(String(profile.targetWeight));
                setGender(profile.gender || 'Athletic');
                setSelectedAvatar(profile.avatarUrl || null);
                setIsEditModalOpen(true);
              }}
              title="Edit Profile"
              aria-label="Edit Profile"
            >
              <Edit2 size={16} />
            </button>
          </div>

          {/* Physical Stats Grid */}
          <div className="profile-stats-grid">
            <div className="p-stat-box">
              <span className="p-stat-label">Weight</span>
              <span className="p-stat-val">{profile.weight} kg</span>
              <span className="p-stat-sub">Target: {profile.targetWeight} kg</span>
            </div>
            <div className="p-stat-box">
              <span className="p-stat-label">Height</span>
              <span className="p-stat-val">{profile.height} cm</span>
              <span className="p-stat-sub">{(profile.height / 30.48).toFixed(1)} ft</span>
            </div>
            <div className="p-stat-box">
              <span className="p-stat-label">BMI</span>
              <span className="p-stat-val" style={{ color: bmiColor }}>{bmi}</span>
              <span className="p-stat-sub" style={{ color: bmiColor }}>{bmiCategory}</span>
            </div>
          </div>

          {/* BMI Visual Gauge */}
          <div className="bmi-gauge-container">
            <div className="bmi-gauge-bar">
              <div className="bmi-section bmi-under" title="Underweight (<18.5)" />
              <div className="bmi-section bmi-normal" title="Normal (18.5 - 24.9)" />
              <div className="bmi-section bmi-over" title="Overweight (25.0 - 29.9)" />
              <div className="bmi-section bmi-obese" title="Obese (≥30.0)" />
              <div
                className="bmi-marker"
                style={{ left: `${Math.min(95, Math.max(5, bmiPositionPercent))}%` }}
                title={`BMI: ${bmi} (${bmiCategory})`}
              />
            </div>
            <div className="bmi-gauge-labels">
              <span>18.5</span>
              <span>25.0</span>
              <span>30.0</span>
            </div>
          </div>
        </section>
      </main>

      {/* ================= EDIT PROFILE MODAL ================= */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            <h3 className="modal-title">Edit Profile</h3>

            <form onSubmit={handleSaveProfile}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Fitness / Health Goal</label>
                <input
                  type="text"
                  className="input-field"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Lean Muscle & Metabolic Health"
                  required
                />
              </div>

              <div className="input-row-grid">
                <div className="input-group">
                  <label className="input-label">Age</label>
                  <input
                    type="number"
                    className="input-field"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="10"
                    max="120"
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Height (cm)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    min="50"
                    max="250"
                    required
                  />
                </div>
              </div>

              <div className="input-row-grid">
                <div className="input-group">
                  <label className="input-label">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= AVATAR PICKER MODAL ================= */}
      {isAvatarPickerOpen && (
        <div className="modal-overlay" onClick={() => setIsAvatarPickerOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            <h3 className="modal-title">Choose Avatar</h3>
            <p className="modal-description">Pick an avatar icon for your profile:</p>

            <div className="preset-avatars-grid">
              <button
                type="button"
                className={`preset-avatar-btn ${selectedAvatar === null ? 'active' : ''}`}
                onClick={() => {
                  setSelectedAvatar(null);
                  updateProfile({ avatarUrl: null });
                  setIsAvatarPickerOpen(false);
                }}
              >
                <User size={24} />
              </button>
              {PRESET_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`preset-avatar-btn ${selectedAvatar === emoji ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedAvatar(emoji);
                    updateProfile({ avatarUrl: emoji });
                    setIsAvatarPickerOpen(false);
                  }}
                >
                  <span className="preset-emoji-text">{emoji}</span>
                </button>
              ))}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => setIsAvatarPickerOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
