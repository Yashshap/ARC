import { DEFAULT_CUSTOM_MEALS } from "./defaultCustomMeals";

export const INITIAL_DATA = {
  theme: 'dark',
  water: {
    target: 2500,
    current: 0,
    streak: 0,
    logs: [],
    weeklyHistory: [],
  },
  diet: {
    targetCalories: null,
    targetMacros: null,
    isCustomTarget: false,
    customMeals: DEFAULT_CUSTOM_MEALS,
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
    weeklyHistory: [],
  },
  workout: {
    streak: 0,
    weeklyGoal: 3,
    plans: [],
    todayWorkouts: [],
    weeklyHistory: [],
  },
  care: {
    skinMood: 'Clear & Fresh',
    skinRoutineAM: [],
    skinRoutinePM: [],
    pillAnalytics: null,
    pills: [],
  },
  profile: null,
  notifications: {
    enabled: true,
    hydration: true,
    medications: true,
    workouts: true,
    sound: true,
  },
  userRating: null,
  fapCounterEnabled: false,
  auth: {
    isLoggedIn: false,
    user: null,
    email: null,
    joinedDate: null,
  },
};
