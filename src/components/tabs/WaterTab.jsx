import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Coffee, 
  GlassWater, 
  Wine, 
  Droplets,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export default function WaterTab() {
  const { data, addWater, removeWaterLog, decreaseWater, setWaterTarget } = useApp();
  const { target, current, logs } = data.water;

  // Goal in Liters: 3, 4, or 5
  const currentGoalLiters = Math.min(5, Math.max(3, Math.round(target / 1000))) || 3;
  
  // Collapsible state for logs
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  
  // Selected glass for quick filling
  const [selectedGlass, setSelectedGlass] = useState(250);

  // Long-press modal state
  const [selectedBottleForEdit, setSelectedBottleForEdit] = useState(null);
  const longPressTimerRef = useRef(null);
  const isLongPressTriggered = useRef(false);

  // Available glass volumes with icons and labels
  const glassOptions = [
    { amount: 150, label: 'Cup', icon: Coffee, desc: '150 ml' },
    { amount: 250, label: 'Glass', icon: GlassWater, desc: '250 ml' },
    { amount: 350, label: 'Mug', icon: Wine, desc: '350 ml' },
    { amount: 500, label: 'Bottle', icon: Droplets, desc: '500 ml' },
  ];

  // Change goal between 3, 4, and 5 Liters
  const handleSelectGoal = (liters) => {
    setWaterTarget(liters * 1000);
  };

  // Add water based on selected glass
  const handleAddGlass = (amount, label) => {
    addWater(amount, label);
  };

  // Long-press handlers for bottles
  const handleTouchStart = (bottle) => {
    isLongPressTriggered.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      if (bottle.filledMl > 0) {
        setSelectedBottleForEdit(bottle);
      }
    }, 450); // 450ms long press threshold
  };

  const handleTouchEnd = (bottle) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // Handle removing water from bottle
  const handleRemoveWaterAmount = (amountToRemove) => {
    decreaseWater(amountToRemove);
    setSelectedBottleForEdit(null);
  };

  // Percentage & Liters calculation
  const totalLitersTarget = currentGoalLiters;
  const currentLiters = (current / 1000).toFixed(2);
  const remainingMl = Math.max(0, currentGoalLiters * 1000 - current);
  const totalPercentage = Math.min(100, Math.round((current / (currentGoalLiters * 1000)) * 100));

  // 5 Bottles calculation (1,000 ml per bottle)
  const bottles = [1, 2, 3, 4, 5].map((bottleIndex) => {
    const isActive = bottleIndex <= currentGoalLiters;
    const bottleStartMl = (bottleIndex - 1) * 1000;
    
    let filledMl = 0;
    if (current >= bottleIndex * 1000) {
      filledMl = 1000;
    } else if (current > bottleStartMl) {
      filledMl = current - bottleStartMl;
    }

    const fillPercent = Math.min(100, Math.round((filledMl / 1000) * 100));

    return {
      index: bottleIndex,
      isActive,
      filledMl,
      fillPercent,
    };
  });

  return (
    <div className="tab-container blue-minimal-tab">
      {/* Header with Title & Goal Selector */}
      <div className="blue-header-card">
        <div className="blue-title-row">
          <div className="blue-title-group">
            <span className="blue-kicker">HYDRATION TRACKER</span>
            <h2 className="blue-heading">Daily Water</h2>
          </div>

          <div className="blue-goal-selector">
            <span className="blue-goal-label">Goal:</span>
            <div className="blue-goal-pills">
              {[3, 4, 5].map((liters) => (
                <button
                  key={liters}
                  className={`blue-goal-pill ${currentGoalLiters === liters ? 'active' : ''}`}
                  onClick={() => handleSelectGoal(liters)}
                >
                  {liters}L
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Arch Progress Card */}
        <div className="blue-hero-arch">
          <div className="blue-hero-content">
            <span className="blue-hero-percent">{totalPercentage}%</span>
            <div className="blue-hero-readout">
              <span className="blue-current-val">{currentLiters}</span>
              <span className="blue-target-val">/ {totalLitersTarget}.0 L</span>
            </div>
            <p className="blue-hero-status">
              {remainingMl === 0 ? '✨ Daily Goal Completed' : `${(remainingMl / 1000).toFixed(2)}L to reach your ${totalLitersTarget}L goal`}
            </p>
          </div>
        </div>
      </div>

      {/* 5 Bottles Display Section - Pure, Minimal Bottles */}
      <div className="blue-section">
        <div className="blue-section-header">
          <h3 className="blue-section-title">5 Bottles</h3>
          <span className="blue-section-hint">Hold bottle to remove water</span>
        </div>

        <div className="blue-bottles-row">
          {bottles.map((b) => (
            <div 
              key={b.index} 
              className={`blue-bottle-wrapper ${b.isActive ? 'active' : 'inactive'} ${b.filledMl > 0 ? 'has-water' : ''}`}
              onMouseDown={() => handleTouchStart(b)}
              onMouseUp={() => handleTouchEnd(b)}
              onMouseLeave={() => handleTouchEnd(b)}
              onTouchStart={() => handleTouchStart(b)}
              onTouchEnd={() => handleTouchEnd(b)}
              onTouchCancel={() => handleTouchEnd(b)}
              title={b.filledMl > 0 ? `Bottle ${b.index}: ${b.filledMl}ml (Long-press to remove)` : `Bottle ${b.index}`}
            >
              {/* Bottle Cap */}
              <div className="blue-bottle-cap" />
              
              {/* Bottle Body - No numbers, no %, no checkmark */}
              <div className="blue-bottle-body">
                {/* Liquid Fill */}
                <div 
                  className="blue-bottle-fill" 
                  style={{ height: `${b.fillPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Glass Icons Volume Selector */}
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
                onClick={() => {
                  setSelectedGlass(g.amount);
                  handleAddGlass(g.amount, g.label);
                }}
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

      {/* Collapsible Logs Section */}
      <div className="blue-section">
        <div className="blue-collapsible-card">
          <button 
            className="blue-collapsible-trigger"
            onClick={() => setIsLogsOpen(!isLogsOpen)}
          >
            <div className="blue-collapsible-title-wrap">
              <span className="blue-collapsible-title">Today's Water Logs</span>
              <span className="blue-collapsible-count">{logs.length} entries</span>
            </div>
            <div className="blue-collapsible-arrow">
              {isLogsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </button>

          {isLogsOpen && (
            <div className="blue-collapsible-content">
              {logs.length === 0 ? (
                <div className="blue-empty-state">
                  <p>No intake recorded yet today.</p>
                  <span>Tap any glass above to begin logging.</span>
                </div>
              ) : (
                <div className="blue-logs-list">
                  {logs.map((item) => (
                    <div key={item.id} className="blue-log-row">
                      <div className="blue-log-left">
                        <div className="blue-log-dot" />
                        <div>
                          <span className="blue-log-label">{item.label}</span>
                          <span className="blue-log-time">{item.time}</span>
                        </div>
                      </div>

                      <div className="blue-log-right">
                        <span className={`blue-log-amount ${item.amount < 0 ? 'negative' : ''}`}>
                          {item.amount > 0 ? `+${item.amount}` : item.amount} ml
                        </span>
                        <button
                          className="blue-delete-btn"
                          onClick={() => removeWaterLog(item.id)}
                          title="Delete entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottle Long-Press Popup / Water Removal Modal */}
      {selectedBottleForEdit && (
        <div className="modal-overlay" onClick={() => setSelectedBottleForEdit(null)}>
          <div className="modal-content blue-bottle-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            
            <div className="blue-modal-header">
              <div className="blue-modal-icon">
                <Droplets size={22} />
              </div>
              <div>
                <h3 className="modal-title" style={{ margin: 0 }}>
                  Bottle #{selectedBottleForEdit.index}
                </h3>
                <span className="blue-modal-sub">
                  Currently holds <strong>{selectedBottleForEdit.filledMl} ml</strong>
                </span>
              </div>
            </div>

            <p className="blue-modal-desc">
              Accidentally filled this bottle? Choose how much water to remove:
            </p>

            <div className="blue-modal-options">
              {/* Option 1: Empty entire bottle */}
              <button 
                className="btn btn-water blue-modal-btn"
                onClick={() => handleRemoveWaterAmount(selectedBottleForEdit.filledMl)}
              >
                <RotateCcw size={16} />
                Empty this bottle (-{selectedBottleForEdit.filledMl} ml)
              </button>

              {/* Option 2: Remove 500ml if bottle has >= 500ml */}
              {selectedBottleForEdit.filledMl >= 500 && selectedBottleForEdit.filledMl !== 500 && (
                <button 
                  className="btn btn-secondary blue-modal-btn"
                  onClick={() => handleRemoveWaterAmount(500)}
                >
                  <Trash2 size={16} />
                  Remove 500 ml
                </button>
              )}

              {/* Option 3: Remove 250ml if bottle has >= 250ml */}
              {selectedBottleForEdit.filledMl >= 250 && (
                <button 
                  className="btn btn-secondary blue-modal-btn"
                  onClick={() => handleRemoveWaterAmount(250)}
                >
                  <Trash2 size={16} />
                  Remove 250 ml
                </button>
              )}

              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedBottleForEdit(null)}
                style={{ marginTop: '6px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
