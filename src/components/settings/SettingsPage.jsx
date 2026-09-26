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
  Sparkles, Crown,
  Droplets,
  Pill,
  Dumbbell,
  Volume2,
  Flame,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

import PaywallScreen from "../subscription/PaywallScreen";

export default function SettingsPage() {
  const {
    data,
    toggleTheme,
    closeSettingsPage,
    openFaqPage,
    openPrivacyPage,
    toggleFapCounter,
    toggleNotification,
    saveRating,
    logoutUser,
    openAuthModal,
    deleteAccount
  } = useApp();

  const { theme, notifications, userRating, auth } = data;
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

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

        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-title">Subscription</span>
          </div>
          
          <div className="settings-card glass-card" style={{ padding: '16px' }}>
            {data?.subscription?.isPremium ? (
              <div style={{ background: 'linear-gradient(to bottom right, var(--bg-surface), var(--bg-app))', border: '1px solid rgba(250,204,21,0.5)', boxShadow: '0 4px 20px rgba(250,204,21,0.15)', padding: '16px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{position:'absolute', top:0, left:0, right:0, height:'4px', background:'linear-gradient(to right, #facc15, #f97316)'}}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'linear-gradient(to bottom right, #facc15, #f97316)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(250,204,21,0.2)' }}>
                    <Star size={20} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '18px', margin: 0 }}>Premium Member</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>Active • Renews via Google Play</p>
                  </div>
                </div>
                <a 
                  href="https://play.google.com/store/account/subscriptions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', backgroundColor: 'rgba(250,204,21,0.1)', color: '#ca8a04', fontWeight: 'bold', padding: '12px', borderRadius: '12px', fontSize: '14px', textAlign: 'center', textDecoration: 'none', marginTop: '16px', border: '1px solid rgba(250,204,21,0.4)', boxShadow: '0 4px 15px rgba(250,204,21,0.05)' }}
                >
                  <Crown size={16} /> Manage Subscription
                </a>
              </div>
            ) : (
              <div style={{ background: 'linear-gradient(to bottom right, var(--bg-surface), var(--bg-app))', border: '1px solid rgba(250,204,21,0.3)', padding: '16px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(to right, #facc15, #f97316)', opacity: 0.8}}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg-app)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                    <ShieldCheck size={20} color="#eab308" />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', margin: 0, fontSize: '16px' }}>Free Tier</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>Basic tracking unlocked</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPaywallOpen(true)}
                  style={{ width: '100%', background: 'linear-gradient(to right, #eab308, #f97316)', color: 'black', fontWeight: 'bold', padding: '10px', borderRadius: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', marginTop: '12px' }}
                >
                  <Crown size={16} /> Upgrade to Premium
                </button>
              </div>
            )}
          </div>
        </section>


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

        <section className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-title">Account Management</span>
          </div>

          <div className="settings-card glass-card">
            {/* Logout / Switch Account */}
            <button
              className="settings-action-row"
              onClick={() => {
                if (auth?.isLoggedIn) {
                  setIsLogoutModalOpen(true);
                } else {
                  openAuthModal();
                }
              }}
              aria-label={auth?.isLoggedIn ? 'Logout of account' : 'Sign in with Google SSO'}
            >
              <div className="settings-row-left">
                <div className="settings-icon-circle icon-warning">
                  <LogOut size={20} />
                </div>
                <div className="settings-row-text">
                  <span className="settings-row-label">
                    {auth?.isLoggedIn ? 'Logout' : 'Sign In with Google SSO'}
                  </span>
                  <span className="settings-row-sub">
                    {auth?.isLoggedIn ? `Signed in as ${auth.email}` : 'Sign in to access your personal profile'}
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
                : 'Sign in with Google SSO to access your personal member profile.'}
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
                    setIsLogoutModalOpen(false);
                    openAuthModal();
                  }}
                >
                  Sign In with Google SSO
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




      {/* ================= PAYWALL MODAL ================= */}
      {isPaywallOpen && (
        <PaywallScreen onClose={() => setIsPaywallOpen(false)} />
      )}

      {/* ================= PAYWALL MODAL ================= */}
      {isPaywallOpen && (
        <PaywallScreen onClose={() => setIsPaywallOpen(false)} />
      )}
    </div>
  );
}
