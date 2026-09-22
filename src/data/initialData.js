import { DEFAULT_CUSTOM_MEALS } from './defaultCustomMeals';

export const INITIAL_DATA = {
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
    ],
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
    ],
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
            ],
          },
          {
            id: 'ex_c2',
            name: 'Incline Dumbbell Press',
            sets: [
              { setNumber: 1, targetReps: 12, targetWeight: 22 },
              { setNumber: 2, targetReps: 10, targetWeight: 24 },
              { setNumber: 3, targetReps: 10, targetWeight: 24 },
            ],
          },
          {
            id: 'ex_c3',
            name: 'Tricep Cable Pushdowns',
            sets: [
              { setNumber: 1, targetReps: 15, targetWeight: 20 },
              { setNumber: 2, targetReps: 12, targetWeight: 25 },
              { setNumber: 3, targetReps: 12, targetWeight: 25 },
            ],
          },
        ],
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
            ],
          },
          {
            id: 'ex_b2',
            name: 'Bent-Over Barbell Rows',
            sets: [
              { setNumber: 1, targetReps: 10, targetWeight: 50 },
              { setNumber: 2, targetReps: 8, targetWeight: 55 },
              { setNumber: 3, targetReps: 8, targetWeight: 60 },
            ],
          },
          {
            id: 'ex_b3',
            name: 'Standing Incline Bicep Curls',
            sets: [
              { setNumber: 1, targetReps: 12, targetWeight: 14 },
              { setNumber: 2, targetReps: 10, targetWeight: 16 },
              { setNumber: 3, targetReps: 10, targetWeight: 16 },
            ],
          },
        ],
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
            ],
          },
          {
            id: 'ex_l2',
            name: 'Romanian Deadlifts (RDL)',
            sets: [
              { setNumber: 1, targetReps: 10, targetWeight: 60 },
              { setNumber: 2, targetReps: 10, targetWeight: 70 },
              { setNumber: 3, targetReps: 8, targetWeight: 80 },
            ],
          },
          {
            id: 'ex_l3',
            name: 'Hanging Leg Raises',
            sets: [
              { setNumber: 1, targetReps: 15, targetWeight: 0 },
              { setNumber: 2, targetReps: 15, targetWeight: 0 },
              { setNumber: 3, targetReps: 12, targetWeight: 0 },
            ],
          },
        ],
      },
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
            ],
          },
          {
            name: 'Incline Dumbbell Press',
            sets: [
              { setNumber: 1, weight: 22, reps: 12, tutSeconds: 45, restSeconds: 90 },
              { setNumber: 2, weight: 24, reps: 10, tutSeconds: 40, restSeconds: 90 },
              { setNumber: 3, weight: 24, reps: 10, tutSeconds: 39, restSeconds: 90 },
            ],
          },
          {
            name: 'Tricep Cable Pushdowns',
            sets: [
              { setNumber: 1, weight: 20, reps: 15, tutSeconds: 50, restSeconds: 60 },
              { setNumber: 2, weight: 25, reps: 12, tutSeconds: 46, restSeconds: 60 },
              { setNumber: 3, weight: 25, reps: 12, tutSeconds: 44, restSeconds: 0 },
            ],
          },
        ],
      },
    ],
    weeklyHistory: [
      { day: 'Mon', minutes: 50, calories: 360, completed: true },
      { day: 'Tue', minutes: 45, calories: 310, completed: true },
      { day: 'Wed', minutes: 0, calories: 0, completed: false },
      { day: 'Thu', minutes: 60, calories: 420, completed: true },
      { day: 'Fri', minutes: 40, calories: 290, completed: true },
      { day: 'Sat', minutes: 48, calories: 350, completed: true },
      { day: 'Sun', minutes: 0, calories: 0, completed: false },
    ],
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
      dayNames: ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'Now'],
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
        ],
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
        ],
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
        ],
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
        ],
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
        ],
      },
    ],
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
    avatarUrl: null,
  },
  notifications: {
    enabled: true,
    hydration: true,
    medications: true,
    workouts: true,
    sound: true,
  },
  userRating: null,
  fapCounterEnabled: false,
  subscription: {
    plan: 'pro',
    status: 'active',
    billingCycle: 'monthly',
    price: '$9.99/mo',
    renewalDate: 'Oct 15, 2026',
    startDate: 'Jan 15, 2026',
    paymentMethod: 'Apple Pay (Mastercard •••• 4242)',
    paymentHistory: [
      { id: 'INV-2026-009', date: 'Sep 15, 2026', amount: '$9.99', status: 'Paid', method: 'Apple Pay', plan: 'VitalSync Pro Monthly' },
      { id: 'INV-2026-008', date: 'Aug 15, 2026', amount: '$9.99', status: 'Paid', method: 'Apple Pay', plan: 'VitalSync Pro Monthly' },
      { id: 'INV-2026-007', date: 'Jul 15, 2026', amount: '$9.99', status: 'Paid', method: 'Apple Pay', plan: 'VitalSync Pro Monthly' },
      { id: 'INV-2026-006', date: 'Jun 15, 2026', amount: '$9.99', status: 'Paid', method: 'Apple Pay', plan: 'VitalSync Pro Monthly' },
      { id: 'INV-2026-005', date: 'May 15, 2026', amount: '$9.99', status: 'Paid', method: 'Apple Pay', plan: 'VitalSync Pro Monthly' },
    ],
    planHistory: [
      { id: 'ph-1', planName: 'VitalSync Pro (Monthly)', period: 'May 15, 2026 – Present', price: '$9.99/mo', status: 'Active', notes: 'Auto-renews monthly via Apple Pay' },
      { id: 'ph-2', planName: 'VitalSync Pro (14-Day Free Trial)', period: 'Jan 15, 2026 – Jan 29, 2026', price: '$0.00', status: 'Completed', notes: 'Converted to Pro Monthly' },
      { id: 'ph-3', planName: 'VitalSync Free Tier', period: 'Jan 10, 2026 – Jan 15, 2026', price: '$0.00', status: 'Upgraded', notes: 'Initial account sign up' },
    ],
  },
  auth: {
    isLoggedIn: true,
    email: 'alex.rivera@vitalsync.health',
    joinedDate: 'January 2026',
  },
};
