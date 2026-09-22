import React, { useState } from 'react';
import {
  ArrowLeft, Dumbbell, Clock, Flame, Award, Play, Trash2, FileText, X
} from 'lucide-react';
import DateStripPicker from '../../common/DateStripPicker';
import { formatTUT } from '../../../utils/timeFormatters';

export default function TodayWorkoutSessionsScreen({
  onClose,
  workouts = [],
  onRemoveWorkout,
}) {
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState(() => new Date());
  const [viewingReport, setViewingReport] = useState(null);

  const selectedIso = `${selectedWorkoutDate.getFullYear()}-${String(selectedWorkoutDate.getMonth() + 1).padStart(2, '0')}-${String(selectedWorkoutDate.getDate()).padStart(2, '0')}`;
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isSelectedToday = selectedIso === todayIso;

  // Filter workouts for selected date
  const displayedWorkouts = workouts.filter(w => {
    if (!w.date) return isSelectedToday;
    return w.date === selectedIso;
  });

  return (
    <div className="today-workout-screen modern-details-theme">
      {/* Top Navigation Bar */}
      <div className="details-screen-top-bar">
        <button
          type="button"
          className="btn-details-back"
          onClick={onClose}
          title="Return to Workout overview"
        >
          <ArrowLeft size={18} />
        </button>

        <h2 className="details-screen-header-title">Today's Workout</h2>

        <div style={{ width: 40, height: 40 }} />
      </div>

      {/* Scrollable Content */}
      <div className="today-workout-scroll-body">
        {/* Horizontally Scrollable Date Strip with Month Header & Calendar Picker */}
        <DateStripPicker
          selectedDate={selectedWorkoutDate}
          onSelectDate={setSelectedWorkoutDate}
          variant="light"
        />

        {/* Today's Summary Card */}
        <div className="today-workout-summary-card">
          <div className="summary-left">
            <div className="summary-icon-badge">
              <Dumbbell size={22} />
            </div>
            <div>
              <span className="summary-date-label">
                {isSelectedToday ? 'Today' : selectedWorkoutDate.toLocaleDateString('en-US', { weekday: 'short' })} • {selectedWorkoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <h3 className="summary-heading">
                {displayedWorkouts.length} Session{displayedWorkouts.length !== 1 ? 's' : ''} Completed
              </h3>
            </div>
          </div>
          <div className="summary-metrics-row">
            <div className="sum-metric">
              <Clock size={15} />
              <span>{displayedWorkouts.reduce((acc, w) => acc + (Number(w.duration) || 0), 0)} mins</span>
            </div>
            <div className="sum-metric">
              <Flame size={15} />
              <span>{displayedWorkouts.reduce((acc, w) => acc + (Number(w.calories) || 0), 0)} kcal</span>
            </div>
            <div className="sum-metric">
              <Award size={15} />
              <span>{displayedWorkouts.reduce((acc, w) => acc + (w.exercises?.reduce((sAcc, ex) => sAcc + (ex.sets?.length || 0), 0) || 0), 0)} sets</span>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="section-header" style={{ marginTop: 6, marginBottom: 2 }}>
          <h3 className="section-title">
            {isSelectedToday ? "Today's Sessions" : "Sessions"} ({displayedWorkouts.length})
          </h3>
        </div>

        {displayedWorkouts.length === 0 ? (
          <div className="empty-state glass-card">
            <Dumbbell size={36} className="empty-icon" />
            <p className="empty-text">
              {isSelectedToday ? 'No workouts logged yet today.' : 'No workouts logged for this date.'}
            </p>
            <span className="empty-subtext">Choose a routine from your workout plans to start training!</span>
            <button
              type="button"
              className="btn btn-workout btn-sm"
              style={{ marginTop: 14 }}
              onClick={onClose}
            >
              <Play size={15} /> View Routines
            </button>
          </div>
        ) : (
          <div className="today-sessions-list">
            {displayedWorkouts.map((w) => (
              <div key={w.id} className="today-session-card glass-card">
                <div className="today-session-top">
                  <div className="session-title-group">
                    <h4 className="session-title">{w.title}</h4>
                    <span className="session-time-meta">
                      <Clock size={13} /> {w.time || 'Today'} • {w.duration} mins • <Flame size={13} /> {w.calories} kcal
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-delete-session"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this workout session?')) {
                        onRemoveWorkout(w.id);
                      }
                    }}
                    title="Delete session"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Exercises completed in this session */}
                {w.exercises && w.exercises.length > 0 && (
                  <div className="session-exercises-list">
                    {w.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="session-exercise-item">
                        <div className="ex-name-row">
                          <span className="ex-bullet">•</span>
                          <span className="ex-name">{ex.name}</span>
                          <span className="ex-sets-count">{ex.sets?.length || 0} sets</span>
                        </div>
                        {ex.sets && ex.sets.length > 0 && (
                          <div className="ex-sets-mini-chips">
                            {ex.sets.map((s, sIdx) => (
                              <span key={sIdx} className="mini-set-chip">
                                Set {s.setNumber || sIdx + 1}: {s.weight || s.targetWeight || 0}kg × {s.reps || s.targetReps || 0}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* View detailed report CTA */}
                <div className="session-card-footer">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setViewingReport(w)}
                  >
                    <FileText size={15} /> View Performance Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Session Report Modal */}
      {viewingReport && (
        <div className="modal-overlay" onClick={() => setViewingReport(null)}>
          <div className="modal-content modal-content-large report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />

            <div className="report-header">
              <div className="report-title-group">
                <span className="report-tag">WORKOUT PERFORMANCE REPORT</span>
                <h3 className="report-title">{viewingReport.title}</h3>
                <span className="report-meta">Completed at {viewingReport.time} • {viewingReport.duration} minutes</span>
              </div>
              <button className="btn-icon" onClick={() => setViewingReport(null)}>
                <X size={18} />
              </button>
            </div>

            {/* High-Level Granular Metrics Grid */}
            <div className="report-stats-grid">
              <div className="r-stat-box">
                <span className="r-stat-label">Total TUT</span>
                <span className="r-stat-val text-accent">{formatTUT(viewingReport.totalTUTSeconds || 0)}</span>
                <span className="r-stat-sub">Time Under Tension</span>
              </div>
              <div className="r-stat-box">
                <span className="r-stat-label">Total Rest</span>
                <span className="r-stat-val">{formatTUT(viewingReport.totalRestSeconds || 0)}</span>
                <span className="r-stat-sub">Between Sets</span>
              </div>
              <div className="r-stat-box">
                <span className="r-stat-label">Volume Lifted</span>
                <span className="r-stat-val text-success">
                  {viewingReport.totalVolumeKg ? `${viewingReport.totalVolumeKg.toLocaleString()} kg` : 'N/A'}
                </span>
                <span className="r-stat-sub">Weight × Reps</span>
              </div>
            </div>

            {/* Set-by-Set Granular Analytics Table */}
            <div className="report-table-section">
              <h4 className="report-section-heading">Detailed Set Breakdown</h4>
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Exercise</th>
                      <th>Set</th>
                      <th>Weight</th>
                      <th>Reps</th>
                      <th>TUT</th>
                      <th>Rest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingReport.exercises?.map((ex, exIdx) =>
                      ex.sets?.map((st, stIdx) => (
                        <tr key={`${exIdx}-${stIdx}`}>
                          <td className="report-ex-name">{stIdx === 0 ? ex.name : ''}</td>
                          <td>#{st.setNumber || stIdx + 1}</td>
                          <td>{st.weight > 0 ? `${st.weight} kg` : 'BW'}</td>
                          <td>{st.reps}</td>
                          <td className="report-tut-cell">{st.tutSeconds ? `${st.tutSeconds}s` : '-'}</td>
                          <td className="report-rest-cell">{st.restSeconds ? `${st.restSeconds}s` : '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => setViewingReport(null)}
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
