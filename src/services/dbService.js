import { db } from '../db/arcDatabase';
import { INITIAL_DATA } from '../data/initialData';
import { FOOD_DATABASE } from '../data/foodDatabase';

const STORAGE_MIGRATION_KEY = 'vitalsync_health_app_data_v1';

/**
 * Helper to get today's ISO date string: YYYY-MM-DD
 */
export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Initialize Dexie IndexedDB.
 * Migrates existing data from localStorage if available, or seeds fresh default data.
 * Returns the assembled app state for AppContext.
 */
export async function initDatabase() {
  try {
    const isInitialized = await db.appState.get('initialized');

    if (!isInitialized) {
      // Check for legacy localStorage data to migrate
      const legacyRaw = localStorage.getItem(STORAGE_MIGRATION_KEY);
      let legacyData = null;
      if (legacyRaw) {
        try {
          legacyData = JSON.parse(legacyRaw);
        } catch {
          legacyData = null;
        }
      }

      const seedSource = legacyData || INITIAL_DATA;

      // 1. Seed Water Logs
      if (seedSource.water?.logs?.length > 0) {
        const today = getTodayDateString();
        const waterEntries = seedSource.water.logs.map(log => ({
          ...log,
          date: log.date || today,
        }));
        await db.waterLogs.bulkPut(waterEntries);
      }

      // 2. Seed Meals
      if (seedSource.diet?.meals) {
        const today = getTodayDateString();
        const mealEntries = [];
        for (const [category, items] of Object.entries(seedSource.diet.meals)) {
          if (Array.isArray(items)) {
            items.forEach(item => {
              mealEntries.push({
                ...item,
                category,
                date: item.date || today,
              });
            });
          }
        }
        if (mealEntries.length > 0) {
          await db.meals.bulkPut(mealEntries);
        }
      }

      // 3. Seed Custom Meals
      if (seedSource.diet?.customMeals?.length > 0) {
        await db.customMeals.bulkPut(seedSource.diet.customMeals);
      }

      // 4. Seed Workout Plans
      if (seedSource.workout?.plans?.length > 0) {
        await db.workoutPlans.bulkPut(seedSource.workout.plans);
      }

      // 5. Seed Workout Sessions
      if (seedSource.workout?.todayWorkouts?.length > 0) {
        const today = getTodayDateString();
        const workoutEntries = seedSource.workout.todayWorkouts.map(w => ({
          ...w,
          date: w.date || today,
        }));
        await db.workoutSessions.bulkPut(workoutEntries);
      }

      // 6. Seed Pills
      if (seedSource.care?.pills?.length > 0) {
        await db.pills.bulkPut(seedSource.care.pills);
      }

      // 7. Seed Skincare Steps
      const skincareEntries = [];
      if (seedSource.care?.skinRoutineAM?.length > 0) {
        seedSource.care.skinRoutineAM.forEach(step => {
          skincareEntries.push({ ...step, routineType: 'AM' });
        });
      }
      if (seedSource.care?.skinRoutinePM?.length > 0) {
        seedSource.care.skinRoutinePM.forEach(step => {
          skincareEntries.push({ ...step, routineType: 'PM' });
        });
      }
      if (skincareEntries.length > 0) {
        await db.skincareSteps.bulkPut(skincareEntries);
      }

      // 8. Seed Reference Food Database Catalog
      const existingFoodCount = await db.foods.count();
      if (existingFoodCount === 0 && FOOD_DATABASE?.length > 0) {
        const foodCatalog = FOOD_DATABASE.map(f => ({
          ...f,
          isCustom: false,
        }));
        await db.foods.bulkPut(foodCatalog);
      }

      // 9. Seed App State (profile, theme, settings, auth, etc.)
      const statePairs = [
        { key: 'initialized', value: true },
        { key: 'theme', value: seedSource.theme || 'dark' },
        { key: 'profile', value: seedSource.profile || INITIAL_DATA.profile },
        { key: 'notifications', value: seedSource.notifications || INITIAL_DATA.notifications },
        { key: 'subscription', value: seedSource.subscription || INITIAL_DATA.subscription },
        { key: 'auth', value: seedSource.auth || INITIAL_DATA.auth },
        { key: 'waterTarget', value: seedSource.water?.target || 2500 },
        { key: 'waterStreak', value: seedSource.water?.streak || 6 },
        { key: 'waterWeeklyHistory', value: seedSource.water?.weeklyHistory || INITIAL_DATA.water.weeklyHistory },
        { key: 'dietTargetCalories', value: seedSource.diet?.targetCalories || 2250 },
        { key: 'dietTargetMacros', value: seedSource.diet?.targetMacros || INITIAL_DATA.diet.targetMacros },
        { key: 'dietWeeklyHistory', value: seedSource.diet?.weeklyHistory || INITIAL_DATA.diet.weeklyHistory },
        { key: 'workoutStreak', value: seedSource.workout?.streak || 4 },
        { key: 'workoutWeeklyGoal', value: seedSource.workout?.weeklyGoal || 5 },
        { key: 'workoutWeeklyHistory', value: seedSource.workout?.weeklyHistory || INITIAL_DATA.workout.weeklyHistory },
        { key: 'skinMood', value: seedSource.care?.skinMood || 'Glowing & Clear' },
        { key: 'pillAnalytics', value: seedSource.care?.pillAnalytics || INITIAL_DATA.care.pillAnalytics },
        { key: 'fapCounterEnabled', value: seedSource.fapCounterEnabled || false },
        { key: 'userRating', value: seedSource.userRating || null },
      ];
      await db.appState.bulkPut(statePairs);
    }

    // Assemble current state from Dexie tables
    return await loadAssembledState();
  } catch (error) {
    console.error('Failed to initialize IndexedDB, falling back to default:', error);
    return INITIAL_DATA;
  }
}

/**
 * Loads all records across Dexie tables and stitches them into the app state format.
 */
export async function loadAssembledState() {
  const [
    waterLogs,
    allMeals,
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
  appStateEntries.forEach(entry => {
    stateMap[entry.key] = entry.value;
  });

  // Calculate current water from today's logs
  const todayWaterLogs = waterLogs.filter(
    l => !l.date || l.date === getTodayDateString()
  );
  const currentWater = todayWaterLogs.reduce((acc, log) => acc + (log.amount || 0), 0);

  // Group meals by category
  const mealsByCategory = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  };
  allMeals.forEach(meal => {
    const cat = meal.category || 'breakfast';
    if (mealsByCategory[cat]) {
      mealsByCategory[cat].push(meal);
    }
  });

  // Group skincare by AM/PM
  const skinRoutineAM = skincareSteps.filter(s => s.routineType === 'AM');
  const skinRoutinePM = skincareSteps.filter(s => s.routineType === 'PM');

  return {
    theme: stateMap.theme || 'dark',
    water: {
      target: stateMap.waterTarget ?? 2500,
      current: Math.max(0, currentWater),
      streak: stateMap.waterStreak ?? 6,
      logs: waterLogs,
      weeklyHistory: stateMap.waterWeeklyHistory || INITIAL_DATA.water.weeklyHistory,
    },
    diet: {
      targetCalories: stateMap.dietTargetCalories ?? 2250,
      targetMacros: stateMap.dietTargetMacros || INITIAL_DATA.diet.targetMacros,
      customMeals: customMeals.length > 0 ? customMeals : INITIAL_DATA.diet.customMeals,
      meals: mealsByCategory,
      weeklyHistory: stateMap.dietWeeklyHistory || INITIAL_DATA.diet.weeklyHistory,
    },
    workout: {
      streak: stateMap.workoutStreak ?? 4,
      weeklyGoal: stateMap.workoutWeeklyGoal ?? 5,
      plans: workoutPlans.length > 0 ? workoutPlans : INITIAL_DATA.workout.plans,
      todayWorkouts: workoutSessions,
      weeklyHistory: stateMap.workoutWeeklyHistory || INITIAL_DATA.workout.weeklyHistory,
    },
    care: {
      skinMood: stateMap.skinMood || 'Glowing & Clear',
      skinRoutineAM,
      skinRoutinePM,
      pillAnalytics: stateMap.pillAnalytics || INITIAL_DATA.care.pillAnalytics,
      pills,
    },
    profile: stateMap.profile || INITIAL_DATA.profile,
    notifications: stateMap.notifications || INITIAL_DATA.notifications,
    userRating: stateMap.userRating || null,
    fapCounterEnabled: stateMap.fapCounterEnabled || false,
    subscription: stateMap.subscription || INITIAL_DATA.subscription,
    auth: stateMap.auth || INITIAL_DATA.auth,
  };
}

/* ================= WATER DB OPERATIONS ================= */
export async function dbAddWaterLog(log) {
  return await db.waterLogs.add(log);
}

export async function dbRemoveWaterLog(id) {
  return await db.waterLogs.delete(id);
}

export async function dbSetWaterTarget(target) {
  return await db.appState.put({ key: 'waterTarget', value: target });
}

/* ================= DIET DB OPERATIONS ================= */
export async function dbAddMeal(meal) {
  return await db.meals.put(meal);
}

export async function dbUpdateMeal(meal) {
  return await db.meals.put(meal);
}

export async function dbRemoveMeal(id) {
  return await db.meals.delete(id);
}

export async function dbSaveCustomMeal(customMeal) {
  return await db.customMeals.put(customMeal);
}

export async function dbDeleteCustomMeal(id) {
  return await db.customMeals.delete(id);
}

export async function dbUpdateDietTargets(calories, macros) {
  await db.appState.bulkPut([
    { key: 'dietTargetCalories', value: calories },
    { key: 'dietTargetMacros', value: macros },
  ]);
}

/* ================= WORKOUT DB OPERATIONS ================= */
export async function dbSaveWorkoutPlan(plan) {
  return await db.workoutPlans.put(plan);
}

export async function dbDeleteWorkoutPlan(id) {
  return await db.workoutPlans.delete(id);
}

export async function dbAddWorkoutSession(session) {
  return await db.workoutSessions.put(session);
}

export async function dbRemoveWorkoutSession(id) {
  return await db.workoutSessions.delete(id);
}

/* ================= CARE DB OPERATIONS ================= */
export async function dbSavePill(pill) {
  return await db.pills.put(pill);
}

export async function dbDeletePill(id) {
  return await db.pills.delete(id);
}

export async function dbSaveSkincareStep(step) {
  return await db.skincareSteps.put(step);
}

export async function dbDeleteSkincareStep(id) {
  return await db.skincareSteps.delete(id);
}

/* ================= APP STATE OPERATIONS ================= */
export async function dbSaveAppStateKey(key, value) {
  return await db.appState.put({ key, value });
}

/* ================= BACKUP & EXPORT ================= */
export async function exportDatabaseToJson() {
  const assembled = await loadAssembledState();
  const allFoods = await db.foods.toArray();
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      database: 'ArcHealthDatabase',
      data: assembled,
      customFoods: allFoods.filter(f => f.isCustom),
    },
    null,
    2
  );
}

export async function importDatabaseFromJson(jsonInput) {
  try {
    const payload = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
    const dataToImport = payload.data || payload;

    // Clear existing tables
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

    // Mark as uninitialized so initDatabase seeds properly from this payload
    localStorage.setItem(STORAGE_MIGRATION_KEY, JSON.stringify(dataToImport));
    await db.appState.delete('initialized');

    return await initDatabase();
  } catch (error) {
    console.error('Failed to import database from JSON:', error);
    return false;
  }
}

export async function resetDatabase() {
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
  localStorage.removeItem(STORAGE_MIGRATION_KEY);
  return await initDatabase();
}
