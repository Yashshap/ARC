import React from 'react';
import { Activity, Sparkles } from 'lucide-react';

export default function SplashScreen({ visible }) {
  if (!visible) return null;

  return (
    <div className="splash-screen" aria-live="polite">
      <div className="splash-orb orb-one" />
      <div className="splash-orb orb-two" />
      <div className="splash-orb orb-three" />

      <div className="splash-card glass-card">
        <div className="splash-logo-wrap">
          <div className="splash-logo-badge">
            <Activity size={26} />
          </div>
        </div>

        <div className="splash-brand-row">
          <span className="splash-brand">VitalSync</span>
          <Sparkles size={18} className="splash-spark" />
        </div>

        <p className="splash-tagline">Your daily rhythm, in sync.</p>

        <div className="splash-status-pill">
          <span className="splash-status-dot" />
          Ready to track your next win
        </div>
      </div>
    </div>
  );
}
