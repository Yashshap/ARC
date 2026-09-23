import Dexie from 'dexie';

export class ArcDatabase extends Dexie {
  constructor(dbName = 'ArcHealth_guest') {
    super(dbName);
    this.version(1).stores({
      waterLogs: '++id, date, time',
      dailyMetrics: 'date',
      meals: 'id, date, category, name',
      customMeals: 'id, name',
      foods: 'id, name, category, isCustom',
      workoutPlans: 'id, category, title',
      workoutSessions: 'id, date, title',
      pills: 'id, name',
      pillLogs: 'id, [date+pillId], date',
      skincareSteps: 'id, routineType',
      skincareLogs: 'id, [date+stepId], date',
      appState: 'key',
    });
  }
}

export let db = new ArcDatabase('ArcHealth_guest');

export const setDatabaseInstance = (newDb) => {
  db = newDb;
};
