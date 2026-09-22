import React, { useState } from 'react';
import { Smartphone, CheckCircle2 } from 'lucide-react';

const ANDROID_COMMANDS = `# 1. Build the React web app
npm run build

# 2. Add Android platform (first time only)
npx cap add android

# 3. Copy web assets to Android
npx cap sync android

# 4. Open in Android Studio to run or build APK
npx cap open android`;

export default function AndroidGuideModal({ isOpen, onClose }) {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCopyAndroidCommands = () => {
    navigator.clipboard.writeText(ANDROID_COMMANDS);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-pill" />
        <div className="modal-title-row">
          <div className="brand-icon" style={{ background: '#10b981' }}>
            <Smartphone size={18} />
          </div>
          <h3 className="modal-title">Android App Wrapping Guide</h3>
        </div>

        <p className="modal-description">
          This app is already configured with <strong>Capacitor</strong> and
          mobile viewport settings. Follow these quick steps to generate your
          native Android project:
        </p>

        <div className="code-snippet-box">
          <div className="code-snippet-header">
            <span>Terminal Commands</span>
            <button className="btn-text" onClick={handleCopyAndroidCommands}>
              {copiedCode ? '✓ Copied!' : 'Copy Commands'}
            </button>
          </div>
          <pre className="code-pre">{ANDROID_COMMANDS}</pre>
        </div>

        <div className="guide-notes">
          <div className="guide-note-item">
            <CheckCircle2 size={16} className="text-success" />
            <span>
              <strong>capacitor.config.json</strong> is already placed at the
              root of your project.
            </span>
          </div>
          <div className="guide-note-item">
            <CheckCircle2 size={16} className="text-success" />
            <span>
              Responsive viewport, safe-area insets, and dark-theme status bar
              are pre-configured.
            </span>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={onClose}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
