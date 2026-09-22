import React, { useState, useMemo, useRef } from 'react';
import {
  ArrowLeft, Utensils, Flame, Plus, Scale, Trash2, Check, CheckCircle2, Search, X
} from 'lucide-react';
import { calculateMealTotal } from '../../../utils/macroCalculations';
import { DEFAULT_FOOD_DATABASE } from '../../../data/foodDatabase';

export default function CustomMealBuilderScreen({
  onClose,
  onSaveCustomMeal,
  foodDatabase = DEFAULT_FOOD_DATABASE,
}) {
  const [newMealName, setNewMealName] = useState('');
  const [builderItems, setBuilderItems] = useState([]);
  const [savedToast, setSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Ingredient picker modal states
  const [isIngredientPickerOpen, setIsIngredientPickerOpen] = useState(false);
  const [selectedIngredientItems, setSelectedIngredientItems] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [isIngDragging, setIsIngDragging] = useState(false);
  const [ingDragY, setIngDragY] = useState(0);
  const touchStartYRef = useRef(0);

  const builderTotals = useMemo(() => calculateMealTotal(builderItems), [builderItems]);

  const filteredIngredients = useMemo(() => {
    const list = foodDatabase || [];
    const q = ingredientSearch.toLowerCase().trim();
    return list.filter(item => {
      return !q || item.name.toLowerCase().includes(q) || (item.categoryLabel && item.categoryLabel.toLowerCase().includes(q));
    });
  }, [foodDatabase, ingredientSearch]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2400);
  };

  const handleOpenAddIngredient = () => {
    setSelectedIngredientItems([]);
    setIngredientSearch('');
    setIsIngredientPickerOpen(true);
  };

  const handleToggleSelectIngredient = (food) => {
    const isAlreadySelected = selectedIngredientItems.some(it => it.id === food.id);
    if (isAlreadySelected) {
      setSelectedIngredientItems(prev => prev.filter(it => it.id !== food.id));
    } else {
      setSelectedIngredientItems(prev => [...prev, food]);
    }
  };

  const handleCommitAddIngredients = () => {
    const newItems = selectedIngredientItems.map(food => ({
      id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: food.name,
      baseWeight: food.baseWeight || 100,
      weight: food.defaultWeight || food.baseWeight || 100,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      unit: food.unit || 'g',
    }));

    setBuilderItems(prev => [...prev, ...newItems]);
    setIsIngredientPickerOpen(false);
    setSelectedIngredientItems([]);
    showToast(`Added ${newItems.length} ingredient${newItems.length > 1 ? 's' : ''}! 🥗`);
  };

  const handleUpdateBuilderItemWeight = (itemId, newWeightVal, isDelta = false) => {
    setBuilderItems(prev => prev.map(it => {
      if (it.id !== itemId) return it;
      const current = Number(it.weight) || 0;
      const newW = isDelta ? Math.max(5, current + newWeightVal) : Math.max(0, Number(newWeightVal) || 0);
      return { ...it, weight: newW };
    }));
  };

  const handleRemoveBuilderItem = (itemId) => {
    setBuilderItems(prev => prev.filter(it => it.id !== itemId));
  };

  const handleSaveCustomMealSubmit = (e) => {
    e.preventDefault();
    if (!newMealName.trim() || builderItems.length === 0) return;

    const totals = calculateMealTotal(builderItems);
    const subtitle = builderItems.slice(0, 3).map(it => it.name).join(', ') + (builderItems.length > 3 ? '...' : '');

    const customMealObj = {
      id: `custom_meal_${Date.now()}`,
      name: newMealName.trim(),
      subtitle,
      isCustomMeal: true,
      items: builderItems,
      weight: totals.totalWeight,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats,
    };

    if (onSaveCustomMeal) {
      onSaveCustomMeal(customMealObj);
    }
    showToast('Custom meal created successfully! 🍽️');
    setTimeout(() => {
      if (onClose) onClose();
    }, 400);
  };

  // Swipe handlers for add ingredient modal
  const handleIngTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
    setIsIngDragging(true);
  };

  const handleIngTouchMove = (e) => {
    if (!isIngDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartYRef.current;
    if (diff > 0) {
      setIngDragY(diff);
    }
  };

  const handleIngTouchEnd = () => {
    if (ingDragY > 120) {
      setIsIngredientPickerOpen(false);
      setSelectedIngredientItems([]);
    }
    setIsIngDragging(false);
    setIngDragY(0);
  };

  return (
    <div className="custom-meal-screen modern-details-theme">
      {/* Top Bar with Back Button, Screen Title */}
      <div className="details-screen-top-bar">
        <button
          type="button"
          className="btn-details-back"
          onClick={onClose}
          title="Return to Diet overview"
        >
          <ArrowLeft size={18} />
        </button>

        <h2 className="details-screen-header-title">Create Custom Meal</h2>

        <div style={{ width: 40, height: 40 }} />
      </div>

      <div className="custom-meal-scroll-body">
        <form onSubmit={handleSaveCustomMealSubmit} className="custom-meal-form-container">
          {/* Meal Name Input */}
          <div className="custom-meal-card custom-meal-name-card">
            <div className="custom-meal-name-row">
              <div className="custom-meal-logo-col">
                <div className="card-icon-badge badge-utensils">
                  <Utensils size={20} />
                </div>
              </div>
              <div className="custom-meal-input-col">
                <label className="custom-meal-tiny-label">Enter the meal name</label>
                <input
                  type="text"
                  className="custom-meal-underline-input"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Card 2: Live Nutritional Breakdown */}
          <div className="custom-meal-card">
            <div className="custom-meal-card-header-between">
              <div className="header-title-col">
                <h3 className="card-title">Nutrition Summary</h3>
                <p className="card-subtitle">Live calculated values from ingredients</p>
              </div>
              <div className="total-weight-pill">
                {Math.round(builderTotals.totalWeight)}g total
              </div>
            </div>

            {/* Energy Hero Box */}
            <div className="custom-meal-energy-box">
              <div className="energy-left">
                <div className="energy-icon-wrap">
                  <Flame size={20} className="flame-icon-orange" />
                </div>
                <div>
                  <span className="energy-label">Total Calories</span>
                  <span className="energy-sub">Energy density</span>
                </div>
              </div>
              <div className="energy-right">
                <span className="energy-value">{Math.round(builderTotals.calories)}</span>
                <span className="energy-unit">kcal</span>
              </div>
            </div>

            {/* 3 Macro Stat Columns */}
            <div className="custom-meal-macro-grid">
              <div className="custom-macro-stat-box protein-box">
                <div className="macro-icon-wrap protein-icon-wrap">🍗</div>
                <span className="macro-stat-label">Protein</span>
                <span className="macro-stat-value">{Math.round(builderTotals.protein)}g</span>
              </div>

              <div className="custom-macro-stat-box carb-box">
                <div className="macro-icon-wrap carb-icon-wrap">🌾</div>
                <span className="macro-stat-label">Carbs</span>
                <span className="macro-stat-value">{Math.round(builderTotals.carbs)}g</span>
              </div>

              <div className="custom-macro-stat-box fat-box">
                <div className="macro-icon-wrap fat-icon-wrap">🥑</div>
                <span className="macro-stat-label">Fats</span>
                <span className="macro-stat-value">{Math.round(builderTotals.fats)}g</span>
              </div>
            </div>
          </div>

          {/* Section 3: Ingredients List */}
          <div className="custom-meal-ingredients-section">
            <div className="ingredients-section-header">
              <div className="ingredients-title-row">
                <h3 className="section-title">Ingredients</h3>
                <span className="ingredients-count-badge">{builderItems.length}</span>
              </div>
              <button
                type="button"
                className="btn-add-ingredient-pill"
                onClick={handleOpenAddIngredient}
              >
                <Plus size={15} /> Add Ingredient
              </button>
            </div>

            {builderItems.length === 0 ? (
              <div className="builder-empty-card" onClick={handleOpenAddIngredient}>
                <div className="empty-icon-wrap">
                  <Scale size={28} />
                </div>
                <span className="empty-heading">No ingredients added yet</span>
                <span className="empty-description">
                  Tap "+ Add Ingredient" to specify weight and macros for each item
                </span>
                <button type="button" className="btn-empty-add-action">
                  <Plus size={15} /> Add First Ingredient
                </button>
              </div>
            ) : (
              <div className="builder-items-list-modern">
                {builderItems.map((item) => (
                  <div key={item.id} className="builder-item-card-modern builder-item-row-clean">
                    <div className="builder-item-info">
                      <span className="builder-item-name">{item.name}</span>
                    </div>
                    <div className="builder-item-actions">
                      <label className="builder-weight-pill" title="Tap to edit weight">
                        <input
                          type="number"
                          className="builder-weight-input"
                          value={item.weight}
                          onChange={(e) => handleUpdateBuilderItemWeight(item.id, e.target.value, false)}
                          onBlur={() => {
                            if (!item.weight || Number(item.weight) <= 0) {
                              handleUpdateBuilderItemWeight(item.id, item.baseWeight || 100, false);
                            }
                          }}
                          min="1"
                          placeholder="0"
                        />
                        <span className="builder-weight-unit">{item.unit || 'g'}</span>
                      </label>
                      <button
                        type="button"
                        className="btn-remove-ingredient"
                        onClick={() => handleRemoveBuilderItem(item.id)}
                        title={`Remove ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fixed Bottom Save Button */}
          <div className="custom-meal-sticky-bottom">
            <button
              type="submit"
              className="btn-save-custom-meal-lime"
              disabled={!newMealName.trim() || builderItems.length === 0}
            >
              <Check size={19} strokeWidth={2.8} /> Save Custom Meal
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {savedToast && (
        <div className="details-floating-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage || 'Saved successfully!'}</span>
        </div>
      )}

      {/* Add Ingredient Picker Modal */}
      {isIngredientPickerOpen && (
        <div
          className="modal-overlay modern-diet-modal-overlay"
          onClick={() => {
            setIsIngredientPickerOpen(false);
            setIngDragY(0);
            setSelectedIngredientItems([]);
          }}
        >
          <div
            className="modal-content add-ingredient-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: ingDragY > 0 ? `translateY(${ingDragY}px)` : 'none',
              transition: isIngDragging ? 'none' : 'transform 0.25s ease-out',
            }}
          >
            <div
              className="modal-drag-pill-area"
              onTouchStart={handleIngTouchStart}
              onTouchMove={handleIngTouchMove}
              onTouchEnd={handleIngTouchEnd}
            >
              <div className="modal-drag-pill" />
            </div>

            {/* Header */}
            <div
              className="edit-goals-header-row"
              onTouchStart={handleIngTouchStart}
              onTouchMove={handleIngTouchMove}
              onTouchEnd={handleIngTouchEnd}
            >
              <div className="edit-goals-title-group">
                <h3 className="edit-goals-title">Add Ingredient</h3>
              </div>
              <button
                type="button"
                className="btn-modal-close-round"
                onClick={() => {
                  setIsIngredientPickerOpen(false);
                  setIngDragY(0);
                  setSelectedIngredientItems([]);
                }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Ingredient Database Browser (Search & Multi-Selection) */}
            <div className="ingredient-browser-view">
              {/* Search Bar */}
              <div className="ingredient-search-bar">
                <Search size={17} className="search-icon-gray" />
                <input
                  type="text"
                  className="ingredient-search-input"
                  placeholder="Search oils, nuts, grains, dairy, meats..."
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  autoFocus
                />
                {ingredientSearch && (
                  <button
                    type="button"
                    className="btn-clear-ing-search"
                    onClick={() => setIngredientSearch('')}
                    title="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Ingredients List */}
              <div className="track-items-list ingredient-modal-track-list">
                {filteredIngredients.length === 0 ? (
                  <div className="ingredient-db-empty">
                    <span>No ingredients found matching "{ingredientSearch}"</span>
                  </div>
                ) : (
                  filteredIngredients.map(item => {
                    const scale = (item.defaultWeight || item.baseWeight || 100) / (item.baseWeight || 100);
                    const cals = Math.round(item.calories * scale);
                    const servingDesc = item.serving || `${item.defaultWeight || item.baseWeight || 100}${item.unit || 'g'}`;
                    const isSelected = selectedIngredientItems.some(it => it.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className={`track-meal-item-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleSelectIngredient(item)}
                      >
                        <div className="item-text-col">
                          <span className="item-title">{item.name}</span>
                          <span className="item-subtitle">{servingDesc}</span>
                        </div>
                        <div className="item-action-col">
                          <span className="item-cals">{cals} Cal</span>
                          <button
                            type="button"
                            className={`btn-food-plus ${isSelected ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSelectIngredient(item);
                            }}
                            title={isSelected ? `Deselect ${item.name}` : `Select ${item.name}`}
                          >
                            {isSelected ? <Check size={16} strokeWidth={2.6} /> : <Plus size={16} />}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sticky Bottom Action Button */}
              <div className="ingredient-modal-sticky-bottom">
                <button
                  type="button"
                  className="btn-track-category-lime"
                  disabled={selectedIngredientItems.length === 0}
                  onClick={handleCommitAddIngredients}
                >
                  Add Ingredient{selectedIngredientItems.length > 1 ? 's' : ''}
                  {selectedIngredientItems.length > 0 ? ` (${selectedIngredientItems.length})` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
