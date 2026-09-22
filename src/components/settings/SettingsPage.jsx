import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  Star,
  ShieldCheck,
  HelpCircle,
  LogOut,
  Trash2,
  ChevronRight,
  Sparkles,
  Droplets,
  Pill,
  Dumbbell,
  Volume2,
  Flame,
  AlertTriangle,
  Crown,
  CreditCard,
  Receipt,
  History,
  ChevronDown,
  Check,
  CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
  const {
    data,
    toggleTheme,
    closeSettingsPage,
    openFaqPage,
    openPrivacyPage,
    toggleFapCounter,
    switchSubscriptionPlan,
    toggleNotification,
    saveRating,
    logoutUser,
    loginUser,
    deleteAccount
  } = useApp();

  const { theme, notifications, userRating, auth, subscription } = data;

  // Subscription Modal state
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isPlanHistoryExpanded, setIsPlanHistoryExpanded] = useState(false);

  // Modals state
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState(userRating?.stars || 5);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [selectedFeedbackTags, setSelectedFeedbackTags] = useState(userRating?.tags || []);
  const [reviewComment, setReviewComment] = useState(userRating?.comment || '');
  const [rateSubmittedToast, setRateSubmittedToast] = useState(false);

  // Logout Modal state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Delete Account Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Rating compliment tags
  const feedbackTags = [
    'Super Clean UI',
    'Accurate Macro Tracker',
    'Great Water Logging',
    'Effective Pill Reminders',
    'Smooth & Fast',
    'Loved TUT Workout Timer',
    'Helpful Daily Habits'
  ];

  const handleToggleTag = (tag) => {
    if (selectedFeedbackTags.includes(tag)) {
      setSelectedFeedbackTags(selectedFeedbackTags.filter(t => t !== tag));
    } else {
      setSelectedFeedbackTags([...selectedFeedbackTags, tag]);
    }
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    saveRating({
      stars: selectedStars,
      tags: selectedFeedbackTags,
      comment: reviewComment.trim()
    });
    setRateSubmittedToast(true);
    setTimeout(() => {
      setRateSubmittedToast(false);
      setIsRateModalOpen(false);
    }, 1200);
  };

  const handleConfirmLogout = () => {
    logoutUser();
    setIsLogoutModalOpen(false);
  };

  const handleConfirmDeleteAccount = () => {
    deleteAccount();
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="settings-page-container">
      {/* ================= STICKY SETTINGS HEADER ================= */}
      <header className="page-header sticky-page-header">
        {/* Upper Left: Back Arrow returning to Profile Page */}
        <button
          className="page-header-btn page-header-back-btn"
          onClick={closeSettingsPage}
          aria-label="Back to profile"
          title="Back to profile"
        >
          <ArrowLeft size={22} className="header-nav-icon" />
        </button>

        {/* Center: Title */}
        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Settings</h1>
          <span className="page-header-sub">Preferences & Controls</span>
        </div>

        {/* Upper Right: Version indicator */}
        <div className="page-header-pill-badge">
          v1.2.0
        </div>
      </header>

      {/* ================= SETTINGS CONTENT ================= */}
      <main className="settings-page-content">

        {/* ================= 1. THEME SECTION ================= */}
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-title">Appearance</span>
          </div>

          <div className="settings-card glass-card">
            <div className="settings-row">
              <div className="settings-row-left">
                <div className={`settings-icon-circle ${theme === 'dark' ? 'icon-dark' : 'icon-light'}`}>
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div className="settings-row-text">
                  <span className="settings-row-label">Theme</span>
                  <span className="settings-row-sub">
                    {theme === 'dark' ? 'Dark Carbon (High Contrast)' : 'Light Daylight (Clean Crisp)'}
                  </span>
                </div>
              </div>

              {/* Theme Segmented Switch */}
              <button
                className={`ios-toggle-switch ${theme === 'dark' ? 'active' : ''}`}
                onClick={toggleTheme}
                role="switch"
                aria-checked={theme === 'dark'}
                aria-label="Toggle dark/light theme"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                <span className="ios-toggle-knob" />
              </button>
            </div>
          </div>
        </section>

        {/* ================= 2. NOTIFICATIONS SECTION ================= */}
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-title">Notifications</span>
          </div>

          <div className="settings-card glass-card">
            {/* Master Notification Toggle */}
            <div className="settings-row">
              <div className="settings-row-left">
                <div className={`settings-icon-circle ${notifications?.enabled ? 'icon-primary' : 'icon-muted'}`}>
                  <Bell size={20} />
                </div>
                <div className="settings-row-text">
                  <span className="settings-row-label">Enable Notifications</span>
                  <span className="settings-row-sub">
                    {notifications?.enabled ? 'Active reminders for daily habits' : 'All app notifications paused'}
                  </span>
                </div>
              </div>

              {/* Master Switch */}
              <button
                className={`ios-toggle-switch ${notifications?.enabled ? 'active' : ''}`}
                onClick={() => toggleNotification('enabled')}
                role="switch"
                aria-checked={!!notifications?.enabled}
                aria-label="Toggle notifications master switch"
                title="Toggle all notifications"
              >
                <span className="ios-toggle-knob" />
              </button>
            </div>

            {/* Sub-Notification Switches (Visible when enabled) */}
            {notifications?.enabled && (
              <div className="settings-sub-group">
                <div className="settings-divider" />

                {/* Hydration Alert */}
                <div className="settings-sub-row">
                  <div className="settings-sub-left">
                    <Droplets size={16} className="text-water" />
                    <span>Hydration Reminders (Hourly)</span>
                  </div>
                  <button
                    className={`ios-toggle-switch toggle-compact ${notifications?.hydration ? 'active' : ''}`}
                    onClick={() => toggleNotification('hydration')}
                    role="switch"
                    aria-checked={!!notifications?.hydration}
                    aria-label="Toggle hydration reminders"
                  >
                    <span className="ios-toggle-knob" />
                  </button>
                </div>

                {/* Pills Alert */}
                <div className="settings-sub-row">
                  <div className="settings-sub-left">
                    <Pill size={16} className="text-care" />
                    <span>Medication & Pill Schedules</span>
                  </div>
                  <button
                    className={`ios-toggle-switch toggle-compact ${notifications?.medications ? 'active' : ''}`}
                    onClick={() => toggleNotification('medications')}
                    role="switch"
                    aria-checked={!!notifications?.medications}
                    aria-label="Toggle pill schedules"
                  >
                    <span className="ios-toggle-knob" />
                  </button>
                </div>

                {/* Workout Alert */}
                <div className="settings-sub-row">
                  <div className="settings-sub-left">
                    <Dumbbell size={16} className="text-workout" />
                    <span>Daily Workout Motivation</span>
                  </div>
                  <button
                    className={`ios-toggle-switch toggle-compact ${notifications?.workouts ? 'active' : ''}`}
                    onClick={() => toggleNotification('workouts')}
                    role="switch"
                    aria-checked={!!notifications?.workouts}
                    aria-label="Toggle workout reminders"
                  >
                    <span className="ios-toggle-knob" />
                  </button>
                </div>

                {/* Sound & Haptics */}
                <div className="settings-sub-row">
                  <div className="settings-sub-left">
                    <Volume2 size={16} className="text-accent" />
                    <span>Sound & Haptic Feedback</span>
                  </div>
                  <button
                    className={`ios-toggle-switch toggle-compact ${notifications?.sound ? 'active' : ''}`}
                    onClick={() => toggleNotification('sound')}
                    role="switch"
                    aria-checked={!!notifications?.sound}
                    aria-label="Toggle sound and haptics"
                  >
                    <span className="ios-toggle-knob" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= 3. HABITS & TRACKERS ================= */}
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-title">Habits & Trackers</span>
          </div>

          <div className="settings-card glass-card">
            <div className="settings-row">
              <div className="settings-row-left">
                <div className={`settings-icon-circle ${data?.fapCounterEnabled ? 'icon-flame-active' : 'icon-muted'}`}>
                  <Flame size={20} />
                </div>
                <div className="settings-row-text">
                  <span className="settings-row-label">Fap Counter</span>
                  <span className="settings-row-sub">
                    {data?.fapCounterEnabled
                      ? 'Streak & discipline tracking active'
                      : 'Enable habit streak & abstinence tracking'}
                  </span>
                </div>
              </div>

              {/* Fap Counter Switch */}
              <button
                className={`ios-toggle-switch ${data?.fapCounterEnabled ? 'active' : ''}`}
                onClick={toggleFapCounter}
                role="switch"
                aria-checked={!!data?.fapCounterEnabled}
                aria-label="Toggle Fap Counter habit tracker"
                title="Toggle Fap Counter"
              >
                <span className="ios-toggle-knob" />
              </button>
            </div>
          </div>
        </section>

        {/* ================= 4. SUBSCRIPTION & MEMBERSHIP ================= */}
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-title">Subscription & Membership</span>
          </div>

          <div className="settings-card glass-card">
            <button
              className="settings-action-row subscription-action-row"
              onClick={() => setIsSubscriptionModalOpen(true)}
              aria-label="Manage Subscription"
            >
              <div className="settings-row-left">
                <div className={`settings-icon-circle ${subscription?.plan === 'pro' ? 'icon-pro-gold' : 'icon-free-tier'}`}>
                  <Crown size={20} />
                </div>
                <div className="settings-row-text">
                  <div className="subscription-card-title-row">
                    <span className="settings-row-label">Subscription</span>
                    <span className={`plan-badge-pill ${subscription?.plan === 'pro' ? 'badge-pro-gradient' : 'badge-free-pill'}`}>
                      {subscription?.plan === 'pro' ? 'PRO MEMBER' : 'FREE TIER'}
                    </span>
                  </div>
                  <span className="settings-row-sub">
                    {subscription?.plan === 'pro'
                      ? `Active • ${subscription?.price || '$9.99/mo'} (Renews ${subscription?.renewalDate || 'Oct 15, 2026'})`
                      : 'Free Plan • Tap to view payment & plan history'}
                  </span>
                </div>
              </div>
              <div className="settings-row-right">
                <ChevronRight size={18} className="chevron-icon" />
              </div>
            </button>
          </div>
        </section>

        {/* ================= 5. ENGAGEMENT & INFORMATION ================= */}
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-title">Support & Community</span>
          </div>

          <div className="settings-card glass-card">
            {/* Rate App */}
            <button
              className="settings-action-row"
              onClick={() => setIsRateModalOpen(true)}
              aria-label="Rate VitalSync App"
            >
              <div className="settings-row-left">
                <div className="settings-icon-circle icon-gold">
                  <Star size={20} />
                </div>
                <div className="settings-row-text">
                  <span className="settings-row-label">Rate App</span>
                  <span className="settings-row-sub">
                    {userRating ? `Rated ${userRating.stars} Stars ★ - Thank you!` : 'Share feedback and rate your experience'}
                  </span>
                </div>
              </div>
              <div className="settings-row-right">
                {userRating && (
                  <span className="settings-badge-success">
                    {userRating.stars} ★
                  </span>
                )}
                <ChevronRight size={18} className="chevron-icon" />
              </div>
            </button>

            <div className="settings-divider" />

            {/* Q and A */}
            <button
              className="settings-action-row"
              onClick={openFaqPage}
              aria-label="Open Frequently Asked Questions"
            >
              <div className="settings-row-left">
                <div className="settings-icon-circle icon-info">
                  <HelpCircle size={20} />
                </div>
                <div className="settings-row-text">
                  <span className="settings-row-label">FAQ</span>
                  <span className="settings-row-sub">Frequently asked questions & feature guides</span>
                </div>
              </div>
              <div className="settings-row-right">
                <ChevronRight size={18} className="chevron-icon" />
              </div>
            </button>

            <div className="settings-divider" />

            {/* Privacy Policy */}
            <button
              className="settings-action-row"
              onClick={openPrivacyPage}
              aria-label="View Privacy Policy"
            >
              <div className="settings-row-left">
                <div className="settings-icon-circle icon-shield">
                  <ShieldCheck size={20} />
                </div>
                <div className="settings-row-text">
                  <span className="settings-row-label">Privacy Policy</span>
                  <span className="settings-row-sub">100% on-device data safety & zero trackers</span>
                </div>
              </div>
              <div className="settings-row-right">
                <ChevronRight size={18} className="chevron-icon" />
              </div>
            </button>
          </div>
        </section>

        {/* ================= 4. ACCOUNT ACTIONS ================= */}
        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-title">Account Management</span>
          </div>

          <div className="settings-card glass-card">
            {/* Logout */}
            <button
              className="settings-action-row"
              onClick={() => setIsLogoutModalOpen(true)}
              aria-label="Logout of account"
            >
              <div className="settings-row-left">
                <div className="settings-icon-circle icon-warning">
                  <LogOut size={20} />
                </div>
                <div className="settings-row-text">
                  <span className="settings-row-label">
                    {auth?.isLoggedIn ? 'Logout' : 'Log In / Switch Account'}
                  </span>
                  <span className="settings-row-sub">
                    {auth?.isLoggedIn ? `Signed in as ${auth.email}` : 'Sign in to access synchronized profile'}
                  </span>
                </div>
              </div>
              <div className="settings-row-right">
                <ChevronRight size={18} className="chevron-icon" />
              </div>
            </button>

            <div className="settings-divider" />

            {/* Delete Account */}
            <button
              className="settings-action-row danger-action-row"
              onClick={() => {
                setDeleteConfirmText('');
                setIsDeleteModalOpen(true);
              }}
              aria-label="Delete Account and all data"
            >
              <div className="settings-row-left">
                <div className="settings-icon-circle icon-danger">
                  <Trash2 size={20} />
                </div>
                <div className="settings-row-text">
                  <span className="settings-row-label text-danger">Delete Account</span>
                  <span className="settings-row-sub">
                    Permanently wipe all health records and settings
                  </span>
                </div>
              </div>
              <div className="settings-row-right">
                <ChevronRight size={18} className="chevron-icon text-danger" />
              </div>
            </button>
          </div>
        </section>

      </main>

      {/* ================= RATE APP MODAL ================= */}
      {isRateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRateModalOpen(false)}>
          <div className="modal-content modal-content-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />

            <div className="rate-modal-header">
              <div className="rate-icon-glow">
                <Sparkles size={28} className="text-warning" />
              </div>
              <h3 className="modal-title">Rate VitalSync</h3>
              <p className="modal-description">
                Your review fuels future features and updates!
              </p>
            </div>

            <form onSubmit={handleRatingSubmit}>
              {/* Interactive Star Rating */}
              <div className="stars-picker-row">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoveredStars || selectedStars) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${isFilled ? 'star-filled' : ''}`}
                      onMouseEnter={() => setHoveredStars(star)}
                      onMouseLeave={() => setHoveredStars(0)}
                      onClick={() => setSelectedStars(star)}
                      aria-label={`${star} Star`}
                    >
                      <Star size={36} fill={isFilled ? '#f59e0b' : 'none'} color={isFilled ? '#f59e0b' : '#64748b'} />
                    </button>
                  );
                })}
              </div>
              <div className="star-rating-label">
                {selectedStars === 5 && '🌟 Extraordinary! Love it!'}
                {selectedStars === 4 && '✨ Really Good & Helpful!'}
                {selectedStars === 3 && '👍 Good, with room to grow.'}
                {selectedStars === 2 && '⚠️ Needs improvement.'}
                {selectedStars === 1 && '👎 Not satisfied.'}
              </div>

              {/* Feedback Tags */}
              <div className="feedback-tags-section">
                <span className="feedback-tags-title">What do you like most?</span>
                <div className="feedback-chips-grid">
                  {feedbackTags.map((tag) => {
                    const isSelected = selectedFeedbackTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`feedback-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleTag(tag)}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment text area */}
              <div className="input-group">
                <label className="input-label">Tell us more (Optional)</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Share what habits you achieved or what features you'd like added next..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              {rateSubmittedToast && (
                <div className="rate-success-toast">
                  <CheckCircle2 size={18} />
                  <span>Thank you! Your rating has been saved.</span>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsRateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ================= LOGOUT MODAL ================= */}
      {isLogoutModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLogoutModalOpen(false)}>
          <div className="modal-content modal-content-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />

            <div className="logout-icon-wrap">
              <LogOut size={32} className="text-warning" />
            </div>

            <h3 className="modal-title">
              {auth?.isLoggedIn ? 'Log Out of VitalSync?' : 'Sign In'}
            </h3>
            <p className="modal-description">
              {auth?.isLoggedIn
                ? 'Your local logs and routines will remain safely preserved on this device. You can log back in at any time.'
                : 'Sign in to access your personal member profile.'}
            </p>

            {auth?.isLoggedIn ? (
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsLogoutModalOpen(false)}
                >
                  Stay Signed In
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-warning-style"
                  onClick={handleConfirmLogout}
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsLogoutModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    loginUser();
                    setIsLogoutModalOpen(false);
                  }}
                >
                  Sign In (Alex Rivera)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= DELETE ACCOUNT MODAL ================= */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content modal-content-centered delete-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />

            <div className="delete-icon-wrap">
              <AlertTriangle size={32} className="text-danger" />
            </div>

            <h3 className="modal-title text-danger">Delete Account & Wipe Data</h3>
            <p className="modal-description">
              This action is <strong>permanent and irreversible</strong>. All your water logs, meal history, workout routines, pill schedules, and custom settings will be completely deleted.
            </p>

            <div className="delete-confirm-box">
              <label className="input-label">Type <strong>DELETE</strong> to confirm:</label>
              <input
                type="text"
                className="input-field delete-input"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                onClick={handleConfirmDeleteAccount}
              >
                Permanently Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBSCRIPTION MODAL SHEET ================= */}
      {isSubscriptionModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSubscriptionModalOpen(false)}>
          <div className="modal-content modal-content-large subscription-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />

            <div className="subscription-modal-header">
              <div className={`brand-icon ${subscription?.plan === 'pro' ? 'icon-pro-badge-bg' : 'icon-free-badge-bg'}`}>
                <Crown size={22} />
              </div>
              <div>
                <h3 className="modal-title">Subscription & Billing</h3>
                <span className="subscription-status-sub">
                  Current Status:{' '}
                  <strong className={subscription?.plan === 'pro' ? 'text-gold' : 'text-accent'}>
                    {subscription?.plan === 'pro' ? 'Active Pro Membership' : 'Active Free Tier'}
                  </strong>
                </span>
              </div>
            </div>

            <div className="subscription-scroll-body">
              {/* CURRENT ACTIVE PLAN HERO CARD */}
              <div className={`current-plan-card ${subscription?.plan === 'pro' ? 'plan-card-pro' : 'plan-card-free'}`}>
                <div className="current-plan-top">
                  <div className="current-plan-info">
                    <span className="current-plan-tag">Current Plan</span>
                    <h4 className="current-plan-name">
                      {subscription?.plan === 'pro' ? 'VitalSync Pro' : 'VitalSync Free Tier'}
                    </h4>
                    <span className="current-plan-price">
                      {subscription?.plan === 'pro' ? '$9.99 / month' : '$0.00 / forever'}
                    </span>
                  </div>
                  <div className={`plan-status-pill ${subscription?.plan === 'pro' ? 'status-pill-pro' : 'status-pill-free'}`}>
                    {subscription?.plan === 'pro' ? '★ PRO ACTIVE' : 'FREE TIER'}
                  </div>
                </div>

                <div className="current-plan-meta">
                  <div className="plan-meta-item">
                    <span className="meta-label">Billing Cycle</span>
                    <span className="meta-val">{subscription?.plan === 'pro' ? 'Monthly' : 'None'}</span>
                  </div>
                  <div className="plan-meta-item">
                    <span className="meta-label">Renewal Date</span>
                    <span className="meta-val">{subscription?.renewalDate || 'Oct 15, 2026'}</span>
                  </div>
                  <div className="plan-meta-item">
                    <span className="meta-label">Payment Method</span>
                    <span className="meta-val">{subscription?.plan === 'pro' ? 'Apple Pay (•••• 4242)' : 'None'}</span>
                  </div>
                </div>

                {/* Plan Features Checklist */}
                <div className="plan-perks-list">
                  <span className="perks-title">Included in your plan:</span>
                  {subscription?.plan === 'pro' ? (
                    <ul className="perks-items">
                      <li><Check size={14} className="text-success" /> Unlimited Custom Macro Recipes & Nutrition Breakdown</li>
                      <li><Check size={14} className="text-success" /> Advanced TUT (Time Under Tension) Workout Engine</li>
                      <li><Check size={14} className="text-success" /> Medication & Skincare Adherence Heatmaps</li>
                      <li><Check size={14} className="text-success" /> Fap Counter Discipline Streak & Focus Tracking</li>
                      <li><Check size={14} className="text-success" /> 100% Encrypted Local Storage with Zero Ads</li>
                    </ul>
                  ) : (
                    <ul className="perks-items">
                      <li><Check size={14} className="text-success" /> Daily Water Intake & Hydration Tracker</li>
                      <li><Check size={14} className="text-success" /> Standard Workout Plan & Exercise Logging</li>
                      <li><Check size={14} className="text-success" /> Basic Medication Reminders</li>
                      <li className="perk-muted">✕ Advanced Macro Recipes (Pro feature)</li>
                      <li className="perk-muted">✕ TUT Resistance Timer (Pro feature)</li>
                    </ul>
                  )}
                </div>

                {/* Interactive Plan Switcher Button */}
                <div className="plan-switch-action">
                  <button
                    type="button"
                    className={`btn btn-sm ${subscription?.plan === 'pro' ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => switchSubscriptionPlan(subscription?.plan === 'pro' ? 'free' : 'pro')}
                  >
                    {subscription?.plan === 'pro' ? 'Switch to Free Plan (Demo)' : 'Upgrade to Pro ($9.99/mo)'}
                  </button>
                </div>
              </div>

              {/* PAYMENT HISTORY SECTION */}
              <div className="subscription-section-block">
                <div className="section-block-header">
                  <div className="section-title-with-icon">
                    <Receipt size={18} className="text-accent" />
                    <h4 className="section-block-title">Payment History</h4>
                  </div>
                  <span className="section-block-badge">
                    {subscription?.paymentHistory?.length || 0} Invoices
                  </span>
                </div>

                <div className="payment-history-list">
                  {subscription?.paymentHistory && subscription.paymentHistory.length > 0 ? (
                    subscription.paymentHistory.map((inv) => (
                      <div key={inv.id} className="payment-history-item">
                        <div className="payment-item-left">
                          <div className="payment-item-icon">
                            <CreditCard size={16} />
                          </div>
                          <div className="payment-item-details">
                            <span className="payment-plan-name">{inv.plan || 'VitalSync Pro Monthly'}</span>
                            <span className="payment-meta-sub">
                              {inv.date} • {inv.id} • {inv.method}
                            </span>
                          </div>
                        </div>
                        <div className="payment-item-right">
                          <span className="payment-amount">{inv.amount}</span>
                          <span className="payment-status-badge status-paid">{inv.status}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="payment-empty-box">
                      <p>No billing invoices found.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PLAN / SUBSCRIPTION HISTORY (COLLAPSABLE) */}
              <div className="subscription-section-block plan-history-collapsible-block">
                <button
                  type="button"
                  className="section-collapsible-trigger"
                  onClick={() => setIsPlanHistoryExpanded(prev => !prev)}
                  aria-expanded={isPlanHistoryExpanded}
                >
                  <div className="section-title-with-icon">
                    <History size={18} className="text-gold" />
                    <div className="collapsible-title-wrap">
                      <h4 className="section-block-title">Subscription & Plan History</h4>
                      <span className="collapsible-subtitle">
                        {isPlanHistoryExpanded
                          ? 'Tap to collapse'
                          : `${subscription?.planHistory?.length || 3} recorded transitions • Tap to expand`}
                      </span>
                    </div>
                  </div>
                  <div className="collapsible-chevron-wrap">
                    <ChevronDown size={18} className={`collapsible-chevron ${isPlanHistoryExpanded ? 'rotate' : ''}`} />
                  </div>
                </button>

                {isPlanHistoryExpanded && (
                  <div className="plan-history-expanded-body">
                    <div className="plan-history-timeline">
                      {subscription?.planHistory?.map((item, idx) => (
                        <div key={item.id || idx} className="timeline-node">
                          <div className="timeline-bullet-wrap">
                            <div className={`timeline-bullet ${item.status === 'Active' ? 'bullet-active' : 'bullet-done'}`} />
                            {idx < subscription.planHistory.length - 1 && <div className="timeline-line" />}
                          </div>
                          <div className="timeline-content-card">
                            <div className="timeline-row-head">
                              <span className="timeline-plan-title">{item.planName}</span>
                              <span className={`timeline-status-pill ${item.status === 'Active' ? 'pill-active' : 'pill-past'}`}>
                                {item.status}
                              </span>
                            </div>
                            <span className="timeline-period-text">{item.period}</span>
                            <div className="timeline-footer-row">
                              <span className="timeline-price">{item.price}</span>
                              <span className="timeline-notes">{item.notes}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setIsSubscriptionModalOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
