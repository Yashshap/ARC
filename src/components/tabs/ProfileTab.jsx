import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Edit2, Smartphone, Download, Upload, RotateCcw, CheckCircle2, Sun, Moon, Palette, Shield } from 'lucide-react';

export default function ProfileTab() {
  const { data, updateProfile, resetAllData, importData, toggleTheme, setTheme } = useApp();
  const { profile, theme } = data;

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age.toString());
  const [height, setHeight] = useState(profile.height.toString());
  const [weight, setWeight] = useState(profile.weight.toString());
  const [targetWeight, setTargetWeight] = useState(profile.targetWeight.toString());
  const [goal, setGoal] = useState(profile.goal);

  // Android Wrapping Modal State
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  // BMI Calculation
  const heightMeters = (Number(profile.height) || 175) / 100;
  const weightKg = Number(profile.weight) || 70;
  const bmi = (weightKg / (heightMeters * heightMeters)).toFixed(1);

  let bmiCategory = 'Normal weight';
  let bmiColor = '#10b981';
  let bmiPositionPercent = 50;

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

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      age: Number(age) || profile.age,
      height: Number(height) || profile.height,
      weight: Number(weight) || profile.weight,
      targetWeight: Number(targetWeight) || profile.targetWeight,
      goal
    });
    setIsEditProfileOpen(false);
  };

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `arc_winter_health_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJsonText);
      const success = importData(parsed);
      if (success) {
        setIsImportModalOpen(false);
        setImportJsonText('');
        setImportError('');
      } else {
        setImportError('Invalid backup file structure.');
      }
    } catch (err) {
      setImportError('Invalid JSON format. Please verify your backup file.');
    }
  };

  const handleCopyAndroidCommands = () => {
    const commands = `# 1. Build the React web app
npm run build

# 2. Add Android platform (first time only)
npx cap add android

# 3. Copy web assets to Android
npx cap sync android

# 4. Open in Android Studio to run or build APK
npx cap open android`;

    navigator.clipboard.writeText(commands);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="tab-content profile-tab-content">
      {/* User Profile Hero Card */}
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
              <h2 className="profile-name">{profile.name}</h2>
              <span className="profile-tagline">{profile.goal}</span>
              <div className="profile-badges-row">
                <span className="profile-mini-pill">{profile.age} yrs</span>
                <span className="profile-mini-pill">{profile.gender}</span>
              </div>
            </div>

            <button
              className="btn-icon"
              onClick={() => {
                setName(profile.name);
                setAge(profile.age.toString());
                setHeight(profile.height.toString());
                setWeight(profile.weight.toString());
                setTargetWeight(profile.targetWeight.toString());
                setGoal(profile.goal);
                setIsEditProfileOpen(true);
              }}
              title="Edit Profile"
            >
              <Edit2 size={16} />
            </button>
          </div>

          {/* User Physical Stats Grid */}
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

          {/* BMI Scale Bar */}
          <div className="bmi-gauge-container">
            <div className="bmi-gauge-bar">
              <div className="bmi-section bmi-under" />
              <div className="bmi-section bmi-normal" />
              <div className="bmi-section bmi-over" />
              <div className="bmi-section bmi-obese" />
              {/* Indicator Marker */}
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
        </div>
      </div>

      {/* ================= APPEARANCE & THEME TOGGLE ================= */}
      <div className="section-block">
        <div className="section-heading-outside">
          <h3 className="section-outside-title">Appearance</h3>
        </div>
        <div className="theme-toggle-compact-card glass-card">
          <div className="theme-compact-left">
            <div className={`theme-icon-circle ${theme === 'dark' ? 'dark-circle' : 'light-circle'}`}>
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div className="theme-compact-text">
              <span className="theme-compact-title">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              <span className="theme-compact-sub">
                {theme === 'dark' ? 'Deep carbon & neon accents' : 'Crisp white & daylight vibrance'}
              </span>
            </div>
          </div>

          {/* Single iOS-style Toggle Switch */}
          <button
            className={`ios-toggle-switch ${theme === 'dark' ? 'active' : ''}`}
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            role="switch"
            aria-checked={theme === 'dark'}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            <span className="ios-toggle-knob" />
          </button>
        </div>
      </div>

      {/* ================= APP TOOLS & ANDROID BUILD ================= */}
      <div className="section-block">
        <div className="section-heading-outside">
          <h3 className="section-outside-title">App Tools & Android Build</h3>
        </div>

        <div className="tools-card glass-card">
          <button
            className="tool-action-row"
            onClick={() => setIsAndroidModalOpen(true)}
          >
            <div className="tool-icon-wrap android-icon">
              <Smartphone size={20} />
            </div>
            <div className="tool-info">
              <span className="tool-name">Wrap for Android (Capacitor)</span>
              <span className="tool-desc">View step-by-step commands to build APK</span>
            </div>
          </button>

          <div className="tool-divider" />

          <button
            className="tool-action-row"
            onClick={handleExportData}
          >
            <div className="tool-icon-wrap export-icon">
              <Download size={20} />
            </div>
            <div className="tool-info">
              <span className="tool-name">Export Backup (JSON)</span>
              <span className="tool-desc">Save all your logs and routines locally</span>
            </div>
          </button>

          <div className="tool-divider" />

          <button
            className="tool-action-row"
            onClick={() => setIsImportModalOpen(true)}
          >
            <div className="tool-icon-wrap import-icon">
              <Upload size={20} />
            </div>
            <div className="tool-info">
              <span className="tool-name">Restore / Import Data</span>
              <span className="tool-desc">Load backup JSON into your tracker</span>
            </div>
          </button>

          <div className="tool-divider" />

          <button
            className="tool-action-row text-danger"
            onClick={() => {
              if (window.confirm('Reset all tracker data to default state?')) {
                resetAllData();
              }
            }}
          >
            <div className="tool-icon-wrap reset-icon">
              <RotateCcw size={20} />
            </div>
            <div className="tool-info">
              <span className="tool-name">Reset All Data</span>
              <span className="tool-desc">Clear local storage and restore defaults</span>
            </div>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="modal-overlay" onClick={() => setIsEditProfileOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            <h3 className="modal-title">Edit User Profile</h3>

            <form onSubmit={handleProfileSubmit}>
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
                  onClick={() => setIsEditProfileOpen(false)}
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

      {/* Android Capacitor Guide Modal */}
      {isAndroidModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAndroidModalOpen(false)}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            <div className="modal-title-row">
              <div className="brand-icon" style={{ background: '#10b981' }}>
                <Smartphone size={18} />
              </div>
              <h3 className="modal-title">Android App Wrapping Guide</h3>
            </div>

            <p className="modal-description">
              This app is already configured with <strong>Capacitor</strong> and mobile viewport settings. Follow these quick steps to generate your native Android project:
            </p>

            <div className="code-snippet-box">
              <div className="code-snippet-header">
                <span>Terminal Commands</span>
                <button className="btn-text" onClick={handleCopyAndroidCommands}>
                  {copiedCode ? '✓ Copied!' : 'Copy Commands'}
                </button>
              </div>
              <pre className="code-pre">
{`# 1. Build the React web app
npm run build

# 2. Add Android platform (first time only)
npx cap add android

# 3. Copy web assets to Android
npx cap sync android

# 4. Open in Android Studio to run or build APK
npx cap open android`}
              </pre>
            </div>

            <div className="guide-notes">
              <div className="guide-note-item">
                <CheckCircle2 size={16} className="text-success" />
                <span><strong>capacitor.config.json</strong> is already placed at the root of your project.</span>
              </div>
              <div className="guide-note-item">
                <CheckCircle2 size={16} className="text-success" />
                <span>Responsive viewport, safe-area insets, and dark-theme status bar are pre-configured.</span>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setIsAndroidModalOpen(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Data Modal */}
      {isImportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsImportModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            <h3 className="modal-title">Restore / Import Data</h3>
            <p className="modal-description">
              Paste the JSON data from your previous export below:
            </p>

            <form onSubmit={handleImportSubmit}>
              <div className="input-group">
                <textarea
                  className="input-field json-textarea"
                  rows="8"
                  placeholder="Paste JSON here..."
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  required
                />
              </div>

              {importError && (
                <p className="error-text">{importError}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsImportModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Import Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
