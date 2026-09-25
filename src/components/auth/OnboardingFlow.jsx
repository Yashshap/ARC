import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Mars, UserRound, Venus } from "lucide-react";
import { useApp } from "../../context/AppContext";

const GENDER_OPTIONS = [
    { value: "male", label: "Male", icon: Mars },
    { value: "female", label: "Female", icon: Venus },
];

export default function OnboardingFlow({ visible, onComplete }) {
    const { triggerGoogleLogin, updateProfile } = useApp();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ name: "", gender: "", height: "", weight: "" });
    const [error, setError] = useState("");

    if (!visible) return null;

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError("");
    };

    const renderGoogleButton = () => (
        <button type="button" className="btn btn-google-sso onboarding-google" onClick={handleGoogleContinue} disabled={isSubmitting}>
            <svg className="google-icon-svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isSubmitting ? "Connecting..." : "Log in with Google"}</span>
        </button>
    );

    const getNumberValue = value => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    };

    const validateStep = () => {
        if (step === 0) {
            if (!form.name.trim()) {
                setError("Please add your name so we can personalize your plan.");
                return false;
            }
            if (!form.gender) {
                setError("Please select your gender.");
                return false;
            }
        }

        if (step === 1) {
            if (!form.weight || getNumberValue(form.weight) <= 0) {
                setError("Weight must be a valid number greater than zero.");
                return false;
            }
            if (!form.height || getNumberValue(form.height) <= 0) {
                setError("Height must be a valid number greater than zero.");
                return false;
            }
        }

        return true;
    };

    const saveProfile = () => {
        const profilePayload = {
            name: form.name.trim(),
            gender: form.gender,
            height: getNumberValue(form.height),
            weight: getNumberValue(form.weight),
            goal: "Improve wellness",
            targetWeight: null,
            activityLevel: "Active",
            avatarUrl: null,
            email: null,
        };
        try {
            window.localStorage.setItem("vitalsync_pending_onboarding_profile", JSON.stringify(profilePayload));
        } catch {}
        updateProfile(profilePayload);
    };

    const completeOnboarding = (authResult = null) => {
        window.localStorage.setItem("vitalsync-onboarding-v2-complete", "true");
        onComplete?.(authResult);
    };

    const goNext = () => {
        if (!validateStep()) return;
        setStep(prev => Math.min(prev + 1, 2));
    };

    const goBack = () => {
        setError("");
        setStep(prev => Math.max(prev - 1, 0));
    };

    const handleGoogleContinue = async () => {
        const profilePayload = {
            name: form.name.trim(),
            gender: form.gender,
            height: getNumberValue(form.height),
            weight: getNumberValue(form.weight),
            goal: "Improve wellness",
            targetWeight: null,
            activityLevel: "Active",
            avatarUrl: null,
            email: null,
        };
        try {
            setIsSubmitting(true);
            setError("");
            try {
                window.localStorage.setItem("vitalsync_pending_onboarding_profile", JSON.stringify(profilePayload));
            } catch {}

            // 1. Open Google Profile Selector while still on the Onboarding screen
            await triggerGoogleLogin();

            // 2. After Google authentication passes, ensure profile is saved and transition to the app with success popup
            updateProfile(profilePayload);
            completeOnboarding({
                status: "success",
                title: "Logged in Successfully",
                message: "Your Google account is connected and your profile has been synced.",
            });
        } catch (err) {
            console.error("Google onboarding failed:", err);
            updateProfile(profilePayload);
            completeOnboarding({
                status: "error",
                title: "Authentication Failed",
                message: err?.message || "Could not complete Google sign-in. Your profile was saved locally.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkipGoogle = () => {
        saveProfile();
        completeOnboarding();
    };

    const renderStep = () => {
        if (step === 0) {
            return (
                <div className="onboarding-step onboarding-welcome-step">
                    <span className="onboarding-step-kicker">01 / 03</span>
                    <h1>Let&apos;s get to know you</h1>
                    <p className="onboarding-subtitle">Tell us your name and gender to personalize your experience.</p>
                    <div className="onboarding-input-group">
                        <label className="onboarding-label" htmlFor="onboarding-name">Your name</label>
                        <input
                            id="onboarding-name"
                            aria-label="Your name"
                            type="text"
                            value={form.name}
                            onChange={event => updateField("name", event.target.value)}
                            placeholder="Alex Morgan"
                            className="onboarding-input"
                        />
                    </div>
                    <div className="onboarding-input-group">
                        <span className="onboarding-label">What&apos;s your gender?</span>
                        <div className="gender-choice-grid">
                            {GENDER_OPTIONS.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={`gender-choice ${form.gender === value ? "selected" : ""}`}
                                    onClick={() => updateField("gender", value)}
                                    aria-pressed={form.gender === value}
                                >
                                    <span className="gender-choice-icon"><Icon size={26} strokeWidth={1.8} /></span>
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 1) {
            return (
                <div className="onboarding-step">
                    <span className="onboarding-step-kicker">02 / 03</span>
                    <h1>Set your starting point</h1>
                    <p className="onboarding-subtitle">These details help us make your health insights more useful.</p>
                    <div className="onboarding-input-grid two-col">
                        <div className="onboarding-input-group">
                            <label className="onboarding-label" htmlFor="onboarding-weight">Weight (kg)</label>
                            <input
                                id="onboarding-weight"
                                type="number"
                                min="1"
                                step="0.1"
                                value={form.weight}
                                onChange={event => updateField("weight", event.target.value)}
                                placeholder="68"
                                className="onboarding-input"
                            />
                        </div>
                        <div className="onboarding-input-group">
                            <label className="onboarding-label" htmlFor="onboarding-height">Height (cm)</label>
                            <input
                                id="onboarding-height"
                                type="number"
                                min="1"
                                value={form.height}
                                onChange={event => updateField("height", event.target.value)}
                                placeholder="172"
                                className="onboarding-input"
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="onboarding-step review-step">
                <div className="review-icon-wrap"><UserRound size={26} /></div>
                <span className="onboarding-step-kicker">03 / 03</span>
                <h1>Make it yours</h1>
                <p className="onboarding-subtitle">Sign in with Google to securely save your profile and sync your progress.</p>
                <div className="onboarding-alt-actions onboarding-inline-actions">
                    {renderGoogleButton()}
                    <button
                        type="button"
                        className="btn btn-secondary onboarding-guest"
                        onClick={handleSkipGoogle}
                        disabled={isSubmitting}
                    >
                        Continue without Google
                    </button>
                </div>
            </div>
        );
    };

    const isLastStep = step === 2;

    return (
        <div className="onboarding-overlay" aria-live="polite">
            <style>{`
                .onboarding-overlay {
                    position: fixed !important;
                    inset: 0 !important;
                    z-index: 1100 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 100% !important;
                    height: 100% !important;
                    background: #000000 !important;
                    overflow: hidden !important;
                }
                .onboarding-panel.onboarding-viewport-shell {
                    width: 100% !important;
                    max-width: 480px !important;
                    height: 100% !important;
                    max-height: 100dvh !important;
                    min-height: 0 !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: flex-start !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    background: var(--bg-app) !important;
                    padding-top: calc(max(16px, env(safe-area-inset-top, 0px)) + 12px) !important;
                    padding-bottom: calc(max(16px, env(safe-area-inset-bottom, 0px)) + 16px) !important;
                    padding-left: 22px !important;
                    padding-right: 22px !important;
                    box-sizing: border-box !important;
                }
                @media (min-width: 520px) {
                    .onboarding-panel.onboarding-viewport-shell {
                        height: 94vh !important;
                        max-height: 94vh !important;
                        border-radius: 36px !important;
                        border: 1px solid var(--border-strong) !important;
                        box-shadow: 0 0 60px rgba(0, 0, 0, 0.7) !important;
                    }
                }
                .onboarding-top-header {
                    flex-shrink: 0;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 18px;
                }
                .onboarding-progress {
                    width: 100% !important;
                    margin: 0 !important;
                }
                .onboarding-top-back {
                    width: 38px !important;
                    height: 38px !important;
                    margin: 0 !important;
                    flex-shrink: 0;
                }
                .onboarding-step {
                    flex: 0 0 auto !important;
                    min-height: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: flex-start !important;
                    gap: 14px !important;
                }
                .onboarding-step h1 {
                    font-size: clamp(1.7rem, 5vw, 2.1rem) !important;
                    line-height: 1.12 !important;
                }
                .onboarding-subtitle {
                    font-size: 0.88rem !important;
                    line-height: 1.5 !important;
                }
                .onboarding-input {
                    height: 50px !important;
                    padding: 12px 14px !important;
                }
                .gender-choice {
                    min-height: 108px !important;
                    padding: 14px 10px !important;
                    gap: 8px !important;
                }
                .gender-choice-icon {
                    width: 54px !important;
                    height: 54px !important;
                }
                .onboarding-footer {
                    flex: 0 0 auto !important;
                    width: 100% !important;
                    margin-top: 22px !important;
                }
            `}</style>
            <div className="onboarding-panel glass-card onboarding-viewport-shell">
                <div className="onboarding-top-header">
                    <div className="onboarding-progress">
                        {[0, 1, 2].map(index => (
                            <span key={index} className={`onboarding-progress-dot ${index <= step ? "active" : ""}`} />
                        ))}
                    </div>

                    {step > 0 && (
                        <button type="button" className="onboarding-top-back" onClick={goBack} aria-label="Go back">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                </div>

                {error && <div className="onboarding-error">{error}</div>}
                {renderStep()}

                {!isLastStep && (
                    <div className="onboarding-footer">
                        <button type="button" className="btn btn-primary onboarding-next" onClick={goNext}>
                            Next
                            <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
