import Dexie from 'dexie';
import { ArcDatabase, db, setDatabaseInstance } from '../db/arcDatabase';
import { INITIAL_DATA } from '../data/initialData';
import { FOOD_DATABASE } from '../data/foodDatabase';
import { scheduleDiskSnapshot, loadDiskSnapshot } from './snapshotService';

const STORAGE_MIGRATION_KEY = 'vitalsync_health_app_data_v1';
let currentUserId = null;

/**
 * Requests persistent storage from the browser/WebView so Android OS storage cleaners
 * do not evict IndexedDB tables under low disk space.
 */
async function ensurePersistentStorage() {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.persist === 'function') {
      await navigator.storage.persist();
    }
  } catch {
    // Ignore if unsupported
  }
}

/**
 * Checks if the current session belongs to an authenticated user (not guest).
 */
export function isUserAuthenticated() {
  return !!currentUserId && currentUserId !== 'guest';
}

/**
 * Switches the active IndexedDB database instance.
 * For guests ('guest' or null), no database writes are performed.
 * For authenticated users, loads/initializes their private database.
 *
 * @param {string|null} userId
 */
export async function switchUserDatabase(userId) {
  try {
    await ensurePersistentStorage();

    if (db) {
      try {
        db.close();
      } catch {
        // Ignore close error
      }
    }

    currentUserId = userId && userId !== 'guest' ? String(userId) : null;

    if (!isUserAuthenticated()) {
      // Guest mode: use clean empty in-memory state
      return { ...INITIAL_DATA };
    }

    const sanitizedId = currentUserId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dbName = `ArcHealth_${sanitizedId}`;
    const newDb = new ArcDatabase(dbName);
    setDatabaseInstance(newDb);

    return await initDatabase();
  } catch (err) {
    console.error('Failed to switch user database:', err);
    return { ...INITIAL_DATA };
  }
}

/**
 * Helper to get today's ISO date string: YYYY-MM-DD
 */
export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Schedules an updated backup snapshot to disk (only for authenticated users).
 */
export async function triggerSnapshotUpdate() {
  if (!isUserAuthenticated()) return;
  try {
    const jsonString = await exportDatabaseToJson();
    scheduleDiskSnapshot(jsonString, currentUserId);
  } catch (err) {
    console.warn('Could not schedule snapshot update:', err);
  }
}

/**
 * Purges legacy mock databases and old localStorage keys to ensure zero fake data exists.
 */
export async function purgeLegacyDatabases() {
  try {
    localStorage.removeItem(STORAGE_MIGRATION_KEY);

    try {
      await Dexie.delete('ArcHealthDatabase');
    } catch {
      // Ignore
    }
    try {
      await Dexie.delete('ArcHealth_guest');
    } catch {
      // Ignore
    }
  } catch (e) {
    console.warn('Error purging legacy databases:', e);
  }
}

/**
 * Initialize Dexie IndexedDB for the current user.
 * Guests do not store data in the database.
 * Authenticated users receive a clean database with the reference food catalog,
 * or automatically recover from their native Android Directory.Data backup snapshot if present.
 *
 * Returns the assembled app state for AppContext.
 */
export async function initDatabase() {
  if (!isUserAuthenticated()) {
    return { ...INITIAL_DATA };
  }

  try {
    const isInitialized = await db.appState.get('initialized');

    if (!isInitialized) {
      // Seed Reference Food Database Catalog for meal logging searches
      const existingFoodCount = await db.foods.count();
      if (existingFoodCount === 0 && FOOD_DATABASE?.length > 0) {
        const foodCatalog = FOOD_DATABASE.map(f => ({
          ...f,
          isCustom: false,
        }));
        await db.foods.bulkPut(foodCatalog);
      }

      // Check if a native Android Auto-Backup / Directory.Data snapshot exists for this user
      const savedSnapshot = await loadDiskSnapshot(currentUserId);
      if (savedSnapshot && savedSnapshot.data) {
        const restored = await importDatabaseFromJson(savedSnapshot);
        if (restored) {
          return await loadAssembledState();
        }
      }

      // Initialize clean user app state with zero dummy data
      const statePairs = [
        { key: 'initialized', value: true },
        { key: 'theme', value: 'dark' },
        { key: 'profile', value: null },
        { key: 'notifications', value: INITIAL_DATA.notifications },
        { key: 'auth', value: INITIAL_DATA.auth },
        { key: 'waterTarget', value: 2500 },
        { key: 'waterStreak', value: 0 },
        { key: 'waterWeeklyHistory', value: [] },
        { key: 'dietTargetCalories', value: null },
        { key: 'dietTargetMacros', value: null },
        { key: 'dietIsCustomTarget', value: false },
        { key: 'dietWeeklyHistory', value: [] },
        { key: 'workoutStreak', value: 0 },
        { key: 'workoutWeeklyGoal', value: 3 },
        { key: 'workoutWeeklyHistory', value: [] },
        { key: 'skinMood', value: 'Clear & Fresh' },
        { key: 'pillAnalytics', value: null },
        { key: 'fapCounterEnabled', value: false },
        { key: 'userRating', value: null },
      ];
      await db.appState.bulkPut(statePairs);
    }

    return await loadAssembledState();
  } catch (error) {
    console.error('Failed to initialize user database, falling back to default:', error);
    return { ...INITIAL_DATA };
  }
}

/**
 * Queries Dexie and reconstructs full app state for the active authenticated user.
 */
async function loadAssembledState() {
  if (!isUserAuthenticated()) {
    return { ...INITIAL_DATA };
  }

  const [
    waterLogs,
    meals,
    customMeals,
    workoutPlans,
    workoutSessions,
    pills,
    skincareSteps,
    appStateEntries,
  ] = await Promise.all([
    db.waterLogs.toArray(),
    db.meals.toArray(),
    db.customMeals.toArray(),
    db.workoutPlans.toArray(),
    db.workoutSessions.toArray(),
    db.pills.toArray(),
    db.skincareSteps.toArray(),
    db.appState.toArray(),
  ]);

  const stateMap = {};
  for (const item of appStateEntries) {
    stateMap[item.key] = item.value;
  }

  // Calculate current water from today's logs
  const today = getTodayDateString();
  const todayWaterLogs = waterLogs.filter(l => l.date === today);
  const currentWater = todayWaterLogs.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

  // Group meals by category
  const mealsByCategory = { breakfast: [], lunch: [], dinner: [], snacks: [] };
  const todayMeals = meals.filter(m => m.date === today);
  for (const meal of todayMeals) {
    const cat = meal.category || 'snacks';
    if (!mealsByCategory[cat]) mealsByCategory[cat] = [];
    mealsByCategory[cat].push(meal);
  }

  // Group skincare steps
  const skinRoutineAM = skincareSteps.filter(s => s.routineType === 'AM');
  const skinRoutinePM = skincareSteps.filter(s => s.routineType === 'PM');

  return {
    theme: stateMap.theme || 'dark',
    water: {
      target: stateMap.waterTarget ?? 2500,
      current: currentWater,
      streak: stateMap.waterStreak ?? 0,
      logs: todayWaterLogs,
      weeklyHistory: stateMap.waterWeeklyHistory || [],
    },
    diet: {
      targetCalories: stateMap.dietTargetCalories ?? null,
      targetMacros: stateMap.dietTargetMacros ?? null,
      isCustomTarget: stateMap.dietIsCustomTarget ?? false,
      customMeals: customMeals || [],
      meals: mealsByCategory,
      weeklyHistory: stateMap.dietWeeklyHistory || [],
    },
    workout: {
      streak: stateMap.workoutStreak ?? 0,
      weeklyGoal: stateMap.workoutWeeklyGoal ?? 3,
      plans: workoutPlans || [],
      todayWorkouts: workoutSessions || [],
      weeklyHistory: stateMap.workoutWeeklyHistory || [],
    },
    care: {
      skinMood: stateMap.skinMood || 'Clear & Fresh',
      skinRoutineAM,
      skinRoutinePM,
      pillAnalytics: stateMap.pillAnalytics || null,
      pills: pills || [],
    },
    profile: stateMap.profile || null,
    notifications: stateMap.notifications || INITIAL_DATA.notifications,
    userRating: stateMap.userRating || null,
    fapCounterEnabled: stateMap.fapCounterEnabled || false,
    auth: stateMap.auth || INITIAL_DATA.auth,
  };
}

/* ================= WATER DB OPERATIONS ================= */
export async function dbAddWaterLog(log) {
  if (!isUserAuthenticated()) return null;
  return await db.waterLogs.add(log);
}

export async function dbRemoveWaterLog(id) {
  if (!isUserAuthenticated()) return null;
  return await db.waterLogs.delete(id);
}

export async function dbSetWaterTarget(target) {
  if (!isUserAuthenticated()) return null;
  return await db.appState.put({ key: 'waterTarget', value: target });
}

/* ================= DIET DB OPERATIONS ================= */
export async function dbAddMeal(meal) {
  if (!isUserAuthenticated()) return null;
  return await db.meals.put(meal);
}

export async function dbUpdateMeal(meal) {
  if (!isUserAuthenticated()) return null;
  return await db.meals.put(meal);
}

export async function dbRemoveMeal(id) {
  if (!isUserAuthenticated()) return null;
  return await db.meals.delete(id);
}

export async function dbSaveCustomMeal(customMeal) {
  if (!isUserAuthenticated()) return null;
  return await db.customMeals.put(customMeal);
}

export async function dbDeleteCustomMeal(id) {
  if (!isUserAuthenticated()) return null;
  return await db.customMeals.delete(id);
}

export async function dbUpdateDietTargets(calories, macros, isCustom = true) {
  if (!isUserAuthenticated()) return;
  await db.appState.bulkPut([
    { key: 'dietTargetCalories', value: calories },
    { key: 'dietTargetMacros', value: macros },
    { key: 'dietIsCustomTarget', value: isCustom },
  ]);
}

/* ================= WORKOUT DB OPERATIONS ================= */
export async function dbSaveWorkoutPlan(plan) {
  if (!isUserAuthenticated()) return null;
  return await db.workoutPlans.put(plan);
}

export async function dbDeleteWorkoutPlan(id) {
  if (!isUserAuthenticated()) return null;
  return await db.workoutPlans.delete(id);
}

export async function dbAddWorkoutSession(session) {
  if (!isUserAuthenticated()) return null;
  return await db.workoutSessions.put(session);
}

export async function dbRemoveWorkoutSession(id) {
  if (!isUserAuthenticated()) return null;
  return await db.workoutSessions.delete(id);
}

/* ================= CARE DB OPERATIONS ================= */
export async function dbSavePill(pill) {
  if (!isUserAuthenticated()) return null;
  return await db.pills.put(pill);
}

export async function dbDeletePill(id) {
  if (!isUserAuthenticated()) return null;
  return await db.pills.delete(id);
}

export async function dbSaveSkincareStep(step) {
  if (!isUserAuthenticated()) return null;
  return await db.skincareSteps.put(step);
}

export async function dbDeleteSkincareStep(id) {
  if (!isUserAuthenticated()) return null;
  return await db.skincareSteps.delete(id);
}

/* ================= APP STATE (SETTINGS & PROFILE) ================= */
export async function dbSaveAppStateKey(key, value) {
  if (!isUserAuthenticated()) return null;
  return await db.appState.put({ key, value });
}

/* ================= FOOD REFERENCE CATALOG ================= */
export async function dbGetAllFoods() {
  if (!isUserAuthenticated()) {
    return FOOD_DATABASE.map(f => ({ ...f, isCustom: false }));
  }
  const allFoods = await db.foods.toArray();
  if (allFoods.length === 0) {
    const foodCatalog = FOOD_DATABASE.map(f => ({
      ...f,
      isCustom: false,
    }));
    await db.foods.bulkPut(foodCatalog);
    return foodCatalog;
  }
  return allFoods;
}

export async function dbAddCustomFood(food) {
  if (!isUserAuthenticated()) return null;
  return await db.foods.put(food);
}

export async function dbDeleteCustomFood(id) {
  if (!isUserAuthenticated()) return null;
  return await db.foods.delete(id);
}

/* ================= BACKUP & RESTORE ================= */
export async function exportDatabaseToJson() {
  if (!isUserAuthenticated()) {
    return JSON.stringify(INITIAL_DATA, null, 2);
  }

  const [
    waterLogs,
    meals,
    customMeals,
    workoutPlans,
    workoutSessions,
    pills,
    skincareSteps,
    appState,
  ] = await Promise.all([
    db.waterLogs.toArray(),
    db.meals.toArray(),
    db.customMeals.toArray(),
    db.workoutPlans.toArray(),
    db.workoutSessions.toArray(),
    db.pills.toArray(),
    db.skincareSteps.toArray(),
    db.appState.toArray(),
  ]);

  const backupData = {
    exportedAt: new Date().toISOString(),
    version: 2,
    userId: currentUserId,
    data: {
      waterLogs,
      meals,
      customMeals,
      workoutPlans,
      workoutSessions,
      pills,
      skincareSteps,
      appState,
    },
  };

  return JSON.stringify(backupData, null, 2);
}

export async function resetDatabase() {
  if (!isUserAuthenticated()) return;
  await Promise.all([
    db.waterLogs.clear(),
    db.meals.clear(),
    db.customMeals.clear(),
    db.workoutPlans.clear(),
    db.workoutSessions.clear(),
    db.pills.clear(),
    db.skincareSteps.clear(),
    db.appState.clear(),
  ]);
  await initDatabase();
}

export async function importDatabaseFromJson(jsonContent) {
  if (!isUserAuthenticated()) return false;
  try {
    const parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
    const dataObj = parsed.data || parsed;

    await Promise.all([
      db.waterLogs.clear(),
      db.meals.clear(),
      db.customMeals.clear(),
      db.workoutPlans.clear(),
      db.workoutSessions.clear(),
      db.pills.clear(),
      db.skincareSteps.clear(),
      db.appState.clear(),
    ]);

    if (dataObj.waterLogs?.length) await db.waterLogs.bulkPut(dataObj.waterLogs);
    if (dataObj.meals?.length) await db.meals.bulkPut(dataObj.meals);
    if (dataObj.customMeals?.length) await db.customMeals.bulkPut(dataObj.customMeals);
    if (dataObj.workoutPlans?.length) await db.workoutPlans.bulkPut(dataObj.workoutPlans);
    if (dataObj.workoutSessions?.length) await db.workoutSessions.bulkPut(dataObj.workoutSessions);
    if (dataObj.pills?.length) await db.pills.bulkPut(dataObj.pills);
    if (dataObj.skincareSteps?.length) await db.skincareSteps.bulkPut(dataObj.skincareSteps);
    if (dataObj.appState?.length) await db.appState.bulkPut(dataObj.appState);

    await db.appState.put({ key: 'initialized', value: true });
    return true;
  } catch (error) {
    console.error('Failed to import database from JSON:', error);
    return false;
  }
}
