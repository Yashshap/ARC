/**
 * Default custom meal presets for the VitalSync Diet Tracker
 */

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
