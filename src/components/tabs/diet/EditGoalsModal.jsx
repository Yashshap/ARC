import React, { useState } from 'react';
import { Flame, X, Check, RefreshCw, Sparkles } from 'lucide-react';
import { calculateMacrosFromCalories } from '../../../utils/macroCalculations';
import { calculateBmiNutritionTargets } from '../../../utils/healthCalculations';

export default function EditGoalsModal({
  isOpen,
  onClose,
  targetCalories = null,
  targetMacros = null,
  profile = null,
  onSave,
}) {
  const bmiTargets = calculateBmiNutritionTargets(profile);
  const initialCal = targetCalories != null
    ? targetCalories
    : (bmiTargets.targetCalories != null ? bmiTargets.targetCalories : 2000);

  const initialMacros = targetMacros != null
    ? targetMacros
    : (bmiTargets.targetMacros?.protein != null
        ? bmiTargets.targetMacros
        : calculateMacrosFromCalories(initialCal));

  const [goalCal, setGoalCal] = useState(() => String(initialCal));
  const [goalP, setGoalP] = useState(() => String(initialMacros.protein));
  const [goalC, setGoalC] = useState(() => String(initialMacros.carbs));
  const [goalF, setGoalF] = useState(() => String(initialMacros.fats));

  if (!isOpen) return null;

  const handleCalorieChange = (newCalVal) => {
    setGoalCal(newCalVal);
    const num = Number(newCalVal);
    if (num > 0) {
      const dynamicMacros = calculateMacrosFromCalories(num);
      setGoalP(String(dynamicMacros.protein));
      setGoalC(String(dynamicMacros.carbs));
      setGoalF(String(dynamicMacros.fats));
    }
  };

  const handleAdjustCalories = (delta) => {
    const current = Number(goalCal) || 2000;
    const nextVal = Math.max(500, current + delta);
    handleCalorieChange(String(nextVal));
  };

  const handleAutoBalance = () => {
    const num = Number(goalCal) || 2000;
    const dynamicMacros = calculateMacrosFromCalories(num);
    setGoalP(String(dynamicMacros.protein));
    setGoalC(String(dynamicMacros.carbs));
    setGoalF(String(dynamicMacros.fats));
  };

  const handleApplyBmiTargets = () => {
    if (bmiTargets.hasMetrics && bmiTargets.targetCalories != null) {
      setGoalCal(String(bmiTargets.targetCalories));
      setGoalP(String(bmiTargets.targetMacros.protein));
      setGoalC(String(bmiTargets.targetMacros.carbs));
      setGoalF(String(bmiTargets.targetMacros.fats));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cal = Number(goalCal) || 2000;
    const dynamic = calculateMacrosFromCalories(cal);
    const p = Number(goalP) || dynamic.protein;
    const c = Number(goalC) || dynamic.carbs;
    const f = Number(goalF) || dynamic.fats;

    if (onSave) {
      onSave(cal, p, c, f);
    }
    onClose();
  };

  return (
    <div className="modal-overlay modern-diet-modal-overlay" onClick={onClose}>
      <div className="modal-content edit-goals-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-pill" />

        {/* Header */}
        <div className="edit-goals-header-row">
          <div className="edit-goals-title-group">
            <div className="edit-goals-icon-badge">
              <Flame size={20} className="flame-icon-orange" />
            </div>
            <div>
              <h3 className="edit-goals-title">Edit Nutrition Targets</h3>
              <p className="edit-goals-subtitle">
                {bmiTargets.hasMetrics
                  ? `BMI: ${bmiTargets.bmi} (${bmiTargets.bmiCategory})`
                  : 'Set custom daily calorie & macro goals'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-modal-close-round"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Daily Calories Card */}
          <div className="edit-calorie-card">
            <div className="edit-calorie-header">
              <span className="edit-calorie-label">Daily Calories Target</span>
              <span className="edit-calorie-tag">Energy Goal</span>
            </div>
            <div className="edit-calorie-input-row">
              <input
                type="number"
                className="edit-calorie-input"
                value={goalCal}
                onChange={(e) => handleCalorieChange(e.target.value)}
                required
                min="500"
                max="10000"
                placeholder={bmiTargets.hasMetrics ? String(bmiTargets.targetCalories) : '2000'}
              />
              <span className="edit-calorie-unit">kcal</span>
            </div>
            <div className="edit-calorie-quick-pills">
              <button
                type="button"
                className="quick-adjust-pill"
                onClick={() => handleAdjustCalories(-100)}
              >
                -100 kcal
              </button>
              <button
                type="button"
                className="quick-adjust-pill"
                onClick={() => handleAdjustCalories(100)}
              >
                +100 kcal
              </button>
              <button
                type="button"
                className="quick-adjust-pill pill-auto-balance"
                onClick={handleAutoBalance}
                title="Recalculate protein, carbs, and fats to match calorie target"
              >
                <RefreshCw size={11} style={{ marginRight: '3px' }} /> Auto-Balance
              </button>
              {bmiTargets.hasMetrics && (
                <button
                  type="button"
                  className="quick-adjust-pill"
                  style={{ color: 'var(--color-primary-light)' }}
                  onClick={handleApplyBmiTargets}
                  title={`Reset to BMI target (${bmiTargets.targetCalories} kcal)`}
                >
                  <Sparkles size={11} style={{ marginRight: '3px' }} /> Use BMI ({bmiTargets.targetCalories})
                </button>
              )}
            </div>
          </div>

          {/* Macros 3-Grid */}
          <div className="edit-macros-section-title">
            <span>Daily Macronutrients</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
              Auto-adjusted to calorie goal
            </span>
          </div>
          <div className="edit-macros-3grid">
            {/* Protein */}
            <div className="edit-macro-card protein-card">
              <div className="edit-macro-card-top">
                <span className="edit-macro-emoji">🍗</span>
                <span className="edit-macro-name">Protein</span>
              </div>
              <div className="edit-macro-input-wrap">
                <input
                  type="number"
                  className="edit-macro-input"
                  value={goalP}
                  onChange={(e) => setGoalP(e.target.value)}
                  required
                  min="0"
                  placeholder="125"
                />
                <span className="edit-macro-unit">g</span>
              </div>
              <span className="edit-macro-cal-hint">
                {Math.round((Number(goalP) || 0) * 4)} kcal
              </span>
            </div>

            {/* Carbs */}
            <div className="edit-macro-card carbs-card">
              <div className="edit-macro-card-top">
                <span className="edit-macro-emoji">🍴</span>
                <span className="edit-macro-name">Carbs</span>
              </div>
              <div className="edit-macro-input-wrap">
                <input
                  type="number"
                  className="edit-macro-input"
                  value={goalC}
                  onChange={(e) => setGoalC(e.target.value)}
                  required
                  min="0"
                  placeholder="250"
                />
                <span className="edit-macro-unit">g</span>
              </div>
              <span className="edit-macro-cal-hint">
                {Math.round((Number(goalC) || 0) * 4)} kcal
              </span>
            </div>

            {/* Fats */}
            <div className="edit-macro-card fats-card">
              <div className="edit-macro-card-top">
                <span className="edit-macro-emoji">🥑</span>
                <span className="edit-macro-name">Fats</span>
              </div>
              <div className="edit-macro-input-wrap">
                <input
                  type="number"
                  className="edit-macro-input"
                  value={goalF}
                  onChange={(e) => setGoalF(e.target.value)}
                  required
                  min="0"
                  placeholder="56"
                />
                <span className="edit-macro-unit">g</span>
              </div>
              <span className="edit-macro-cal-hint">
                {Math.round((Number(goalF) || 0) * 9)} kcal
              </span>
            </div>
          </div>

          {/* Calculated summary */}
          <div className="edit-macro-sum-bar">
            <span className="macro-sum-label">Calculated from macros:</span>
            <span className="macro-sum-val">
              {(Number(goalP) || 0) * 4 + (Number(goalC) || 0) * 4 + (Number(goalF) || 0) * 9} / {Number(goalCal) || 0} kcal
            </span>
          </div>

          {/* Action buttons */}
          <div className="edit-goals-actions-row">
            <button
              type="button"
              className="btn-cancel-goals"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-save-goals-lime">
              <Check size={18} strokeWidth={2.5} />
              <span>Save Targets</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
