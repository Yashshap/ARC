import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Database,
  EyeOff,
  FileCheck,
  UserCheck,
  AlertTriangle,
  Mail
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
          <h1 className="page-header-title">Privacy & Legal Policy</h1>
          <span className="page-header-sub">Effective Date: September 26, 2026</span>
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
              VitalSync (ARC) is built with a local-first privacy architecture. Your biometrics, hydration logs, diet & micronutrient entries, workouts, and supplement reminders are stored locally on your device and are never sold or transmitted to ad networks or data brokers.
            </p>
          </div>
        </div>

        {/* Policy Section 1: Medical & Nutritional Disclaimer */}
        <div className="privacy-card">
          <div className="privacy-card-header">
            <AlertTriangle size={18} className="text-warning" />
            <h4 className="privacy-card-title">1. Medical & Nutritional Disclaimer</h4>
          </div>
          <p className="privacy-card-desc">
            VitalSync (ARC) is intended strictly for general fitness, nutrition logging, hydration tracking, and personal wellness informational purposes. It is <strong>not a medical device</strong> and does not provide medical advice, clinical diagnosis, or treatment. BMI estimates, calorie/macronutrient targets, micronutrient RDA percentages, and supplement reminders are informational estimates only. Always consult a qualified physician or registered dietitian before making changes to your diet, medication/supplement schedule, or exercise routine.
          </p>
        </div>

        {/* Policy Section 2: Local Storage & Android Auto-Backup */}
        <div className="privacy-card">
          <div className="privacy-card-header">
            <Database size={18} className="text-accent" />
            <h4 className="privacy-card-title">2. Local Storage & Device Auto-Backup</h4>
          </div>
          <p className="privacy-card-desc">
            All profile metrics, logged meals, custom recipes, workout plans, and skincare/supplement schedules are stored locally in your device’s IndexedDB database and internal app sandbox. On Android devices, standard Android Auto-Backup (`allowBackup`) may back up your local app snapshot to your personal encrypted Google Drive device backup if enabled in your Android system settings. We do not operate centralized cloud servers storing your private health logs.
          </p>
        </div>

        {/* Policy Section 3: Google Sign-In (OAuth 2.0) Disclosure */}
        <div className="privacy-card">
          <div className="privacy-card-header">
            <UserCheck size={18} className="text-success" />
            <h4 className="privacy-card-title">3. Google Sign-In & Account Identity</h4>
          </div>
          <p className="privacy-card-desc">
            You may use the app in Guest Mode without signing in. If you choose to sign in with Google, the app accesses only your basic Google profile identity (<strong>Name, Email Address, and Profile Picture URL</strong>) via Android Credential Manager / Google OAuth 2.0. This information is used solely on your device to personalize your profile screen and isolate your local database (`ArcHealth_&lt;userId&gt;`). We never access your Google contacts, emails, calendar, or files.
          </p>
        </div>

        {/* Policy Section 4: Zero Third-Party Trackers & Ads */}
        <div className="privacy-card">
          <div className="privacy-card-header">
            <EyeOff size={18} className="text-warning" />
            <h4 className="privacy-card-title">4. Zero Third-Party Trackers & Ads</h4>
          </div>
          <p className="privacy-card-desc">
            We do not embed third-party advertising SDKs, behavioral tracking pixels, cross-app identifiers, or telemetry profilers. Your daily habits and health logs remain strictly private.
          </p>
        </div>

        {/* Policy Section 5: Account & Data Deletion */}
        <div className="privacy-card">
          <div className="privacy-card-header">
            <FileCheck size={18} className="text-success" />
            <h4 className="privacy-card-title">5. Data Portability & Account Deletion</h4>
          </div>
          <p className="privacy-card-desc">
            You retain 100% ownership and control of your records. You can export your full database as a JSON file at any time, or permanently erase your account and all local health data immediately by going to <strong>Settings &rarr; Delete Account</strong> inside the app (or by clearing app storage / uninstalling the app). Web instructions for account and data deletion are also permanently available at <code>/delete-account.html</code>.
          </p>
        </div>

        {/* Policy Section 6: GDPR & DPDP Compliance */}
        <div className="privacy-card">
          <div className="privacy-card-header">
            <ShieldCheck size={18} className="text-care" />
            <h4 className="privacy-card-title">6. Data Minimization & Privacy Rights (GDPR / DPDP)</h4>
          </div>
          <p className="privacy-card-desc">
            In accordance with global data protection frameworks including the EU General Data Protection Regulation (GDPR) and the Digital Personal Data Protection Act (DPDP), we practice strict data minimization. Because processing happens locally on your device, you have immediate, self-service access to inspect, modify, export, or permanently erase all personal data at any time.
          </p>
        </div>

        {/* Policy Section 7: Contact Us */}
        <div className="privacy-card">
          <div className="privacy-card-header">
            <Mail size={18} className="text-accent" />
            <h4 className="privacy-card-title">7. Developer Contact & Support</h4>
          </div>
          <p className="privacy-card-desc">
            If you have any questions regarding this Privacy Policy, data handling, or account deletion requests, please contact the developer at: <strong>yashshap.dev@gmail.com</strong>
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
