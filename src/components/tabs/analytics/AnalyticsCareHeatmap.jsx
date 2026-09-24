import React from 'react';
import { Pill, Sparkles } from 'lucide-react';
import { getCellStatus } from '../../../utils/careAnalyticsUtils';

export default function AnalyticsCareHeatmap({
  activeTab,
  onChangeTab,
  items = [],
  onSelectItem,
  weekDays = [],
  todayIso,
}) {
  return (
    <div className="section-block">
      <div className="medicine-analytics-card glass-card">
        {/* Segmented Control: Supplements vs Skin Care */}
        <div className="analytics-segmented-control">
          <button
            className={`analytics-segmented-btn ${activeTab === 'supplements' ? 'active' : ''}`}
            onClick={() => onChangeTab('supplements')}
          >
            <Pill size={15} />
            <span>Supplements</span>
          </button>
          <button
            className={`analytics-segmented-btn ${activeTab === 'skincare' ? 'active' : ''}`}
            onClick={() => onChangeTab('skincare')}
          >
            <Sparkles size={15} />
            <span>Skin Care</span>
          </button>
        </div>

        {/* 7-Day Matrix Heatmap Table */}
        <div className="heatmap-table-wrap">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th className="heatmap-th-name">
                  {activeTab === 'supplements' ? 'Supplement' : 'Routine Step'}
                </th>
                {weekDays.map((day, dIdx) => {
                  const isToday = day.iso === todayIso;
                  return (
                    <th
                      key={dIdx}
                      className={`heatmap-th-day ${isToday ? 'th-today' : ''}`}
                      title={`${day.dayName}, ${day.iso}`}
                    >
                      <span className="th-day-letter">{day.dayLetter}</span>
                      <span className="th-day-num">{day.dayNum}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="heatmap-empty-notice"
                    style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}
                  >
                    No active {activeTab === 'supplements' ? 'supplements' : 'skincare steps'} for this week.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="heatmap-med-row"
                    onClick={() => onSelectItem(item)}
                    title={`Tap to view full report for ${item.name}`}
                  >
                    <td className="heatmap-td-name">
                      <div className="heatmap-name-wrap">
                        <span className="heatmap-row-name" title={item.name}>
                          {item.name}
                        </span>
                        {item.routineType && (
                          <span className={`routine-mini-badge badge-${item.routineType.toLowerCase()}`}>
                            {item.routineType}
                          </span>
                        )}
                      </div>
                    </td>
                    {weekDays.map((day, sIdx) => {
                      const status = getCellStatus(item, day.iso, todayIso);

                      if (status === 'none') {
                        return (
                          <td key={sIdx} className="heatmap-td-cell">
                            <div className="heatmap-cell-empty" />
                          </td>
                        );
                      }

                      const isTaken = status === 'taken';
                      const cellClass = isTaken ? 'cell-taken' : 'cell-missed';
                      const tooltipText = isTaken
                        ? `${item.name}: Completed on ${day.dayName} (${day.iso})`
                        : `${item.name}: Missed / Not completed on ${day.dayName} (${day.iso})`;

                      return (
                        <td key={sIdx} className="heatmap-td-cell" title={tooltipText}>
                          <div className={`heatmap-cell-tile ${cellClass}`} />
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
