import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import DateStripPicker from '../common/DateStripPicker';
import AnalyticsCareHeatmap from './analytics/AnalyticsCareHeatmap';
import WaterAnalyticsChart from './analytics/WaterAnalyticsChart';
import CalorieAnalyticsChart from './analytics/CalorieAnalyticsChart';
import AnalyticsDrilldownModal from './analytics/AnalyticsDrilldownModal';
import { getIsoDate, getWeekDays } from '../../utils/careAnalyticsUtils';

export default function AnalyticsTab() {
  const { data } = useApp();
  const { water, diet, care } = data;

  // Date Selector State (Default: Today)
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const todayIso = useMemo(() => getIsoDate(new Date()), []);

  // Week days for the 7-day matrix table (Monday to Sunday)
  const weekDays = useMemo(() => {
    return getWeekDays(selectedDate);
  }, [selectedDate]);

  const weekStartIso = weekDays[0]?.iso;
  const weekEndIso = weekDays[6]?.iso;

  // Segmented Control State: 'supplements' | 'skincare'
  const [analyticsCareTab, setAnalyticsCareTab] = useState('supplements');

  // Level 3 Drilldown Modal State
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  // Dynamic Supplements list filtered for selected week
  const supplementList = useMemo(() => {
    const pills = care?.pills || [];
    if (!weekStartIso || !weekEndIso) return pills;
    return pills.filter(p => {
      const isCreated = !p.createdAt || p.createdAt <= weekEndIso;
      const notDeletedBeforeWeek = !p.deletedAt || p.deletedAt >= weekStartIso;
      return isCreated && notDeletedBeforeWeek;
    });
  }, [care?.pills, weekStartIso, weekEndIso]);

  // Dynamic Skincare list from actual AM and PM routines filtered for selected week
  const skincareList = useMemo(() => {
    const am = (care?.skinRoutineAM || []).map(s => ({
      ...s,
      name: s.step,
      routineType: 'AM',
      dosage: 'Morning Routine',
      time: s.time || '08:00 AM',
      instructions: 'Morning skincare routine step. Follow in sequence for optimal barrier protection.'
    }));
    const pm = (care?.skinRoutinePM || []).map(s => ({
      ...s,
      name: s.step,
      routineType: 'PM',
      dosage: 'Evening Routine',
      time: s.time || '10:00 PM',
      instructions: 'Evening skincare routine step. Nourishes and accelerates cellular recovery overnight.'
    }));
    const all = [...am, ...pm];
    if (!weekStartIso || !weekEndIso) return all;
    return all.filter(s => {
      const isCreated = !s.createdAt || s.createdAt <= weekEndIso;
      const notDeletedBeforeWeek = !s.deletedAt || s.deletedAt >= weekStartIso;
      return isCreated && notDeletedBeforeWeek;
    });
  }, [care?.skinRoutineAM, care?.skinRoutinePM, weekStartIso, weekEndIso]);

  const currentList = analyticsCareTab === 'supplements' ? supplementList : skincareList;

  return (
    <div className="tab-content analytics-tab-content">
      {/* Date Selector */}
      <DateStripPicker
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        variant="glass"
      />

      {/* Supplement & Skincare Heatmap */}
      <AnalyticsCareHeatmap
        activeTab={analyticsCareTab}
        onChangeTab={setAnalyticsCareTab}
        items={currentList}
        onSelectItem={setSelectedItemForModal}
        weekDays={weekDays}
        todayIso={todayIso}
      />

      {/* Water Intake Chart */}
      <WaterAnalyticsChart water={water} />

      {/* Caloric Intake Chart */}
      <CalorieAnalyticsChart diet={diet} />

      {/* Level 3 Drilldown Modal */}
      {selectedItemForModal && (
        <AnalyticsDrilldownModal
          item={selectedItemForModal}
          category={analyticsCareTab}
          todayIso={todayIso}
          onClose={() => setSelectedItemForModal(null)}
        />
      )}
    </div>
  );
}
