import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_FOOD_DATABASE } from '../../data/foodDatabase';
import { DEFAULT_CUSTOM_MEALS } from '../../data/defaultCustomMeals';
import SlideOverPage from '../common/SlideOverPage';
import {
  Plus, Trash2, Coffee, Sun, Moon,
  ChevronRight, MoreVertical, Flame, Edit3, Apple, CheckCircle2
} from 'lucide-react';

import NutritionDetailsScreen from './diet/NutritionDetailsScreen';
import FoodEditScreen from './diet/FoodEditScreen';
import CustomMealBuilderScreen from './diet/CustomMealBuilderScreen';
import TrackMealCategoryScreen from './diet/TrackMealCategoryScreen';
import EditGoalsModal from './diet/EditGoalsModal';

export default function DietTab() {
  const {
    data,
    addMealItem,
    removeMealItem,
    updateMealItem,
    updateDietTargets,
    saveCustomMeal,
    toggleTheme,
  } = useApp();

  const dietData = data?.diet || {};
  const targetCalories = Number(dietData.targetCalories) || 2200;
  const targetMacros = dietData.targetMacros || { protein: 77, carbs: 250, fats: 44 };
  const meals = dietData.meals || { breakfast: [], lunch: [], dinner: [], snacks: [] };
  const customMeals = Array.isArray(dietData.customMeals) && dietData.customMeals.length > 0
    ? dietData.customMeals
    : (DEFAULT_CUSTOM_MEALS || []);
  const foodDatabase = DEFAULT_FOOD_DATABASE || [];

  // Calculate totals of logged meals
  const allLoggedItems = [
    ...(meals.breakfast || []),
    ...(meals.lunch || []),
    ...(meals.dinner || []),
    ...(meals.snacks || []),
  ];

  const totalCalories = allLoggedItems.reduce((acc, it) => acc + (it.calories || 0), 0);
  const totalProtein = allLoggedItems.reduce((acc, it) => acc + (it.protein || 0), 0);
  const totalCarbs = allLoggedItems.reduce((acc, it) => acc + (it.carbs || 0), 0);
  const totalFats = allLoggedItems.reduce((acc, it) => acc + (it.fats || 0), 0);
  const remainingCalories = Math.max(0, Math.round(targetCalories - totalCalories));

  // Sub-screen navigation states
  const [activeMealCategory, setActiveMealCategory] = useState(null); // 'breakfast', 'lunch', etc.
  const [editingMealItem, setEditingMealItem] = useState(null); // { category, item }
  const [showDetailsScreen, setShowDetailsScreen] = useState(false);
  const [isCreateMealOpen, setIsCreateMealOpen] = useState(false);
  const [isEditGoalsOpen, setIsEditGoalsOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null); // ID of item whose 3-dots menu is open

  // Toast state
  const [savedToast, setSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showNotification = (msg) => {
    setToastMessage(msg);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2600);
  };

  const mealSections = [
    { key: 'breakfast', label: 'Breakfast', icon: Coffee, color: '#f59e0b' },
    { key: 'lunch', label: 'Lunch', icon: Sun, color: '#10b981' },
    { key: 'dinner', label: 'Dinner', icon: Moon, color: '#6366f1' },
    { key: 'snacks', label: 'Snacks', icon: Apple, color: '#ec4899' },
  ];

  const handleOpenEditItem = (category, item) => {
    setActiveMenuId(null);
    setEditingMealItem({ category, item });
  };

  const handleSaveEditItem = (category, itemId, updatedFields) => {
    updateMealItem(category, itemId, updatedFields);
    showNotification('Item updated successfully! 🥗');
  };

  const handleDeleteMealItem = (category, itemId) => {
    removeMealItem(category, itemId);
    showNotification('Item removed');
  };

  const handleSaveCustomMeal = (newMeal) => {
    saveCustomMeal(newMeal);
  };

  const handleAddItemsToCategory = (category, items) => {
    items.forEach(item => {
      addMealItem(category, item);
    });
  };

  return (
    <div className="tab-container diet-tab">
      {/* ================= MAIN DIET TAB SCREEN ================= */}
      {/* Modern Calorie & Macro Preview Card */}
      <div
        className="diet-single-circle-card modern-entry-card glass-card"
        onClick={() => setShowDetailsScreen(true)}
        role="button"
        tabIndex={0}
        title="Open Nutrition & Macro Details"
      >
        <div className="single-circle-left">
          <div className="modern-entry-badge">
            <Flame size={20} className="text-lime" />
          </div>
          <div className="single-circle-text">
            <div className="entry-card-title-row">
              <span className="entry-card-title">Nutrition & Macros</span>
            </div>
            <div className="entry-card-stats-row">
              <span className="single-circle-current">{totalCalories.toLocaleString()}</span>
              <span className="single-circle-target">/ {targetCalories.toLocaleString()} kcal</span>
            </div>
          </div>
        </div>
        <div className="single-circle-arrow">
          <ChevronRight size={20} />
        </div>
      </div>

      {/* Meals Section Header */}
      <div className="meals-section-header">
        <h3 className="section-title">Today's Meals</h3>
      </div>

      {/* Global Backdrop for 3-dots dropdown */}
      {activeMenuId && (
        <div
          className="menu-backdrop"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenuId(null);
          }}
        />
      )}

      {/* Meals List */}
      <div className="meals-container">
        {mealSections.map(section => {
          const items = meals[section.key] || [];
          const mealCals = items.reduce((acc, it) => acc + (it.calories || 0), 0);
          const Icon = section.icon;
          const hasActiveMenu = items.some(it => it.id === activeMenuId);

          return (
            <div
              key={section.key}
              className={`meal-card glass-card ${hasActiveMenu ? 'has-active-menu' : ''}`}
            >
              <div className="meal-card-header">
                <div className="meal-title-group">
                  <div className="meal-icon" style={{ color: section.color }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="meal-name">{section.label}</h3>
                    <span className="meal-cals">{mealCals} kcal</span>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setActiveMealCategory(section.key);
                  }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Meal Items List */}
              {items.length === 0 ? (
                <div className="meal-empty-note">No items logged yet</div>
              ) : (
                <div className="meal-items-list">
                  {items.map(item => {
                    const isItemMenuActive = activeMenuId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`meal-item-row ${isItemMenuActive ? 'has-active-menu' : ''}`}
                      >
                        <div className="meal-item-details">
                          <span className="meal-item-name">{item.name}</span>
                          <div className="meal-item-qty-cal">
                            <span className="meal-item-qty">
                              {item.weight ? `${Math.round(item.weight)}g` : (item.quantity || '1 serving')}
                            </span>
                            <span className="meal-item-cal-sep">•</span>
                            <span className="meal-item-cal">{Math.round(item.calories)} kcal</span>
                          </div>
                        </div>

                        <div className={`meal-item-menu-wrap ${isItemMenuActive ? 'active' : ''}`}>
                          <button
                            type="button"
                            className="btn-dots-menu"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isItemMenuActive ? null : item.id);
                            }}
                            title="More options"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {isItemMenuActive && (
                            <div className="item-dropdown-menu">
                              <button
                                type="button"
                                className="dropdown-item-btn"
                                onClick={() => handleOpenEditItem(section.key, item)}
                              >
                                <Edit3 size={15} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="dropdown-item-btn text-danger"
                                onClick={() => {
                                  handleDeleteMealItem(section.key, item.id);
                                  setActiveMenuId(null);
                                }}
                              >
                                <Trash2 size={15} />
                              <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= SLIDE-OVER SUB-PAGES ================= */}
      {/* 1. Food Edit Screen */}
      <SlideOverPage
        isOpen={Boolean(editingMealItem)}
        onClose={() => setEditingMealItem(null)}
        zIndex={510}
      >
        {({ close }) => (
          <FoodEditScreen
            key={editingMealItem?.item?.id || 'none'}
            editingMealItem={editingMealItem}
            onClose={close}
            onSave={handleSaveEditItem}
            onDelete={handleDeleteMealItem}
          />
        )}
      </SlideOverPage>

      {/* 2. Nutrition & Macro Details Screen */}
      <SlideOverPage
        isOpen={Boolean(showDetailsScreen)}
        onClose={() => setShowDetailsScreen(false)}
        zIndex={500}
      >
        {({ close }) => (
          <NutritionDetailsScreen
            onClose={close}
            theme={data?.theme}
            toggleTheme={toggleTheme}
            targetCalories={targetCalories}
            targetMacros={targetMacros}
            totalCalories={totalCalories}
            totalProtein={totalProtein}
            totalCarbs={totalCarbs}
            totalFats={totalFats}
            remainingCalories={remainingCalories}
            onOpenEditGoals={() => setIsEditGoalsOpen(true)}
          />
        )}
      </SlideOverPage>

      {/* 3. Create Custom Meal Screen */}
      <SlideOverPage
        isOpen={Boolean(isCreateMealOpen)}
        onClose={() => setIsCreateMealOpen(false)}
        zIndex={520}
      >
        {({ close }) => (
          <CustomMealBuilderScreen
            onClose={close}
            onSaveCustomMeal={handleSaveCustomMeal}
            foodDatabase={foodDatabase}
          />
        )}
      </SlideOverPage>

      {/* 4. Track Meal Category Screen */}
      <SlideOverPage
        isOpen={Boolean(activeMealCategory)}
        onClose={() => setActiveMealCategory(null)}
        zIndex={500}
      >
        {({ close }) => (
          <TrackMealCategoryScreen
            category={activeMealCategory}
            onClose={close}
            customMeals={customMeals}
            foodDatabase={foodDatabase}
            onOpenCreateMeal={() => setIsCreateMealOpen(true)}
            onAddItems={handleAddItemsToCategory}
            onShowNotification={showNotification}
          />
        )}
      </SlideOverPage>

      {/* Edit Goals Modal */}
      <EditGoalsModal
        key={isEditGoalsOpen ? 'open' : 'closed'}
        isOpen={isEditGoalsOpen}
        onClose={() => setIsEditGoalsOpen(false)}
        targetCalories={targetCalories}
        targetMacros={targetMacros}
        onSave={(cal, p, c, f) => {
          updateDietTargets(cal, p, c, f);
          showNotification('Goals saved successfully! 🎯');
        }}
      />

      {/* Toast Notification */}
      {savedToast && (
        <div className="details-floating-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage || 'Saved successfully!'}</span>
        </div>
      )}
    </div>
  );
}
