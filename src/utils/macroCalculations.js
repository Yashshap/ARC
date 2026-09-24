/**
 * Macro calculation utilities for scaling foods and meals based on weight (grams),
 * and dynamically computing macronutrient distributions from calorie targets.
 */

export const calculateItemMacros = (item, weight) => {
  if (!item) {
    return { weight: 0, calories: 0, protein: 0, carbs: 0, fats: 0 };
  }
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

export const calculateMealTotal = (items) => {
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

/**
 * Dynamically computes balanced macronutrient targets based on daily calorie target.
 * Standard nutritional ratio:
 * - Protein: 25% of calories (4 kcal/g) -> Math.round((calories * 0.25) / 4)
 * - Carbs: 50% of calories (4 kcal/g) -> Math.round((calories * 0.50) / 4)
 * - Fats: 25% of calories (9 kcal/g) -> Math.round((calories * 0.25) / 9)
 * For 2000 kcal: 125g Protein, 250g Carbs, 56g Fats
 */
export const calculateMacrosFromCalories = (calories = 2000) => {
  const c = Math.max(0, Number(calories) || 2000);
  return {
    protein: Math.round((c * 0.25) / 4),
    carbs: Math.round((c * 0.50) / 4),
    fats: Math.round((c * 0.25) / 9),
  };
};
