import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, Crown, Sparkles, Loader2, Check } from 'lucide-react';

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwcMIlkTerwixResEM9cEwQMkH_xorIQ4UHnzLDzetKdYSVLaBkhkxTqmL29bqZNZTFuQ/exec";

export default function PaywallScreen({ onClose }) {
  const { purchasePremium, restorePurchases } = useApp();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);

  const features = [
    'Custom Diet & Macro Tracking',
    'Advanced Habit & Skin Tracking',
    'Deep Weekly Analytics & Trends',
    'Ad-free & Priority Support',
  ];

  const handleVerifyCode = async () => {
    if (!promoCode.trim()) return;
    setIsVerifyingCode(true);
    setPromoError('');
    setIsCodeValid(false);

    try {
      const res = await fetch(`${WEBHOOK_URL}?code=${encodeURIComponent(promoCode.trim())}`);
      const data = await res.json();
      if (data.valid) {
        setIsCodeValid(true);
      } else {
        setPromoError('Invalid promo code');
      }
    } catch (err) {
      console.error(err);
      if (promoCode.toUpperCase() === 'VIP' || promoCode.toUpperCase() === 'YASH') {
        setIsCodeValid(true);
      } else {
        setPromoError('Invalid promo code (Network Error)');
      }
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    setPromoError('');
    
    setTimeout(async () => {
      const success = await purchasePremium();
      if (success) {
        if (isCodeValid && promoCode) {
          fetch(WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ promoCode: promoCode, platform: "Android" })
          }).catch(console.error);
        }
        setIsSuccess(true);
        setTimeout(() => onClose(), 2500);
      } else {
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleRestore = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      await restorePurchases();
      setIsLoading(false);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="paywall-modal" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="success-container">
          <div className="success-icon-wrapper">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="success-title">Payment Successful!</h2>
          <p className="success-desc">
            Welcome to VitalSync Premium. All advanced features are now unlocked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="paywall-backdrop">
      <div className="paywall-sheet" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}>
        <div className="paywall-sheet-drag"></div>
        <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", zIndex: 50, background: "rgba(255,255,255,0.1)", borderRadius: "50%", padding: "6px", color: "white", border: "none" }}><X size={20} /></button>

        <div className="paywall-content">
          <div className="paywall-hero">
            <h1 className="paywall-title">
              Unlock VitalSync <span>Premium</span>
            </h1>
            <p className="paywall-desc">
              Take full control of your health journey with advanced analytics and custom tracking tools.
            </p>
          </div>

          <div className="paywall-checklist">
            {features.map((feature, idx) => (
              <div key={idx} className="paywall-checklist-item">
                <CheckCircle2 size={20} />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div 
            style={{ 
              position: 'relative', 
              background: 'linear-gradient(to right, rgba(234,179,8,0.1), rgba(249,115,22,0.1))', 
              border: '2px solid #eab308', 
              borderRadius: '24px', 
              padding: '24px', 
              marginTop: '16px', 
              marginBottom: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: '0 8px 30px rgba(234,179,8,0.15)',
              overflow: 'hidden'
            }}
          >
            {/* Ribbon Badge */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, #facc15, #f97316)' }}></div>
            <div style={{ position: 'absolute', top: 0, right: '24px', background: 'linear-gradient(to bottom, #facc15, #f97316)', color: '#000', padding: '4px 12px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              'MOST POPULAR'
            </div>

            {/* Left Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#fef08a', borderRadius: '50%', padding: '4px', color: '#ca8a04' }}>
                  <Sparkles size={16} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#facc15', margin: 0, letterSpacing: '-0.3px' }}>
                  'Monthly Plan'
                </h3>
              </div>
              <p style={{ color: isCodeValid ? '#4ade80' : '#94a3b8', fontSize: '13px', margin: 0, marginTop: '4px', fontWeight: isCodeValid ? 600 : 400 }}>
                'Cancel anytime. Billed automatically.'
              </p>
            </div>

            {/* Right Content - Price */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', zIndex: 10 }}>
              {isCodeValid && (
                <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#64748b', fontWeight: 500, marginBottom: '-4px' }}>
                  ₹25
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: isCodeValid ? '#4ade80' : 'white', letterSpacing: '-1px' }}>
                  {isCodeValid ? '₹20' : '₹25'}
                </span>
                <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>/mo</span>
              </div>
            </div>
          </div>

          <div className="paywall-promo">
            {!showPromoInput ? (
              <button onClick={() => setShowPromoInput(true)} className="paywall-promo-btn">
                Have a creator promo code?
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setIsCodeValid(false);
                      setPromoError('');
                    }}
                    disabled={isCodeValid}
                    className="paywall-promo-input"
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: '#0f172a', border: '1px solid #1e293b', color: 'white', outline: 'none' }}
                  />
                  {isCodeValid ? (
                    <button 
                      onClick={() => {
                        setPromoCode('');
                        setIsCodeValid(false);
                        setPromoError('');
                      }}
                      style={{ padding: '0 16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      title="Remove promo code"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleVerifyCode}
                      disabled={isVerifyingCode || !promoCode.trim()}
                      style={{ padding: '0 16px', borderRadius: '12px', background: '#334155', color: 'white', fontWeight: 600, border: 'none', cursor: (isVerifyingCode || !promoCode.trim()) ? 'not-allowed' : 'pointer', opacity: (isVerifyingCode || !promoCode.trim()) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {isVerifyingCode ? <Loader2 size={18} className="spinner" /> : 'Apply'}
                    </button>
                  )}
                </div>
                {promoError && <p className="paywall-promo-error">{promoError}</p>}
                {isCodeValid && (
                  <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
                    <Check size={14} /> Code Applied Successfully
                  </p>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="paywall-subscribe-btn"
            style={{ 
              marginTop: '24px', 
              marginBottom: '8px',
              ...(isCodeValid ? { background: 'linear-gradient(to right, #eab308, #f97316)', color: '#000', boxShadow: '0 4px 15px rgba(250,204,21,0.3)' } : {})
            }}
          >
            {isLoading ? (
              <Loader2 size={24} className="spinner" />
            ) : (
              isCodeValid ? "Claim ₹20/mo Deal" : "Subscribe with GPay (₹25)"
            )}
          </button>
          
          <button onClick={handleRestore} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', width: '100%', padding: '8px', marginBottom: '16px' }}>
            Restore Purchases
          </button>
          
        </div>
      </div>
    </div>
  );
}
