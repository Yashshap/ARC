import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Crown } from 'lucide-react';
import PaywallScreen from './PaywallScreen';

export default function PremiumWrapper({ children, featureName = "this feature" }) {
  const { data } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);
  
  const isPremium = data?.subscription?.isPremium;

  return (
    <div className="premium-wrapper" style={isPremium ? { height: '100%' } : {}}>
      <div className={isPremium ? "w-full h-full" : "premium-blur-content"}>
        {children}
      </div>

      {!isPremium && (
        <div className="premium-overlay">
          <div className="premium-overlay-card">
            <div className="premium-lock-icon">
              <Lock size={32} />
            </div>
            
            <h3 className="premium-overlay-title">
              Unlock {featureName}
            </h3>
            
            <p className="premium-overlay-desc">
              Upgrade to Premium to access {featureName.toLowerCase()} and other advanced analytics.
            </p>

            <button onClick={() => setShowPaywall(true)} className="btn-upgrade">
              <Crown size={20} />
              Upgrade for ₹25/mo
            </button>
          </div>
        </div>
      )}

      {showPaywall && (
        <PaywallScreen onClose={() => setShowPaywall(false)} />
      )}
    </div>
  );
}
