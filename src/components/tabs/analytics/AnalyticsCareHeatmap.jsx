import React from 'react';
import { Pill, Sparkles } from 'lucide-react';

export default function AnalyticsCareHeatmap({
  activeTab,
  onChangeTab,
  dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  items = [],
  onSelectItem,
}) {
  const displayDayNames = dayNames.slice(-7);

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
                {displayDayNames.map((dayLetter, dIdx) => (
                  <th key={dIdx} className="heatmap-th-day">
                    <span className="th-day-letter">{dayLetter}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const weekHistory = (item.heatmapHistory || [1, 1, 1, 1, 1, 1, 1]).slice(-7);
                return (
                  <tr
                    key={item.id}
                    className="heatmap-med-row"
                    onClick={() => onSelectItem(item)}
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
  );
}
