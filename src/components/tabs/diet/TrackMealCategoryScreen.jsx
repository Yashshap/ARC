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


  const handleToggleSelectFoodItem = (food, isCustom = false) => {
    const isAlreadySelected = selectedMealItems.some(it => it.id === food.id);
    if (isAlreadySelected) {
      setSelectedMealItems(prev => prev.filter(it => it.id !== food.id));
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
    }
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
        {(
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
              {filteredCustomMeals.length === 0 && (
                <div
                  className="meal-empty-note"
                  style={{ cursor: "pointer", padding: "12px 14px" }}
                  onClick={onOpenCreateMeal}
                >
                  No custom meals saved yet — tap <strong>+ Custom Meal</strong> to create one.
                </div>
              )}
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

      {/* Sticky Bottom Track Action Button */}
      <div className="track-meal-sticky-bottom">
        <button
          type="button"
          className="btn-save-custom-meal-lime"
          onClick={handleCommitAddToMeal}
          disabled={selectedMealItems.length === 0}
        >
          <Check size={19} strokeWidth={2.8} /> Add to {categoryLabel}
          {selectedMealItems.length > 0 ? ` (${selectedMealItems.length})` : ''}
        </button>
      </div>

    </div>
  );
}
