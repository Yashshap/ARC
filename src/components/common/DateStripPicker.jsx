import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const triggerLightHaptic = () => {
  try {
    if (Haptics && Haptics.impact) {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(8);
        }
      });
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }
  } catch {
    // fallback silently if unsupported
  }
};

export default function DateStripPicker({
  selectedDate,
  onSelectDate,
  variant = 'glass', // 'glass' | 'light'
  className = '',
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const todayIso = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  // Ensure selectedDate is a valid Date and never in the future
  const activeDate = useMemo(() => {
    if (!selectedDate) return new Date(today);
    const d = new Date(selectedDate);
    if (isNaN(d.getTime())) return new Date(today);
    d.setHours(0, 0, 0, 0);
    return d.getTime() > today.getTime() ? new Date(today) : d;
  }, [selectedDate, today]);

  const activeIso = useMemo(() => {
    const y = activeDate.getFullYear();
    const m = String(activeDate.getMonth() + 1).padStart(2, '0');
    const d = String(activeDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [activeDate]);

  // End of the current week (Sunday) so the 7-day strip layout remains balanced
  const endOfWeekIso = useMemo(() => {
    const dayOfWeek = today.getDay();
    const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + diffToSunday);
    const y = sunday.getFullYear();
    const m = String(sunday.getMonth() + 1).padStart(2, '0');
    const d = String(sunday.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  // The displayed month label at the top (dynamically changes on scroll or selection)
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    return activeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  const scrollContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const lastHapticIsoRef = useRef(null);
  const isInitialMount = useRef(true);

  // Generate days for past 12 months up to the end of the current week
  const daysList = useMemo(() => {
    const list = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const ty = today.getFullYear();
    const tm = today.getMonth();

    // Check if the current week spans into the next month
    const [eYear, eMonth] = endOfWeekIso.split('-').map(Number);
    const maxOffset = (eYear - ty) * 12 + (eMonth - 1 - tm);

    for (let offset = -12; offset <= maxOffset; offset++) {
      const monthDate = new Date(ty, tm + offset, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const monthYear = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Never include any days beyond the end of the current week
        if (iso > endOfWeekIso) continue;

        const isFuture = iso > todayIso;

        list.push({
          date: d,
          dayNum: day,
          dayShort: dayNames[d.getDay()],
          isoString: iso,
          monthYear,
          isFuture,
        });
      }
    }
    return list;
  }, [today, todayIso, endOfWeekIso]);

  // Scroll active item into view on mount (align by Monday of active week so 7-day week is displayed)
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const d = new Date(activeDate);
      const dayOfWeek = d.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(d);
      monday.setDate(d.getDate() + diffToMonday);
      const mondayIso = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;

      const mondayEl = container.querySelector(`[data-iso="${mondayIso}"]`);
      const targetEl = container.querySelector(`[data-iso="${activeIso}"]`);
      const elToAlign = mondayEl || targetEl;

      if (elToAlign) {
        elToAlign.scrollIntoView({
          behavior: isInitialMount.current ? 'auto' : 'smooth',
          inline: 'start',
          block: 'nearest',
        });
      }

      if (targetEl) {
        setDisplayedMonth(
          targetEl.dataset.monthyear ||
            activeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        );
      }
      isInitialMount.current = false;
    }, isInitialMount.current ? 70 : 0);

    return () => clearTimeout(timer);
  }, [activeDate, activeIso, daysList]);

  // Scroll listener to update displayedMonth and trigger haptics dynamically as user scrolls
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      cancelAnimationFrame(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      const items = container.querySelectorAll('.week-day-btn');
      let closestMonthYear = null;
      let closestIso = null;
      let minDiff = Infinity;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const diff = Math.abs(itemCenter - centerX);
        if (diff < minDiff) {
          minDiff = diff;
          closestMonthYear = item.dataset.monthyear;
          closestIso = item.dataset.iso;
        }
      }

      if (closestIso && closestIso !== lastHapticIsoRef.current) {
        lastHapticIsoRef.current = closestIso;
        triggerLightHaptic();
      }

      if (closestMonthYear) {
        setDisplayedMonth(closestMonthYear);
      }
    });
  }, []);

  const handleDateClick = (item) => {
    if (item.isFuture || item.isoString > todayIso) return;
    triggerLightHaptic();
    onSelectDate?.(item.date, item.isoString);
    setDisplayedMonth(item.monthYear);
  };

  const handleCalendarChange = (e) => {
    const val = e.target.value;
    if (!val || val > todayIso) return;
    triggerLightHaptic();
    const [year, month, day] = val.split('-').map(Number);
    const newDate = new Date(year, month - 1, day);
    if (newDate.getTime() > today.getTime()) return;

    onSelectDate?.(newDate, val);
    setDisplayedMonth(newDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

    // Scroll to the week containing the new date so it sits naturally in place
    setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const d = new Date(newDate);
      const dayOfWeek = d.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(d);
      monday.setDate(d.getDate() + diffToMonday);
      const mondayIso = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;

      const mondayEl = container.querySelector(`[data-iso="${mondayIso}"]`);
      const targetEl = container.querySelector(`[data-iso="${val}"]`);
      const elToAlign = mondayEl || targetEl;

      if (elToAlign) {
        elToAlign.scrollIntoView({
          behavior: 'smooth',
          inline: 'start',
          block: 'nearest',
        });
      }
    }, 60);
  };

  return (
    <div
      className={`analytics-date-selector ${variant === 'light' ? 'light-theme' : 'glass-card'} ${className}`}
    >
      <div className="date-selector-header">
        <span className="date-selector-month-label">{displayedMonth}</span>
      </div>

      <div className="date-selector-main-row">
        {/* Left section: Scrollable dates up to current week, future dates disabled */}
        <div
          ref={scrollContainerRef}
          className="date-selector-week-strip scrollable-date-strip"
          onScroll={handleScroll}
        >
          {daysList.map((item) => {
            const isSelected = item.isoString === activeIso;
            const isFuture = item.isFuture;

            return (
              <button
                key={item.isoString}
                type="button"
                data-iso={item.isoString}
                data-monthyear={item.monthYear}
                disabled={isFuture}
                className={`week-day-btn ${isSelected ? 'active' : ''} ${isFuture ? 'disabled future-date' : ''}`}
                onClick={() => handleDateClick(item)}
                aria-disabled={isFuture}
                title={
                  isFuture
                    ? `${item.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })} (Future date disabled)`
                    : item.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })
                }
              >
                <span className="week-day-name">{item.dayShort}</span>
                <span className="week-day-num">{item.dayNum}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="date-selector-divider" />

        {/* Rightmost: Calendar Option with max={todayIso} */}
        <div className="date-selector-calendar-col">
          <div className="calendar-btn-wrap" title="Select date from calendar">
            <button type="button" className="btn-calendar-picker" aria-label="Open Calendar">
              <Calendar size={18} />
            </button>
            <input
              type="date"
              className="native-date-input-overlay"
              value={activeIso}
              max={todayIso}
              onChange={handleCalendarChange}
              aria-label="Pick date"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
