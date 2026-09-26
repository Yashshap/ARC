import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, Crown, Sparkles, Loader2 } from 'lucide-react';

export default function PaywallScreen({ onClose }) {
  const { purchasePremium, restorePurchases } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');

  const features = [
    'Custom Diet & Macro Tracking',
    'Advanced Habit & Skin Tracking',
    'Deep Weekly Analytics & Trends',
    'Ad-free & Priority Support',
  ];

  const handleSubscribe = async () => {
    setIsLoading(true);
    setPromoError('');
    
    setTimeout(async () => {
      if (promoCode && promoCode.toLowerCase() !== 'vip' && promoCode.toLowerCase() !== 'yash') {
        setPromoError('Invalid promo code');
        setIsLoading(false);
        return;
      }
      
      const success = await purchasePremium();
      if (success) {
        setIsSuccess(true);
        setTimeout(() => onClose(), 2500);
      } else {
        setIsLoading(false);
      }
      setIsLoading(false);
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
      <div className="paywall-modal">
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
    <div className="paywall-modal">
      <div className="paywall-topbar">
        <button onClick={onClose} className="paywall-close-btn">
          <X size={24} />
        </button>
      </div>

      <div className="paywall-content">
        <div className="paywall-hero">
          <div className="paywall-crown-icon">
            <Crown size={40} />
          </div>
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

        <div className="paywall-pricing-card">
          <div className="paywall-pricing-card-badge">
            <Sparkles size={20} />
          </div>
          <h3 className="paywall-pricing-title">Monthly Plan</h3>
          <div className="paywall-pricing-price">
            <span className="amount">₹25</span>
            <span className="period">/mo</span>
          </div>
          <p className="paywall-pricing-desc">Cancel anytime. Billed automatically.</p>
        </div>

        <div className="paywall-promo">
          {!showPromoInput ? (
            <button onClick={() => setShowPromoInput(true)} className="paywall-promo-btn">
              Have a creator promo code?
            </button>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="paywall-promo-input"
              />
              {promoError && <p className="paywall-promo-error">{promoError}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="paywall-bottom">
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="paywall-subscribe-btn"
        >
          {isLoading ? (
            <Loader2 size={24} className="spinner" />
          ) : (
            'Subscribe with GPay'
          )}
        </button>

        <div className="paywall-legal">
          <button onClick={handleRestore}>Restore</button>
          <span>•</span>
          <a href="#">Terms</a>
          <span>•</span>
          <a href="#">Privacy</a>
        </div>
      </div>
    </div>
  );
}
