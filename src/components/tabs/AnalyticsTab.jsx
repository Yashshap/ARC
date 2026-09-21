import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, Pill, Sparkles, Check, X, Info, ChevronRight, Calendar } from 'lucide-react';
import DateStripPicker from '../common/DateStripPicker';

export default function AnalyticsTab() {
  const { data } = useApp();
  const { water, diet, workout, care } = data;

  // Date Selector State (Default: Today)
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const selectedIso = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  // Segmented Control State: 'supplements' | 'skincare'
  const [analyticsCareTab, setAnalyticsCareTab] = useState('supplements');

  // Level 3 Drilldown Modal State
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  // Skincare items for analytics heatmap
  const skinCareItems = [
    {
      id: 'sc-1',
      name: 'Gentle Hydrating Cleanser',
      shortName: 'Cleanser',
      dosage: 'AM & PM Routine',
      time: '08:00 AM',
      totalTakenDays: 29,
      totalScheduledDays: 30,
      adherence: 97,
      missedDoses: 1,
      instructions: 'Lather gently on damp face with lukewarm water for 60 seconds.',
      heatmapHistory: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      monthlyHistory: [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 0, 1
      ]
    },
    {
      id: 'sc-2',
      name: 'Niacinamide 10% Serum',
      shortName: 'Niacinamide',
      dosage: '3-4 drops',
      time: '08:05 AM',
      totalTakenDays: 27,
      totalScheduledDays: 30,
      adherence: 90,
      missedDoses: 3,
      instructions: 'Apply before heavier creams to regulate sebum production and refine pores.',
      heatmapHistory: [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
      monthlyHistory: [
        1, 1, 1, 0, 1, 1, 1, 1, 1, 0,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 0, 1, 1, 1, 1, 1, 1
      ]
    },
    {
      id: 'sc-3',
      name: 'Ceramide Barrier Cream',
      shortName: 'Ceramide Cream',
      dosage: 'Pea-sized amount',
      time: '08:08 AM',
      totalTakenDays: 28,
      totalScheduledDays: 30,
      adherence: 93,
      missedDoses: 2,
      instructions: 'Smooth over face and neck to lock in moisture and protect skin barrier.',
      heatmapHistory: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      monthlyHistory: [
        1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 0, 1, 1, 1, 1, 1
      ]
    },
    {
      id: 'sc-4',
      name: 'SPF 50+ Broad Spectrum Sunscreen',
      shortName: 'SPF 50+ Sunscreen',
      dosage: 'Two-finger length',
      time: '08:10 AM',
      totalTakenDays: 26,
      totalScheduledDays: 30,
      adherence: 87,
      missedDoses: 4,
      instructions: 'Critical for UV protection and preventing photoaging. Reapply if outdoors.',
      heatmapHistory: [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
      monthlyHistory: [
        1, 1, 0, 1, 1, 1, 1, 0, 1, 1,
        1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 0, 1, 1, 1
      ]
    },
    {
      id: 'sc-5',
      name: 'Retinoid 0.2% Emulsion',
      shortName: 'Retinoid Night',
      dosage: '1 pump',
      time: '10:00 PM',
      totalTakenDays: 24,
      totalScheduledDays: 30,
      adherence: 80,
      missedDoses: 6,
      instructions: 'Use only at night. Accelerates cell turnover. Follow with soothing moisturizer.',
      heatmapHistory: [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 2],
      monthlyHistory: [
        1, 0, 1, 1, 0, 1, 1, 1, 0, 1,
        1, 0, 1, 1, 1, 1, 0, 1, 1, 1,
        1, 1, 0, 1, 1, 1, 1, 1, 1, 2
      ]
    },
    {
      id: 'sc-6',
      name: 'Peptide Deep Recovery Balm',
      shortName: 'Night Balm',
      dosage: 'Dime-sized amount',
      time: '10:15 PM',
      totalTakenDays: 25,
      totalScheduledDays: 30,
      adherence: 83,
      missedDoses: 5,
      instructions: 'Seals moisture and active ingredients overnight for supple morning skin.',
      heatmapHistory: [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 2],
      monthlyHistory: [
        1, 1, 1, 0, 1, 1, 1, 0, 1, 1,
        1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 0, 2
      ]
    }
  ];

  // Analytics - Water 7-day max
  const maxWaterVal = Math.max(...water.weeklyHistory.map(h => h.amount), water.target, 3000);

  // Analytics - Diet 7-day max
  const maxCalVal = Math.max(...diet.weeklyHistory.map(h => h.calories), diet.targetCalories, 2500);

  // Overall wellness score calculation
  const waterScore = Math.min(100, Math.round((water.todayIntake / water.target) * 100)) || 0;
  const workoutScore = workout.completedToday ? 100 : 0;
  const skinAMDone = care.skinRoutineAM.filter(s => s.completed).length;
  const skinPMDone = care.skinRoutinePM.filter(s => s.completed).length;
  const skinTotal = care.skinRoutineAM.length + care.skinRoutinePM.length;
  const skinScore = skinTotal > 0 ? Math.round(((skinAMDone + skinPMDone) / skinTotal) * 100) : 0;
  const pillsTaken = care.pills.filter(p => p.taken).length;
  const pillsScore = care.pills.length > 0 ? Math.round((pillsTaken / care.pills.length) * 100) : 0;
  const overallScore = Math.round((waterScore * 0.3) + (workoutScore * 0.3) + (skinScore * 0.2) + (pillsScore * 0.2));

  return (
    <div className="tab-content analytics-tab-content">
      {/* ================= DATE SELECTOR (AT TOP) ================= */}
      <DateStripPicker
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        variant="glass"
      />

      {/* ================= SUPPLEMENT & SKINCARE ANALYTICS ================= */}
      <div className="section-block">
        <div className="medicine-analytics-card glass-card">
          {/* Segmented Control: Supplements vs Skin Care */}
          <div className="analytics-segmented-control">
            <button
              className={`analytics-segmented-btn ${analyticsCareTab === 'supplements' ? 'active' : ''}`}
              onClick={() => setAnalyticsCareTab('supplements')}
            >
              <Pill size={15} />
              <span>Supplements</span>
            </button>
            <button
              className={`analytics-segmented-btn ${analyticsCareTab === 'skincare' ? 'active' : ''}`}
              onClick={() => setAnalyticsCareTab('skincare')}
            >
              <Sparkles size={15} />
              <span>Skin Care</span>
            </button>
          </div>

          {/* 7-Day Matrix Heatmap Table (No horizontal scroll needed) */}
          <div className="heatmap-table-wrap">
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th className="heatmap-th-name">
                    {analyticsCareTab === 'supplements' ? 'Supplement' : 'Routine Step'}
                  </th>
                  {(care.pillAnalytics?.dayNames || ['M', 'T', 'W', 'T', 'F', 'S', 'S']).slice(-7).map((dayLetter, dIdx) => (
                    <th key={dIdx} className="heatmap-th-day">
                      <span className="th-day-letter">{dayLetter}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(analyticsCareTab === 'supplements' ? (care.pills || []) : skinCareItems).map((item) => {
                  const weekHistory = (item.heatmapHistory || [1, 1, 1, 1, 1, 1, 1]).slice(-7);
                  return (
                    <tr
                      key={item.id}
                      className="heatmap-med-row"
                      onClick={() => setSelectedItemForModal(item)}
                      title={`Tap to view full report for ${item.name}`}
                    >
                      <td className="heatmap-td-name">
                        <span className="heatmap-row-name" title={item.name}>
                          {item.name}
                        </span>
                      </td>
                      {weekHistory.map((status, sIdx) => {
                        let cellClass = 'cell-taken';
                        if (status === 0) cellClass = 'cell-missed';
                        else if (status === 2) cellClass = 'cell-pending';

                        return (
                          <td key={sIdx} className="heatmap-td-cell">
                            <div className={`heatmap-cell-tile ${cellClass}`} />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analytics Chart 1: Water Intake */}
      <div className="section-block">
        <div className="section-heading-outside">
          <h3 className="section-outside-title">Water Intake</h3>
        </div>
        <div className="chart-card glass-card">
          <div className="chart-svg-wrap">
            <svg viewBox="0 0 320 160" className="analytics-svg">
              {/* Target Line */}
              {(() => {
                const targetY = 140 - (water.target / maxWaterVal) * 110;
                return (
                  <g>
                    <line
                      x1="20"
                      y1={targetY}
                      x2="300"
                      y2={targetY}
                      stroke="var(--color-water-light)"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                    <text x="302" y={targetY + 4} fill="var(--text-muted)" fontSize="8">
                      Goal
                    </text>
                  </g>
                );
              })()}

              {/* Bars for each day */}
              {water.weeklyHistory.map((item, idx) => {
                const x = 32 + idx * 38;
                const barHeight = Math.max(4, (item.amount / maxWaterVal) * 110);
                const y = 140 - barHeight;
                const isGoalMet = item.amount >= item.target;

                return (
                  <g key={item.day}>
                    <rect
                      x={x}
                      y={y}
                      width="20"
                      height={barHeight}
                      rx="4"
                      fill={isGoalMet ? 'var(--color-water-light)' : 'rgba(56, 189, 248, 0.4)'}
                      className="chart-bar"
                    />
                    <text
                      x={x + 10}
                      y={y - 4}
                      fill="var(--text-secondary)"
                      fontSize="7"
                      textAnchor="middle"
                    >
                      {item.amount >= 1000 ? `${(item.amount / 1000).toFixed(1)}L` : `${item.amount}ml`}
                    </text>
                    <text
                      x={x + 10}
                      y="154"
                      fill="var(--text-muted)"
                      fontSize="9"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      {item.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Analytics Chart 2: Caloric Intake */}
      <div className="section-block">
        <div className="section-heading-outside">
          <h3 className="section-outside-title">Caloric Intake</h3>
        </div>
        <div className="chart-card glass-card">
          <div className="chart-svg-wrap">
            <svg viewBox="0 0 320 160" className="analytics-svg">
              {/* Target Line */}
              {(() => {
                const targetY = 140 - (diet.targetCalories / maxCalVal) * 110;
                return (
                  <g>
                    <line
                      x1="20"
                      y1={targetY}
                      x2="300"
                      y2={targetY}
                      stroke="var(--color-diet-light)"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                      opacity="0.6"
                    />
                    <text x="302" y={targetY + 4} fill="var(--text-muted)" fontSize="8">
                      {diet.targetCalories}
                    </text>
                  </g>
                );
              })()}

              {/* Bars for each day */}
              {diet.weeklyHistory.map((item, idx) => {
                const x = 32 + idx * 38;
                const barHeight = Math.max(4, (item.calories / maxCalVal) * 110);
                const y = 140 - barHeight;

                return (
                  <g key={item.day}>
                    <rect
                      x={x}
                      y={y}
                      width="20"
                      height={barHeight}
                      rx="4"
                      fill="url(#dietGradientAnalytics)"
                      className="chart-bar"
                    />
                    <text
                      x={x + 10}
                      y={y - 4}
                      fill="var(--text-secondary)"
                      fontSize="7"
                      textAnchor="middle"
                    >
                      {item.calories}
                    </text>
                    <text
                      x={x + 10}
                      y="154"
                      fill="var(--text-muted)"
                      fontSize="9"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      {item.day}
                    </text>
                  </g>
                );
              })}

              <defs>
                <linearGradient id="dietGradientAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-diet-light)" />
                  <stop offset="100%" stopColor="var(--color-diet)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* ================= LEVEL 3 INDIVIDUAL ITEM MODAL ================= */}
      {selectedItemForModal && (
        <div className="modal-overlay" onClick={() => setSelectedItemForModal(null)}>
          <div className="modal-content modal-content-large level3-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />

            <div className="level3-header">
              <div className="level3-title-group">
                <span className="level3-badge">
                  {analyticsCareTab === 'supplements' ? 'SUPPLEMENT DRILL-DOWN' : 'SKINCARE DRILL-DOWN'}
                </span>
                <h3 className="level3-title">{selectedItemForModal.name}</h3>
                <span className="level3-meta">
                  {selectedItemForModal.dosage} • {selectedItemForModal.time}
                  {selectedItemForModal.withFood !== undefined ? (selectedItemForModal.withFood ? ' • With Food' : ' • Empty Stomach') : ''}
                </span>
              </div>
              <button className="btn-icon" onClick={() => setSelectedItemForModal(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Level 3 Core Stats Trio */}
            <div className="level3-stats-grid">
              <div className="l3-stat-card">
                <span className="l3-stat-label">Days Completed</span>
                <span className="l3-stat-val text-success">
                  {selectedItemForModal.totalTakenDays || 26} / {selectedItemForModal.totalScheduledDays || 30}
                </span>
                <span className="l3-stat-sub">days this month</span>
              </div>

              <div className="l3-stat-card">
                <span className="l3-stat-label">Adherence Rate</span>
                <span className="l3-stat-val text-accent">
                  {selectedItemForModal.adherence || 87}%
                </span>
                <span className="l3-stat-sub">overall compliance</span>
              </div>

              <div className="l3-stat-card">
                <span className="l3-stat-label">Missed Days</span>
                <span className="l3-stat-val text-danger">
                  {selectedItemForModal.missedDoses || 4}
                </span>
                <span className="l3-stat-sub">missed doses</span>
              </div>
            </div>

            {/* 30-Day Habit Grid */}
            <div className="level3-habit-section">
              <div className="section-header">
                <h4 className="level3-habit-title">30-Day Consistency Grid</h4>
                <span className="level3-habit-sub">Day 1 to 30</span>
              </div>

              <div className="level3-habit-grid">
                {(selectedItemForModal.monthlyHistory || Array(30).fill(1)).map((st, idx) => (
                  <div
                    key={idx}
                    className={`habit-dot ${st === 1 ? 'dot-taken' : st === 0 ? 'dot-missed' : 'dot-pending'}`}
                    title={`Day ${idx + 1}: ${st === 1 ? 'Completed' : st === 0 ? 'Missed' : 'Pending'}`}
                  >
                    <span className="habit-dot-num">{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical / Usage Notes */}
            {selectedItemForModal.instructions && (
              <div className="level3-notes-box">
                <Info size={16} className="level3-notes-icon" />
                <div className="level3-notes-content">
                  <span className="level3-notes-label">Instructions & Guidance</span>
                  <p className="level3-notes-text">{selectedItemForModal.instructions}</p>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setSelectedItemForModal(null)}
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
