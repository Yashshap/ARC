const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getCurrentDayName() {
  return DAY_NAMES[new Date().getDay()];
}

/**
 * Syncs the current water volume to today's entry in weeklyHistory.
 */
export function syncWaterWeeklyHistory(weeklyHistory = [], currentWater, targetWater = 2500) {
  const currentDay = getCurrentDayName();
  const exists = weeklyHistory.some(item => item.day === currentDay);

  if (!exists) {
    return [...weeklyHistory, { day: currentDay, amount: currentWater, target: targetWater }];
  }

  return weeklyHistory.map(item =>
    item.day === currentDay
      ? { ...item, amount: currentWater, target: targetWater }
      : item
  );
}

/**
 * Syncs meals to today's entry in diet weeklyHistory.
 */
export function syncDietWeeklyHistory(weeklyHistory = [], mealsByCategory = {}) {
  const currentDay = getCurrentDayName();

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  Object.values(mealsByCategory).forEach(categoryMeals => {
    if (Array.isArray(categoryMeals)) {
      categoryMeals.forEach(meal => {
        totalCalories += Number(meal.calories) || 0;
        totalProtein += Number(meal.protein) || 0;
        totalCarbs += Number(meal.carbs) || 0;
        totalFats += Number(meal.fats) || 0;
      });
    }
  });

  const exists = weeklyHistory.some(item => item.day === currentDay);

  if (!exists) {
    return [
      ...weeklyHistory,
      {
        day: currentDay,
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fats: Math.round(totalFats),
      },
    ];
  }

  return weeklyHistory.map(item =>
    item.day === currentDay
      ? {
          ...item,
          calories: Math.round(totalCalories),
          protein: Math.round(totalProtein),
          carbs: Math.round(totalCarbs),
          fats: Math.round(totalFats),
        }
      : item
  );
}

/**
 * Syncs workouts to today's entry in workout weeklyHistory.
 */
export function syncWorkoutWeeklyHistory(weeklyHistory = [], todayWorkouts = []) {
  const currentDay = getCurrentDayName();

  let totalMinutes = 0;
  let totalCalories = 0;

  todayWorkouts.forEach(workout => {
    totalMinutes += Number(workout.duration) || 0;
    totalCalories += Number(workout.calories) || 0;
  });

  const completed = todayWorkouts.length > 0;
  const exists = weeklyHistory.some(item => item.day === currentDay);

  if (!exists) {
    return [
      ...weeklyHistory,
      {
        day: currentDay,
        minutes: totalMinutes,
        calories: totalCalories,
        completed,
      },
    ];
  }

  return weeklyHistory.map(item =>
    item.day === currentDay
      ? {
          ...item,
          minutes: totalMinutes,
          calories: totalCalories,
          completed,
        }
      : item
  );
}
