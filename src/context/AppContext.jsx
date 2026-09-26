import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA } from '../data/initialData';
import {
  dbAddWaterLog,
  dbRemoveWaterLog,
  dbSetWaterTarget,
  dbAddMeal,
  dbUpdateMeal,
  dbRemoveMeal,
  dbSaveCustomMeal,
  dbDeleteCustomMeal,
  dbUpdateDietTargets,
  dbSaveWorkoutPlan,
  dbDeleteWorkoutPlan,
  dbAddWorkoutSession,
  dbRemoveWorkoutSession,
  dbSavePill,
  dbSaveSkincareStep,
  dbSaveAppStateKey,
  exportDatabaseToJson,
  importDatabaseFromJson,
  resetDatabase,
  getTodayDateString,
  triggerSnapshotUpdate,
  switchUserDatabase,
  purgeLegacyDatabases,
} from '../services/dbService';
import { signOutGoogle, getStoredAuthSession, handleGoogleOAuthCallback, loginWithGoogle } from '../services/authService';
import {
  syncWaterWeeklyHistory,
  syncDietWeeklyHistory,
  syncWorkoutWeeklyHistory,
} from '../utils/dateHistorySync';
import { getIsoDate } from '../utils/careAnalyticsUtils';
import { calculateMacrosFromCalories } from '../utils/macroCalculations';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [data, setData] = useState(INITIAL_DATA);
  const [isDbReady, setIsDbReady] = useState(false);

  // App Navigation State
  const [activeTab, setActiveTab] = useState('water');
  const [currentPage, setCurrentPage] = useState('main'); // 'main' | 'profile' | 'settings' | 'faq' | 'privacy'
  const [previousTab, setPreviousTab] = useState('water');
  const [isFullScreenPage, setIsFullScreenPage] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize Dexie IndexedDB & process Google OAuth redirect on startup
  useEffect(() => {
    let isMounted = true;

    async function initAppSession() {
      // 1. Purge legacy mock databases if any exist
      await purgeLegacyDatabases();

      // 2. Check if user just redirected back from Google OAuth
      const oauthUser = await handleGoogleOAuthCallback();
      if (oauthUser) {
        const userState = await switchUserDatabase(oauthUser.id);
        const userProfile = userState.profile || {
          name: oauthUser.name,
          goal: 'Personal Health & Fitness',
          age: null,
          gender: null,
          height: null,
          weight: null,
          targetWeight: null,
          activityLevel: 'Active',
          avatarUrl: oauthUser.avatarUrl,
          email: oauthUser.email,
        };
        const userAuth = {
          isLoggedIn: true,
          user: oauthUser,
          email: oauthUser.email,
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };
        await dbSaveAppStateKey('profile', userProfile);
        await dbSaveAppStateKey('auth', userAuth);

        if (isMounted) {
          setData({
            ...userState,
            profile: userProfile,
            auth: userAuth,
          });
          setIsDbReady(true);
          setCurrentPage('profile');
        }
        return;
      }

      // 3. Check for existing stored session
      const storedSession = getStoredAuthSession();
      if (storedSession?.id) {
        const userState = await switchUserDatabase(storedSession.id);
        if (isMounted) {
          setData(userState);
          setIsDbReady(true);
        }
      } else {
        // Guest mode: clean empty state, zero DB writes
        const guestState = await switchUserDatabase('guest');
        if (isMounted) {
          setData(guestState);
          setIsDbReady(true);
        }
      }
    }

    initAppSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Continuously schedule disk snapshot for Android Auto-Backup
  useEffect(() => {
    if (isDbReady) {
      triggerSnapshotUpdate();
    }
  }, [data, isDbReady]);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', data.theme || 'dark');
  }, [data.theme]);

  /* ================= THEME ACTIONS ================= */
  const toggleTheme = () => {
    setData(prev => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      dbSaveAppStateKey('theme', nextTheme).catch(console.error);
      return { ...prev, theme: nextTheme };
    });
  };

  const setTheme = (theme) => {
    setData(prev => {
      dbSaveAppStateKey('theme', theme).catch(console.error);
      return { ...prev, theme };
    });
  };

  /* ================= WATER ACTIONS ================= */
  const addWater = (amount, label = 'Quick Add') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = getTodayDateString();

    setData(prev => {
      const newCurrent = prev.water.current + amount;
      const newLog = { id: Date.now(), amount, time: timeStr, label, date: today };
      const newLogs = [newLog, ...prev.water.logs];
      const newWeeklyHistory = syncWaterWeeklyHistory(prev.water.weeklyHistory, newCurrent, prev.water.target);

      // Async write to Dexie
      dbAddWaterLog(newLog).catch(console.error);
      dbSaveAppStateKey('waterWeeklyHistory', newWeeklyHistory).catch(console.error);

      return {
        ...prev,
        water: {
          ...prev.water,
          current: newCurrent,
          logs: newLogs,
          weeklyHistory: newWeeklyHistory,
        },
      };
    });
  };

  const removeWaterLog = (id) => {
    setData(prev => {
      const targetLog = prev.water.logs.find(l => l.id === id);
      if (!targetLog) return prev;
      const newCurrent = Math.max(0, prev.water.current - targetLog.amount);
      const newLogs = prev.water.logs.filter(l => l.id !== id);
      const newWeeklyHistory = syncWaterWeeklyHistory(prev.water.weeklyHistory, newCurrent, prev.water.target);

      // Async remove from Dexie
      dbRemoveWaterLog(id).catch(console.error);
      dbSaveAppStateKey('waterWeeklyHistory', newWeeklyHistory).catch(console.error);

      return {
        ...prev,
        water: {
          ...prev.water,
          current: newCurrent,
          logs: newLogs,
          weeklyHistory: newWeeklyHistory,
        },
      };
    });
  };

  const decreaseWater = (amount) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = getTodayDateString();

    setData(prev => {
      const newCurrent = Math.max(0, prev.water.current - amount);
      const newLog = { id: Date.now(), amount: -amount, time: timeStr, label: 'Adjustment', date: today };
      const newLogs = [newLog, ...prev.water.logs];
      const newWeeklyHistory = syncWaterWeeklyHistory(prev.water.weeklyHistory, newCurrent, prev.water.target);

      // Async write to Dexie
      dbAddWaterLog(newLog).catch(console.error);
      dbSaveAppStateKey('waterWeeklyHistory', newWeeklyHistory).catch(console.error);

      return {
        ...prev,
        water: {
          ...prev.water,
          current: newCurrent,
          logs: newLogs,
          weeklyHistory: newWeeklyHistory,
        },
      };
    });
  };

  const setWaterTarget = (newTarget) => {
    const targetNum = Number(newTarget);
    setData(prev => {
      const newWeeklyHistory = syncWaterWeeklyHistory(prev.water.weeklyHistory, prev.water.current, targetNum);
      dbSetWaterTarget(targetNum).catch(console.error);
      dbSaveAppStateKey('waterWeeklyHistory', newWeeklyHistory).catch(console.error);
      return {
        ...prev,
        water: {
          ...prev.water,
          target: targetNum,
          weeklyHistory: newWeeklyHistory,
        },
      };
    });
  };

  /* ================= DIET ACTIONS ================= */
  const addMealItem = (category, item) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = getTodayDateString();

    const newItem = {
      ...item,
      id: item.uid || item.id || ('meal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
      foodId: item.foodId || item.id,
      name: item.name,
      category,
      calories: Number(item.calories) || 0,
      protein: Number(item.protein) || 0,
      carbs: Number(item.carbs) || 0,
      fats: Number(item.fats) || 0,
      fiber: Number(item.fiber) || 0,
      items: item.items || [],
      weight: Number(item.weight) || Number(item.defaultWeight) || Number(item.baseWeight) || 100,
      serving: item.serving || null,
      quantity: item.quantity || item.serving || null,
      time: timeStr,
      date: today,
    };

    setData(prev => {
      const updatedCategoryMeals = [...(prev.diet.meals[category] || []), newItem];
      const updatedMeals = {
        ...prev.diet.meals,
        [category]: updatedCategoryMeals,
      };
      const updatedWeeklyHistory = syncDietWeeklyHistory(prev.diet.weeklyHistory, updatedMeals);

      // Async write to Dexie
      dbAddMeal(newItem).catch(console.error);
      dbSaveAppStateKey('dietWeeklyHistory', updatedWeeklyHistory).catch(console.error);

      return {
        ...prev,
        diet: {
          ...prev.diet,
          meals: updatedMeals,
          weeklyHistory: updatedWeeklyHistory,
        },
      };
    });

    return newItem;
  };

  const removeMealItem = (category, id) => {
    setData(prev => {
      const updatedCategoryMeals = (prev.diet.meals[category] || []).filter(item => item.id !== id);
      const updatedMeals = {
        ...prev.diet.meals,
        [category]: updatedCategoryMeals,
      };
      const updatedWeeklyHistory = syncDietWeeklyHistory(prev.diet.weeklyHistory, updatedMeals);

      // Async remove from Dexie
      dbRemoveMeal(id).catch(console.error);
      dbSaveAppStateKey('dietWeeklyHistory', updatedWeeklyHistory).catch(console.error);

      return {
        ...prev,
        diet: {
          ...prev.diet,
          meals: updatedMeals,
          weeklyHistory: updatedWeeklyHistory,
        },
      };
    });
  };

  const updateMealItem = (category, itemIdOrObj, updatedFields = {}) => {
    const isObj = typeof itemIdOrObj === 'object' && itemIdOrObj !== null;
    const targetId = isObj ? itemIdOrObj.id : itemIdOrObj;
    const patch = isObj ? itemIdOrObj : updatedFields;

    setData(prev => {
      let mergedItemForDb = null;
      const updatedCategoryMeals = (prev.diet.meals[category] || []).map(item => {
        if (item.id === targetId) {
          const merged = { ...item, ...patch, id: item.id, category };
          mergedItemForDb = merged;
          return merged;
        }
        return item;
      });
      const updatedMeals = {
        ...prev.diet.meals,
        [category]: updatedCategoryMeals,
      };
      const updatedWeeklyHistory = syncDietWeeklyHistory(prev.diet.weeklyHistory, updatedMeals);

      // Async write to Dexie
      if (mergedItemForDb) {
        dbUpdateMeal(mergedItemForDb).catch(console.error);
      }
      dbSaveAppStateKey('dietWeeklyHistory', updatedWeeklyHistory).catch(console.error);

      return {
        ...prev,
        diet: {
          ...prev.diet,
          meals: updatedMeals,
          weeklyHistory: updatedWeeklyHistory,
        },
      };
    });
  };

  const saveCustomMeal = (customMeal) => {
    const mealWithId = {
      ...customMeal,
      id: customMeal.id || ('custom_' + Date.now()),
    };

    setData(prev => {
      const existing = (prev.diet.customMeals || []).filter(m => m.id !== mealWithId.id);
      const updated = [mealWithId, ...existing];

      // Async write to Dexie
      dbSaveCustomMeal(mealWithId).catch(console.error);

      return {
        ...prev,
        diet: {
          ...prev.diet,
          customMeals: updated,
        },
      };
    });
  };

  const deleteCustomMeal = (mealId) => {
    setData(prev => {
      const updated = (prev.diet.customMeals || []).filter(m => m.id !== mealId);
      dbDeleteCustomMeal(mealId).catch(console.error);
      return {
        ...prev,
        diet: {
          ...prev.diet,
          customMeals: updated,
        },
      };
    });
  };

  const updateDietTargets = (calories, protein, carbs, fats) => {
    const c = Number(calories) || 2000;
    const dynamicMacros = calculateMacrosFromCalories(c);
    const macros = {
      protein: protein !== undefined && protein !== null && !isNaN(Number(protein)) ? Number(protein) : dynamicMacros.protein,
      carbs: carbs !== undefined && carbs !== null && !isNaN(Number(carbs)) ? Number(carbs) : dynamicMacros.carbs,
      fats: fats !== undefined && fats !== null && !isNaN(Number(fats)) ? Number(fats) : dynamicMacros.fats,
    };

    setData(prev => {
      dbUpdateDietTargets(c, macros, true).catch(console.error);
      return {
        ...prev,
        diet: {
          ...prev.diet,
          targetCalories: c,
          targetMacros: macros,
          isCustomTarget: true,
        },
      };
    });
  };

  /* ================= WORKOUT ACTIONS ================= */
  const addWorkout = (workout) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = getTodayDateString();

    const newWorkout = {
      id: 'work_' + Date.now(),
      title: workout.title || 'Workout Session',
      category: workout.category || 'General',
      duration: Number(workout.duration) || 30,
      calories: Number(workout.calories) || 200,
      time: timeStr,
      date: today,
      exercises: workout.exercises || [],
      totalTUTSeconds: workout.totalTUTSeconds || 0,
      totalRestSeconds: workout.totalRestSeconds || 0,
      totalVolumeKg: workout.totalVolumeKg || 0,
    };

    setData(prev => {
      const updatedSessions = [newWorkout, ...prev.workout.todayWorkouts];
      const updatedWeeklyHistory = syncWorkoutWeeklyHistory(prev.workout.weeklyHistory, updatedSessions);

      // Async write to Dexie
      dbAddWorkoutSession(newWorkout).catch(console.error);
      dbSaveAppStateKey('workoutWeeklyHistory', updatedWeeklyHistory).catch(console.error);

      return {
        ...prev,
        workout: {
          ...prev.workout,
          todayWorkouts: updatedSessions,
          weeklyHistory: updatedWeeklyHistory,
        },
      };
    });
  };

  const removeWorkout = (id) => {
    setData(prev => {
      const updatedSessions = prev.workout.todayWorkouts.filter(w => w.id !== id);
      const updatedWeeklyHistory = syncWorkoutWeeklyHistory(prev.workout.weeklyHistory, updatedSessions);

      dbRemoveWorkoutSession(id).catch(console.error);
      dbSaveAppStateKey('workoutWeeklyHistory', updatedWeeklyHistory).catch(console.error);

      return {
        ...prev,
        workout: {
          ...prev.workout,
          todayWorkouts: updatedSessions,
          weeklyHistory: updatedWeeklyHistory,
        },
      };
    });
  };

  const saveWorkoutPlan = (plan) => {
    const planWithId = {
      ...plan,
      id: plan.id || ('plan_' + Date.now()),
    };

    setData(prev => {
      const existingPlans = prev.workout.plans || [];
      const exists = existingPlans.some(p => p.id === planWithId.id);
      const updatedPlans = exists
        ? existingPlans.map(p => (p.id === planWithId.id ? planWithId : p))
        : [...existingPlans, planWithId];

      dbSaveWorkoutPlan(planWithId).catch(console.error);

      return {
        ...prev,
        workout: {
          ...prev.workout,
          plans: updatedPlans,
        },
      };
    });
  };

  const deleteWorkoutPlan = (planId) => {
    setData(prev => {
      const updated = (prev.workout.plans || []).filter(p => p.id !== planId);
      dbDeleteWorkoutPlan(planId).catch(console.error);
      return {
        ...prev,
        workout: {
          ...prev.workout,
          plans: updated,
        },
      };
    });
  };

  /* ================= CARE & PILLS ACTIONS ================= */
  const toggleSkinStep = (routineType, id, targetDate = new Date()) => {
    const targetIso = getIsoDate(targetDate);
    const todayIso = getIsoDate(new Date());
    const isTargetToday = targetIso === todayIso;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setData(prev => {
      const listKey = routineType === 'AM' ? 'skinRoutineAM' : 'skinRoutinePM';
      let modifiedStep = null;
      const updatedList = (prev.care[listKey] || []).map(step => {
        if (step.id === id) {
          const currentHistory = step.history || {};
          const currentStatus = !!currentHistory[targetIso];
          const nextStatus = !currentStatus;
          modifiedStep = {
            ...step,
            routineType,
            history: {
              ...currentHistory,
              [targetIso]: nextStatus,
            },
            completed: isTargetToday ? nextStatus : step.completed,
            time: isTargetToday ? (nextStatus ? timeStr : null) : step.time,
          };
          return modifiedStep;
        }
        return step;
      });

      if (modifiedStep) {
        dbSaveSkincareStep(modifiedStep).catch(console.error);
      }

      return {
        ...prev,
        care: {
          ...prev.care,
          [listKey]: updatedList,
        },
      };
    });
  };

  const addSkinStep = (routineType, stepName) => {
    const listKey = routineType === 'AM' ? 'skinRoutineAM' : 'skinRoutinePM';
    const todayIso = getIsoDate(new Date());
    const newStep = {
      id: 'step_' + Date.now(),
      routineType,
      step: stepName,
      completed: false,
      time: null,
      createdAt: todayIso,
      deletedAt: null,
      history: {},
    };

    setData(prev => {
      dbSaveSkincareStep(newStep).catch(console.error);
      return {
        ...prev,
        care: {
          ...prev.care,
          [listKey]: [...(prev.care[listKey] || []), newStep],
        },
      };
    });
  };

  const removeSkinStep = (routineType, id) => {
    const listKey = routineType === 'AM' ? 'skinRoutineAM' : 'skinRoutinePM';
    const todayIso = getIsoDate(new Date());

    setData(prev => {
      let modifiedStep = null;
      const updatedList = (prev.care[listKey] || []).map(step => {
        if (step.id === id) {
          modifiedStep = { ...step, deletedAt: todayIso };
          return modifiedStep;
        }
        return step;
      });

      if (modifiedStep) {
        dbSaveSkincareStep(modifiedStep).catch(console.error);
      }

      return {
        ...prev,
        care: {
          ...prev.care,
          [listKey]: updatedList,
        },
      };
    });
  };

  const updateSkinStep = (routineType, id, newStepName) => {
    setData(prev => {
      const listKey = routineType === 'AM' ? 'skinRoutineAM' : 'skinRoutinePM';
      let updatedStep = null;
      const updatedList = (prev.care[listKey] || []).map(step => {
        if (step.id === id) {
          updatedStep = { ...step, routineType, step: newStepName };
          return updatedStep;
        }
        return step;
      });

      if (updatedStep) {
        dbSaveSkincareStep(updatedStep).catch(console.error);
      }

      return {
        ...prev,
        care: {
          ...prev.care,
          [listKey]: updatedList,
        },
      };
    });
  };

  const setSkinMood = (mood) => {
    setData(prev => {
      dbSaveAppStateKey('skinMood', mood).catch(console.error);
      return {
        ...prev,
        care: {
          ...prev.care,
          skinMood: mood,
        },
      };
    });
  };

  const togglePillTaken = (id, targetDate = new Date()) => {
    const targetIso = getIsoDate(targetDate);
    const todayIso = getIsoDate(new Date());
    const isTargetToday = targetIso === todayIso;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setData(prev => {
      let updatedPill = null;
      const updatedPills = (prev.care.pills || []).map(p => {
        if (p.id === id) {
          const currentHistory = p.history || {};
          const currentStatus = !!currentHistory[targetIso];
          const nextStatus = !currentStatus;

          const totalTaken = nextStatus
            ? (p.totalTakenDays || 25) + 1
            : Math.max(0, (p.totalTakenDays || 26) - 1);
          const totalScheduled = p.totalScheduledDays || 30;
          const adherence = Math.round((totalTaken / totalScheduled) * 100);

          updatedPill = {
            ...p,
            history: {
              ...currentHistory,
              [targetIso]: nextStatus,
            },
            taken: isTargetToday ? nextStatus : p.taken,
            takenAt: isTargetToday ? (nextStatus ? timeStr : null) : p.takenAt,
            totalTakenDays: totalTaken,
            adherence,
          };
          return updatedPill;
        }
        return p;
      });

      if (updatedPill) {
        dbSavePill(updatedPill).catch(console.error);
      }

      return {
        ...prev,
        care: {
          ...prev.care,
          pills: updatedPills,
        },
      };
    });
  };

  const addPill = (pill) => {
    const todayIso = getIsoDate(new Date());
    const newPill = {
      id: 'pill_' + Date.now(),
      name: pill.name,
      shortName: pill.shortName || pill.name.split(' ')[0],
      dosage: pill.dosage || '1 dose',
      time: pill.time || '09:00 AM',
      withFood: !!pill.withFood,
      taken: false,
      takenAt: null,
      totalTakenDays: 0,
      totalScheduledDays: 30,
      adherence: 0,
      missedDoses: 0,
      instructions: pill.instructions || '',
      createdAt: todayIso,
      deletedAt: null,
      history: {},
    };

    setData(prev => {
      dbSavePill(newPill).catch(console.error);
      return {
        ...prev,
        care: {
          ...prev.care,
          pills: [...(prev.care.pills || []), newPill],
        },
      };
    });
  };

  const updatePill = (id, updatedFields) => {
    setData(prev => {
      let updatedPill = null;
      const updatedPills = (prev.care.pills || []).map(p => {
        if (p.id === id) {
          updatedPill = { ...p, ...updatedFields };
          return updatedPill;
        }
        return p;
      });

      if (updatedPill) {
        dbSavePill(updatedPill).catch(console.error);
      }

      return {
        ...prev,
        care: {
          ...prev.care,
          pills: updatedPills,
        },
      };
    });
  };

  const removePill = (id) => {
    const todayIso = getIsoDate(new Date());
    setData(prev => {
      let updatedPill = null;
      const updatedPills = (prev.care.pills || []).map(p => {
        if (p.id === id) {
          updatedPill = { ...p, deletedAt: todayIso };
          return updatedPill;
        }
        return p;
      });

      if (updatedPill) {
        dbSavePill(updatedPill).catch(console.error);
      }

      return {
        ...prev,
        care: {
          ...prev.care,
          pills: updatedPills,
        },
      };
    });
  };

  /* ================= PROFILE ACTIONS ================= */
  const updateProfile = (profileUpdate) => {
    setData(prev => {
      const currentProfile = prev.profile || {
        name: '',
        goal: 'Health & Fitness Tracking',
        age: null,
        gender: null,
        height: null,
        weight: null,
        targetWeight: null,
        activityLevel: 'Active',
        avatarUrl: null,
        email: prev.auth?.email || null,
      };
      const updated = { ...currentProfile, ...profileUpdate };
      dbSaveAppStateKey('profile', updated).catch(console.error);
      return {
        ...prev,
        profile: updated,
      };
    });
  };

  const resetAllData = async () => {
    const freshState = await resetDatabase();
    setData(freshState);
  };

  const importData = async (importedJson) => {
    try {
      const newState = await importDatabaseFromJson(importedJson);
      if (newState) {
        setData(newState);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  /* ================= NOTIFICATIONS, RATING & AUTH ================= */
  const toggleNotification = (key) => {
    setData(prev => {
      const current = prev.notifications || INITIAL_DATA.notifications;
      const updated =
        key === 'enabled'
          ? { ...current, enabled: !current.enabled }
          : { ...current, [key]: !current[key] };

      dbSaveAppStateKey('notifications', updated).catch(console.error);
      return {
        ...prev,
        notifications: updated,
      };
    });
  };

  const saveRating = (ratingData) => {
    const userRating = {
      ...ratingData,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    setData(prev => {
      dbSaveAppStateKey('userRating', userRating).catch(console.error);
      return { ...prev, userRating };
    });
  };

  /* ================= GOOGLE SSO & GUEST AUTH ACTIONS ================= */
  const loginWithGoogleSSO = async (googleUser) => {
    try {
      // 1. Switch to user-isolated database
      const userState = await switchUserDatabase(googleUser.id);

      let pendingOnboarding = null;
      try {
        const rawPending = window.localStorage.getItem("vitalsync_pending_onboarding_profile");
        if (rawPending) pendingOnboarding = JSON.parse(rawPending);
      } catch {}

      // 2. Build profile from Google user info, pending onboarding data, or existing profile
      const baseProfile = userState.profile || {
        name: googleUser.name || "Google User",
        goal: "Health & Fitness Tracking",
        age: null,
        gender: null,
        height: null,
        weight: null,
        targetWeight: null,
        activityLevel: "Active",
        avatarUrl: googleUser.avatarUrl || null,
        email: googleUser.email,
      };
      const userProfile = {
        ...baseProfile,
        name: pendingOnboarding?.name || baseProfile.name || googleUser.name || "Google User",
        gender: pendingOnboarding?.gender ?? baseProfile.gender ?? null,
        height: pendingOnboarding?.height ?? baseProfile.height ?? null,
        weight: pendingOnboarding?.weight ?? baseProfile.weight ?? null,
        avatarUrl: googleUser.avatarUrl || baseProfile.avatarUrl || null,
        email: googleUser.email || baseProfile.email || null,
      };

      // 3. Build auth state
      const userAuth = {
        isLoggedIn: true,
        user: googleUser,
        email: googleUser.email,
        joinedDate: userState.auth?.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };

      // 4. Save to user database
      await dbSaveAppStateKey('profile', userProfile);
      await dbSaveAppStateKey('auth', userAuth);

      setData({
        ...userState,
        profile: userProfile,
        auth: userAuth,
      });

      setIsAuthModalOpen(false);
      setCurrentPage('main');
    } catch (err) {
      console.error('Failed to log in with Google SSO:', err);
      throw err;
    }
  };

  const triggerGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        await loginWithGoogleSSO(user);
      }
    } catch (err) {
      console.error('Failed to authenticate with Google:', err);
      throw err;
    }
  };

  const exploreAsGuest = async () => {
    setIsAuthModalOpen(false);
    // Switch to guest database if not already
    const guestState = await switchUserDatabase('guest');
    setData({
      ...guestState,
      profile: null,
      auth: { isLoggedIn: false, user: null, email: null, joinedDate: null },
    });
    setActiveTab('water');
    setCurrentPage('main');
  };

  const logoutUser = async () => {
    await signOutGoogle();
    const guestState = await switchUserDatabase('guest');
    setData({
      ...guestState,
      profile: null,
      auth: { isLoggedIn: false, user: null, email: null, joinedDate: null },
    });
    setActiveTab('water');
    setCurrentPage('main');
  };

  const toggleFapCounter = () => {
    setData(prev => {
      const nextVal = !prev.fapCounterEnabled;
      dbSaveAppStateKey('fapCounterEnabled', nextVal).catch(console.error);
      return {
        ...prev,
        fapCounterEnabled: nextVal,
      };
    });
  };

  const deleteAccount = async () => {
    await resetAllData();
    await signOutGoogle();
    setCurrentPage('main');
    setActiveTab('water');
  };

  // Profile and Settings navigation helpers
  const openProfilePage = () => {
    // If no profile is logged in, show Auth options
    if (!data.auth?.isLoggedIn || !data.profile) {
      setIsAuthModalOpen(true);
      return;
    }
    if (activeTab !== 'profile') {
      setPreviousTab(activeTab);
    }
    setCurrentPage('profile');
  };

  const closeProfilePage = () => setCurrentPage('main');
  const openSettingsPage = () => setCurrentPage('settings');
  const closeSettingsPage = () => setCurrentPage('profile');
  const openFaqPage = () => setCurrentPage('faq');
  const closeFaqPage = () => setCurrentPage('settings');
  const openPrivacyPage = () => setCurrentPage('privacy');
  const closePrivacyPage = () => setCurrentPage('settings');

  return (
    <AppContext.Provider
      value={{
        data,
        isDbReady,
        activeTab,
        setActiveTab,
        isFullScreenPage,
        setIsFullScreenPage,
        toggleTheme,
        setTheme,
        purchasePremium: async () => {
          setData(prev => {
            const nextSub = { ...prev.subscription, isPremium: true, plan: "premium_monthly" };
            dbSaveAppStateKey("subscription", nextSub).catch(console.error);
            return { ...prev, subscription: nextSub };
          });
          return true;
        },
        restorePurchases: async () => { return true; },
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
        removeSkinStep,
        updateSkinStep,
        setSkinMood,
        togglePillTaken,
        addPill,
        updatePill,
        removePill,
        // Profile
        updateProfile,
        resetAllData,
        importData,
        exportData: exportDatabaseToJson,
        // Page Navigation
        currentPage,
        setCurrentPage,
        openProfilePage,
        closeProfilePage,
        openSettingsPage,
        closeSettingsPage,
        openFaqPage,
        closeFaqPage,
        openPrivacyPage,
        closePrivacyPage,
        previousTab,
        // Habits & Features
        toggleFapCounter,
        // Notifications
        toggleNotification,
        // Rating
        saveRating,
        // Auth & Google SSO
        isAuthModalOpen,
        setIsAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        loginWithGoogleSSO,
        triggerGoogleLogin,
        exploreAsGuest,
        logoutUser,
        deleteAccount,
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
