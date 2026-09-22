import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  EyeOff,
  FileCheck
} from 'lucide-react';

export default function PrivacyPage() {
  const { closePrivacyPage } = useApp();

  return (
    <div className="settings-page-container privacy-page-container">
      {/* Sticky Top Header */}
      <header className="page-header sticky-page-header">
        <button
          className="page-header-btn page-header-back-btn"
          onClick={closePrivacyPage}
          aria-label="Back to settings"
          title="Back to settings"
        >
          <ArrowLeft size={22} className="header-nav-icon" />
        </button>

        <div className="page-header-title-wrap">
          <h1 className="page-header-title">Privacy Policy</h1>
          <span className="page-header-sub">100% On-Device & Encrypted</span>
        </div>

        <div className="page-header-pill-badge">
          <ShieldCheck size={14} />
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="settings-page-content privacy-page-content">
        {/* Highlight Card */}
        <div className="privacy-highlight-card">
          <div className="privacy-highlight-icon">
            <Lock size={20} className="text-success" />
          </div>
          <div>
            <h3 className="privacy-highlight-title">Your Health Data Stays On Your Device</h3>
            <p className="privacy-highlight-text">
              VitalSync is architected with a privacy-first foundation. None of your biometrics, hydration logs, diet, workouts, or medication schedules are ever transmitted to remote ad servers or third parties.
            </p>
          </div>
        </div>

        {/* Policy Section 1 */}
        <div className="privacy-card">
          <div className="privacy-card-header">
            <Database size={18} className="text-accent" />
            <h4 className="privacy-card-title">1. Local Storage & Client Encryption</h4>
          </div>
          <p className="privacy-card-desc">
            All user profile metrics, meal ingredients, workout routines, and supplement tracking data are stored directly inside your browser’s or device’s local storage engine. VitalSync does not maintain centralized user databases containing your private health records.
          </p>
        </div>

        {/* Policy Section 2 */}
        <div className="privacy-card">
          <div className="privacy-card-header">
            <EyeOff size={18} className="text-warning" />
            <h4 className="privacy-card-title">2. Zero Third-Party Trackers & Ads</h4>
          </div>
          <p className="privacy-card-desc">
            We do not embed third-party analytics pixels, behavioral ad networks, data brokers, or telemetry monitors. Your daily habits and physical journey remain entirely your own.
          </p>
        </div>

        {/* Policy Section 3 */}
        <div className="privacy-card">
          <div className="privacy-card-header">
            <FileCheck size={18} className="text-success" />
            <h4 className="privacy-card-title">3. Absolute Ownership & Data Control</h4>
          </div>
          <p className="privacy-card-desc">
            You retain complete control of your data. You can export your full records at any time as a readable JSON file, or permanently erase your data using the Delete Account option in Settings.
          </p>
        </div>

        {/* Policy Section 4 */}
        <div className="privacy-card">
          <div className="privacy-card-header">
            <ShieldCheck size={18} className="text-care" />
            <h4 className="privacy-card-title">4. HIPAA & GDPR Standards</h4>
          </div>
          <p className="privacy-card-desc">
            Because data processing occurs exclusively on your local client without centralized profiling, our platform exceeds standard international data privacy principles.
          </p>
        </div>

        {/* Back Button Action */}
        <div className="privacy-bottom-action">
          <button className="btn btn-primary privacy-understand-btn" onClick={closePrivacyPage}>
            I Understand & Agree
          </button>
        </div>
      </main>
    </div>
  );
}
