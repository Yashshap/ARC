import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { AppProvider, useApp } from "./context/AppContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Header from "./components/layout/Header";
import Navbar from "./components/layout/Navbar";
import WaterTab from "./components/tabs/WaterTab";
import DietTab from "./components/tabs/DietTab";
import WorkoutTab from "./components/tabs/WorkoutTab";
import CareAndPillsTab from "./components/tabs/CareAndPillsTab";
import AnalyticsTab from "./components/tabs/AnalyticsTab";
import ProfilePage from "./components/profile/ProfilePage";
import SettingsPage from "./components/settings/SettingsPage";
import FaqPage from "./components/settings/FaqPage";
import PrivacyPage from "./components/settings/PrivacyPage";
import AuthScreenModal from "./components/auth/AuthScreenModal";
import OnboardingFlow from "./components/auth/OnboardingFlow";
import "./styles/theme.css";
import PremiumWrapper from "./components/subscription/PremiumWrapper";
import PaywallScreen from "./components/subscription/PaywallScreen";
import "./styles/subscription.css";
import "./App.css";

function MainLayout() {
  const {
    activeTab,
    currentPage,
    isAuthModalOpen,
    closeAuthModal,
    exploreAsGuest,
    loginWithGoogleSSO,
    triggerGoogleLogin,
    data,
  } = useApp();

  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("vitalsync-onboarding-v2-complete") === "true";
  });
  const [authResultPopup, setAuthResultPopup] = useState(null);
  const [isRetryingAuth, setIsRetryingAuth] = useState(false);
  const [showSoftPaywall, setShowSoftPaywall] = useState(false);

  // Keep onboarding visible until onboardingComplete is explicitly set to true by OnboardingFlow
  const shouldShowOnboarding = !onboardingComplete;

  const handleOnboardingComplete = (authResult) => {
    setOnboardingComplete(true);
    if (!data?.subscription?.isPremium) {
      setShowSoftPaywall(true);
    }
    if (authResult && authResult.status) {
      setAuthResultPopup(authResult);
      if (authResult.status === "success") {
        window.setTimeout(() => {
          setAuthResultPopup(prev => (prev?.status === "success" ? null : prev));
        }, 4200);
      }
    }
  };

  const handleRetryGoogleFromPopup = async () => {
    try {
      setIsRetryingAuth(true);
      await triggerGoogleLogin();
      setAuthResultPopup({
        status: "success",
        title: "Logged in Successfully",
        message: "Your Google account is now connected and synced.",
      });
      window.setTimeout(() => {
        setAuthResultPopup(null);
      }, 3500);
    } catch (err) {
      setAuthResultPopup({
        status: "error",
        title: "Authentication Failed",
        message: err?.message || "Google sign-in failed. Please try again.",
      });
    } finally {
      setIsRetryingAuth(false);
    }
  };

  const renderPageContent = () => {
    if (currentPage === "settings") {
      return (
        <div id="app-viewport" className="app-viewport page-viewport-fullscreen">
          <ErrorBoundary name="Settings Page">
            <SettingsPage />
          </ErrorBoundary>
        </div>
      );
    }

    if (currentPage === "faq") {
      return (
        <div id="app-viewport" className="app-viewport page-viewport-fullscreen">
          <ErrorBoundary name="Help & FAQ Page">
            <FaqPage />
          </ErrorBoundary>
        </div>
      );
    }

    if (currentPage === "privacy") {
      return (
        <div id="app-viewport" className="app-viewport page-viewport-fullscreen">
          <ErrorBoundary name="Privacy Policy Page">
            <PrivacyPage />
          </ErrorBoundary>
        </div>
      );
    }

    if (currentPage === "profile") {
      return (
        <div id="app-viewport" className="app-viewport page-viewport-fullscreen">
          <ErrorBoundary name="Profile Page">
            <ProfilePage />
          </ErrorBoundary>
        </div>
      );
    }

    return (
      <div id="app-viewport" className="app-viewport">
        <Header />
        <main className="app-content">
          {activeTab === "water" && (
            <ErrorBoundary name="Water Tracker">
              <WaterTab />
            </ErrorBoundary>
          )}
          {activeTab === "diet" && (
            <ErrorBoundary name="Diet Tracker">
              <PremiumWrapper featureName="Diet & Macros">
                <DietTab />
              </PremiumWrapper>
            </ErrorBoundary>
          )}
          {activeTab === "workout" && (
            <ErrorBoundary name="Workout Tracker">
              <WorkoutTab />
            </ErrorBoundary>
          )}
          {activeTab === "care" && (
            <ErrorBoundary name="Care & Pills">
              <PremiumWrapper featureName="Skin & Habit Tracking">
                <CareAndPillsTab />
              </PremiumWrapper>
            </ErrorBoundary>
          )}
          {activeTab === "analytics" && (
            <ErrorBoundary name="Analytics">
              <PremiumWrapper featureName="Advanced Analytics">
                <AnalyticsTab />
              </PremiumWrapper>
            </ErrorBoundary>
          )}
          {activeTab === "profile" && (
            <ErrorBoundary name="Profile">
              <ProfilePage />
            </ErrorBoundary>
          )}
        </main>
        <Navbar />
      </div>
    );
  };

  return (
    <>
            <OnboardingFlow
        visible={shouldShowOnboarding}
        onComplete={handleOnboardingComplete}
      />
      {renderPageContent()}
      {showSoftPaywall && <PaywallScreen onClose={() => setShowSoftPaywall(false)} />}
      <AuthScreenModal
        key={isAuthModalOpen ? "open" : "closed"}
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onExploreAsGuest={exploreAsGuest}
        onLoginSuccess={loginWithGoogleSSO}
      />

      {authResultPopup && (
        <div
          className="modal-overlay"
          style={{
            zIndex: 1300,
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setAuthResultPopup(null)}
        >
          <div
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: "360px",
              padding: "24px 20px",
              borderRadius: "24px",
              background: "rgba(15, 23, 42, 0.95)",
              border:
                authResultPopup.status === "success"
                  ? "1px solid rgba(16, 185, 129, 0.4)"
                  : "1px solid rgba(239, 68, 68, 0.4)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.65)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "14px",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  authResultPopup.status === "success"
                    ? "rgba(16, 185, 129, 0.16)"
                    : "rgba(239, 68, 68, 0.16)",
                color: authResultPopup.status === "success" ? "#10b981" : "#ef4444",
              }}
            >
              {authResultPopup.status === "success" ? (
                <CheckCircle2 size={30} />
              ) : (
                <ShieldAlert size={30} />
              )}
            </div>

            <h3 style={{ margin: 0, fontSize: "1.18rem", fontWeight: 800, color: "#f8fafc" }}>
              {authResultPopup.title}
            </h3>

            <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.5, color: "#94a3b8" }}>
              {authResultPopup.message}
            </p>

            <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "6px" }}>
              {authResultPopup.status === "error" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleRetryGoogleFromPopup}
                  disabled={isRetryingAuth}
                >
                  {isRetryingAuth ? "Connecting..." : "Try Again"}
                </button>
              )}
              <button
                type="button"
                className={authResultPopup.status === "success" ? "btn btn-primary" : "btn btn-secondary"}
                style={{ flex: 1 }}
                onClick={() => setAuthResultPopup(null)}
              >
                {authResultPopup.status === "success" ? "Great, Let\x27s Go" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary name="VitalSync App" showHomeAction>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
