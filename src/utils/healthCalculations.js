/**
 * Calculates BMI and returns category, display color, and scale bar position.
 * @param {number|string} weightKg
 * @param {number|string} heightCm
 * @returns {{ bmi: string, bmiCategory: string, bmiColor: string, bmiPositionPercent: number }}
 */
export function calculateBMI(weightKg, heightCm) {
  const heightMeters = (Number(heightCm) || 175) / 100;
  const weight = Number(weightKg) || 70;
  const bmiVal = weight / (heightMeters * heightMeters);
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

  return { bmi, bmiCategory, bmiColor, bmiPositionPercent };
}
