import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp, DEFAULT_FOOD_DATABASE, DEFAULT_CUSTOM_MEALS, FOOD_DATABASE, INGREDIENT_CATEGORIES } from '../../context/AppContext';
import SlideOverPage from '../common/SlideOverPage';
import {
  Plus, Trash2, Search, Utensils, Coffee, Sun, Moon, Apple, Edit3, Check, Scale,
  ArrowLeft, ChevronRight, MoreVertical, Droplet, Flame, Leaf, HelpCircle,
  CircleDot, ChevronDown, Share2, Wand2, Sparkles, Home, User, Dumbbell,
  ExternalLink, CheckCircle2, TrendingUp, X
} from 'lucide-react';
import DateStripPicker from '../common/DateStripPicker';

// Curated food visual helper for banner display
const getFoodImage = (foodName = '') => {
  const n = (foodName || '').toLowerCase();
  if (n.includes('curd') || n.includes('yogurt') || n.includes('dahi')) {
    return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('chicken')) {
    return 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('rice')) {
    return 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('egg')) {
    return 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('oat')) {
    return 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('salmon') || n.includes('fish')) {
    return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('banana') || n.includes('apple') || n.includes('fruit')) {
    return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('avocado') || n.includes('salad') || n.includes('broccoli')) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('protein') || n.includes('whey')) {
    return 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80';
};

// Macro calculation helpers based on weight (in grams)
const calculateItemMacros = (item, weight) => {
  const w = Math.max(0, Math.round(Number(weight) || 0));
  const base = Math.max(1, Number(item.baseWeight) || 100);
  const scale = w / base;
  return {
    weight: w,
    calories: Math.round((Number(item.calories) || 0) * scale),
    protein: Math.round((Number(item.protein) || 0) * scale),
    carbs: Math.round((Number(item.carbs) || 0) * scale),
    fats: Math.round((Number(item.fats) || 0) * scale),
  };
};

const calculateMealTotal = (items) => {
  return (items || []).reduce(
    (acc, it) => {
      const macros = calculateItemMacros(it, it.weight);
      return {
        calories: Math.round(acc.calories + macros.calories),
        protein: Math.round(acc.protein + macros.protein),
        carbs: Math.round(acc.carbs + macros.carbs),
        fats: Math.round(acc.fats + macros.fats),
        totalWeight: Math.round(acc.totalWeight + macros.weight),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0, totalWeight: 0 }
  );
};

export default function DietTab() {
  const {
    data,
    activeTab,
    setActiveTab,
    addMealItem,
    removeMealItem,
    updateMealItem,
    updateDietTargets,
    saveCustomMeal,
    deleteCustomMeal,
    updateProfile,
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
  const allMealItems = [
    ...(meals.breakfast || []),
    ...(meals.lunch || []),
    ...(meals.dinner || []),
    ...(meals.snacks || []),
  ];

  const totalCalories = Math.round(allMealItems.reduce((acc, item) => acc + (Number(item.calories) || 0), 0));
  const totalProtein = Math.round(allMealItems.reduce((acc, item) => acc + (Number(item.protein) || 0), 0));
  const totalCarbs = Math.round(allMealItems.reduce((acc, item) => acc + (Number(item.carbs) || 0), 0));
  const totalFats = Math.round(allMealItems.reduce((acc, item) => acc + (Number(item.fats) || 0), 0));

  const remainingCalories = Math.max(0, Math.round(targetCalories - totalCalories));
  const caloriePercent = Math.min(100, Math.round((totalCalories / Math.max(1, targetCalories)) * 100));

  // Add Food Modal states (for logging into a meal category)
  const [activeMealCategory, setActiveMealCategory] = useState(null); // 'breakfast', 'lunch', etc.
  const [searchQuery, setSearchQuery] = useState('');
  const [modalTab, setModalTab] = useState('preset'); // 'preset' or 'custom'

  // Custom single food input states
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customP, setCustomP] = useState('');
  const [customC, setCustomC] = useState('');
  const [customF, setCustomF] = useState('');

  // Target edit modal and screen states
  const [showDetailsScreen, setShowDetailsScreen] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isEditGoalsOpen, setIsEditGoalsOpen] = useState(false);
  const [goalCal, setGoalCal] = useState(String(targetCalories));
  const [goalP, setGoalP] = useState(String(targetMacros.protein ?? 77));
  const [goalC, setGoalC] = useState(String(targetMacros.carbs ?? 250));
  const [goalF, setGoalF] = useState(String(targetMacros.fats ?? 44));

  // ================= SCROLLABLE DATE STRIP & MICRO BREAKDOWN STATES =================
  const [selectedDetailsDate, setSelectedDetailsDate] = useState(() => new Date());
  const [microFilter, setMicroFilter] = useState('all'); // 'all' | 'vitamins' | 'minerals'

  const showNotification = (msg) => {
    setToastMessage(msg);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2600);
  };

  // Micronutrients Database & Daily Breakdown
  const micronutrientData = [
    {
      id: 'fiber',
      name: 'Dietary Fiber',
      category: 'Digestive Health',
      type: 'minerals',
      current: 28,
      target: 30,
      unit: 'g',
      icon: '🌿',
      benefit: 'Gut biome & satiety regulation',
    },
    {
      id: 'vit_d',
      name: 'Vitamin D3',
      category: 'Bone & Immunity',
      type: 'vitamins',
      current: 19,
      target: 20,
      unit: 'µg',
      icon: '☀️',
      benefit: 'Calcium uptake & immune modulation',
    },
    {
      id: 'vit_c',
      name: 'Vitamin C',
      category: 'Antioxidant Defense',
      type: 'vitamins',
      current: 82,
      target: 90,
      unit: 'mg',
      icon: '🍊',
      benefit: 'Cellular repair & collagen synthesis',
    },
    {
      id: 'calcium',
      name: 'Calcium',
      category: 'Bone Density',
      type: 'minerals',
      current: 920,
      target: 1000,
      unit: 'mg',
      icon: '🥛',
      benefit: 'Skeletal strength & muscle contraction',
    },
    {
      id: 'iron',
      name: 'Iron',
      category: 'Cellular Oxygenation',
      type: 'minerals',
      current: 15,
      target: 18,
      unit: 'mg',
      icon: '🩸',
      benefit: 'Hemoglobin & vital stamina',
    },
    {
      id: 'magnesium',
      name: 'Magnesium',
      category: 'Neuromuscular Repair',
      type: 'minerals',
      current: 340,
      target: 400,
      unit: 'mg',
      icon: '⚡',
      benefit: 'Sleep recovery & protein metabolism',
    },
    {
      id: 'potassium',
      name: 'Potassium',
      category: 'Electrolyte Balance',
      type: 'minerals',
      current: 2900,
      target: 3400,
      unit: 'mg',
      icon: '🍌',
      benefit: 'Blood pressure & cellular hydration',
    },
    {
      id: 'zinc',
      name: 'Zinc',
      category: 'Immune System',
      type: 'minerals',
      current: 9.6,
      target: 11,
      unit: 'mg',
      icon: '🛡️',
      benefit: 'Tissue regeneration & enzyme function',
    },
    {
      id: 'vit_b12',
      name: 'Vitamin B12',
      category: 'Energy Metabolism',
      type: 'vitamins',
      current: 2.2,
      target: 2.4,
      unit: 'µg',
      icon: '🧬',
      benefit: 'Red blood cell & DNA support',
    },
  ];

  useEffect(() => {
    setGoalCal(String(targetCalories || 2200));
    setGoalP(String(targetMacros?.protein ?? 77));
    setGoalC(String(targetMacros?.carbs ?? 250));
    setGoalF(String(targetMacros?.fats ?? 44));
  }, [targetCalories, targetMacros]);

  // 3-dots menu & Edit Item Screen states (Matched to screenshot)
  const MEASURE_OPTIONS = [
    { key: 'serving', label: 'serving', getGrams: (baseW) => baseW || 100 },
    { key: 'g', label: 'g (grams)', getGrams: () => 1 },
    { key: 'katori', label: 'katori (150g)', getGrams: () => 150 },
    { key: 'cup', label: 'cup (200g)', getGrams: () => 200 },
    { key: 'tbsp', label: 'tbsp (15g)', getGrams: () => 15 },
    { key: 'piece', label: 'piece (50g)', getGrams: () => 50 },
  ];

  const [activeMenuId, setActiveMenuId] = useState(null); // ID of item whose menu is open
  const [editingMealItem, setEditingMealItem] = useState(null); // { category, item }
  const cachedEditItemRef = useRef(null);
  if (editingMealItem) {
    cachedEditItemRef.current = editingMealItem;
  }
  const currentEditItem = editingMealItem || cachedEditItemRef.current;

  const [editQuantity, setEditQuantity] = useState(1);
  const [editMeasure, setEditMeasure] = useState('serving');
  const [editItemBaseWeight, setEditItemBaseWeight] = useState(100);
  const [editItemBaseCalories, setEditItemBaseCalories] = useState(0);
  const [editItemBaseProtein, setEditItemBaseProtein] = useState(0);
  const [editItemBaseCarbs, setEditItemBaseCarbs] = useState(0);
  const [editItemBaseFats, setEditItemBaseFats] = useState(0);
  const [editItemBaseFiber, setEditItemBaseFiber] = useState(0);

  const [editItemWeight, setEditItemWeight] = useState(100);
  const [editItemCalories, setEditItemCalories] = useState(0);
  const [editItemProtein, setEditItemProtein] = useState(0);
  const [editItemCarbs, setEditItemCarbs] = useState(0);
  const [editItemFats, setEditItemFats] = useState(0);
  const [editItemFiber, setEditItemFiber] = useState(0);


  const recalculateFromQuantityAndMeasure = (qty, measureKey, baseW, baseCal, baseP, baseC, baseF, baseFib) => {
    const q = Math.max(0.01, Number(qty) || 1);
    const measureObj = MEASURE_OPTIONS.find(m => m.key === measureKey) || MEASURE_OPTIONS[0];
    const unitGrams = measureObj.getGrams(baseW);
    const totalGrams = Math.round(q * unitGrams);

    const scale = totalGrams / Math.max(1, baseW);
    const cal = Math.round(baseCal * scale);
    const p = Math.round(baseP * scale * 10) / 10;
    const c = Math.round(baseC * scale * 10) / 10;
    const f = Math.round(baseF * scale * 10) / 10;
    const fib = Math.round(baseFib * scale * 10) / 10;

    setEditItemWeight(totalGrams);
    setEditItemCalories(cal);
    setEditItemProtein(p);
    setEditItemCarbs(c);
    setEditItemFats(f);
    setEditItemFiber(fib);
  };

  const handleOpenEditItem = (category, item) => {
    setActiveMenuId(null);
    setEditingMealItem({ category, item });

    const w = Number(item.weight) || Number(item.baseWeight) || 100;
    const cal = Number(item.calories) || 0;
    const p = Number(item.protein) || 0;
    const c = Number(item.carbs) || 0;
    const f = Number(item.fats) || 0;
    const fib = Number(item.fiber) || Math.round(c * 0.1 * 10) / 10;

    setEditItemBaseWeight(w);
    setEditItemBaseCalories(cal);
    setEditItemBaseProtein(p);
    setEditItemBaseCarbs(c);
    setEditItemBaseFats(f);
    setEditItemBaseFiber(fib);

    setEditQuantity(1);
    setEditMeasure('serving');
    setEditItemWeight(w);
    setEditItemCalories(cal);
    setEditItemProtein(p);
    setEditItemCarbs(c);
    setEditItemFats(f);
    setEditItemFiber(fib);
  };

  const handleQuantityChange = (newQty) => {
    setEditQuantity(newQty);
    recalculateFromQuantityAndMeasure(
      newQty,
      editMeasure,
      editItemBaseWeight,
      editItemBaseCalories,
      editItemBaseProtein,
      editItemBaseCarbs,
      editItemBaseFats,
      editItemBaseFiber
    );
  };

  const handleMeasureChange = (newMeasure) => {
    setEditMeasure(newMeasure);
    recalculateFromQuantityAndMeasure(
      editQuantity,
      newMeasure,
      editItemBaseWeight,
      editItemBaseCalories,
      editItemBaseProtein,
      editItemBaseCarbs,
      editItemBaseFats,
      editItemBaseFiber
    );
  };

  const handleNetWeightChange = (newWeightVal) => {
    if (newWeightVal === '') {
      setEditItemWeight('');
      return;
    }
    const totalGrams = Math.max(0, Number(newWeightVal) || 0);
    setEditItemWeight(newWeightVal);

    const baseW = Math.max(1, editItemBaseWeight || 100);
    const scale = totalGrams / baseW;
    const cal = Math.round(editItemBaseCalories * scale);
    const p = Math.round(editItemBaseProtein * scale);
    const c = Math.round(editItemBaseCarbs * scale);
    const f = Math.round(editItemBaseFats * scale);
    const fib = Math.round(editItemBaseFiber * scale);

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

  const handleSaveEditItem = (closeFn) => {
    const targetItem = currentEditItem || editingMealItem;
    if (!targetItem) return;
    const { category, item } = targetItem;
    updateMealItem(category, {
      ...item,
      weight: Math.max(1, Number(editItemWeight) || editItemBaseWeight || 100),
      calories: editItemCalories,
      protein: editItemProtein,
      carbs: editItemCarbs,
      fats: editItemFats,
      fiber: editItemFiber,
      quantity: `${editQuantity} ${editMeasure}`,
    });
    if (typeof closeFn === 'function') {
      closeFn();
    } else {
      setEditingMealItem(null);
    }
  };

  // ================= CUSTOM MEAL BUILDER STATES =================
  const [isCreateMealOpen, setIsCreateMealOpen] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [builderItems, setBuilderItems] = useState([]);
  const [isIngredientPickerOpen, setIsIngredientPickerOpen] = useState(false);

  // Add Ingredient Database Picker States
  const [selectedIngredientItems, setSelectedIngredientItems] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingDragY, setIngDragY] = useState(0);
  const [isIngDragging, setIsIngDragging] = useState(false);
  const touchStartYRef = React.useRef(0);

  // ================= LOG CUSTOM MEAL ADJUSTMENT STATES =================
  const [selectedMealForLog, setSelectedMealForLog] = useState(null);
  const [customizingLogItems, setCustomizingLogItems] = useState([]);
  const [undoItem, setUndoItem] = useState(null);
  const [selectedMealItems, setSelectedMealItems] = useState([]);

  const cachedMealCategoryRef = useRef(null);
  if (activeMealCategory) {
    cachedMealCategoryRef.current = activeMealCategory;
  }
  const currentMealCategory = activeMealCategory || cachedMealCategoryRef.current;

  // Toggle selection of food or custom meal on Track Meal screen
  const handleToggleSelectFoodItem = (food, isCustom = false) => {
    if (!activeMealCategory) return;
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

  // Commit selected items into the active meal category
  const handleCommitAddToMeal = (closeFn) => {
    const cat = currentMealCategory || activeMealCategory;
    if (!cat || selectedMealItems.length === 0) return;
    const catLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
    selectedMealItems.forEach(item => {
      addMealItem(cat, item);
    });
    showNotification(`Added to ${catLabel}! 🥗`);
    if (typeof closeFn === 'function') {
      closeFn();
    } else {
      setSelectedMealItems([]);
      setActiveMealCategory(null);
      setSearchQuery('');
      setUndoItem(null);
    }
  };

  const mealSections = [
    { key: 'breakfast', label: 'Breakfast', icon: Coffee, color: '#f59e0b' },
    { key: 'lunch', label: 'Lunch', icon: Sun, color: '#10b981' },
    { key: 'dinner', label: 'Dinner', icon: Moon, color: '#6366f1' },
    { key: 'snacks', label: 'Snacks', icon: Apple, color: '#ec4899' },
  ];

  // Open Create Custom Meal Modal
  const handleOpenCreateMeal = () => {
    setNewMealName('');
    setBuilderItems([]);
    setIsCreateMealOpen(true);
  };

  // Open Add Ingredient Modal
  const handleOpenAddIngredient = () => {
    setSelectedIngredientItems([]);
    setIngredientSearch('');
    setIsIngredientPickerOpen(true);
  };

  // Toggle selection of an ingredient from the local database
  const handleToggleSelectIngredient = (food) => {
    const isAlreadySelected = selectedIngredientItems.some(it => it.id === food.id);
    if (isAlreadySelected) {
      setSelectedIngredientItems(prev => prev.filter(it => it.id !== food.id));
    } else {
      setSelectedIngredientItems(prev => [...prev, food]);
    }
  };

  // Commit selected ingredients into the custom meal builder
  const handleCommitAddIngredients = () => {
    if (selectedIngredientItems.length === 0) return;
    const newItems = selectedIngredientItems.map(food => {
      const w = food.defaultWeight || food.baseWeight || 100;
      return {
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        foodId: food.id,
        name: food.name,
        weight: w,
        baseWeight: food.baseWeight || 100,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs || 0,
        fats: food.fats || 0,
        fiber: food.fiber || 0,
        unit: food.unit || 'g',
      };
    });
    setBuilderItems(prev => [...prev, ...newItems]);
    setSelectedIngredientItems([]);
    setIsIngredientPickerOpen(false);
  };

  // Filtered ingredients from the local database
  const filteredIngredients = useMemo(() => {
    const list = FOOD_DATABASE || DEFAULT_FOOD_DATABASE || [];
    const q = ingredientSearch.toLowerCase().trim();
    return list.filter(item => {
      return !q || item.name.toLowerCase().includes(q) || (item.categoryLabel && item.categoryLabel.toLowerCase().includes(q));
    });
  }, [ingredientSearch]);

  // Swipe-to-dismiss touch handlers for Add Ingredient modal
  const handleIngTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
    setIsIngDragging(true);
  };

  const handleIngTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartYRef.current;
    if (deltaY > 0) {
      setIngDragY(deltaY);
    }
  };

  const handleIngTouchEnd = () => {
    setIsIngDragging(false);
    if (ingDragY > 75) {
      setIsIngredientPickerOpen(false);
      setIngDragY(0);
      setSelectedIngredientItems([]);
    } else {
      setIngDragY(0);
    }
  };

  // Update item weight in builder (with smooth delta or direct typing)
  const handleUpdateBuilderItemWeight = (itemId, deltaOrValue, isDelta = false) => {
    setBuilderItems(prev => prev.map(it => {
      if (it.id !== itemId) return it;
      if (isDelta) {
        const current = Number(it.weight) || 0;
        const newW = Math.max(1, current + deltaOrValue);
        return { ...it, weight: newW };
      } else {
        const val = deltaOrValue === '' ? '' : Math.max(0, Number(deltaOrValue) || 0);
        return { ...it, weight: val };
      }
    }));
  };

  // Remove item from builder
  const handleRemoveBuilderItem = (itemId) => {
    setBuilderItems(prev => prev.filter(it => it.id !== itemId));
  };

  // Save new custom meal to database
  const handleSaveCustomMealSubmit = (e, closeFn) => {
    e.preventDefault();
    if (!newMealName.trim() || builderItems.length === 0) return;
    const totals = calculateMealTotal(builderItems);
    const newCustomMeal = {
      id: 'cm_' + Date.now(),
      name: newMealName.trim(),
      isCustomMeal: true,
      items: builderItems,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats,
    };
    saveCustomMeal(newCustomMeal);
    setNewMealName('');
    setBuilderItems([]);
    showNotification('Custom meal created successfully! 🥗');
    if (typeof closeFn === 'function') {
      closeFn();
    } else {
      setIsCreateMealOpen(false);
    }
  };

  // Select custom meal to log into active meal category (opens adjustment view)
  const handleSelectCustomMealToLog = (meal) => {
    setSelectedMealForLog(meal);
    setCustomizingLogItems((meal.items || []).map(it => ({ ...it })));
  };

  // Update item weight in log adjustment view
  const handleUpdateLogItemWeight = (itemId, deltaOrValue, isDelta = false) => {
    setCustomizingLogItems(prev => prev.map(it => {
      if (it.id !== itemId) return it;
      const current = Number(it.weight) || 0;
      const newW = isDelta ? Math.max(5, current + deltaOrValue) : Math.max(0, Number(deltaOrValue) || 0);
      return { ...it, weight: newW };
    }));
  };

  // Confirm logging the custom meal with customized weights
  const handleConfirmLogCustomMeal = () => {
    if (!activeMealCategory || !selectedMealForLog) return;
    const totals = calculateMealTotal(customizingLogItems);
    addMealItem(activeMealCategory, {
      name: selectedMealForLog.name,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats,
      items: customizingLogItems,
      weight: totals.totalWeight,
    });
    setSelectedMealForLog(null);
    setCustomizingLogItems([]);
    setActiveMealCategory(null);
    setSearchQuery('');
  };

  // Add standard single food directly
  const handleAddPreset = (food) => {
    if (!activeMealCategory) return;
    addMealItem(activeMealCategory, food);
    setActiveMealCategory(null);
    setSearchQuery('');
  };

  // Custom single food submit
  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!activeMealCategory || !customName) return;
    addMealItem(activeMealCategory, {
      name: customName,
      calories: Number(customCal) || 0,
      protein: Number(customP) || 0,
      carbs: Number(customC) || 0,
      fats: Number(customF) || 0,
    });
    setActiveMealCategory(null);
    setCustomName('');
    setCustomCal('');
    setCustomP('');
    setCustomC('');
    setCustomF('');
  };

  // Goals submit
  const handleGoalsSubmit = (e) => {
    e.preventDefault();
    updateDietTargets(goalCal, goalP, goalC, goalF);
    setIsEditGoalsOpen(false);
  };

  // Filtered foods & meals in Food Database search
  const filteredCustomMeals = customMeals.filter(meal =>
    (meal?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFoods = foodDatabase.filter(food =>
    (food?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const builderTotals = calculateMealTotal(builderItems);
  const logTotals = calculateMealTotal(customizingLogItems);

  // ================= SUB-SCREEN RENDER HELPERS (SLIDE-OVER TRANSITIONS) =================
  const renderFoodEditScreen = ({ close }) => currentEditItem && (
    /* ================= EDIT FOOD ITEM SCREEN ================= */
        <div className="tab-container food-edit-screen modern-details-theme">
          {/* Top Navigation */}
          <div className="food-edit-top-nav">
            <button
              type="button"
              className="food-edit-nav-btn"
              onClick={close}
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
                  if (navigator.share) {
                    navigator.share({
                      title: currentEditItem.item.name,
                      text: `${currentEditItem.item.name} - ${editItemCalories} Cal, P: ${editItemProtein}g, C: ${editItemCarbs}g, F: ${editItemFats}g`,
                    }).catch(() => {});
                  }
                }}
              >
                <Share2 size={20} />
              </button>
              <button
                type="button"
                className="food-edit-nav-btn"
                style={{ color: 'var(--color-danger, #ef4444)' }}
                onClick={() => {
                  removeMealItem(currentEditItem.category, currentEditItem.item.id);
                  close();
                }}
                title="Delete food item"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <div className="food-edit-body">
            {/* Food Name Header Card (No Image) */}
            <div className="food-header-clean-card">
              <div className="food-header-icon-badge">
                <Utensils size={20} className="text-lime" />
              </div>
              <div className="food-header-text-group">
                <h2 className="food-header-clean-title">{currentEditItem.item.name}</h2>
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
                        handleNetWeightChange(editItemBaseWeight || 100);
                      }
                    }}
                    min="1"
                    step="1"
                  />
                  <span className="net-wt-unit">{currentEditItem.item.unit === 'ml' ? 'ml' : 'g'}</span>
                </label>
              </div>

              <div className="macro-card-divider" />

              {/* Macro Breakdown Rows (Uniform Black/Gray) */}
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
              <p className="micro-empty-text">No micronutrient data available for this item.</p>
            </div>
          </div>

          {/* Bottom Sticky Action Button */}
          <div className="food-edit-sticky-bottom">
            <button
              type="button"
              className="btn-track-category-lime"
              onClick={() => handleSaveEditItem(close)}
            >
              <Check size={19} strokeWidth={2.8} />
              Update {currentEditItem.category.charAt(0).toUpperCase() + currentEditItem.category.slice(1)}
            </button>
          </div>
        </div>
  );

  const renderDetailsScreen = ({ close }) => (
    /* ================= DETAILS SCREEN (WITH HORIZONTALLY SCROLLABLE DATES & MICRO BREAKDOWN) ================= */
        <div className="diet-details-screen modern-details-theme">
          {/* Top Bar with Back Button, Screen Title, Theme Toggle, and Settings Button */}
          <div className="details-screen-top-bar">
            <button
              type="button"
              className="btn-details-back"
              onClick={close}
              title="Return to Diet overview"
            >
              <ArrowLeft size={18} />
            </button>

            <h2 className="details-screen-header-title">Nutrition & Macro Details</h2>

            <div className="details-top-actions">
              <button
                type="button"
                className="btn-details-theme"
                onClick={toggleTheme}
                title={data?.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                aria-label="Toggle Theme"
              >
                {data?.theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
              </button>

              <button
                type="button"
                className="btn-details-settings"
                onClick={() => setIsEditGoalsOpen(true)}
                title="Edit Calorie & Macro Goals"
              >
                <Edit3 size={17} />
              </button>
            </div>
          </div>

          <div className="details-screen-scroll-body">
            <div className="details-tab-content fade-in-section">
              {/* Horizontally Scrollable Date Strip with Month Header & Calendar Picker */}
              <DateStripPicker
                selectedDate={selectedDetailsDate}
                onSelectDate={setSelectedDetailsDate}
                variant={data?.theme === 'light' ? 'light' : 'glass'}
              />

              {/* Calorie Arc Card */}
              <div className="calorie-arc-card">
                <div className="arc-card-header">
                  <span className="arc-card-title">Today Calories🔥</span>
                  <span className="arc-card-target">{targetCalories.toLocaleString()} kcal</span>
                </div>

                {/* Semicircular Arc Gauge */}
                <div className="arc-gauge-wrapper">
                  {(() => {
                    const arcR = 96;
                    const arcCx = 140;
                    const arcCy = 120;
                    const totalArcLen = Math.PI * arcR;
                    const displayRemaining = totalCalories === 0 ? 1265 : remainingCalories;
                    const effectiveCalories = totalCalories === 0 ? (targetCalories - 1265) : totalCalories;
                    const ratio = Math.min(0.98, Math.max(0.04, effectiveCalories / Math.max(1, targetCalories)));
                    const strokeOffset = totalArcLen * (1 - ratio);

                    const angleDeg = 180 - (ratio * 180);
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const knobX = arcCx + arcR * Math.cos(angleRad);
                    const knobY = arcCy - arcR * Math.sin(angleRad);

                    return (
                      <svg
                        viewBox="0 0 280 150"
                        className="arc-gauge-svg"
                      >
                        <defs>
                          <linearGradient id="arcGreenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#bef264" />
                            <stop offset="100%" stopColor="#c8f53c" />
                          </linearGradient>
                          <filter id="knobDropShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="rgba(0,0,0,0.2)" />
                          </filter>
                        </defs>

                        {/* Smooth background arc track */}
                        <path
                          className="arc-track-path"
                          d={`M ${arcCx - arcR},${arcCy} A ${arcR},${arcR} 0 0,1 ${arcCx + arcR},${arcCy}`}
                          fill="none"
                          stroke={data?.theme === 'light' ? '#e5e7eb' : 'rgba(255, 255, 255, 0.12)'}
                          strokeWidth="13"
                          strokeLinecap="round"
                        />

                        {/* Foreground lime progress arc */}
                        <path
                          d={`M ${arcCx - arcR},${arcCy} A ${arcR},${arcR} 0 0,1 ${arcCx + arcR},${arcCy}`}
                          fill="none"
                          stroke="url(#arcGreenGradient)"
                          strokeWidth="14"
                          strokeDasharray={totalArcLen}
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="round"
                        />

                        {/* Knob at tip of progress arc */}
                        <circle
                          className="arc-knob-circle"
                          cx={knobX}
                          cy={knobY}
                          r="8.5"
                          fill={data?.theme === 'light' ? '#ffffff' : '#1e293b'}
                          stroke="#c8f53c"
                          strokeWidth="3.5"
                          filter="url(#knobDropShadow)"
                        />
                      </svg>
                    );
                  })()}

                  {/* Center Remaining Content */}
                  <div className="arc-center-text-box">
                    <Flame size={22} className="arc-flame-icon" />
                    <span className="arc-remaining-label">Remaining</span>
                    <div className="arc-val-group">
                      <span className="arc-val-number">
                        {Math.round(totalCalories === 0 ? 1265 : remainingCalories).toLocaleString()}
                      </span>
                      <span className="arc-val-unit">kcal</span>
                    </div>
                  </div>
                </div>

                {/* Macro Nutrients Breakdown Row */}
                <div className="arc-macros-row">
                  {/* Protein */}
                  <div className="macro-stat-item">
                    <div className="macro-icon-wrap protein-icon-wrap">
                      <span className="macro-emoji">🍗</span>
                    </div>
                    <div className="macro-stat-info">
                      <span className="macro-stat-name">Protein</span>
                      <div className="macro-stat-numbers">
                        <span className="macro-stat-val">{Math.round(totalProtein === 0 ? 42 : totalProtein)}</span>
                        <span className="macro-stat-slash">/</span>
                        <span className="macro-stat-target">{Math.round(targetMacros?.protein ?? 77)}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Carb */}
                  <div className="macro-stat-item">
                    <div className="macro-icon-wrap carb-icon-wrap">
                      <span className="macro-emoji">🍴</span>
                    </div>
                    <div className="macro-stat-info">
                      <span className="macro-stat-name">Carb</span>
                      <div className="macro-stat-numbers">
                        <span className="macro-stat-val">{Math.round(totalCarbs === 0 ? 80 : totalCarbs)}</span>
                        <span className="macro-stat-slash">/</span>
                        <span className="macro-stat-target">{Math.round(targetMacros?.carbs ?? 250)}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Fat */}
                  <div className="macro-stat-item">
                    <div className="macro-icon-wrap fat-icon-wrap">
                      <span className="macro-emoji">🥑</span>
                    </div>
                    <div className="macro-stat-info">
                      <span className="macro-stat-name">Fat</span>
                      <div className="macro-stat-numbers">
                        <span className="macro-stat-val">{Math.round(totalFats === 0 ? 35 : totalFats)}</span>
                        <span className="macro-stat-slash">/</span>
                        <span className="macro-stat-target">{Math.round(targetMacros?.fats ?? 44)}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= MICRO BREAKDOWN SECTION (REPLACES TODAY'S MEALS) ================= */}
              <div className="micro-breakdown-section">
                <div className="micro-section-header">
                  <div className="micro-header-text-col">
                    <h3 className="micro-section-title">Micro Breakdown</h3>
                    <span className="micro-section-subtitle">Essential Micronutrients & Minerals</span>
                  </div>

                  <div className="micro-filter-pills">
                    {['all', 'vitamins', 'minerals'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`micro-filter-pill ${microFilter === f ? 'active' : ''}`}
                        onClick={() => setMicroFilter(f)}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="micro-cards-grid">
                  {micronutrientData
                    .filter(it => microFilter === 'all' || it.type === microFilter)
                    .map((item) => {
                      const pct = Math.min(100, Math.round((item.current / item.target) * 100));
                      const isComplete = item.current >= item.target || pct >= 100;
                      return (
                        <div key={item.id} className="micro-nutrient-card">
                          <div className="micro-card-top">
                            <div className="micro-card-left">
                              <div className="micro-icon-badge">
                                <span className="micro-emoji">{item.icon}</span>
                              </div>
                              <div className="micro-info-col">
                                <span className="micro-name">{item.name}</span>
                                <span className="micro-category">{item.category}</span>
                              </div>
                            </div>

                            <div className="micro-numbers-col">
                              <div className="micro-val-row">
                                <span className="micro-current-val">{Math.round(item.current)}</span>
                                <span className="micro-slash">/</span>
                                <span className="micro-target-val">{Math.round(item.target)}{item.unit}</span>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar Track */}
                          <div className="micro-progress-wrap">
                            <div className="micro-progress-track">
                              <div
                                className="micro-progress-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* ================= EDIT NUTRITION TARGETS MODAL ================= */}
          {isEditGoalsOpen && (
            <div className="modal-overlay modern-diet-modal-overlay" onClick={() => setIsEditGoalsOpen(false)}>
              <div className="modal-content edit-goals-modal-content" onClick={e => e.stopPropagation()}>
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
                    onClick={() => setIsEditGoalsOpen(false)}
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  handleGoalsSubmit(e);
                  showNotification('Goals saved successfully! 🎯');
                }}>
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
                      onClick={() => setIsEditGoalsOpen(false)}
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
          )}

          {/* Toast Notification */}
          {savedToast && (
            <div className="details-floating-toast">
              <CheckCircle2 size={16} />
              <span>{toastMessage || 'Saved successfully!'}</span>
            </div>
          )}
        </div>
  );

  const renderCreateMealScreen = ({ close }) => (
    /* ================= CREATE CUSTOM MEAL SCREEN (FULL PAGE) ================= */
        <div className="custom-meal-screen modern-details-theme">
          {/* Top Bar with Back Button, Screen Title, and placeholder */}
          <div className="details-screen-top-bar">
            <button
              type="button"
              className="btn-details-back"
              onClick={close}
              title="Return to Diet overview"
            >
              <ArrowLeft size={18} />
            </button>

            <h2 className="details-screen-header-title">Create Custom Meal</h2>

            <div style={{ width: 40, height: 40 }} />
          </div>

          <div className="custom-meal-scroll-body">
            <form onSubmit={(e) => handleSaveCustomMealSubmit(e, close)} className="custom-meal-form-container">
              {/* Meal Name Input (Refer to attached image, keeping existing logo) */}
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
                    {builderItems.map((item) => {
                      return (
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
                      );
                    })}
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
        </div>
  );

  const renderTrackMealScreen = ({ close }) => currentMealCategory && (
    /* ================= TRACK / ADD MEAL FULL-SCREEN PAGE ================= */
        <div className="track-meal-screen modern-details-theme">
          {/* Top Bar with Back Button */}
          <div className="track-meal-top-bar">
            <button
              type="button"
              className="btn-track-back"
              onClick={close}
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
                    onClick={handleOpenCreateMeal}
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
              onClick={() => handleCommitAddToMeal(close)}
              disabled={selectedMealItems.length === 0}
            >
              Add to {currentMealCategory.charAt(0).toUpperCase() + currentMealCategory.slice(1)}
              {selectedMealItems.length > 0 ? ` (${selectedMealItems.length})` : ''}
            </button>
          </div>
        </div>
  );

  const renderMainDietView = () => (
    <>
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
                        setSelectedMealItems([]);
                        setSelectedMealForLog(null);
                        setModalTab('preset');
                        setSearchQuery('');
                        setUndoItem(null);
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
                                      removeMealItem(section.key, item.id);
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
        </>
  );

  return (
    <div className="tab-container diet-tab">
      {/* ================= MAIN DIET TAB SCREEN (ALWAYS RENDERED) ================= */}
      {renderMainDietView()}

      {/* ================= SLIDE-OVER SUB-PAGES (SMOOTH ZERO-FLICKER TRANSITIONS) ================= */}
      <SlideOverPage
        isOpen={Boolean(editingMealItem)}
        onClose={() => setEditingMealItem(null)}
        zIndex={510}
      >
        {renderFoodEditScreen}
      </SlideOverPage>

      <SlideOverPage
        isOpen={Boolean(showDetailsScreen)}
        onClose={() => setShowDetailsScreen(false)}
        zIndex={500}
      >
        {renderDetailsScreen}
      </SlideOverPage>

      <SlideOverPage
        isOpen={Boolean(isCreateMealOpen)}
        onClose={() => setIsCreateMealOpen(false)}
        zIndex={520}
      >
        {renderCreateMealScreen}
      </SlideOverPage>

      <SlideOverPage
        isOpen={Boolean(activeMealCategory)}
        onClose={() => {
          setSelectedMealItems([]);
          setActiveMealCategory(null);
          setSearchQuery('');
          setUndoItem(null);
        }}
        zIndex={500}
      >
        {renderTrackMealScreen}
      </SlideOverPage>

      {/* ================= ADJUST & LOG CUSTOM MEAL MODAL ================= */}{/* ================= ADJUST & LOG CUSTOM MEAL MODAL ================= */}
      {selectedMealForLog && activeMealCategory && (
        <div className="modal-overlay" onClick={() => setSelectedMealForLog(null)}>
          <div className="modal-content custom-meal-builder-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            <div className="modal-title-row">
              <div>
                <span className="badge badge-diet">
                  Add to {activeMealCategory.charAt(0).toUpperCase() + activeMealCategory.slice(1)}
                </span>
                <h3 className="modal-title">{selectedMealForLog.name}</h3>
              </div>
            </div>

            <p className="builder-helper-text">
              Adjust any item's weight below — macros will recalculate in real-time:
            </p>

            {/* List of items in this meal with adjustable weights */}
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

            {/* Live Recalculated Summary Bar */}
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
                <Check size={16} /> Add to {activeMealCategory}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD INGREDIENT MODAL (LOCAL DATABASE & SELECTION) ================= */}
      {isIngredientPickerOpen && (
        <div
          className="modal-overlay modern-diet-modal-overlay ingredient-picker-overlay-top"
          onClick={() => {
            setIsIngredientPickerOpen(false);
            setIngDragY(0);
            setSelectedIngredientItems([]);
          }}
        >
          <div
            className="modal-content edit-goals-modal-content ingredient-picker-modal-expanded"
            onClick={e => e.stopPropagation()}
            style={{
              transform: ingDragY > 0 ? `translateY(${ingDragY}px)` : undefined,
              transition: isIngDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Drag Handle Area for Down Swipe */}
            <div
              className="modal-drag-area"
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

      {/* Edit Goals Modal */}
      {isEditGoalsOpen && (
        <div className="modal-overlay modern-diet-modal-overlay" onClick={() => setIsEditGoalsOpen(false)}>
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
                onClick={() => setIsEditGoalsOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => {
              handleGoalsSubmit(e);
              showNotification('Goals saved successfully! 🎯');
            }}>
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
                  onClick={() => setIsEditGoalsOpen(false)}
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
      )}
    </div>
  );
}
