import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Moon, Sun, Edit3, Flame
} from 'lucide-react';
import { calculateMacrosFromCalories } from '../../../utils/macroCalculations';
import { calculateBmiNutritionTargets } from '../../../utils/healthCalculations';
import DateStripPicker from '../../common/DateStripPicker';

const DEFAULT_MICRONUTRIENTS = [
  {
    id: 'fiber',
    name: 'Dietary Fiber',
    category: 'Digestive Health',
    type: 'minerals',
    current: 0,
    unit: 'g',
    icon: '🌿',
    benefit: 'Gut biome & satiety regulation',
  },
  {
    id: 'vit_d',
    name: 'Vitamin D3',
    category: 'Bone & Immunity',
    type: 'vitamins',
    current: 0,
    unit: 'µg',
    icon: '☀️',
    benefit: 'Calcium uptake & immune modulation',
  },
  {
    id: 'vit_c',
    name: 'Vitamin C',
    category: 'Antioxidant Defense',
    type: 'vitamins',
    current: 0,
    unit: 'mg',
    icon: '🍊',
    benefit: 'Cellular repair & collagen synthesis',
  },
  {
    id: 'calcium',
    name: 'Calcium',
    category: 'Bone Density',
    type: 'minerals',
    current: 0,
    unit: 'mg',
    icon: '🥛',
    benefit: 'Skeletal strength & muscle contraction',
  },
  {
    id: 'iron',
    name: 'Iron',
    category: 'Cellular Oxygenation',
    type: 'minerals',
    current: 0,
    unit: 'mg',
    icon: '🩸',
    benefit: 'Hemoglobin & vital stamina',
  },
  {
    id: 'magnesium',
    name: 'Magnesium',
    category: 'Neuromuscular Repair',
    type: 'minerals',
    current: 0,
    unit: 'mg',
    icon: '⚡',
    benefit: 'Sleep recovery & protein metabolism',
  },
  {
    id: 'potassium',
    name: 'Potassium',
    category: 'Electrolyte Balance',
    type: 'minerals',
    current: 0,
    unit: 'mg',
    icon: '🍌',
    benefit: 'Blood pressure & cellular hydration',
  },
  {
    id: 'zinc',
    name: 'Zinc',
    category: 'Immune System',
    type: 'minerals',
    current: 0,
    unit: 'mg',
    icon: '🛡️',
    benefit: 'Tissue regeneration & enzyme function',
  },
  {
    id: 'vit_b12',
    name: 'Vitamin B12',
    category: 'Energy Metabolism',
    type: 'vitamins',
    current: 0,
    unit: 'µg',
    icon: '🧬',
    benefit: 'Red blood cell & DNA support',
  },
];

export default function NutritionDetailsScreen({
  onClose,
  theme = 'dark',
  toggleTheme,
  targetCalories = null,
  targetMacros = null,
  profile = null,
  totalCalories = 0,
  totalProtein = 0,
  totalCarbs = 0,
  totalFats = 0,
  remainingCalories = null,
  onOpenEditGoals,
}) {
  const [microFilter, setMicroFilter] = useState('all'); // 'all' | 'vitamins' | 'minerals'
  const [selectedDetailsDate, setSelectedDetailsDate] = useState(() => new Date());

  // BMI-based targets and recommendations
  const bmiResults = useMemo(() => calculateBmiNutritionTargets(profile), [profile]);

  // Active targets: custom targets take precedence, else BMI targets, else null
  const activeTargetCalories = targetCalories != null
    ? Number(targetCalories)
    : bmiResults.targetCalories;

  const activeMacros = targetMacros != null
    ? targetMacros
    : (activeTargetCalories != null
        ? (bmiResults.targetMacros || calculateMacrosFromCalories(activeTargetCalories))
        : null);

  // Dynamic micronutrient targets derived from BMI/calories, or null if no metrics & no calories
  const dynamicMicros = useMemo(() => {
    if (bmiResults.hasMetrics) {
      return bmiResults.targetMicros;
    }
    if (activeTargetCalories != null && activeTargetCalories > 0) {
      return {
        fiber: Math.round((activeTargetCalories / 1000) * 14),
        vit_d: 20,
        vit_c: Math.round((activeTargetCalories / 2000) * 90),
        calcium: 1000,
        iron: 15,
        magnesium: 350,
        potassium: Math.round((activeTargetCalories / 2000) * 3400),
        zinc: Number(((activeTargetCalories / 2000) * 11).toFixed(1)),
        vit_b12: 2.4,
      };
    }
    return {
      fiber: null,
      vit_d: null,
      vit_c: null,
      calcium: null,
      iron: null,
      magnesium: null,
      potassium: null,
      zinc: null,
      vit_b12: null,
    };
  }, [bmiResults, activeTargetCalories]);

  return (
    <div className="diet-details-screen modern-details-theme">
      {/* Top Bar with Back Button, Screen Title, Theme Toggle, and Settings Button */}
      <div className="details-screen-top-bar">
        <button
          type="button"
          className="btn-details-back"
          onClick={onClose}
          title="Return to Diet overview"
        >
          <ArrowLeft size={18} />
        </button>

        <h2 className="details-screen-header-title">Nutrition & Macro Details</h2>

        <div className="details-top-actions">
          <button
            type="button"
            className="btn-details-theme"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          <button
            type="button"
            className="btn-details-settings"
            onClick={onOpenEditGoals}
            title="Edit Calorie & Macro Goals"
          >
            <Edit3 size={17} />
          </button>
        </div>
      </div>

      <div className="details-screen-scroll-body">
        <div className="details-tab-content fade-in-section">
          {/* Horizontally Scrollable Date Strip with Month Header & Calendar Picker */}
          <DateStripPicker
            selectedDate={selectedDetailsDate}
            onSelectDate={setSelectedDetailsDate}
            variant={theme === 'light' ? 'light' : 'glass'}
          />

          {/* Calorie Arc Card */}
          <div className="calorie-arc-card">
            <div className="arc-card-header">
              <span className="arc-card-title">Daily Calories🔥</span>
              <span className="arc-card-target">
                {activeTargetCalories != null ? `${activeTargetCalories.toLocaleString()} kcal` : '- kcal'}
              </span>
            </div>

            {/* Semicircular Arc Gauge */}
            <div className="arc-gauge-wrapper">
              {(() => {
                const arcR = 96;
                const arcCx = 140;
                const arcCy = 120;
                const totalArcLen = Math.PI * arcR;
                const hasTarget = activeTargetCalories != null && activeTargetCalories > 0;
                const ratio = hasTarget
                  ? Math.min(1, Math.max(0, totalCalories / activeTargetCalories))
                  : 0;
                const strokeOffset = totalArcLen * (1 - ratio);

                const angleDeg = 180 - (ratio * 180);
                const angleRad = (angleDeg * Math.PI) / 180;
                const knobX = arcCx + arcR * Math.cos(angleRad);
                const knobY = arcCy - arcR * Math.sin(angleRad);

                return (
                  <svg
                    viewBox="0 0 280 150"
                    className="arc-gauge-svg"
                  >
                    <defs>
                      <linearGradient id="arcGreenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#bef264" />
                        <stop offset="100%" stopColor="#c8f53c" />
                      </linearGradient>
                      <filter id="knobDropShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="rgba(0,0,0,0.2)" />
                      </filter>
                    </defs>

                    {/* Smooth background arc track */}
                    <path
                      className="arc-track-path"
                      d={`M ${arcCx - arcR},${arcCy} A ${arcR},${arcR} 0 0,1 ${arcCx + arcR},${arcCy}`}
                      fill="none"
                      stroke={theme === 'light' ? '#e5e7eb' : 'rgba(255, 255, 255, 0.12)'}
                      strokeWidth="13"
                      strokeLinecap="round"
                    />

                    {/* Foreground lime progress arc */}
                    <path
                      d={`M ${arcCx - arcR},${arcCy} A ${arcR},${arcR} 0 0,1 ${arcCx + arcR},${arcCy}`}
                      fill="none"
                      stroke="url(#arcGreenGradient)"
                      strokeWidth="14"
                      strokeDasharray={totalArcLen}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                    />

                    {/* Knob at tip of progress arc */}
                    {ratio > 0 && (
                      <circle
                        className="arc-knob-circle"
                        cx={knobX}
                        cy={knobY}
                        r="8.5"
                        fill={theme === 'light' ? '#ffffff' : '#1e293b'}
                        stroke="#c8f53c"
                        strokeWidth="3.5"
                        filter="url(#knobDropShadow)"
                      />
                    )}
                  </svg>
                );
              })()}

              {/* Center Remaining Content */}
              <div className="arc-center-text-box">
                <Flame size={22} className="arc-flame-icon" />
                <span className="arc-remaining-label">Remaining</span>
                <div className="arc-val-group">
                  <span className="arc-val-number">
                    {remainingCalories != null ? Math.round(remainingCalories).toLocaleString() : '-'}
                  </span>
                  <span className="arc-val-unit">kcal</span>
                </div>
              </div>
            </div>

            {/* Macro Nutrients Breakdown Row */}
            <div className="arc-macros-row">
              {/* Protein */}
              <div className="macro-stat-item">
                <div className="macro-icon-wrap protein-icon-wrap">
                  <span className="macro-emoji">🍗</span>
                </div>
                <div className="macro-stat-info">
                  <span className="macro-stat-name">Protein</span>
                  <div className="macro-stat-numbers">
                    <span className="macro-stat-val">{Math.round(totalProtein)}</span>
                    <span className="macro-stat-slash">/</span>
                    <span className="macro-stat-target">
                      {activeMacros?.protein != null ? `${Math.round(activeMacros.protein)}g` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Carb */}
              <div className="macro-stat-item">
                <div className="macro-icon-wrap carb-icon-wrap">
                  <span className="macro-emoji">🍴</span>
                </div>
                <div className="macro-stat-info">
                  <span className="macro-stat-name">Carb</span>
                  <div className="macro-stat-numbers">
                    <span className="macro-stat-val">{Math.round(totalCarbs)}</span>
                    <span className="macro-stat-slash">/</span>
                    <span className="macro-stat-target">
                      {activeMacros?.carbs != null ? `${Math.round(activeMacros.carbs)}g` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fat */}
              <div className="macro-stat-item">
                <div className="macro-icon-wrap fat-icon-wrap">
                  <span className="macro-emoji">🥑</span>
                </div>
                <div className="macro-stat-info">
                  <span className="macro-stat-name">Fat</span>
                  <div className="macro-stat-numbers">
                    <span className="macro-stat-val">{Math.round(totalFats)}</span>
                    <span className="macro-stat-slash">/</span>
                    <span className="macro-stat-target">
                      {activeMacros?.fats != null ? `${Math.round(activeMacros.fats)}g` : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= MICRO BREAKDOWN SECTION ================= */}
          <div className="micro-breakdown-section">
            <div className="micro-section-header">
              <div className="micro-header-text-col">
                <h3 className="micro-section-title">Micro Breakdown</h3>
                <span className="micro-section-subtitle">
                  {bmiResults.hasMetrics
                    ? 'Personalized for your BMI & Physical Profile'
                    : 'Essential Micronutrients & Minerals'}
                </span>
              </div>

              <div className="micro-filter-pills">
                {['all', 'vitamins', 'minerals'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`micro-filter-pill ${microFilter === f ? 'active' : ''}`}
                    onClick={() => setMicroFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="micro-cards-grid">
              {DEFAULT_MICRONUTRIENTS
                .filter(it => microFilter === 'all' || it.type === microFilter)
                .map((item) => {
                  const targetVal = dynamicMicros[item.id];
                  const pct = targetVal != null && targetVal > 0
                    ? Math.min(100, Math.round((item.current / targetVal) * 100))
                    : 0;

                  return (
                    <div key={item.id} className="micro-nutrient-card">
                      <div className="micro-card-top">
                        <div className="micro-card-left">
                          <div className="micro-icon-badge">
                            <span className="micro-emoji">{item.icon}</span>
                          </div>
                          <div className="micro-info-col">
                            <span className="micro-name">{item.name}</span>
                            <span className="micro-category">{item.category}</span>
                          </div>
                        </div>

                        <div className="micro-numbers-col">
                          <div className="micro-val-row">
                            <span className="micro-current-val">{Math.round(item.current)}</span>
                            <span className="micro-slash">/</span>
                            <span className="micro-target-val">
                              {targetVal != null ? `${Math.round(targetVal)}${item.unit}` : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar Track */}
                      <div className="micro-progress-wrap">
                        <div className="micro-progress-track">
                          <div
                            className="micro-progress-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
