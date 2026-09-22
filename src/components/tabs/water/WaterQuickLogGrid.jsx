import React from 'react';
import { Coffee, GlassWater, Wine, Droplets } from 'lucide-react';

const DEFAULT_GLASS_OPTIONS = [
  { amount: 150, label: 'Cup', icon: Coffee, desc: '150 ml' },
  { amount: 250, label: 'Glass', icon: GlassWater, desc: '250 ml' },
  { amount: 350, label: 'Mug', icon: Wine, desc: '350 ml' },
  { amount: 500, label: 'Bottle', icon: Droplets, desc: '500 ml' },
];

export default function WaterQuickLogGrid({
  glassOptions = DEFAULT_GLASS_OPTIONS,
  selectedGlass,
  onSelectAndAdd,
}) {
  return (
    <div className="blue-section">
      <div className="blue-section-header">
        <h3 className="blue-section-title">Select Glass Volume</h3>
        <span className="blue-section-subtitle">Tap to fill bottles</span>
      </div>

      <div className="blue-glasses-grid">
        {glassOptions.map((g) => {
          const Icon = g.icon;
          const isSelected = selectedGlass === g.amount;

          return (
            <button
              key={g.amount}
              className={`blue-glass-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectAndAdd(g.amount, g.label)}
            >
              <div className="blue-glass-icon-circle">
                <Icon size={20} />
              </div>
              <span className="blue-glass-amount">+{g.amount}ml</span>
              <span className="blue-glass-name">{g.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
