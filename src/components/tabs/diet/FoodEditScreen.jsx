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
}) {
  const item = editingMealItem?.item;
  const category = editingMealItem?.category || "breakfast";

  const dbMatch = DEFAULT_FOOD_DATABASE.find(f => f.id === item?.id || f.name.toLowerCase() === item?.name?.toLowerCase());

  const baseWeight = Number(item?.weight) || Number(item?.baseWeight) || 100;
  const baseCalories = Number(item?.calories) || 0;
  const baseProtein = Number(item?.protein) || 0;
  const baseCarbs = Number(item?.carbs) || 0;
  const baseFats = Number(item?.fats) || 0;
  const baseFiber = Number(item?.fiber) || Math.round(baseCarbs * 0.1 * 10) / 10;

  // Reference micronutrients per 100g
  const basePotassium = Number(item?.potassium || dbMatch?.potassium) || 0;
  const baseSodium = Number(item?.sodium || dbMatch?.sodium) || 0;
  const baseCalcium = Number(item?.calcium || dbMatch?.calcium) || 0;
  const baseIron = Number(item?.iron || dbMatch?.iron) || 0;
  const baseMagnesium = Number(item?.magnesium || dbMatch?.magnesium) || 0;
  const baseZinc = Number(item?.zinc || dbMatch?.zinc) || 0;
  const baseVitaminB12 = Number(item?.vitaminB12 ?? dbMatch?.vitaminB12) || 0;
  const baseFolateB9 = Number(item?.folateB9 ?? dbMatch?.folateB9) || 0;
  const baseVitaminD = Number(item?.vitaminD ?? dbMatch?.vitaminD) || 0;

  const [editQuantity, setEditQuantity] = useState(1);
  const [editMeasure, setEditMeasure] = useState("serving");

  const [editItemWeight, setEditItemWeight] = useState(baseWeight);
  const [editItemCalories, setEditItemCalories] = useState(baseCalories);
  const [editItemProtein, setEditItemProtein] = useState(baseProtein);
  const [editItemCarbs, setEditItemCarbs] = useState(baseCarbs);
  const [editItemFats, setEditItemFats] = useState(baseFats);
  const [editItemFiber, setEditItemFiber] = useState(baseFiber);

  if (!item) return null;

  const currentWeightNum = Number(editItemWeight) || baseWeight || 100;
  const scale = currentWeightNum / Math.max(1, baseWeight);
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
    const unitGrams = measureObj.getGrams(baseWeight);
    const totalGrams = Math.round(q * unitGrams);

    const s = totalGrams / Math.max(1, baseWeight);
    const cal = Math.round(baseCalories * s);
    const p = Math.round(baseProtein * s * 10) / 10;
    const c = Math.round(baseCarbs * s * 10) / 10;
    const f = Math.round(baseFats * s * 10) / 10;
    const fib = Math.round(baseFiber * s * 10) / 10;

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

    const baseW = Math.max(1, baseWeight || 100);
    const s = totalGrams / baseW;
    const cal = Math.round(baseCalories * s);
    const p = Math.round(baseProtein * s);
    const c = Math.round(baseCarbs * s);
    const f = Math.round(baseFats * s);
    const fib = Math.round(baseFiber * s);

    setEditItemCalories(cal);
    setEditItemProtein(p);
    setEditItemCarbs(c);
    setEditItemFats(f);
    setEditItemFiber(fib);

    const measureObj = MEASURE_OPTIONS.find(m => m.key === editMeasure) || MEASURE_OPTIONS[0];
    const unitGrams = measureObj.getGrams(baseW);
    const calculatedQty = Math.round(totalGrams / Math.max(1, unitGrams));
    setEditQuantity(calculatedQty);
  };

  const handleSave = () => {
    if (onSave) {
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
        weight: Number(editItemWeight) || baseWeight || 100,
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
                    handleNetWeightChange(baseWeight || 100);
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
          Update {category.charAt(0).toUpperCase() + category.slice(1)}
        </button>
      </div>
    </div>
  );
}
