/**
 * Health and nutrition calculation utilities.
 * Calculates BMI, daily energy expenditure (kcal), dynamic macronutrients,
 * and essential micronutrient targets based on user biometric data.
 */

/**
 * Calculates BMI and returns category, display color, scale bar position, and validation flag.
 * If weight or height is missing/invalid, returns null and '-' representations.
 *
 * @param {number|string} weightKg
 * @param {number|string} heightCm
 * @returns {{
 *   bmi: string,
 *   bmiVal: number|null,
 *   bmiCategory: string,
 *   bmiColor: string,
 *   bmiPositionPercent: number,
 *   hasBMI: boolean
 * }}
 */
export function calculateBMI(weightKg, heightCm) {
  const w = Number(weightKg);
  const h = Number(heightCm);

  if (!w || !h || w <= 0 || h <= 0) {
    return {
      bmi: '-',
      bmiVal: null,
      bmiCategory: 'No Data',
      bmiColor: 'var(--text-muted, #94a3b8)',
      bmiPositionPercent: 0,
      hasBMI: false,
    };
  }

  const heightMeters = h / 100;
  const bmiVal = w / (heightMeters * heightMeters);
  const bmi = bmiVal.toFixed(1);

  let bmiCategory = 'Normal weight';
  let bmiColor = '#10b981';
  let bmiPositionPercent = 50;

  if (bmiVal < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = '#38bdf8';
    bmiPositionPercent = 15;
  } else if (bmiVal < 25) {
    bmiCategory = 'Normal weight';
    bmiColor = '#10b981';
    bmiPositionPercent = 45;
  } else if (bmiVal < 30) {
    bmiCategory = 'Overweight';
    bmiColor = '#f59e0b';
    bmiPositionPercent = 75;
  } else {
    bmiCategory = 'Obese';
    bmiColor = '#ef4444';
    bmiPositionPercent = 92;
  }

  return {
    bmi,
    bmiVal,
    bmiCategory,
    bmiColor,
    bmiPositionPercent,
    hasBMI: true,
  };
}

/**
 * Calculates daily recommended energy (kcal), macros (protein, carbs, fats),
 * and micronutrient targets based on BMI and physical metrics.
 * If height & weight are not available, returns null for all target values.
 *
 * @param {object|null} profile
 * @returns {{
 *   hasMetrics: boolean,
 *   bmi: string|null,
 *   bmiCategory: string|null,
 *   targetCalories: number|null,
 *   targetMacros: { protein: number|null, carbs: number|null, fats: number|null },
 *   targetMicros: { [key: string]: number|null }
 * }}
 */
export function calculateBmiNutritionTargets(profile) {
  const w = Number(profile?.weight);
  const h = Number(profile?.height);

  if (!w || !h || w <= 0 || h <= 0) {
    return {
      hasMetrics: false,
      bmi: null,
      bmiCategory: null,
      targetCalories: null,
      targetMacros: { protein: null, carbs: null, fats: null },
      targetMicros: {
        fiber: null,
        vit_d: null,
        vit_c: null,
        calcium: null,
        iron: null,
        magnesium: null,
        potassium: null,
        zinc: null,
        vit_b12: null,
      },
    };
  }

  const { bmi, bmiVal, bmiCategory } = calculateBMI(w, h);

  // Basal Metabolic Rate (Mifflin-St Jeor formula)
  const age = Number(profile?.age) || 25;
  const gender = (profile?.gender || '').toLowerCase();
  const genderOffset = gender === 'female' ? -161 : gender === 'male' ? 5 : -78;
  const bmr = 10 * w + 6.25 * h - 5 * age + genderOffset;

  // Physical Activity Level (PAL)
  const activityMultipliers = {
    'Sedentary': 1.2,
    'Light': 1.375,
    'Moderate': 1.5,
    'Active': 1.55,
    'Very Active': 1.725,
  };
  const pal = activityMultipliers[profile?.activityLevel] || 1.375;
  const maintenanceKcal = bmr * pal;

  // Goal & BMI-driven calorie target adjustment
  let kcalTarget;
  if (bmiVal < 18.5) {
    // Underweight: surplus to support lean mass restoration (+350 kcal)
    kcalTarget = Math.round(maintenanceKcal + 350);
  } else if (bmiVal < 25) {
    // Normal: maintenance calories
    kcalTarget = Math.round(maintenanceKcal);
  } else if (bmiVal < 30) {
    // Overweight: moderate calorie deficit for sustainable fat loss (-350 kcal)
    kcalTarget = Math.round(maintenanceKcal - 350);
  } else {
    // Obese: structured calorie deficit (-500 kcal)
    kcalTarget = Math.round(maintenanceKcal - 500);
  }

  // Clinical safety thresholds
  kcalTarget = Math.max(1200, Math.min(4500, kcalTarget));

  // Macronutrient breakdown based on BMI and calorie target (AMDR balanced distribution):
  // 25% Protein, 50% Carbs, 25% Fats
  const protein = Math.round((kcalTarget * 0.25) / 4);
  const carbs = Math.round((kcalTarget * 0.50) / 4);
  const fats = Math.round((kcalTarget * 0.25) / 9);

  // Micronutrient target recommendations derived from BMI and energy turnover:
  const targetMicros = {
    // Dietary Fiber: 14g per 1000 kcal (Institute of Medicine guideline)
    fiber: Math.round((kcalTarget / 1000) * 14),

    // Vitamin D3: higher in higher BMI due to fat tissue sequestration
    vit_d: bmiVal >= 30 ? 30 : bmiVal >= 25 ? 25 : 20, // µg

    // Vitamin C: scaled with metabolic throughput
    vit_c: Math.round((kcalTarget / 2000) * 90), // mg

    // Calcium: 1000 mg (1200 mg if older or high body weight)
    calcium: age > 50 || w > 85 ? 1200 : 1000, // mg

    // Iron: 18 mg for females, 11 mg for males
    iron: gender === 'female' ? 18 : 11, // mg

    // Magnesium: 5.5 mg per kg body weight
    magnesium: Math.round(w * 5.5), // mg

    // Potassium: scaled with calorie/mineral turnover
    potassium: Math.round((kcalTarget / 2000) * 3400), // mg

    // Zinc: scaled with weight and energy
    zinc: Number(((kcalTarget / 2000) * 11).toFixed(1)), // mg

    // Vitamin B12: 2.4 µg standard baseline
    vit_b12: 2.4, // µg
  };

  return {
    hasMetrics: true,
    bmi,
    bmiCategory,
    targetCalories: kcalTarget,
    targetMacros: { protein, carbs, fats },
    targetMicros,
  };
}
