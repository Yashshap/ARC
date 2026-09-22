import React from 'react';
import { Info, X } from 'lucide-react';

export default function AnalyticsDrilldownModal({
  item,
  category = 'supplements',
  onClose,
}) {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-large level3-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-pill" />

        <div className="level3-header">
          <div className="level3-title-group">
            <span className="level3-badge">
              {category === 'supplements'
                ? 'SUPPLEMENT DRILL-DOWN'
                : 'SKINCARE DRILL-DOWN'}
            </span>
            <h3 className="level3-title">{item.name}</h3>
            <span className="level3-meta">
              {item.dosage} • {item.time}
              {item.withFood !== undefined
                ? item.withFood
                  ? ' • With Food'
                  : ' • Empty Stomach'
                : ''}
            </span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close Drill-Down">
            <X size={18} />
          </button>
        </div>

        {/* Level 3 Core Stats Trio */}
        <div className="level3-stats-grid">
          <div className="l3-stat-card">
            <span className="l3-stat-label">Days Completed</span>
            <span className="l3-stat-val text-success">
              {item.totalTakenDays || 26} / {item.totalScheduledDays || 30}
            </span>
            <span className="l3-stat-sub">days this month</span>
          </div>

          <div className="l3-stat-card">
            <span className="l3-stat-label">Adherence Rate</span>
            <span className="l3-stat-val text-accent">
              {item.adherence || 87}%
            </span>
            <span className="l3-stat-sub">overall compliance</span>
          </div>

          <div className="l3-stat-card">
            <span className="l3-stat-label">Missed Days</span>
            <span className="l3-stat-val text-danger">
              {item.missedDoses || 4}
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
            {(item.monthlyHistory || Array(30).fill(1)).map((st, idx) => (
              <div
                key={idx}
                className={`habit-dot ${
                  st === 1 ? 'dot-taken' : st === 0 ? 'dot-missed' : 'dot-pending'
                }`}
                title={`Day ${idx + 1}: ${
                  st === 1 ? 'Completed' : st === 0 ? 'Missed' : 'Pending'
                }`}
              >
                <span className="habit-dot-num">{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical / Usage Notes */}
        {item.instructions && (
          <div className="level3-notes-box">
            <Info size={16} className="level3-notes-icon" />
            <div className="level3-notes-content">
              <span className="level3-notes-label">Instructions & Guidance</span>
              <p className="level3-notes-text">{item.instructions}</p>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={onClose}
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
