import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import DateStripPicker from '../common/DateStripPicker';
import { DEFAULT_SKINCARE_ANALYTICS_ITEMS } from '../../data/skincareAnalyticsData';
import AnalyticsCareHeatmap from './analytics/AnalyticsCareHeatmap';
import WaterAnalyticsChart from './analytics/WaterAnalyticsChart';
import CalorieAnalyticsChart from './analytics/CalorieAnalyticsChart';
import AnalyticsDrilldownModal from './analytics/AnalyticsDrilldownModal';

export default function AnalyticsTab() {
  const { data } = useApp();
  const { water, diet, care } = data;

  // Date Selector State (Default: Today)
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Segmented Control State: 'supplements' | 'skincare'
  const [analyticsCareTab, setAnalyticsCareTab] = useState('supplements');

  // Level 3 Drilldown Modal State
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  const careItems =
    analyticsCareTab === 'supplements'
      ? care.pills || []
      : DEFAULT_SKINCARE_ANALYTICS_ITEMS;

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
        dayNames={care.pillAnalytics?.dayNames || ['M', 'T', 'W', 'T', 'F', 'S', 'S']}
        items={careItems}
        onSelectItem={setSelectedItemForModal}
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
          onClose={() => setSelectedItemForModal(null)}
        />
      )}
    </div>
  );
}
