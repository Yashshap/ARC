/**
 * Time formatting helpers for timers, workout logs, and Time-Under-Tension (TUT).
 */

export const formatTime = (totalSecs = 0) => {
  const s = Math.max(0, Math.floor(Number(totalSecs) || 0));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTUT = (totalSecs = 0) => {
  const s = Math.max(0, Math.floor(Number(totalSecs) || 0));
  if (s === 0) return '0s';
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};
