import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  BellRing,
  Star,
  ShieldCheck,
  HelpCircle,
  LogOut,
  Trash2,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Droplets,
  Pill,
  Dumbbell,
  Volume2,
  MessageSquare,
  Search,
  ExternalLink,
  Lock,
  ChevronDown
} from 'lucide-react';

export default function SettingsPage() {
  const {
    data,
    toggleTheme,
    closeSettingsPage,
    toggleNotification,
    saveRating,
    logoutUser,
    loginUser,
    deleteAccount
  } = useApp();

  const { theme, notifications, userRating, auth } = data;

  // Modals state
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState(userRating?.stars || 5);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [selectedFeedbackTags, setSelectedFeedbackTags] = useState(userRating?.tags || []);
  const [reviewComment, setReviewComment] = useState(userRating?.comment || '');
  const [rateSubmittedToast, setRateSubmittedToast] = useState(false);

  // Q&A / FAQ Modal state
  const [isQAModalOpen, setIsQAModalOpen] = useState(false);
  const [qaSearch, setQaSearch] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState('faq-1');

  // Privacy Policy Modal state
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

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

  // Q&A data
  const faqItems = [
    {
      id: 'faq-1',
      category: 'Water & Hydration',
      question: 'How is my daily water intake target calculated?',
      answer: 'Your recommended target is initialized based on standard metabolic hydration guidelines (~30-35ml per kg of body weight). You can easily adjust your daily target goal at any time in the Water tab by tapping on the Target badge.'
    },
    {
      id: 'faq-2',
      category: 'Diet & Macros',
      question: 'How do custom meals calculate calories and macros?',
      answer: 'When you create a custom meal or recipe in the Diet tab, VitalSync calculates the combined protein, carbohydrates, fats, and total calories in real time. Saved meals can then be logged with a single tap whenever you eat.'
    },
    {
      id: 'faq-3',
      category: 'Workouts & TUT',
      question: 'What is TUT (Time Under Tension) in the workout tracker?',
      answer: 'TUT measures the duration muscles spend under resistance during each set. Tracking TUT along with rest periods optimizes hypertrophy and muscular endurance by ensuring you achieve the required stimulus.'
    },
    {
      id: 'faq-4',
      category: 'Medication & Care',
      question: 'How does pill adherence and the 30-day heatmap work?',
      answer: 'The Care & Pills tab tracks your daily adherence rate based on scheduled doses. The heatmap displays your consistency over the past 30 days (Green for taken, Gray for missed, Yellow for pending today) so you never miss critical supplements.'
    },
    {
      id: 'faq-5',
      category: 'Privacy & Storage',
      question: 'Where is my health and biometric data stored?',
      answer: 'VitalSync is engineered with an offline-first, client-side architecture. 100% of your biometric stats, routine logs, and medications remain encrypted on your device via HTML5 Local Storage. We never sell or transmit your personal data.'
    },
    {
      id: 'faq-6',
      category: 'Data Backup',
      question: 'How do I transfer my data to a new device?',
      answer: 'Go to your Profile tab and click "Export Backup (JSON)". This generates a secure JSON backup of your records that you can transfer to your other device and restore via "Restore / Import Data".'
    },
    {
      id: 'faq-7',
      category: 'Notifications',
      question: 'How do notifications work in offline/web app mode?',
      answer: 'Notifications utilize standard Web Notifications and Android Capacitor Local Notification channels when running as an APK. You can toggle specific notification categories right here in Settings.'
    }
  ];

  const filteredFaqs = faqItems.filter(item =>
    item.question.toLowerCase().includes(qaSearch.toLowerCase()) ||
    item.answer.toLowerCase().includes(qaSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(qaSearch.toLowerCase())
  );

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

        {/* ================= 3. ENGAGEMENT & INFORMATION ================= */}
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
              onClick={() => setIsQAModalOpen(true)}
              aria-label="Open Frequently Asked Questions"
            >
              <div className="settings-row-left">
                <div className="settings-icon-circle icon-info">
                  <HelpCircle size={20} />
                </div>
                <div className="settings-row-text">
                  <span className="settings-row-label">Q and A</span>
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
              onClick={() => setIsPrivacyModalOpen(true)}
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

      {/* ================= Q AND A (FAQ) MODAL ================= */}
      {isQAModalOpen && (
        <div className="modal-overlay" onClick={() => setIsQAModalOpen(false)}>
          <div className="modal-content modal-content-large qa-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />

            <div className="qa-modal-header">
              <div className="brand-icon icon-info-bg">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="modal-title">Questions & Answers</h3>
                <p className="modal-description">Everything you need to know about VitalSync</p>
              </div>
            </div>

            {/* Search Filter */}
            <div className="qa-search-box">
              <Search size={16} className="qa-search-icon" />
              <input
                type="text"
                className="qa-search-input"
                placeholder="Search questions (e.g. water, macros, pills)..."
                value={qaSearch}
                onChange={(e) => setQaSearch(e.target.value)}
              />
              {qaSearch && (
                <button className="qa-search-clear" onClick={() => setQaSearch('')}>
                  ×
                </button>
              )}
            </div>

            {/* Accordion List */}
            <div className="qa-accordion-list">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;
                  return (
                    <div key={faq.id} className={`qa-accordion-item ${isExpanded ? 'expanded' : ''}`}>
                      <button
                        className="qa-accordion-trigger"
                        onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                        aria-expanded={isExpanded}
                      >
                        <div className="qa-trigger-left">
                          <span className="qa-category-pill">{faq.category}</span>
                          <span className="qa-question-text">{faq.question}</span>
                        </div>
                        <ChevronDown size={18} className={`qa-chevron ${isExpanded ? 'rotate' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="qa-accordion-body">
                          <p className="qa-answer-text">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="qa-empty-state">
                  <p>No questions found matching "{qaSearch}".</p>
                  <button className="btn btn-secondary btn-sm" onClick={() => setQaSearch('')}>
                    Reset Search
                  </button>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setIsQAModalOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRIVACY POLICY MODAL ================= */}
      {isPrivacyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPrivacyModalOpen(false)}>
          <div className="modal-content modal-content-large privacy-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />

            <div className="privacy-modal-header">
              <div className="brand-icon icon-shield-bg">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="modal-title">Privacy Policy</h3>
                <span className="privacy-updated-text">Updated: September 2026 • 100% On-Device</span>
              </div>
            </div>

            <div className="privacy-scroll-body">
              <div className="privacy-highlight-card">
                <Lock size={18} className="text-success" />
                <p>
                  <strong>Your health data stays on your device.</strong> VitalSync is designed with privacy-first principles. None of your biometrics, hydration logs, diet, workouts, or pill records are uploaded to remote ad servers.
                </p>
              </div>

              <div className="privacy-section-item">
                <h4 className="privacy-subtitle">1. Data Storage & Encryption</h4>
                <p>
                  All user profile metrics, meal ingredients, workout routines, and supplement tracking data are stored locally in your browser’s encrypted client-side storage engine. No remote server has access to your health database.
                </p>
              </div>

              <div className="privacy-section-item">
                <h4 className="privacy-subtitle">2. Zero Third-Party Tracking</h4>
                <p>
                  VitalSync does not use behavioral advertising networks, tracking cookies, analytics pixels, or data brokers. Your habits and routines are entirely confidential.
                </p>
              </div>

              <div className="privacy-section-item">
                <h4 className="privacy-subtitle">3. Data Ownership & Portability</h4>
                <p>
                  You own 100% of your data. You can export your full health records at any time as a readable JSON file via the Profile page, or completely wipe your data using the Delete Account option.
                </p>
              </div>

              <div className="privacy-section-item">
                <h4 className="privacy-subtitle">4. HIPAA & GDPR Philosophy</h4>
                <p>
                  Because data processing occurs strictly on your device without centralized profiling, your personal medical privacy and confidentiality meet the most stringent international data standards.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setIsPrivacyModalOpen(false)}
              >
                I Understand
              </button>
            </div>
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

    </div>
  );
}
