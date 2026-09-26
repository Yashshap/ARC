import React, { useState } from "react";
import {
  ArrowLeft, Share2, Trash2, Utensils, HelpCircle, ChevronDown, Flame, Check
} from "lucide-react";
import { DEFAULT_FOOD_DATABASE } from "../../../data/foodDatabase";

const MEASURE_OPTIONS = [
  { key: "serving", label: "serving", getGrams: (baseW) => baseW || 100 },
  { key: "g", label: "g (grams)", getGrams: () => 1 },
  { key: "katori", label: "katori (150g)", getGrams: () => 150 },
  { key: "cup", label: "cup (200g)", getGrams: () => 200 },
  { key: "tbsp", label: "tbsp (15g)", getGrams: () => 15 },
  { key: "piece", label: "piece (50g)", getGrams: () => 50 },
];

export default function FoodEditScreen({
  editingMealItem,
  onClose,
  onSave,
  onDelete,
  actionLabel,
}) {
  const item = editingMealItem?.item;
  const category = editingMealItem?.category || "breakfast";

  const dbMatch = DEFAULT_FOOD_DATABASE.find(
    f => f.id === (item?.foodId || item?.id) || f.name.toLowerCase() === item?.name?.toLowerCase()
  );

  // Standard 1-serving weight (for 'serving' unit)
  const servingWeight =
    Number(item?.baseServingWeight) ||
    Number(dbMatch?.defaultWeight) ||
    Number(dbMatch?.baseWeight) ||
    Number(item?.defaultWeight) ||
    Number(item?.baseWeight) ||
    Number(item?.weight) ||
    100;

  // Current saved weight of this item instance
  const initialWeight = Number(item?.weight) || servingWeight;

  // Per-100g reference macros (prefer dbMatch if available, else derive from item's current calories/weight)
  const refWeight = dbMatch ? (Number(dbMatch.baseWeight) || 100) : Math.max(1, initialWeight);
  const refCalories = dbMatch ? (Number(dbMatch.calories) || 0) : (Number(item?.calories) || 0);
  const refProtein = dbMatch ? (Number(dbMatch.protein) || 0) : (Number(item?.protein) || 0);
  const refCarbs = dbMatch ? (Number(dbMatch.carbs) || 0) : (Number(item?.carbs) || 0);
  const refFats = dbMatch ? (Number(dbMatch.fats) || 0) : (Number(item?.fats) || 0);
  const refFiber = dbMatch
    ? (Number(dbMatch.fiber) || 0)
    : (Number(item?.fiber) || Math.round(refCarbs * 0.1 * 10) / 10);

  // Reference micronutrients per 100g (always from dbMatch per 100g when available, or scaled to 100g from item)
  const microScaleTo100 = dbMatch ? 1 : (100 / Math.max(1, initialWeight));
  const basePotassium = Number(dbMatch?.potassium ?? (item?.potassium ? item.potassium * microScaleTo100 : 0)) || 0;
  const baseSodium = Number(dbMatch?.sodium ?? (item?.sodium ? item.sodium * microScaleTo100 : 0)) || 0;
  const baseCalcium = Number(dbMatch?.calcium ?? (item?.calcium ? item.calcium * microScaleTo100 : 0)) || 0;
  const baseIron = Number(dbMatch?.iron ?? (item?.iron ? item.iron * microScaleTo100 : 0)) || 0;
  const baseMagnesium = Number(dbMatch?.magnesium ?? (item?.magnesium ? item.magnesium * microScaleTo100 : 0)) || 0;
  const baseZinc = Number(dbMatch?.zinc ?? (item?.zinc ? item.zinc * microScaleTo100 : 0)) || 0;
  const baseVitaminB12 = Number(dbMatch?.vitaminB12 ?? (item?.vitaminB12 ? item.vitaminB12 * microScaleTo100 : 0)) || 0;
  const baseFolateB9 = Number(dbMatch?.folateB9 ?? (item?.folateB9 ? item.folateB9 * microScaleTo100 : 0)) || 0;
  const baseVitaminD = Number(dbMatch?.vitaminD ?? (item?.vitaminD ? item.vitaminD * microScaleTo100 : 0)) || 0;

  const initialScale = initialWeight / Math.max(1, refWeight);
  const initialCals = item?.calories != null ? Math.round(Number(item.calories)) : Math.round(refCalories * initialScale);
  const initialProt = item?.protein != null ? Math.round(Number(item.protein) * 10) / 10 : Math.round(refProtein * initialScale * 10) / 10;
  const initialCarb = item?.carbs != null ? Math.round(Number(item.carbs) * 10) / 10 : Math.round(refCarbs * initialScale * 10) / 10;
  const initialFat = item?.fats != null ? Math.round(Number(item.fats) * 10) / 10 : Math.round(refFats * initialScale * 10) / 10;
  const initialFib = item?.fiber != null ? Math.round(Number(item.fiber) * 10) / 10 : Math.round(refFiber * initialScale * 10) / 10;

  const [editQuantity, setEditQuantity] = useState(
    item?.editQuantity != null ? item.editQuantity : Math.max(0.5, Math.round((initialWeight / Math.max(1, servingWeight)) * 10) / 10)
  );
  const [editMeasure, setEditMeasure] = useState(item?.editMeasure || "serving");

  const [editItemWeight, setEditItemWeight] = useState(initialWeight);
  const [editItemCalories, setEditItemCalories] = useState(initialCals);
  const [editItemProtein, setEditItemProtein] = useState(initialProt);
  const [editItemCarbs, setEditItemCarbs] = useState(initialCarb);
  const [editItemFats, setEditItemFats] = useState(initialFat);
  const [editItemFiber, setEditItemFiber] = useState(initialFib);

  if (!item) return null;

  const currentWeightNum = Number(editItemWeight) || servingWeight || 100;
  const curScale = currentWeightNum / 100; // per 100g base for micronutrients

  const curPotassium = Math.round(basePotassium * curScale * 10) / 10;
  const curSodium = Math.round(baseSodium * curScale * 10) / 10;
  const curCalcium = Math.round(baseCalcium * curScale * 10) / 10;
  const curIron = Math.round(baseIron * curScale * 10) / 10;
  const curMagnesium = Math.round(baseMagnesium * curScale * 10) / 10;
  const curZinc = Math.round(baseZinc * curScale * 10) / 10;
  const curVitaminB12 = Math.round(baseVitaminB12 * curScale * 100) / 100;
  const curFolateB9 = Math.round(baseFolateB9 * curScale * 10) / 10;
  const curVitaminD = Math.round(baseVitaminD * curScale * 10) / 10;

  const hasMicros = basePotassium > 0 || baseSodium > 0 || baseCalcium > 0 || baseIron > 0 || baseMagnesium > 0 || baseZinc > 0 || baseVitaminB12 > 0 || baseFolateB9 > 0 || baseVitaminD > 0;

  const recalculateFromQuantityAndMeasure = (qty, measureKey) => {
    const q = Math.max(0.01, Number(qty) || 1);
    const measureObj = MEASURE_OPTIONS.find(m => m.key === measureKey) || MEASURE_OPTIONS[0];
    const unitGrams = measureObj.getGrams(servingWeight);
    const totalGrams = Math.round(q * unitGrams);

    const s = totalGrams / Math.max(1, refWeight);
    const cal = Math.round(refCalories * s);
    const p = Math.round(refProtein * s * 10) / 10;
    const c = Math.round(refCarbs * s * 10) / 10;
    const f = Math.round(refFats * s * 10) / 10;
    const fib = Math.round(refFiber * s * 10) / 10;

    setEditItemWeight(totalGrams);
    setEditItemCalories(cal);
    setEditItemProtein(p);
    setEditItemCarbs(c);
    setEditItemFats(f);
    setEditItemFiber(fib);
  };

  const handleQuantityChange = (newQty) => {
    setEditQuantity(newQty);
    recalculateFromQuantityAndMeasure(newQty, editMeasure);
  };

  const handleMeasureChange = (newMeasure) => {
    setEditMeasure(newMeasure);
    recalculateFromQuantityAndMeasure(editQuantity, newMeasure);
  };

  const handleNetWeightChange = (newWeightVal) => {
    if (newWeightVal === "") {
      setEditItemWeight("");
      return;
    }
    const totalGrams = Math.max(0, Number(newWeightVal) || 0);
    setEditItemWeight(newWeightVal);

    const s = totalGrams / Math.max(1, refWeight);
    const cal = Math.round(refCalories * s);
    const p = Math.round(refProtein * s * 10) / 10;
    const c = Math.round(refCarbs * s * 10) / 10;
    const f = Math.round(refFats * s * 10) / 10;
    const fib = Math.round(refFiber * s * 10) / 10;

    setEditItemCalories(cal);
    setEditItemProtein(p);
    setEditItemCarbs(c);
    setEditItemFats(f);
    setEditItemFiber(fib);

    const measureObj = MEASURE_OPTIONS.find(m => m.key === editMeasure) || MEASURE_OPTIONS[0];
    const unitGrams = measureObj.getGrams(servingWeight);
    const calculatedQty = Math.round((totalGrams / Math.max(1, unitGrams)) * 10) / 10;
    setEditQuantity(calculatedQty);
  };

  const handleSave = () => {
    if (onSave) {
      const finalWeight = Number(editItemWeight) || servingWeight || 100;
      const unitSuffix = item.unit === "ml" ? "ml" : "g";
      const updatedLabel = editMeasure === "g"
        ? `${finalWeight}${unitSuffix}`
        : `${editQuantity} ${editMeasure} (${finalWeight}${unitSuffix})`;

      onSave(category, item.id, {
        calories: Number(editItemCalories) || 0,
        protein: Number(editItemProtein) || 0,
        carbs: Number(editItemCarbs) || 0,
        fats: Number(editItemFats) || 0,
        fiber: Number(editItemFiber) || 0,
        potassium: curPotassium,
        sodium: curSodium,
        calcium: curCalcium,
        iron: curIron,
        magnesium: curMagnesium,
        zinc: curZinc,
        vitaminB12: curVitaminB12,
        folateB9: curFolateB9,
        vitaminD: curVitaminD,
        weight: finalWeight,
        baseServingWeight: servingWeight,
        editQuantity: Number(editQuantity) || 1,
        editMeasure: editMeasure,
        quantity: updatedLabel,
        serving: updatedLabel,
      });
    }
    if (onClose) onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(category, item.id);
    }
    if (onClose) onClose();
  };

  return (
    <div className="food-edit-screen modern-details-theme">
      <div className="food-edit-top-nav">
        <button
          type="button"
          className="food-edit-nav-btn"
          onClick={onClose}
          title="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="food-edit-nav-actions">
          <button
            type="button"
            className="food-edit-nav-btn"
            title="Share"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.share) {
                navigator.share({
                  title: item.name,
                  text: `${item.name} - ${editItemCalories} Cal, P: ${editItemProtein}g, C: ${editItemCarbs}g, F: ${editItemFats}g`,
                }).catch(() => {});
              }
            }}
          >
            <Share2 size={20} />
          </button>
          <button
            type="button"
            className="food-edit-nav-btn"
            style={{ color: "var(--color-danger, #ef4444)" }}
            onClick={handleDelete}
            title="Delete food item"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="food-edit-body">
        {/* Food Name Header Card */}
        <div className="food-header-clean-card">
          <div className="food-header-icon-badge">
            <Utensils size={20} className="text-lime" />
          </div>
          <div className="food-header-text-group">
            <h2 className="food-header-clean-title">{item.name}</h2>
          </div>
        </div>

        {/* Card: Quantity & Measure Selectors */}
        <div className="food-controls-clean-card">
          <div className="food-controls-row">
            {/* Quantity */}
            <div className="food-control-group">
              <span className="food-control-label">QUANTITY</span>
              <div className="food-qty-input-wrap">
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  className="food-qty-input"
                  value={editQuantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                />
              </div>
            </div>

            {/* Measure */}
            <div className="food-control-group">
              <div className="food-control-label-row">
                <span className="food-control-label">MEASURE</span>
                <HelpCircle size={14} className="food-control-help" title="Measurement unit" />
              </div>
              <div className="food-measure-select-wrap">
                <select
                  className="food-measure-select"
                  value={editMeasure}
                  onChange={(e) => handleMeasureChange(e.target.value)}
                >
                  {MEASURE_OPTIONS.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="food-select-chevron" />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Macronutrients Breakdown */}
        <h3 className="food-section-title">Macronutrients Breakdown</h3>
        <div className="macro-breakdown-card">
          {/* Calories Shown Separately */}
          <div className="macro-card-top-row">
            <div className="macro-card-cal-group">
              <div className="macro-cal-label-wrap">
                <Flame size={18} className="flame-icon-orange" />
                <span className="macro-card-cal-label">Calories</span>
              </div>
              <span className="macro-card-cal-val">{editItemCalories} <small>kcal</small></span>
            </div>
            <label className="macro-card-net-wt-editable" title="Tap to edit net weight">
              <span className="net-wt-label">Net wt:</span>
              <input
                type="number"
                className="net-wt-input"
                value={editItemWeight}
                onChange={(e) => handleNetWeightChange(e.target.value)}
                onBlur={() => {
                  if (!editItemWeight || Number(editItemWeight) <= 0) {
                    handleNetWeightChange(servingWeight || 100);
                  }
                }}
                min="1"
                step="1"
              />
              <span className="net-wt-unit">{item.unit === "ml" ? "ml" : "g"}</span>
            </label>
          </div>

          <div className="macro-card-divider" />

          {/* Macro Breakdown Rows */}
          <div className="macro-items-list">
            <div className="macro-breakdown-row">
              <div className="macro-row-left">
                <div className="macro-stat-icon-badge">
                  <span className="macro-emoji">🍗</span>
                </div>
                <span className="macro-row-name">Protein</span>
              </div>
              <span className="macro-row-val">{Math.round(Number(editItemProtein) || 0)} g</span>
            </div>

            <div className="macro-breakdown-row">
              <div className="macro-row-left">
                <div className="macro-stat-icon-badge">
                  <span className="macro-emoji">🍴</span>
                </div>
                <span className="macro-row-name">Carbs</span>
              </div>
              <span className="macro-row-val">{Math.round(Number(editItemCarbs) || 0)} g</span>
            </div>

            <div className="macro-breakdown-row">
              <div className="macro-row-left">
                <div className="macro-stat-icon-badge">
                  <span className="macro-emoji">🥑</span>
                </div>
                <span className="macro-row-name">Fats</span>
              </div>
              <span className="macro-row-val">{Math.round(Number(editItemFats) || 0)} g</span>
            </div>

            <div className="macro-breakdown-row">
              <div className="macro-row-left">
                <div className="macro-stat-icon-badge">
                  <span className="macro-emoji">🌿</span>
                </div>
                <span className="macro-row-name">Fiber</span>
              </div>
              <span className="macro-row-val">{Math.round(Number(editItemFiber || 0))} g</span>
            </div>
          </div>
        </div>

        {/* Section: Micronutrients Breakdown */}
        <h3 className="food-section-title">Micronutrients Breakdown</h3>
        <div className="micro-breakdown-card">
          {!hasMicros ? (
            <p className="micro-empty-text">No micronutrient data available for this item.</p>
          ) : (
            <div className="macro-items-list">
              {curPotassium > 0 && (
                <div className="macro-breakdown-row">
                  <div className="macro-row-left">
                    <div className="macro-stat-icon-badge">
                      <span className="macro-emoji">🍌</span>
                    </div>
                    <span className="macro-row-name">Potassium (K)</span>
                  </div>
                  <span className="macro-row-val">{curPotassium} mg</span>
                </div>
              )}
              {curSodium > 0 && (
                <div className="macro-breakdown-row">
                  <div className="macro-row-left">
                    <div className="macro-stat-icon-badge">
                      <span className="macro-emoji">🧂</span>
                    </div>
                    <span className="macro-row-name">Sodium (Na)</span>
                  </div>
                  <span className="macro-row-val">{curSodium} mg</span>
                </div>
              )}
              {curCalcium > 0 && (
                <div className="macro-breakdown-row">
                  <div className="macro-row-left">
                    <div className="macro-stat-icon-badge">
                      <span className="macro-emoji">🥛</span>
                    </div>
                    <span className="macro-row-name">Calcium (Ca)</span>
                  </div>
                  <span className="macro-row-val">{curCalcium} mg</span>
                </div>
              )}
              {curIron > 0 && (
                <div className="macro-breakdown-row">
                  <div className="macro-row-left">
                    <div className="macro-stat-icon-badge">
                      <span className="macro-emoji">🥬</span>
                    </div>
                    <span className="macro-row-name">Iron (Fe)</span>
                  </div>
                  <span className="macro-row-val">{curIron} mg</span>
                </div>
              )}
              {curMagnesium > 0 && (
                <div className="macro-breakdown-row">
                  <div className="macro-row-left">
                    <div className="macro-stat-icon-badge">
                      <span className="macro-emoji">🌰</span>
                    </div>
                    <span className="macro-row-name">Magnesium (Mg)</span>
                  </div>
                  <span className="macro-row-val">{curMagnesium} mg</span>
                </div>
              )}
              {curZinc > 0 && (
                <div className="macro-breakdown-row">
                  <div className="macro-row-left">
                    <div className="macro-stat-icon-badge">
                      <span className="macro-emoji">🛡️</span>
                    </div>
                    <span className="macro-row-name">Zinc (Zn)</span>
                  </div>
                  <span className="macro-row-val">{curZinc} mg</span>
                </div>
              )}
              {curVitaminB12 > 0 && (
                <div className="macro-breakdown-row">
                  <div className="macro-row-left">
                    <div className="macro-stat-icon-badge">
                      <span className="macro-emoji">💊</span>
                    </div>
                    <span className="macro-row-name">Vitamin B12</span>
                  </div>
                  <span className="macro-row-val">{curVitaminB12} mcg</span>
                </div>
              )}
              {curFolateB9 > 0 && (
                <div className="macro-breakdown-row">
                  <div className="macro-row-left">
                    <div className="macro-stat-icon-badge">
                      <span className="macro-emoji">🥗</span>
                    </div>
                    <span className="macro-row-name">Folate (B9)</span>
                  </div>
                  <span className="macro-row-val">{curFolateB9} mcg</span>
                </div>
              )}
              {curVitaminD > 0 && (
                <div className="macro-breakdown-row">
                  <div className="macro-row-left">
                    <div className="macro-stat-icon-badge">
                      <span className="macro-emoji">☀️</span>
                    </div>
                    <span className="macro-row-name">Vitamin D</span>
                  </div>
                  <span className="macro-row-val">{curVitaminD} mcg <small>({Math.round(curVitaminD * 40)} IU)</small></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Button */}
      <div className="food-edit-sticky-bottom">
        <button
          type="button"
          className="btn-save-custom-meal-lime"
          onClick={handleSave}
        >
          <Check size={19} strokeWidth={2.8} />
          {actionLabel || `Update ${category.charAt(0).toUpperCase() + category.slice(1)}`}
        </button>
      </div>
    </div>
  );
}
