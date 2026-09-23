import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Settings,
  User,
  Edit2,
  Camera,
  Sparkles,
  UserCheck,
  ChevronRight,
} from 'lucide-react';

const PRESET_AVATARS = [
  '⚡', '💪', '🏃', '🧘', '💧', '🥗', '🔥', '🎯'
];

export default function ProfilePage() {
  const {
    data,
    updateProfile,
    closeProfilePage,
    openSettingsPage,
    exploreAsGuest,
    triggerGoogleLogin,
  } = useApp();

  const { profile, auth } = data;
  const isLoggedIn = !!auth?.isLoggedIn && !!profile;

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [goal, setGoal] = useState(profile?.goal || 'Health & Fitness Tracking');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [height, setHeight] = useState(profile?.height ? String(profile.height) : '');
  const [weight, setWeight] = useState(profile?.weight ? String(profile.weight) : '');
  const [targetWeight, setTargetWeight] = useState(profile?.targetWeight ? String(profile.targetWeight) : '');
  const [gender, setGender] = useState(profile?.gender || 'Not specified');
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatarUrl || null);

  // Avatar Picker State
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  // BMI Calculation (only if valid height and weight are provided)
  const hasValidMetrics = Number(profile?.height) > 0 && Number(profile?.weight) > 0;
  const heightM = (Number(profile?.height) || 175) / 100;
  const weightKg = Number(profile?.weight) || 70;
  const bmi = hasValidMetrics ? (weightKg / (heightM * heightM)).toFixed(1) : '--';

  let bmiCategory = hasValidMetrics ? 'Normal weight' : 'Add height & weight to calculate';
  let bmiColor = '#10b981';
  let bmiPositionPercent = 50;

  if (hasValidMetrics) {
    const numBmi = Number(bmi);
    if (numBmi < 18.5) {
      bmiCategory = 'Underweight';
      bmiColor = '#38bdf8';
      bmiPositionPercent = 15;
    } else if (numBmi >= 18.5 && numBmi < 25) {
      bmiCategory = 'Normal weight';
      bmiColor = '#10b981';
      bmiPositionPercent = 45;
    } else if (numBmi >= 25 && numBmi < 30) {
      bmiCategory = 'Overweight';
      bmiColor = '#f59e0b';
      bmiPositionPercent = 75;
    } else {
      bmiCategory = 'Obese';
      bmiColor = '#ef4444';
      bmiPositionPercent = 92;
    }
  }

  const handleOpenEditModal = () => {
    setName(profile?.name || '');
    setGoal(profile?.goal || 'Health & Fitness Tracking');
    setAge(profile?.age ? String(profile.age) : '');
    setHeight(profile?.height ? String(profile.height) : '');
    setWeight(profile?.weight ? String(profile.weight) : '');
    setTargetWeight(profile?.targetWeight ? String(profile.targetWeight) : '');
    setGender(profile?.gender || 'Not specified');
    setSelectedAvatar(profile?.avatarUrl || null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || (profile?.name || 'User'),
      goal: goal.trim() || (profile?.goal || 'Health & Fitness Tracking'),
      age: age ? Number(age) : null,
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      targetWeight: targetWeight ? Number(targetWeight) : null,
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
          <span className="page-header-sub">
            {isLoggedIn ? 'Personal Health Hub' : 'Guest Mode'}
          </span>
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
        {!isLoggedIn ? (
          /* ================= GUEST / NOT LOGGED IN VIEW ================= */
          <section className="profile-hero-card glass-card profile-guest-card">
            <div className="guest-hero-header">
              <div className="auth-sparkle-icon" style={{ margin: '0 auto 16px' }}>
                <Sparkles size={24} className="brand-svg text-accent" />
              </div>
              <h2 className="profile-name">No Profile Logged In</h2>
              <p className="profile-tagline" style={{ maxWidth: '320px', margin: '8px auto 20px', lineHeight: 1.5 }}>
                You are currently exploring as a guest. Sign in with Google SSO to access your personal profile, keep your health history safe, and customize your stats.
              </p>
            </div>

            <div className="auth-action-buttons-group">
              <button
                type="button"
                className="btn btn-google-sso"
                onClick={triggerGoogleLogin}
                id="profile-google-login-btn"
              >
                <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google SSO</span>
              </button>

              <button
                type="button"
                className="btn btn-guest-mode"
                onClick={exploreAsGuest}
                id="profile-explore-guest-btn"
              >
                <div className="guest-btn-content">
                  <div className="guest-btn-left">
                    <UserCheck size={18} className="guest-icon" />
                    <div className="guest-text-col">
                      <span className="guest-title">Continue as Guest</span>
                      <span className="guest-sub">Go straight to the Water Tracker</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="guest-arrow" />
                </div>
              </button>
            </div>
          </section>
        ) : (
          /* ================= LOGGED IN PROFILE HERO CARD ================= */
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
                  {profile?.avatarUrl ? (
                    profile.avatarUrl.startsWith('http') || profile.avatarUrl.startsWith('data:') ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="profile-avatar-img" />
                    ) : (
                      <span className="avatar-preset-emoji">{profile.avatarUrl}</span>
                    )
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
                  <h2 className="profile-name">{profile?.name || 'Google User'}</h2>
                  <span className="profile-status-badge">
                    <Sparkles size={11} /> Active Member
                  </span>
                </div>
                <span className="profile-tagline">{profile?.goal || 'Health & Fitness Tracking'}</span>
                <div className="profile-badges-row">
                  {profile?.age && <span className="profile-mini-pill">{profile.age} yrs</span>}
                  {profile?.gender && <span className="profile-mini-pill">{profile.gender}</span>}
                  <span className="profile-mini-pill">{auth?.email || profile?.email || 'Google Account'}</span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                className="btn-icon profile-edit-btn"
                onClick={handleOpenEditModal}
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
                <span className="p-stat-val">
                  {profile?.weight ? `${profile.weight} kg` : '--'}
                </span>
                <span className="p-stat-sub">
                  {profile?.targetWeight ? `Target: ${profile.targetWeight} kg` : 'Target: --'}
                </span>
              </div>
              <div className="p-stat-box">
                <span className="p-stat-label">Height</span>
                <span className="p-stat-val">
                  {profile?.height ? `${profile.height} cm` : '--'}
                </span>
                <span className="p-stat-sub">
                  {profile?.height ? `${(profile.height / 30.48).toFixed(1)} ft` : '--'}
                </span>
              </div>
              <div className="p-stat-box">
                <span className="p-stat-label">BMI</span>
                <span className="p-stat-val" style={{ color: bmiColor }}>{bmi}</span>
                <span className="p-stat-sub" style={{ color: bmiColor }}>{bmiCategory}</span>
              </div>
            </div>

            {/* BMI Visual Gauge (if metrics available) */}
            {hasValidMetrics && (
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
            )}
          </section>
        )}
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
                  placeholder="Your Name"
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
                    placeholder="e.g. 25"
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
                    placeholder="e.g. 175"
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
                    placeholder="e.g. 70"
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
                    placeholder="e.g. 68"
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
