/**
 * Utility functions for Supplement & Skincare activity tracking & analytics
 */

/**
 * Format a Date object or timestamp to 'YYYY-MM-DD'
 */
export function getIsoDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Get 7 days of the week (Monday to Sunday) containing referenceDate
 */
export function getWeekDays(referenceDate = new Date()) {
  const d = referenceDate instanceof Date ? new Date(referenceDate) : new Date();
  if (isNaN(d.getTime())) return [];

  // In JS: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dayOfWeek = d.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const days = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    days.push({
      date: cur,
      iso: getIsoDate(cur),
      dayLetter: dayLetters[i],
      dayName: dayNames[i],
      dayNum: cur.getDate(),
    });
  }
  return days;
}

/**
 * Determine the cell display status for a supplement or skincare step on a specific day
 * Returns:
 * - 'none': Do not show any block at all (upcoming days, before item creation, or after deletion)
 * - 'taken': Green highlighted block
 * - 'missed': Red block
 */
export function getCellStatus(item, dayIso, todayIso = getIsoDate(new Date())) {
  if (!item) return 'none';

  // 1. If item was created AFTER this day -> no block at all
  if (item.createdAt && dayIso < item.createdAt) {
    return 'none';
  }

  // 2. If item was deleted on or BEFORE this day -> no block at all
  // "if i deleted it in between the week then at that place no need to show any block at all"
  if (item.deletedAt && dayIso >= item.deletedAt) {
    return 'none';
  }

  // 3. For upcoming days in the future -> no block at all
  // "for upcomming days also no need to show any block at all"
  if (dayIso > todayIso) {
    return 'none';
  }

  // 4. For active past/today dates:
  // "only on the day i took it should show green highlighted if not taken or missed should show red"
  const isTaken = item.history ? !!item.history[dayIso] : false;
  return isTaken ? 'taken' : 'missed';
}

/**
 * Calculate dynamic adherence stats for Level 3 drilldown modal
 */
export function calculateItemStats(item, todayIso = getIsoDate(new Date())) {
  if (!item) {
    return {
      totalTakenDays: 0,
      totalScheduledDays: 0,
      adherence: 0,
      missedDoses: 0,
      monthlyHistory: Array(30).fill(2),
    };
  }

  const today = new Date(todayIso);
  let totalTakenDays = 0;
  let totalScheduledDays = 0;
  const monthlyHistory = [];

  // Check last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = getIsoDate(d);

    const isBeforeCreation = item.createdAt && iso < item.createdAt;
    const isAfterDeletion = item.deletedAt && iso >= item.deletedAt;
    const isFuture = iso > todayIso;

    if (isBeforeCreation || isAfterDeletion || isFuture) {
      // Pending / inactive
      monthlyHistory.push(2);
    } else {
      totalScheduledDays++;
      const taken = item.history ? !!item.history[iso] : false;
      if (taken) {
        totalTakenDays++;
        monthlyHistory.push(1);
      } else {
        monthlyHistory.push(0);
      }
    }
  }

  const adherence = totalScheduledDays > 0
    ? Math.round((totalTakenDays / totalScheduledDays) * 100)
    : 0;
  const missedDoses = Math.max(0, totalScheduledDays - totalTakenDays);

  return {
    totalTakenDays,
    totalScheduledDays,
    adherence,
    missedDoses,
    monthlyHistory,
  };
}

/**
 * Helper to generate initial history map for seed/mock items
 */
export function buildInitialHistoryMap(heatmapArray = [], defaultTaken = false, todayIso = getIsoDate(new Date())) {
  const history = {};
  const today = new Date(todayIso);

  // heatmapArray usually has 14 items, ending with today or yesterday
  const len = heatmapArray.length || 7;
  for (let i = len - 1; i >= 0; i--) {
    const offset = (len - 1) - i;
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    const iso = getIsoDate(d);

    if (offset === 0) {
      history[iso] = !!defaultTaken;
    } else {
      // 1 means taken, 0 or 2 means not taken
      history[iso] = heatmapArray[i] === 1;
    }
  }

  return history;
}
