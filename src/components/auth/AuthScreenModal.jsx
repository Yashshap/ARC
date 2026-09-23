import React, { useState } from 'react';
import { Sparkles, ArrowRight, UserCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AuthScreenModal({ isOpen, onClose, onExploreAsGuest }) {
  const { triggerGoogleLogin } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await triggerGoogleLogin();
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      const msg = err?.message || 'Google Sign-In failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay auth-modal-overlay" onClick={onClose}>
      <div
        className="modal-content auth-modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Sign In with Google or Explore as Guest"
      >
        <button
          className="auth-modal-close-btn btn-icon"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="auth-brand-badge">
          <div className="brand-icon auth-sparkle-icon">
            <Sparkles size={24} className="brand-svg text-accent" />
          </div>
          <h2 className="auth-modal-title">Welcome to VitalSync</h2>
          <p className="auth-modal-subtitle">
            Synchronize your hydration, nutrition, workouts, and wellness habits in one private, edge-first app.
          </p>
        </div>

        {errorMessage && (
          <div
            className="auth-error-banner"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              margin: '0 0 16px 0',
              color: '#fca5a5',
              fontSize: '0.85rem',
              lineHeight: 1.4,
              textAlign: 'center',
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="auth-action-buttons-group">
          {/* Real Google SSO Button */}
          <button
            type="button"
            className="btn btn-google-sso"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            id="google-sso-login-btn"
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
            <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div className="auth-divider-row">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">OR</span>
            <div className="auth-divider-line" />
          </div>

          {/* Explore as a Guest Button */}
          <button
            type="button"
            className="btn btn-guest-mode"
            onClick={onExploreAsGuest}
            id="explore-as-guest-btn"
          >
            <div className="guest-btn-content">
              <div className="guest-btn-left">
                <UserCheck size={18} className="guest-icon" />
                <div className="guest-text-col">
                  <span className="guest-title">Explore as a Guest</span>
                  <span className="guest-sub">Explore the Water Tracker without saving data</span>
                </div>
              </div>
              <ArrowRight size={18} className="guest-arrow" />
            </div>
          </button>
        </div>

        <p className="auth-disclaimer-note">
          Guest exploration does not save data. Sign in with Google to record your daily logs and personalize your profile.
        </p>
      </div>
    </div>
  );
}
