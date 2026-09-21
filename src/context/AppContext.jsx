import React, { createContext, useContext, useState, useEffect } from 'react';
import { FOOD_DATABASE, INGREDIENT_CATEGORIES } from '../data/foodDatabase';

const AppContext = createContext();

const STORAGE_KEY = 'vitalsync_health_app_data_v1';

export { FOOD_DATABASE, INGREDIENT_CATEGORIES };
export const DEFAULT_FOOD_DATABASE = FOOD_DATABASE;

export const DEFAULT_CUSTOM_MEALS = [
  {
    id: 'cm_breakfast_boiled_egg',
    name: 'My breakfast boiled egg',
    subtitle: "Boiled Egg, Tea with Cow's Milk and Sugar, ...",
    isCustomMeal: true,
    items: [
      { id: 'cm_b1', name: 'Boiled Egg', weight: 100, calories: 144, protein: 13, carbs: 1, fats: 10 },
      { id: 'cm_b2', name: "Tea with Cow's Milk & Sugar", weight: 150, calories: 138, protein: 2, carbs: 19, fats: 2 },
    ],
    calories: 282,
    protein: 15,
    carbs: 20,
    fats: 12,
  },
  {
    id: 'cm_lunch_rice',
    name: 'My lunch rice',
    subtitle: "Plain Cooked Rice, Curds (cow's milk), Roti",
    isCustomMeal: true,
    items: [
      { id: 'cm_l1', name: 'Plain Cooked Rice', weight: 120, calories: 156, protein: 3, carbs: 34, fats: 0 },
      { id: 'cm_l2', name: "Curds (cow's milk)", weight: 100, calories: 60, protein: 4, carbs: 5, fats: 3 },
      { id: 'cm_l3', name: 'Roti', weight: 35, calories: 80, protein: 3, carbs: 16, fats: 1 },
    ],
    calories: 296,
    protein: 9,
    carbs: 54,
    fats: 5,
  },
  {
    id: 'cm_chicken_rice',
    name: 'High-Protein Chicken & Rice Bowl',
    subtitle: 'Chicken Breast, Jasmine Rice, Steamed Broccoli, Olive Oil',
    isCustomMeal: true,
    items: [
      { id: 'cmi_1', name: 'Chicken Breast (Cooked)', weight: 180, baseWeight: 100, calories: 165, protein: 31, carbs: 0, fats: 4 },
      { id: 'cmi_2', name: 'Jasmine Rice (Cooked)', weight: 200, baseWeight: 100, calories: 130, protein: 3, carbs: 28, fats: 0 },
      { id: 'cmi_3', name: 'Steamed Broccoli', weight: 100, baseWeight: 100, calories: 35, protein: 2, carbs: 7, fats: 0 },
      { id: 'cmi_4', name: 'Extra Virgin Olive Oil', weight: 10, baseWeight: 10, calories: 88, protein: 0, carbs: 0, fats: 10 }
    ],
    calories: 680,
    protein: 64,
    carbs: 63,
    fats: 18,
  },
  {
    id: 'cm_power_oats',
    name: 'Power Oats & Whey Bowl',
    subtitle: 'Rolled Oats, Whey Protein, Peanut Butter, Banana',
    isCustomMeal: true,
    items: [
      { id: 'cmi_5', name: 'Rolled Oats (Raw)', weight: 80, baseWeight: 100, calories: 389, protein: 17, carbs: 66, fats: 7 },
      { id: 'cmi_6', name: 'Whey Protein Powder', weight: 35, baseWeight: 30, calories: 120, protein: 24, carbs: 2, fats: 2 },
      { id: 'cmi_7', name: 'Peanut Butter', weight: 20, baseWeight: 15, calories: 95, protein: 4, carbs: 4, fats: 8 },
      { id: 'cmi_8', name: 'Banana', weight: 120, baseWeight: 100, calories: 89, protein: 1, carbs: 23, fats: 0 }
    ],
    calories: 685,
    protein: 48,
    carbs: 87,
    fats: 18,
  }
];

const INITIAL_DATA = {
  theme: 'dark',
  water: {
    target: 2500,
    current: 1750,
    streak: 6,
    logs: [
      { id: 1, amount: 250, time: '08:15 AM', label: 'Morning Glass' },
      { id: 2, amount: 500, time: '10:45 AM', label: 'Work Bottle' },
      { id: 3, amount: 250, time: '01:30 PM', label: 'Post-Lunch' },
      { id: 4, amount: 750, time: '04:15 PM', label: 'Workout Flask' },
    ],
    weeklyHistory: [
      { day: 'Mon', amount: 2400, target: 2500 },
      { day: 'Tue', amount: 2600, target: 2500 },
      { day: 'Wed', amount: 2100, target: 2500 },
      { day: 'Thu', amount: 2700, target: 2500 },
      { day: 'Fri', amount: 2500, target: 2500 },
      { day: 'Sat', amount: 2200, target: 2500 },
      { day: 'Sun', amount: 1750, target: 2500 },
    ]
  },
  diet: {
    targetCalories: 2250,
    targetMacros: { protein: 145, carbs: 230, fats: 65 },
    customMeals: DEFAULT_CUSTOM_MEALS,
    meals: {
      breakfast: [
        { id: 'b1', name: 'Rolled Oats with Berries & Honey', calories: 350, protein: 12, carbs: 64, fats: 6, time: '08:30 AM' },
        { id: 'b2', name: 'Boiled Eggs (2 large)', calories: 140, protein: 13, carbs: 1, fats: 10, time: '08:45 AM' },
      ],
      lunch: [
        { id: 'l1', name: 'Grilled Chicken & Brown Rice Bowl', calories: 580, protein: 46, carbs: 65, fats: 12, time: '01:15 PM' },
        { id: 'l2', name: 'Olive Oil Tossed Green Salad', calories: 120, protein: 2, carbs: 8, fats: 9, time: '01:15 PM' },
      ],
      dinner: [
        { id: 'd1', name: 'Air-Fried Salmon Fillet', calories: 420, protein: 38, carbs: 0, fats: 24, time: '07:30 PM' },
        { id: 'd2', name: 'Steamed Sweet Potato & Broccoli', calories: 190, protein: 5, carbs: 42, fats: 1, time: '07:30 PM' },
      ],
      snacks: [
        { id: 's1', name: 'Greek Yogurt with Walnuts', calories: 180, protein: 15, carbs: 12, fats: 8, time: '04:30 PM' },
      ],
    },
    weeklyHistory: [
      { day: 'Mon', calories: 2180, protein: 138, carbs: 215, fats: 62 },
      { day: 'Tue', calories: 2290, protein: 148, carbs: 235, fats: 67 },
      { day: 'Wed', calories: 2050, protein: 132, carbs: 200, fats: 60 },
      { day: 'Thu', calories: 2310, protein: 150, carbs: 240, fats: 68 },
      { day: 'Fri', calories: 2190, protein: 140, carbs: 225, fats: 64 },
      { day: 'Sat', calories: 2400, protein: 142, carbs: 260, fats: 72 },
      { day: 'Sun', calories: 1980, protein: 131, carbs: 202, fats: 62 },
    ]
  },
  workout: {
    streak: 4,
    weeklyGoal: 5,
    plans: [
      {
        id: 'plan_chest',
        title: 'Chest & Triceps Hypertrophy',
        category: 'Strength',
        duration: 45,
        estimatedCalories: 340,
        exercises: [
          {
            id: 'ex_c1',
            name: 'Barbell Flat Bench Press',
            sets: [
              { setNumber: 1, targetReps: 10, targetWeight: 60 },
              { setNumber: 2, targetReps: 10, targetWeight: 65 },
              { setNumber: 3, targetReps: 8, targetWeight: 70 },
              { setNumber: 4, targetReps: 6, targetWeight: 75 },
            ]
          },
          {
            id: 'ex_c2',
            name: 'Incline Dumbbell Press',
            sets: [
              { setNumber: 1, targetReps: 12, targetWeight: 22 },
              { setNumber: 2, targetReps: 10, targetWeight: 24 },
              { setNumber: 3, targetReps: 10, targetWeight: 24 },
            ]
          },
          {
            id: 'ex_c3',
            name: 'Tricep Cable Pushdowns',
            sets: [
              { setNumber: 1, targetReps: 15, targetWeight: 20 },
              { setNumber: 2, targetReps: 12, targetWeight: 25 },
              { setNumber: 3, targetReps: 12, targetWeight: 25 },
            ]
          }
        ]
      },
      {
        id: 'plan_back',
        title: 'Back & Biceps Power',
        category: 'Strength',
        duration: 50,
        estimatedCalories: 360,
        exercises: [
          {
            id: 'ex_b1',
            name: 'Wide-Grip Lat Pulldown',
            sets: [
              { setNumber: 1, targetReps: 12, targetWeight: 50 },
              { setNumber: 2, targetReps: 10, targetWeight: 55 },
              { setNumber: 3, targetReps: 8, targetWeight: 60 },
            ]
          },
          {
            id: 'ex_b2',
            name: 'Bent-Over Barbell Rows',
            sets: [
              { setNumber: 1, targetReps: 10, targetWeight: 50 },
              { setNumber: 2, targetReps: 8, targetWeight: 55 },
              { setNumber: 3, targetReps: 8, targetWeight: 60 },
            ]
          },
          {
            id: 'ex_b3',
            name: 'Standing Incline Bicep Curls',
            sets: [
              { setNumber: 1, targetReps: 12, targetWeight: 14 },
              { setNumber: 2, targetReps: 10, targetWeight: 16 },
              { setNumber: 3, targetReps: 10, targetWeight: 16 },
            ]
          }
        ]
      },
      {
        id: 'plan_legs',
        title: 'Legs & Core Foundation',
        category: 'Strength',
        duration: 55,
        estimatedCalories: 420,
        exercises: [
          {
            id: 'ex_l1',
            name: 'Barbell Back Squats',
            sets: [
              { setNumber: 1, targetReps: 10, targetWeight: 70 },
              { setNumber: 2, targetReps: 8, targetWeight: 80 },
              { setNumber: 3, targetReps: 6, targetWeight: 90 },
              { setNumber: 4, targetReps: 6, targetWeight: 90 },
            ]
          },
          {
            id: 'ex_l2',
            name: 'Romanian Deadlifts (RDL)',
            sets: [
              { setNumber: 1, targetReps: 10, targetWeight: 60 },
              { setNumber: 2, targetReps: 10, targetWeight: 70 },
              { setNumber: 3, targetReps: 8, targetWeight: 80 },
            ]
          },
          {
            id: 'ex_l3',
            name: 'Hanging Leg Raises',
            sets: [
              { setNumber: 1, targetReps: 15, targetWeight: 0 },
              { setNumber: 2, targetReps: 15, targetWeight: 0 },
              { setNumber: 3, targetReps: 12, targetWeight: 0 },
            ]
          }
        ]
      }
    ],
    todayWorkouts: [
      {
        id: 'w1',
        title: 'Chest & Triceps Hypertrophy',
        category: 'Strength',
        duration: 48,
        calories: 350,
        time: '10:30 AM',
        totalTUTSeconds: 462,
        totalRestSeconds: 1240,
        totalVolumeKg: 4650,
        exercises: [
          {
            name: 'Barbell Flat Bench Press',
            sets: [
              { setNumber: 1, weight: 60, reps: 10, tutSeconds: 38, restSeconds: 90 },
              { setNumber: 2, weight: 65, reps: 10, tutSeconds: 42, restSeconds: 95 },
              { setNumber: 3, weight: 70, reps: 8, tutSeconds: 36, restSeconds: 120 },
              { setNumber: 4, weight: 75, reps: 6, tutSeconds: 32, restSeconds: 110 },
            ]
          },
          {
            name: 'Incline Dumbbell Press',
            sets: [
              { setNumber: 1, weight: 22, reps: 12, tutSeconds: 45, restSeconds: 90 },
              { setNumber: 2, weight: 24, reps: 10, tutSeconds: 40, restSeconds: 90 },
              { setNumber: 3, weight: 24, reps: 10, tutSeconds: 39, restSeconds: 90 },
            ]
          },
          {
            name: 'Tricep Cable Pushdowns',
            sets: [
              { setNumber: 1, weight: 20, reps: 15, tutSeconds: 50, restSeconds: 60 },
              { setNumber: 2, weight: 25, reps: 12, tutSeconds: 46, restSeconds: 60 },
              { setNumber: 3, weight: 25, reps: 12, tutSeconds: 44, restSeconds: 0 },
            ]
          }
        ]
      }
    ],
    weeklyHistory: [
      { day: 'Mon', minutes: 50, calories: 360, completed: true },
      { day: 'Tue', minutes: 45, calories: 310, completed: true },
      { day: 'Wed', minutes: 0, calories: 0, completed: false },
      { day: 'Thu', minutes: 60, calories: 420, completed: true },
      { day: 'Fri', minutes: 40, calories: 290, completed: true },
      { day: 'Sat', minutes: 48, calories: 350, completed: true },
      { day: 'Sun', minutes: 0, calories: 0, completed: false },
    ]
  },
  care: {
    skinMood: 'Glowing & Clear',
    skinRoutineAM: [
      { id: 'am-1', step: 'Gentle Hydrating Cleanser', completed: true, time: '08:00 AM' },
      { id: 'am-2', step: 'Niacinamide 10% Serum', completed: true, time: '08:05 AM' },
      { id: 'am-3', step: 'Ceramide Barrier Cream', completed: true, time: '08:08 AM' },
      { id: 'am-4', step: 'SPF 50+ Broad Spectrum Sunscreen', completed: true, time: '08:10 AM' },
    ],
    skinRoutinePM: [
      { id: 'pm-1', step: 'Micellar Water / Oil Cleanser', completed: false, time: null },
      { id: 'pm-2', step: 'Foaming Amino Cleanser', completed: false, time: null },
      { id: 'pm-3', step: 'Retinoid 0.2% Emulsion', completed: false, time: null },
      { id: 'pm-4', step: 'Peptide Deep Night Recovery Balm', completed: false, time: null },
    ],
    pillAnalytics: {
      overallAdherence: 87,
      totalTaken: 130,
      totalScheduled: 150,
      totalMissed: 20,
      dates: ['Sep 7', 'Sep 8', 'Sep 9', 'Sep 10', 'Sep 11', 'Sep 12', 'Sep 13', 'Sep 14', 'Sep 15', 'Sep 16', 'Sep 17', 'Sep 18', 'Sep 19', 'Today'],
      dayNames: ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'Now']
    },
    pills: [
      {
        id: 'p1',
        name: 'Vitamin D3 (5000 IU)',
        shortName: 'Vitamin D',
        dosage: '1 softgel',
        time: '08:30 AM',
        withFood: true,
        taken: true,
        takenAt: '08:35 AM',
        totalTakenDays: 26,
        totalScheduledDays: 30,
        adherence: 87,
        missedDoses: 4,
        instructions: 'Take in the morning with a healthy fat source (avocado or eggs) for optimal bioavailability.',
        heatmapHistory: [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        monthlyHistory: [
          1, 1, 1, 0, 1, 1, 1, 1, 1, 0,
          1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
          1, 1, 0, 1, 1, 1, 1, 1, 1, 1
        ]
      },
      {
        id: 'p2',
        name: 'Omega-3 Fish Oil (1200mg)',
        shortName: 'Omega-3',
        dosage: '2 capsules',
        time: '01:00 PM',
        withFood: true,
        taken: true,
        takenAt: '01:25 PM',
        totalTakenDays: 28,
        totalScheduledDays: 30,
        adherence: 93,
        missedDoses: 2,
        instructions: 'Take with lunch or dinner to enhance EPA/DHA lipid absorption.',
        heatmapHistory: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        monthlyHistory: [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 0, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1, 0, 1, 1, 1, 1, 1, 1
        ]
      },
      {
        id: 'p3',
        name: 'Magnesium Glycinate (200mg)',
        shortName: 'Magnesium',
        dosage: '1 tablet',
        time: '09:30 PM',
        withFood: false,
        taken: false,
        takenAt: null,
        totalTakenDays: 25,
        totalScheduledDays: 30,
        adherence: 83,
        missedDoses: 5,
        instructions: 'Take 30-45 minutes before sleep for nervous system relaxation and deep restorative REM sleep.',
        heatmapHistory: [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 2],
        monthlyHistory: [
          1, 0, 1, 1, 1, 1, 0, 1, 1, 1,
          0, 1, 1, 1, 1, 1, 0, 1, 1, 1,
          1, 1, 1, 1, 0, 1, 1, 1, 1, 2
        ]
      },
      {
        id: 'p4',
        name: 'Zinc Picolinate (25mg)',
        shortName: 'Zinc',
        dosage: '1 capsule',
        time: '10:00 PM',
        withFood: false,
        taken: false,
        takenAt: null,
        totalTakenDays: 27,
        totalScheduledDays: 30,
        adherence: 90,
        missedDoses: 3,
        instructions: 'Supports immune defenses and hormonal balance. Avoid taking with high-calcium dairy.',
        heatmapHistory: [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2],
        monthlyHistory: [
          1, 1, 0, 1, 1, 1, 1, 1, 1, 1,
          0, 1, 1, 1, 1, 1, 1, 1, 0, 1,
          1, 1, 1, 1, 1, 1, 1, 1, 1, 2
        ]
      },
      {
        id: 'p5',
        name: 'Probiotic Complex (50B CFU)',
        shortName: 'Probiotics',
        dosage: '1 capsule',
        time: '07:30 AM',
        withFood: false,
        taken: true,
        takenAt: '07:35 AM',
        totalTakenDays: 24,
        totalScheduledDays: 30,
        adherence: 80,
        missedDoses: 6,
        instructions: 'Take on an empty stomach with a full glass of water upon waking.',
        heatmapHistory: [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
        monthlyHistory: [
          1, 1, 1, 1, 0, 1, 1, 0, 1, 1,
          1, 1, 0, 1, 1, 1, 1, 0, 1, 1,
          1, 0, 1, 1, 1, 1, 0, 1, 1, 1
        ]
      }
    ]
  },
  profile: {
    name: 'Alex Rivera',
    age: 27,
    gender: 'Athletic',
    height: 178, // cm
    weight: 71.5, // kg
    targetWeight: 69.0, // kg
    goal: 'Lean Muscle & Metabolic Health',
    activityLevel: 'Active (4-5 days/week)',
  }
};

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_DATA,
          ...parsed,
          diet: {
            ...INITIAL_DATA.diet,
            ...(parsed.diet || {}),
            targetMacros: {
              ...INITIAL_DATA.diet.targetMacros,
              ...(parsed.diet?.targetMacros || {}),
            },
            meals: {
              ...INITIAL_DATA.diet.meals,
              ...(parsed.diet?.meals || {}),
            },
            customMeals: (parsed.diet?.customMeals && parsed.diet.customMeals.length > 0)
              ? parsed.diet.customMeals
              : INITIAL_DATA.diet.customMeals,
          },
          water: {
            ...INITIAL_DATA.water,
            ...(parsed.water || {}),
          },
          workout: {
            ...INITIAL_DATA.workout,
            ...(parsed.workout || {}),
          },
          care: {
            ...INITIAL_DATA.care,
            ...(parsed.care || {}),
          },
          profile: {
            ...INITIAL_DATA.profile,
            ...(parsed.profile || {}),
          },
        };
      }
    } catch (e) {
      console.error('Failed to load storage:', e);
    }
    return INITIAL_DATA;
  });

  const [activeTab, setActiveTab] = useState('water');
  const [isFullScreenPage, setIsFullScreenPage] = useState(false);

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [data]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', data.theme || 'dark');
  }, [data.theme]);

  // Theme Toggle & Set
  const toggleTheme = () => {
    setData(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  const setTheme = (theme) => {
    setData(prev => ({
      ...prev,
      theme
    }));
  };


  /* ================= WATER ACTIONS ================= */
  const addWater = (amount, label = 'Quick Add') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setData(prev => {
      const newCurrent = prev.water.current + amount;
      const newLogs = [
        { id: Date.now(), amount, time: timeStr, label },
        ...prev.water.logs
      ];
      return {
        ...prev,
        water: {
          ...prev.water,
          current: newCurrent,
          logs: newLogs
        }
      };
    });
  };

  const removeWaterLog = (id) => {
    setData(prev => {
      const targetLog = prev.water.logs.find(l => l.id === id);
      if (!targetLog) return prev;
      return {
        ...prev,
        water: {
          ...prev.water,
          current: Math.max(0, prev.water.current - targetLog.amount),
          logs: prev.water.logs.filter(l => l.id !== id)
        }
      };
    });
  };

  const decreaseWater = (amount) => {
    setData(prev => {
      const newCurrent = Math.max(0, prev.water.current - amount);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        ...prev,
        water: {
          ...prev.water,
          current: newCurrent,
          logs: [
            { id: Date.now(), amount: -amount, time: timeStr, label: 'Adjustment' },
            ...prev.water.logs
          ]
        }
      };
    });
  };

  const setWaterTarget = (newTarget) => {
    setData(prev => ({
      ...prev,
      water: { ...prev.water, target: Number(newTarget) }
    }));
  };

  /* ================= DIET ACTIONS ================= */
  const addMealItem = (category, item) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newItem = {
      id: item.id || ('meal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
      name: item.name,
      calories: Number(item.calories) || 0,
      protein: Number(item.protein) || 0,
      carbs: Number(item.carbs) || 0,
      fats: Number(item.fats) || 0,
      items: item.items || [],
      weight: item.weight || null,
      serving: item.serving || null,
      time: timeStr
    };

    setData(prev => ({
      ...prev,
      diet: {
        ...prev.diet,
        meals: {
          ...prev.diet.meals,
          [category]: [...(prev.diet.meals[category] || []), newItem]
        }
      }
    }));

    return newItem;
  };

  const removeMealItem = (category, id) => {
    setData(prev => ({
      ...prev,
      diet: {
        ...prev.diet,
        meals: {
          ...prev.diet.meals,
          [category]: prev.diet.meals[category].filter(item => item.id !== id)
        }
      }
    }));
  };

  const updateMealItem = (category, updatedItem) => {
    setData(prev => ({
      ...prev,
      diet: {
        ...prev.diet,
        meals: {
          ...prev.diet.meals,
          [category]: (prev.diet.meals[category] || []).map(item =>
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item
          )
        }
      }
    }));
  };

  const saveCustomMeal = (customMeal) => {
    setData(prev => {
      const existing = (prev.diet.customMeals || []).filter(m => m.id !== customMeal.id);
      return {
        ...prev,
        diet: {
          ...prev.diet,
          customMeals: [customMeal, ...existing]
        }
      };
    });
  };

  const deleteCustomMeal = (mealId) => {
    setData(prev => ({
      ...prev,
      diet: {
        ...prev.diet,
        customMeals: (prev.diet.customMeals || []).filter(m => m.id !== mealId)
      }
    }));
  };

  const updateDietTargets = (calories, protein, carbs, fats) => {
    setData(prev => ({
      ...prev,
      diet: {
        ...prev.diet,
        targetCalories: Number(calories),
        targetMacros: {
          protein: Number(protein),
          carbs: Number(carbs),
          fats: Number(fats)
        }
      }
    }));
  };

  /* ================= WORKOUT ACTIONS ================= */
  const addWorkout = (workout) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newWorkout = {
      id: 'work_' + Date.now(),
      title: workout.title || 'Workout Session',
      category: workout.category || 'General',
      duration: Number(workout.duration) || 30,
      calories: Number(workout.calories) || 200,
      time: timeStr,
      exercises: workout.exercises || []
    };

    setData(prev => ({
      ...prev,
      workout: {
        ...prev.workout,
        todayWorkouts: [newWorkout, ...prev.workout.todayWorkouts]
      }
    }));
  };

  const saveWorkoutPlan = (plan) => {
    setData(prev => {
      const existingPlans = prev.workout.plans || [];
      const exists = existingPlans.some(p => p.id === plan.id);
      let updatedPlans;
      if (exists) {
        updatedPlans = existingPlans.map(p => p.id === plan.id ? plan : p);
      } else {
        updatedPlans = [...existingPlans, { ...plan, id: plan.id || 'plan_' + Date.now() }];
      }
      return {
        ...prev,
        workout: {
          ...prev.workout,
          plans: updatedPlans
        }
      };
    });
  };

  const deleteWorkoutPlan = (planId) => {
    setData(prev => ({
      ...prev,
      workout: {
        ...prev.workout,
        plans: (prev.workout.plans || []).filter(p => p.id !== planId)
      }
    }));
  };

  const removeWorkout = (id) => {
    setData(prev => ({
      ...prev,
      workout: {
        ...prev.workout,
        todayWorkouts: prev.workout.todayWorkouts.filter(w => w.id !== id)
      }
    }));
  };

  /* ================= CARE & PILLS ACTIONS ================= */
  const toggleSkinStep = (routineType, id) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setData(prev => {
      const listKey = routineType === 'AM' ? 'skinRoutineAM' : 'skinRoutinePM';
      return {
        ...prev,
        care: {
          ...prev.care,
          [listKey]: prev.care[listKey].map(step => {
            if (step.id === id) {
              const nextState = !step.completed;
              return {
                ...step,
                completed: nextState,
                time: nextState ? timeStr : null
              };
            }
            return step;
          })
        }
      };
    });
  };

  const addSkinStep = (routineType, stepName) => {
    const listKey = routineType === 'AM' ? 'skinRoutineAM' : 'skinRoutinePM';
    const newStep = {
      id: 'step_' + Date.now(),
      step: stepName,
      completed: false,
      time: null
    };

    setData(prev => ({
      ...prev,
      care: {
        ...prev.care,
        [listKey]: [...prev.care[listKey], newStep]
      }
    }));
  };

  const setSkinMood = (mood) => {
    setData(prev => ({
      ...prev,
      care: {
        ...prev.care,
        skinMood: mood
      }
    }));
  };

  const togglePillTaken = (id) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setData(prev => ({
      ...prev,
      care: {
        ...prev.care,
        pills: prev.care.pills.map(p => {
          if (p.id === id) {
            const nextTaken = !p.taken;
            return {
              ...p,
              taken: nextTaken,
              takenAt: nextTaken ? timeStr : null
            };
          }
          return p;
        })
      }
    }));
  };

  const addPill = (pill) => {
    const newPill = {
      id: 'pill_' + Date.now(),
      name: pill.name,
      dosage: pill.dosage || '1 dose',
      time: pill.time || '09:00 AM',
      withFood: !!pill.withFood,
      taken: false,
      takenAt: null
    };

    setData(prev => ({
      ...prev,
      care: {
        ...prev.care,
        pills: [...prev.care.pills, newPill]
      }
    }));
  };

  const removePill = (id) => {
    setData(prev => ({
      ...prev,
      care: {
        ...prev.care,
        pills: prev.care.pills.filter(p => p.id !== id)
      }
    }));
  };

  /* ================= PROFILE ACTIONS ================= */
  const updateProfile = (profileUpdate) => {
    setData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profileUpdate
      }
    }));
  };

  const resetAllData = () => {
    setData(INITIAL_DATA);
    localStorage.removeItem(STORAGE_KEY);
  };

  const importData = (importedJson) => {
    try {
      const parsed = JSON.parse(importedJson);
      setData(parsed);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        data,
        activeTab,
        setActiveTab,
        isFullScreenPage,
        setIsFullScreenPage,
        toggleTheme,
        setTheme,
        // Water
        addWater,
        removeWaterLog,
        decreaseWater,
        setWaterTarget,
        // Diet
        addMealItem,
        removeMealItem,
        updateMealItem,
        updateDietTargets,
        saveCustomMeal,
        deleteCustomMeal,
        // Workout
        addWorkout,
        removeWorkout,
        saveWorkoutPlan,
        deleteWorkoutPlan,
        // Care & Pills
        toggleSkinStep,
        addSkinStep,
        setSkinMood,
        togglePillTaken,
        addPill,
        removePill,
        // Profile
        updateProfile,
        resetAllData,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
