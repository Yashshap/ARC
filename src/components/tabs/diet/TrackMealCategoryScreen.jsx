import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Search, X, Plus, Check
} from 'lucide-react';
import { calculateMealTotal } from '../../../utils/macroCalculations';
import FoodEditScreen from './FoodEditScreen';

export default function TrackMealCategoryScreen({
  category,
  onClose,
  customMeals = [],
  foodDatabase = [],
  loggedCategoryMeals = [],
  onOpenCreateMeal,
  onAddItems,
  onUpdateMealItem,
  onSaveCustomMeal,
  onShowNotification,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealItems, setSelectedMealItems] = useState([]);
  const [editedItemsMap, setEditedItemsMap] = useState({});
  const [editingFoodItem, setEditingFoodItem] = useState(null);

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

  const buildFoodEntry = (food, isCustom = false) => {
    const existingSelected = selectedMealItems.find(it => it.id === food.id);
    if (existingSelected) return existingSelected;
    if (editedItemsMap[food.id]) return editedItemsMap[food.id];

    if (isCustom || food.isAlreadyScaled) {
      const customWeight =
        Number(food.weight) ||
        Number(food.baseServingWeight) ||
        (food.items ? calculateMealTotal(food.items).totalWeight : 100);
      const qtyNum = Number(food.editQuantity) || 1;
      return {
        ...food,
        id: food.id,
        foodId: food.foodId || food.id,
        name: food.name,
        calories: Math.round(Number(food.calories) || 0),
        protein: Math.round((Number(food.protein) || 0) * 10) / 10,
        carbs: Math.round((Number(food.carbs) || 0) * 10) / 10,
        fats: Math.round((Number(food.fats) || 0) * 10) / 10,
        fiber: Math.round((Number(food.fiber) || 0) * 10) / 10,
        baseServingWeight: Number(food.baseServingWeight) || customWeight,
        baseCalories: Number(food.baseCalories) || ((Number(food.calories) || 0) / qtyNum),
        baseProtein: Number(food.baseProtein) || ((Number(food.protein) || 0) / qtyNum),
        baseCarbs: Number(food.baseCarbs) || ((Number(food.carbs) || 0) / qtyNum),
        baseFats: Number(food.baseFats) || ((Number(food.fats) || 0) / qtyNum),
        baseFiber: Number(food.baseFiber) || ((Number(food.fiber) || 0) / qtyNum),
        editQuantity: qtyNum,
        editMeasure: food.editMeasure || 'serving',
        items: food.items,
        isCustomMeal: isCustom,
        weight: customWeight,
        serving: food.serving || `1 serving (${Math.round(customWeight)}g)`,
        quantity: food.quantity || food.serving || `1 serving (${Math.round(customWeight)}g)`,
        isAlreadyScaled: true,
      };
    }

    // Standard database item: scale per-100g values to 1 default serving (defaultWeight)
    const servingWeight = Number(food.defaultWeight) || Number(food.baseWeight) || 100;
    const refWeight = Number(food.baseWeight) || 100;
    const scale = servingWeight / Math.max(1, refWeight);
    const microScale = servingWeight / 100;

    const scaledCals = Math.round((Number(food.calories) || 0) * scale);
    const scaledProt = Math.round((Number(food.protein) || 0) * scale * 10) / 10;
    const scaledCarbs = Math.round((Number(food.carbs) || 0) * scale * 10) / 10;
    const scaledFats = Math.round((Number(food.fats) || 0) * scale * 10) / 10;
    const scaledFiber = Math.round((Number(food.fiber) || 0) * scale * 10) / 10;

    return {
      ...food,
      id: food.id,
      foodId: food.foodId || food.id,
      name: food.name,
      calories: scaledCals,
      protein: scaledProt,
      carbs: scaledCarbs,
      fats: scaledFats,
      fiber: scaledFiber,
      potassium: Math.round((Number(food.potassium) || 0) * microScale * 10) / 10,
      sodium: Math.round((Number(food.sodium) || 0) * microScale * 10) / 10,
      calcium: Math.round((Number(food.calcium) || 0) * microScale * 10) / 10,
      iron: Math.round((Number(food.iron) || 0) * microScale * 10) / 10,
      magnesium: Math.round((Number(food.magnesium) || 0) * microScale * 10) / 10,
      zinc: Math.round((Number(food.zinc) || 0) * microScale * 10) / 10,
      vitaminB12: Math.round((Number(food.vitaminB12) || 0) * microScale * 100) / 100,
      folateB9: Math.round((Number(food.folateB9) || 0) * microScale * 10) / 10,
      vitaminD: Math.round((Number(food.vitaminD) || 0) * microScale * 10) / 10,
      baseServingWeight: servingWeight,
      baseCalories: scaledCals,
      baseProtein: scaledProt,
      baseCarbs: scaledCarbs,
      baseFats: scaledFats,
      baseFiber: scaledFiber,
      editQuantity: 1,
      editMeasure: 'serving',
      items: food.items,
      isCustomMeal: false,
      weight: servingWeight,
      serving: food.serving || `1 serving (${servingWeight}${food.unit || 'g'})`,
      quantity: food.serving || `1 serving (${servingWeight}${food.unit || 'g'})`,
      isAlreadyScaled: true,
    };
  };

  const handleToggleSelectFoodItem = (food, isCustom = false) => {
    const isAlreadySelected = selectedMealItems.some(it => it.id === food.id);
    if (isAlreadySelected) {
      setSelectedMealItems(prev => prev.filter(it => it.id !== food.id));
    } else {
      const itemToSelect = buildFoodEntry(food, isCustom);
      setSelectedMealItems(prev => [...prev, itemToSelect]);
    }
  };

  const handleOpenFoodEdit = (food, isCustom = false) => {
    const entry = buildFoodEntry(food, isCustom);
    setEditingFoodItem({
      category: category || 'breakfast',
      item: entry,
      isCustom,
    });
  };

  const applyEditedItemChanges = (itemId, updatedFields) => {
    const baseItem = editingFoodItem?.item || {};
    const mergedItem = {
      ...baseItem,
      ...updatedFields,
      id: itemId,
      foodId: baseItem.foodId || itemId,
      isAlreadyScaled: true,
    };

    setEditedItemsMap(prev => ({ ...prev, [itemId]: mergedItem }));
    setSelectedMealItems(prev => {
      const exists = prev.some(it => it.id === itemId);
      if (exists) {
        return prev.map(it => (it.id === itemId ? mergedItem : it));
      }
      return [...prev, mergedItem];
    });

    // If this item is a saved Custom Meal, persist the updated quantity/calories to customMeals too
    if (editingFoodItem?.isCustom && onSaveCustomMeal) {
      onSaveCustomMeal(mergedItem);
    }

    // If this food/meal is already logged in Today's Meals for this category, update it there too
    if (onUpdateMealItem && Array.isArray(loggedCategoryMeals)) {
      const alreadyLogged = loggedCategoryMeals.find(
        m => m.id === itemId || m.foodId === itemId
      );
      if (alreadyLogged) {
        onUpdateMealItem(category, alreadyLogged.id, updatedFields);
      }
    }

    return mergedItem;
  };

  const handleLiveFoodEdit = (_cat, itemId, updatedFields) => {
    applyEditedItemChanges(itemId, updatedFields);
  };

  const handleSaveFoodEdit = (_cat, itemId, updatedFields) => {
    applyEditedItemChanges(itemId, updatedFields);
    setEditingFoodItem(null);
  };

  const handleDeleteFoodEdit = (_cat, itemId) => {
    setSelectedMealItems(prev => prev.filter(it => it.id !== itemId));
    setEditingFoodItem(null);
  };

  const handleCommitAddToMeal = () => {
    if (!category || selectedMealItems.length === 0) return;
    // Avoid adding a duplicate copy if the item was already in Today's Meals and updated in-place
    const itemsToAdd = selectedMealItems.filter(sel => {
      const wasEditedAndAlreadyLogged =
        editedItemsMap[sel.id] &&
        Array.isArray(loggedCategoryMeals) &&
        loggedCategoryMeals.some(m => m.id === sel.id || m.foodId === sel.id);
      return !wasEditedAndAlreadyLogged;
    });

    if (itemsToAdd.length > 0 && onAddItems) {
      onAddItems(category, itemsToAdd);
    }
    if (onShowNotification) {
      onShowNotification(`Saved to ${categoryLabel}! 🥗`);
    }
    setSelectedMealItems([]);
    setSearchQuery('');
    if (onClose) onClose();
  };

  const handleScreenBack = () => {
    if (selectedMealItems.length > 0) {
      handleCommitAddToMeal();
      return;
    }
    if (onClose) onClose();
  };

  if (editingFoodItem) {
    return (
      <FoodEditScreen
        key={editingFoodItem.item.id}
        editingMealItem={editingFoodItem}
        onClose={() => setEditingFoodItem(null)}
        onLiveChange={handleLiveFoodEdit}
        onSave={handleSaveFoodEdit}
        onDelete={handleDeleteFoodEdit}
        actionLabel={`Save for ${categoryLabel || 'Meal'}`}
      />
    );
  }

  return (
    <div className="track-meal-screen modern-details-theme">
      {/* Top Bar with Back Button */}
      <div className="track-meal-top-bar">
        <button
          type="button"
          className="btn-track-back"
          onClick={handleScreenBack}
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
              const displayMeal = buildFoodEntry(meal, true);
              const subtitle = displayMeal.quantity || (meal.items && meal.items.length > 0
                ? meal.items.map(it => it.name).join(', ')
                : (meal.subtitle || 'Custom prepared meal'));
              const isSelected = selectedMealItems.some(it => it.id === meal.id);
              return (
                <div
                  key={meal.id}
                  className={`track-meal-item-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleOpenFoodEdit(meal, true)}
                >
                  <div className="item-text-col">
                    <span className="item-title">{displayMeal.name}</span>
                    <span className="item-subtitle">{subtitle}</span>
                  </div>
                  <div className="item-action-col">
                    <span className="item-cals">{Math.round(displayMeal.calories)} Cal</span>
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
                style={{ cursor: 'pointer', padding: '12px 14px' }}
                onClick={onOpenCreateMeal}
              >
                No custom meals saved yet — tap <strong>+ Custom Meal</strong> to create one.
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Did you also have... / Food Database */}
        <div className="track-meal-section">
          <div className="track-section-header">
            <span className="track-section-title">Did you also have...</span>
          </div>
          <div className="track-items-list">
            {filteredFoods.map(food => {
              const displayFood = buildFoodEntry(food, false);
              const servingDesc = displayFood.quantity || displayFood.serving || `${displayFood.baseServingWeight || 100}${displayFood.unit || 'g'}`;
              const isSelected = selectedMealItems.some(it => it.id === food.id);
              return (
                <div
                  key={food.id}
                  className={`track-meal-item-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleOpenFoodEdit(food, false)}
                >
                  <div className="item-text-col">
                    <span className="item-title">{displayFood.name}</span>
                    <span className="item-subtitle">{servingDesc}</span>
                  </div>
                  <div className="item-action-col">
                    <span className="item-cals">{Math.round(displayFood.calories)} Cal</span>
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
