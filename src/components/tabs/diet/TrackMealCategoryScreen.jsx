import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Search, X, Plus, Check
} from 'lucide-react';
import { calculateItemMacros, calculateMealTotal } from '../../../utils/macroCalculations';

export default function TrackMealCategoryScreen({
  category,
  onClose,
  customMeals = [],
  foodDatabase = [],
  onOpenCreateMeal,
  onAddItems,
  onShowNotification,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealItems, setSelectedMealItems] = useState([]);
  const [undoItem, setUndoItem] = useState(null);

  // Customize/adjust modal for custom meal before logging
  const [selectedMealForLog, setSelectedMealForLog] = useState(null);
  const [customizingLogItems, setCustomizingLogItems] = useState([]);

  const categoryLabel = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';

  const filteredCustomMeals = useMemo(() => {
    return customMeals.filter(meal =>
      (meal?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customMeals, searchQuery]);

  const filteredFoods = useMemo(() => {
    return foodDatabase.filter(food =>
      (food?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [foodDatabase, searchQuery]);

  const logTotals = useMemo(() => calculateMealTotal(customizingLogItems), [customizingLogItems]);

  const handleToggleSelectFoodItem = (food, isCustom = false) => {
    const isAlreadySelected = selectedMealItems.some(it => it.id === food.id);
    if (isAlreadySelected) {
      setSelectedMealItems(prev => prev.filter(it => it.id !== food.id));
      if (undoItem?.id === food.id) setUndoItem(null);
    } else {
      const itemToSelect = {
        id: food.id,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
        items: food.items,
        isCustomMeal: isCustom,
        weight: food.baseWeight || (food.items ? calculateMealTotal(food.items).totalWeight : 100),
        serving: food.serving,
        quantity: food.serving || '1 serving',
      };
      setSelectedMealItems(prev => [...prev, itemToSelect]);
      setUndoItem({ id: food.id, name: food.name });
    }
  };

  const handleUndoSelect = () => {
    if (!undoItem) return;
    setSelectedMealItems(prev => prev.filter(it => it.id !== undoItem.id));
    setUndoItem(null);
  };

  const handleCommitAddToMeal = () => {
    if (!category || selectedMealItems.length === 0) return;
    if (onAddItems) {
      onAddItems(category, selectedMealItems);
    }
    if (onShowNotification) {
      onShowNotification(`Added to ${categoryLabel}! 🥗`);
    }
    setSelectedMealItems([]);
    setSearchQuery('');
    setUndoItem(null);
    if (onClose) onClose();
  };

  // Adjust custom meal flow
  const handleOpenCustomizeModal = (meal) => {
    setSelectedMealForLog(meal);
    setCustomizingLogItems(meal.items ? meal.items.map(it => ({ ...it })) : []);
  };

  const handleUpdateLogItemWeight = (itemId, deltaOrValue, isDelta = false) => {
    setCustomizingLogItems(prev => prev.map(it => {
      if (it.id !== itemId) return it;
      const current = Number(it.weight) || 0;
      const newW = isDelta ? Math.max(5, current + deltaOrValue) : Math.max(0, Number(deltaOrValue) || 0);
      return { ...it, weight: newW };
    }));
  };

  const handleConfirmLogCustomMeal = () => {
    if (!category || !selectedMealForLog) return;
    const totals = calculateMealTotal(customizingLogItems);
    const itemToLog = {
      name: selectedMealForLog.name,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats,
      items: customizingLogItems,
      weight: totals.totalWeight,
      isCustomMeal: true,
    };
    if (onAddItems) {
      onAddItems(category, [itemToLog]);
    }
    if (onShowNotification) {
      onShowNotification(`Added to ${categoryLabel}! 🥗`);
    }
    setSelectedMealForLog(null);
    setCustomizingLogItems([]);
    if (onClose) onClose();
  };

  return (
    <div className="track-meal-screen modern-details-theme">
      {/* Top Bar with Back Button */}
      <div className="track-meal-top-bar">
        <button
          type="button"
          className="btn-track-back"
          onClick={onClose}
          title="Return to Diet overview"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="track-meal-search-container">
        <div className="track-meal-search-box">
          <Search size={18} className="search-icon-gray" />
          <input
            type="text"
            className="track-meal-search-input"
            placeholder="Search by Food Name/Dish"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="track-meal-scroll-body">
        {/* Section 1: My Meals */}
        {filteredCustomMeals.length > 0 && (
          <div className="track-meal-section">
            <div className="track-section-header">
              <span className="track-section-title">My Meals</span>
              <button
                type="button"
                className="track-section-action-btn"
                onClick={onOpenCreateMeal}
              >
                + Custom Meal
              </button>
            </div>
            <div className="track-items-list">
              {filteredCustomMeals.map(meal => {
                const subtitle = meal.items && meal.items.length > 0
                  ? meal.items.map(it => it.name).join(', ')
                  : (meal.subtitle || 'Custom prepared meal');
                const isSelected = selectedMealItems.some(it => it.id === meal.id);
                return (
                  <div
                    key={meal.id}
                    className={`track-meal-item-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleSelectFoodItem(meal, true)}
                  >
                    <div className="item-text-col">
                      <span className="item-title">{meal.name}</span>
                      <span className="item-subtitle">{subtitle}</span>
                    </div>
                    <div className="item-action-col">
                      <button
                        type="button"
                        className="btn-text-adjust"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCustomizeModal(meal);
                        }}
                        title="Adjust ingredients"
                      >
                        Adjust
                      </button>
                      <span className="item-cals">{meal.calories} Cal</span>
                      <button
                        type="button"
                        className={`btn-food-plus ${isSelected ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelectFoodItem(meal, true);
                        }}
                        title={isSelected ? `Deselect ${meal.name}` : `Select ${meal.name}`}
                      >
                        {isSelected ? <Check size={16} strokeWidth={2.6} /> : <Plus size={16} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Did you also have... / Food Database */}
        <div className="track-meal-section">
          <div className="track-section-header">
            <span className="track-section-title">Did you also have...</span>
          </div>
          <div className="track-items-list">
            {filteredFoods.map(food => {
              const servingDesc = food.serving || `${food.baseWeight || 100}${food.unit || 'g'}`;
              const isSelected = selectedMealItems.some(it => it.id === food.id);
              return (
                <div
                  key={food.id}
                  className={`track-meal-item-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleToggleSelectFoodItem(food, false)}
                >
                  <div className="item-text-col">
                    <span className="item-title">{food.name}</span>
                    <span className="item-subtitle">{servingDesc}</span>
                  </div>
                  <div className="item-action-col">
                    <span className="item-cals">{food.calories} Cal</span>
                    <button
                      type="button"
                      className={`btn-food-plus ${isSelected ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelectFoodItem(food, false);
                      }}
                      title={isSelected ? `Deselect ${food.name}` : `Select ${food.name}`}
                    >
                      {isSelected ? <Check size={16} strokeWidth={2.6} /> : <Plus size={16} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Undo Toast Bar */}
      {undoItem && (
        <div className="track-meal-undo-bar">
          <span className="undo-text">{undoItem.name} selected.</span>
          <button
            type="button"
            className="btn-undo-action"
            onClick={handleUndoSelect}
          >
            Undo
          </button>
        </div>
      )}

      {/* Sticky Bottom Track Action Button */}
      <div className="track-meal-sticky-bottom">
        <button
          type="button"
          className="btn-track-category-lime"
          onClick={handleCommitAddToMeal}
          disabled={selectedMealItems.length === 0}
        >
          Add to {categoryLabel}
          {selectedMealItems.length > 0 ? ` (${selectedMealItems.length})` : ''}
        </button>
      </div>

      {/* Adjust & Log Custom Meal Modal */}
      {selectedMealForLog && (
        <div className="modal-overlay" onClick={() => setSelectedMealForLog(null)}>
          <div className="modal-content custom-meal-builder-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            <div className="modal-title-row">
              <div>
                <span className="badge badge-diet">
                  Add to {categoryLabel}
                </span>
                <h3 className="modal-title">{selectedMealForLog.name}</h3>
              </div>
            </div>

            <p className="builder-helper-text">
              Adjust any item's weight below — macros will recalculate in real-time:
            </p>

            <div className="builder-items-list">
              {customizingLogItems.map((item) => {
                const macros = calculateItemMacros(item, item.weight);
                return (
                  <div key={item.id} className="builder-item-card glass-card">
                    <div className="builder-item-top">
                      <span className="builder-item-name">{item.name}</span>
                      <div className="weight-adjuster-pill">
                        <button
                          type="button"
                          className="btn-weight-step"
                          onClick={() => handleUpdateLogItemWeight(item.id, -10, true)}
                          title="-10g"
                        >
                          -10
                        </button>
                        <div className="weight-input-wrap">
                          <input
                            type="number"
                            className="input-weight-field"
                            value={item.weight}
                            onChange={(e) => handleUpdateLogItemWeight(item.id, e.target.value, false)}
                            min="0"
                          />
                          <span className="weight-unit">g</span>
                        </div>
                        <button
                          type="button"
                          className="btn-weight-step"
                          onClick={() => handleUpdateLogItemWeight(item.id, 10, true)}
                          title="+10g"
                        >
                          +10
                        </button>
                      </div>
                    </div>

                    <div className="builder-item-macros-row">
                      <span className="b-macro-cal">{Math.round(macros.calories)} kcal</span>
                      <span>• P: {Math.round(macros.protein)}g</span>
                      <span>• C: {Math.round(macros.carbs)}g</span>
                      <span>• F: {Math.round(macros.fats)}g</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="meal-total-macros-bar">
              <div className="meal-total-header">
                <span className="total-label">Meal Total ({Math.round(logTotals.totalWeight)}g)</span>
                <span className="total-cal">{Math.round(logTotals.calories)} kcal</span>
              </div>
              <div className="meal-total-chips">
                <span className="total-chip chip-protein">P: {Math.round(logTotals.protein)}g</span>
                <span className="total-chip chip-carbs">C: {Math.round(logTotals.carbs)}g</span>
                <span className="total-chip chip-fats">F: {Math.round(logTotals.fats)}g</span>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedMealForLog(null)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-diet"
                onClick={handleConfirmLogCustomMeal}
              >
                <Check size={16} /> Add to {categoryLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
