import React, { useState } from 'react';
import { Flame, X, Check } from 'lucide-react';

export default function EditGoalsModal({
  isOpen,
  onClose,
  targetCalories = 2200,
  targetMacros = { protein: 77, carbs: 250, fats: 44 },
  onSave,
}) {
  const [goalCal, setGoalCal] = useState(() => String(targetCalories || 2200));
  const [goalP, setGoalP] = useState(() => String(targetMacros?.protein ?? 77));
  const [goalC, setGoalC] = useState(() => String(targetMacros?.carbs ?? 250));
  const [goalF, setGoalF] = useState(() => String(targetMacros?.fats ?? 44));

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(Number(goalCal) || 2200, Number(goalP) || 0, Number(goalC) || 0, Number(goalF) || 0);
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
              <p className="edit-goals-subtitle">Set your daily calorie & macro goals</p>
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
                onChange={(e) => setGoalCal(e.target.value)}
                required
                min="500"
                max="10000"
                placeholder="2200"
              />
              <span className="edit-calorie-unit">kcal</span>
            </div>
            <div className="edit-calorie-quick-pills">
              <button
                type="button"
                className="quick-adjust-pill"
                onClick={() => setGoalCal(String(Math.max(500, (Number(goalCal) || 2000) - 100)))}
              >
                -100 kcal
              </button>
              <button
                type="button"
                className="quick-adjust-pill"
                onClick={() => setGoalCal(String((Number(goalCal) || 2000) + 100))}
              >
                +100 kcal
              </button>
            </div>
          </div>

          {/* Macros 3-Grid */}
          <div className="edit-macros-section-title">Daily Macronutrients</div>
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
                  placeholder="77"
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
                  placeholder="44"
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
