import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import SlideOverPage from '../common/SlideOverPage';
import DateStripPicker from '../common/DateStripPicker';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Dumbbell, 
  Timer, 
  Flame, 
  Clock, 
  Award, 
  ChevronRight, 
  Check, 
  Edit3, 
  FileText, 
  X, 
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function WorkoutTab() {
  const { data, addWorkout, removeWorkout, saveWorkoutPlan, deleteWorkoutPlan } = useApp();
  const { todayWorkouts, plans = [], streak, weeklyGoal, completedThisWeek } = data.workout;

  // Sub-screen for Today's Workout Sessions
  const [showTodayWorkoutScreen, setShowTodayWorkoutScreen] = useState(false);
  const [selectedWorkoutDate, setSelectedWorkoutDate] = useState(() => new Date());

  const isSelectedToday = useMemo(() => {
    if (!selectedWorkoutDate) return true;
    const today = new Date();
    const sel = new Date(selectedWorkoutDate);
    return today.toDateString() === sel.toDateString();
  }, [selectedWorkoutDate]);

  const displayedWorkouts = useMemo(() => {
    if (isSelectedToday) return todayWorkouts;
    return todayWorkouts.filter(w => {
      if (!w.date) return false;
      return new Date(w.date).toDateString() === new Date(selectedWorkoutDate).toDateString();
    });
  }, [isSelectedToday, todayWorkouts, selectedWorkoutDate]);

  // Active Session State
  const [activeSession, setActiveSession] = useState(null);
  // activeSession structure:
  // {
  //   planId, planTitle, category,
  //   currentExerciseIndex: 0,
  //   currentSetIndex: 0,
  //   status: 'ready' | 'in_set' | 'resting',
  //   setStartTime: null,
  //   restStartTime: null,
  //   elapsedSessionSeconds: 0,
  //   liveTutSeconds: 0,
  //   liveRestSeconds: 0,
  //   recordedSets: [],
  //   currentWeight: 60,
  //   currentReps: 10,
  // }

  // Interval timer ref for active workout session
  const sessionTimerRef = useRef(null);

  // Modal States
  const [isPlanEditorOpen, setIsPlanEditorOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [viewingReport, setViewingReport] = useState(null); // workout object for detailed report

  // Standalone Interval Stopwatch (when not in a plan)
  const [standaloneSecs, setStandaloneSecs] = useState(60);
  const [isStandaloneRunning, setIsStandaloneRunning] = useState(false);
  const standaloneTimerRef = useRef(null);

  useEffect(() => {
    if (isStandaloneRunning) {
      standaloneTimerRef.current = setInterval(() => {
        setStandaloneSecs(prev => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    } else {
      clearInterval(standaloneTimerRef.current);
    }
    return () => clearInterval(standaloneTimerRef.current);
  }, [isStandaloneRunning]);

  // Active Workout Timer effect
  useEffect(() => {
    if (activeSession) {
      sessionTimerRef.current = setInterval(() => {
        setActiveSession(prev => {
          if (!prev) return null;
          let newTut = prev.liveTutSeconds;
          let newRest = prev.liveRestSeconds;

          if (prev.status === 'in_set') {
            newTut += 1;
          } else if (prev.status === 'resting') {
            newRest += 1;
          }

          return {
            ...prev,
            elapsedSessionSeconds: prev.elapsedSessionSeconds + 1,
            liveTutSeconds: newTut,
            liveRestSeconds: newRest
          };
        });
      }, 1000);
    } else {
      clearInterval(sessionTimerRef.current);
    }
    return () => clearInterval(sessionTimerRef.current);
  }, [activeSession?.status]);

  // Format seconds to MM:SS
  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format seconds to e.g. "4m 25s" or "38s"
  const formatTUT = (totalSecs) => {
    if (!totalSecs || totalSecs === 0) return '0s';
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  /* ================= ACTIVE WORKOUT CONTROLS ================= */
  const handleStartWorkout = (plan) => {
    const firstEx = plan.exercises[0];
    const firstSet = firstEx?.sets[0];

    setActiveSession({
      planId: plan.id,
      planTitle: plan.title,
      category: plan.category || 'Strength',
      planExercises: plan.exercises,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      status: 'ready', // 'ready' | 'in_set' | 'resting'
      setStartTime: null,
      restStartTime: null,
      elapsedSessionSeconds: 0,
      liveTutSeconds: 0,
      liveRestSeconds: 0,
      recordedSets: [],
      currentWeight: firstSet?.targetWeight ?? 60,
      currentReps: firstSet?.targetReps ?? 10,
    });
  };

  // User clicks "Start Set"
  const handleStartSet = () => {
    setActiveSession(prev => ({
      ...prev,
      status: 'in_set',
      setStartTime: Date.now(),
      liveTutSeconds: 0,
      // If was resting, record how long rest lasted
      lastRestRecorded: prev.status === 'resting' ? prev.liveRestSeconds : 0
    }));
  };

  // User clicks "Finish Set"
  const handleFinishSet = () => {
    if (!activeSession) return;
    const currentEx = activeSession.planExercises[activeSession.currentExerciseIndex];
    const tut = Math.max(1, activeSession.liveTutSeconds);

    const recordedItem = {
      exerciseName: currentEx.name,
      setNumber: activeSession.currentSetIndex + 1,
      weight: Number(activeSession.currentWeight) || 0,
      reps: Number(activeSession.currentReps) || 0,
      tutSeconds: tut,
      restSeconds: 0 // will be updated when next set starts
    };

    setActiveSession(prev => ({
      ...prev,
      status: 'resting',
      restStartTime: Date.now(),
      liveRestSeconds: 0,
      recordedSets: [...prev.recordedSets, recordedItem]
    }));
  };

  // User clicks "Start Next Set"
  const handleNextSet = () => {
    if (!activeSession) return;
    const currentEx = activeSession.planExercises[activeSession.currentExerciseIndex];
    const nextSetIdx = activeSession.currentSetIndex + 1;
    const restTaken = activeSession.liveRestSeconds;

    // Update rest seconds on last recorded set
    const updatedRecorded = [...activeSession.recordedSets];
    if (updatedRecorded.length > 0) {
      updatedRecorded[updatedRecorded.length - 1].restSeconds = restTaken;
    }

    if (nextSetIdx < currentEx.sets.length) {
      // Advance to next set in current exercise and start it immediately
      const nextSetData = currentEx.sets[nextSetIdx];
      setActiveSession(prev => ({
        ...prev,
        currentSetIndex: nextSetIdx,
        currentWeight: nextSetData?.targetWeight ?? prev.currentWeight,
        currentReps: nextSetData?.targetReps ?? prev.currentReps,
        status: 'in_set',
        setStartTime: Date.now(),
        liveTutSeconds: 0,
        liveRestSeconds: 0,
        recordedSets: updatedRecorded
      }));
    } else {
      // Advance to next exercise and start its first set immediately
      const nextExIdx = activeSession.currentExerciseIndex + 1;
      if (nextExIdx < activeSession.planExercises.length) {
        const nextExData = activeSession.planExercises[nextExIdx];
        const firstSetOfNextEx = nextExData.sets[0];
        setActiveSession(prev => ({
          ...prev,
          currentExerciseIndex: nextExIdx,
          currentSetIndex: 0,
          currentWeight: firstSetOfNextEx?.targetWeight ?? 50,
          currentReps: firstSetOfNextEx?.targetReps ?? 10,
          status: 'in_set',
          setStartTime: Date.now(),
          liveTutSeconds: 0,
          liveRestSeconds: 0,
          recordedSets: updatedRecorded
        }));
      } else {
        // All exercises in plan finished!
        handleCompleteWorkout(updatedRecorded);
      }
    }
  };

  // Complete & Save Workout Session
  const handleCompleteWorkout = (setsToSave = null) => {
    const finalSets = setsToSave || activeSession.recordedSets;
    const durationMins = Math.max(1, Math.round(activeSession.elapsedSessionSeconds / 60));
    const totalTUT = finalSets.reduce((acc, s) => acc + (s.tutSeconds || 0), 0);
    const totalRest = finalSets.reduce((acc, s) => acc + (s.restSeconds || 0), 0);
    const totalVol = finalSets.reduce((acc, s) => acc + ((s.weight || 0) * (s.reps || 0)), 0);

    // Group sets by exercise
    const exerciseMap = {};
    finalSets.forEach(s => {
      if (!exerciseMap[s.exerciseName]) {
        exerciseMap[s.exerciseName] = { name: s.exerciseName, sets: [] };
      }
      exerciseMap[s.exerciseName].sets.push(s);
    });

    const newWorkoutLog = {
      title: activeSession.planTitle,
      category: activeSession.category,
      duration: durationMins,
      calories: Math.round(durationMins * 7.5),
      totalTUTSeconds: totalTUT,
      totalRestSeconds: totalRest,
      totalVolumeKg: totalVol,
      exercises: Object.values(exerciseMap)
    };

    addWorkout(newWorkoutLog);
    setActiveSession(null);
  };

  /* ================= PLAN EDITOR MODAL ================= */
  const handleOpenEditPlan = (plan = null) => {
    if (plan) {
      setEditingPlan(JSON.parse(JSON.stringify(plan)));
    } else {
      setEditingPlan({
        id: 'plan_' + Date.now(),
        title: 'New Custom Routine',
        category: 'Strength',
        duration: 45,
        exercises: [
          {
            id: 'ex_new_1',
            name: 'Barbell Bench Press',
            sets: [
              { setNumber: 1, targetWeight: 60, targetReps: 10 },
              { setNumber: 2, targetWeight: 65, targetReps: 10 },
              { setNumber: 3, targetWeight: 70, targetReps: 8 },
            ]
          }
        ]
      });
    }
    setIsPlanEditorOpen(true);
  };

  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!editingPlan.title.trim()) return;
    saveWorkoutPlan(editingPlan);
    setIsPlanEditorOpen(false);
  };

  const handleAddExerciseToPlan = () => {
    setEditingPlan(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: 'ex_' + Date.now(),
          name: 'New Exercise',
          sets: [
            { setNumber: 1, targetWeight: 40, targetReps: 10 },
            { setNumber: 2, targetWeight: 40, targetReps: 10 },
            { setNumber: 3, targetWeight: 40, targetReps: 10 },
          ]
        }
      ]
    }));
  };

  const handleAddSetToExercise = (exIndex) => {
    setEditingPlan(prev => {
      const updated = { ...prev };
      const currentSets = updated.exercises[exIndex].sets;
      const lastSet = currentSets[currentSets.length - 1];
      currentSets.push({
        setNumber: currentSets.length + 1,
        targetWeight: lastSet?.targetWeight ?? 40,
        targetReps: lastSet?.targetReps ?? 10
      });
      return updated;
    });
  };

  const handleRemoveSetFromExercise = (exIndex, setIndex) => {
    setEditingPlan(prev => {
      const updated = { ...prev };
      updated.exercises[exIndex].sets = updated.exercises[exIndex].sets.filter((_, i) => i !== setIndex);
      return updated;
    });
  };

  const handleRemoveExerciseFromPlan = (exIndex) => {
    setEditingPlan(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== exIndex)
    }));
  };

  return (
    <div className="tab-container workout-tab">
      {/* Today's Workout Entry Card (Minimal: Title + Arrow only) */}
      <div 
        className="today-workout-entry-card glass-card"
        onClick={() => setShowTodayWorkoutScreen(true)}
        role="button"
        tabIndex={0}
        title="Open Today's Workout Sessions"
      >
        <span className="today-workout-title">Today's Workout</span>
        <div className="today-workout-arrow">
          <ChevronRight size={20} />
        </div>
      </div>

      {/* Available Workout Plans List */}
      <div className="section-block">
        <div className="section-header">
          <div>
            <h3 className="section-title">Workout Plans ({plans.length})</h3>
          </div>
          <button
            className="btn btn-workout btn-sm"
            onClick={() => handleOpenEditPlan(null)}
          >
            <Plus size={15} /> Custom Plan
          </button>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id} className="plan-card glass-card">
              <div className="plan-card-header">
                <div>
                  <span className="plan-cat-tag">{plan.category}</span>
                  <h4 className="plan-title">{plan.title}</h4>
                  <span className="plan-meta">
                    {plan.exercises?.length || 0} exercises • ~{plan.duration || 45} mins
                  </span>
                </div>

                <button
                  className="btn-icon"
                  onClick={() => handleOpenEditPlan(plan)}
                  title="Edit plan"
                >
                  <Edit3 size={15} />
                </button>
              </div>

              {/* Exercise summary list */}
              <div className="plan-exercises-preview">
                {plan.exercises?.slice(0, 3).map((ex, idx) => (
                  <div key={idx} className="plan-ex-item">
                    <span className="plan-ex-name">{ex.name}</span>
                    <span className="plan-ex-sets">{ex.sets?.length || 3} sets</span>
                  </div>
                ))}
                {plan.exercises?.length > 3 && (
                  <span className="plan-ex-more">+{plan.exercises.length - 3} more exercises</span>
                )}
              </div>

              {/* Start Plan Button */}
              <button
                className="btn btn-workout plan-start-btn"
                onClick={() => handleStartWorkout(plan)}
              >
                <Play size={16} /> Start Routine
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- DETAILED SESSION REPORT MODAL ---------------- */}
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

      {/* ---------------- EDIT / CREATE PLAN MODAL ---------------- */}
      {isPlanEditorOpen && editingPlan && (
        <div className="modal-overlay" onClick={() => setIsPlanEditorOpen(false)}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            <h3 className="modal-title">Customize Workout Routine</h3>

            <form onSubmit={handleSavePlan}>
              <div className="input-group">
                <label className="input-label">Routine Title</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingPlan.title}
                  onChange={(e) => setEditingPlan(p => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>

              <div className="input-row-grid">
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingPlan.category}
                    onChange={(e) => setEditingPlan(p => ({ ...p, category: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Est. Duration (mins)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editingPlan.duration}
                    onChange={(e) => setEditingPlan(p => ({ ...p, duration: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Plan Exercises List */}
              <div className="plan-editor-exercises">
                <div className="section-header">
                  <span className="input-label">Exercises & Default Sets</span>
                  <button
                    type="button"
                    className="btn-text"
                    onClick={handleAddExerciseToPlan}
                  >
                    + Add Exercise
                  </button>
                </div>

                {editingPlan.exercises.map((ex, exIdx) => (
                  <div key={ex.id || exIdx} className="plan-editor-ex-card">
                    <div className="plan-editor-ex-header">
                      <input
                        type="text"
                        className="input-field plan-ex-title-input"
                        value={ex.name}
                        onChange={(e) => {
                          const updated = [...editingPlan.exercises];
                          updated[exIdx].name = e.target.value;
                          setEditingPlan(p => ({ ...p, exercises: updated }));
                        }}
                        placeholder="Exercise name"
                      />
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => handleRemoveExerciseFromPlan(exIdx)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Sets List */}
                    <div className="plan-editor-sets-list">
                      {ex.sets.map((st, stIdx) => (
                        <div key={stIdx} className="plan-set-row">
                          <span className="set-num-tag">Set {stIdx + 1}</span>
                          <input
                            type="number"
                            className="input-field plan-set-input"
                            value={st.targetWeight}
                            onChange={(e) => {
                              const updated = [...editingPlan.exercises];
                              updated[exIdx].sets[stIdx].targetWeight = Number(e.target.value);
                              setEditingPlan(p => ({ ...p, exercises: updated }));
                            }}
                            placeholder="Weight (kg)"
                            title="Default Weight (kg)"
                          />
                          <span className="set-unit">kg ×</span>
                          <input
                            type="number"
                            className="input-field plan-set-input"
                            value={st.targetReps}
                            onChange={(e) => {
                              const updated = [...editingPlan.exercises];
                              updated[exIdx].sets[stIdx].targetReps = Number(e.target.value);
                              setEditingPlan(p => ({ ...p, exercises: updated }));
                            }}
                            placeholder="Reps"
                            title="Default Reps"
                          />
                          <span className="set-unit">reps</span>
                          {ex.sets.length > 1 && (
                            <button
                              type="button"
                              className="btn-delete"
                              onClick={() => handleRemoveSetFromExercise(exIdx, stIdx)}
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="btn-text"
                      style={{ fontSize: '0.75rem', marginTop: '6px' }}
                      onClick={() => handleAddSetToExercise(exIdx)}
                    >
                      + Add Set
                    </button>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPlanEditorOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-workout">
                  Save Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- TODAY'S WORKOUT SESSIONS SUB-PAGE ---------------- */}
      <SlideOverPage
        isOpen={showTodayWorkoutScreen}
        onClose={() => setShowTodayWorkoutScreen(false)}
        zIndex={500}
      >
        {({ close }) => (
          <div className="today-workout-screen modern-details-theme">
            {/* Top Navigation Bar */}
            <div className="details-screen-top-bar">
              <button
                type="button"
                className="btn-details-back"
                onClick={close}
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
                    onClick={close}
                  >
                    <Play size={15} /> View Routines
                  </button>
                </div>
              ) : (
                <div className="today-sessions-list">
                  {displayedWorkouts.map((w) => {
                    return (
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
                              if (window.confirm('Are you sure you want to delete this workout session?')) {
                                removeWorkout(w.id);
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </SlideOverPage>

      {/* ---------------- ACTIVE WORKOUT ROUTINE SUB-PAGE ---------------- */}
      <SlideOverPage
        isOpen={Boolean(activeSession)}
        onClose={() => setActiveSession(null)}
        zIndex={520}
      >
        {({ close }) => {
          if (!activeSession) return null;

          const handleBackClick = () => {
            if (activeSession.recordedSets?.length > 0 || activeSession.status === 'in_set') {
              if (window.confirm('Exit workout routine? Your current progress will not be saved.')) {
                close();
              }
            } else {
              close();
            }
          };

          const currentEx = activeSession.planExercises[activeSession.currentExerciseIndex];
          const currentSetNum = activeSession.currentSetIndex + 1;
          const totalSetsForEx = currentEx?.sets?.length || 1;

          return (
            <div className="active-workout-screen modern-details-theme">
              {/* Top Navigation Bar with Back Arrow */}
              <div className="details-screen-top-bar">
                <button
                  type="button"
                  className="btn-details-back"
                  onClick={handleBackClick}
                  title="Return to Workout tab"
                >
                  <ArrowLeft size={18} />
                </button>

                <h2 className="details-screen-header-title active-nav-title">{activeSession.planTitle}</h2>

                <button
                  type="button"
                  className="btn-finish-session-nav"
                  onClick={() => {
                    if (window.confirm('Finish and save this workout session?')) {
                      handleCompleteWorkout();
                    }
                  }}
                >
                  Finish
                </button>
              </div>

              {/* Scrollable Workout Player Body */}
              <div className="active-workout-scroll-body">
                {/* Session Stats Banner */}
                <div className="active-session-banner glass-card">
                  <div className="active-session-clock-pill">
                    <Clock size={16} />
                    <span className="active-clock-time">{formatTime(activeSession.elapsedSessionSeconds)}</span>
                  </div>
                  <div className="active-session-meta-pill">
                    <span>{activeSession.category}</span>
                    <span className="bullet">•</span>
                    <span>Ex {activeSession.currentExerciseIndex + 1} of {activeSession.planExercises.length}</span>
                    <span className="bullet">•</span>
                    <span>{activeSession.recordedSets.length} sets logged</span>
                  </div>
                </div>

                {/* Current Exercise & Set Card */}
                {currentEx && (
                  <div className="active-exercise-box glass-card">
                    <div className="active-exercise-header">
                      <div>
                        <span className="active-ex-subtitle">
                          Exercise {activeSession.currentExerciseIndex + 1} of {activeSession.planExercises.length}
                        </span>
                        <h3 className="active-ex-name">{currentEx.name}</h3>
                      </div>
                      <span className="active-set-counter">
                        Set {currentSetNum}/{totalSetsForEx}
                      </span>
                    </div>

                    {/* Weight & Reps Adjuster Controls */}
                    <div className="active-adjusters-row">
                      {/* Weight Box */}
                      <div className="adjuster-box">
                        <span className="adjuster-label">WEIGHT (KG)</span>
                        <div className="adjuster-controls">
                          <button
                            type="button"
                            className="adjuster-btn"
                            onClick={() => setActiveSession(p => ({ ...p, currentWeight: Math.max(0, p.currentWeight - 2.5) }))}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="adjuster-input"
                            value={activeSession.currentWeight}
                            readOnly={activeSession.status === 'in_set'}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (activeSession.status === 'in_set' && val > activeSession.currentWeight) return;
                              setActiveSession(p => ({ ...p, currentWeight: val }));
                            }}
                          />
                          <button
                            type="button"
                            className="adjuster-btn"
                            disabled={activeSession.status === 'in_set'}
                            onClick={() => setActiveSession(p => ({ ...p, currentWeight: p.currentWeight + 2.5 }))}
                            title={activeSession.status === 'in_set' ? "Cannot increase weight once set is started" : "Increase weight"}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Reps Box */}
                      <div className="adjuster-box">
                        <span className="adjuster-label">REPS</span>
                        <div className="adjuster-controls">
                          <button
                            type="button"
                            className="adjuster-btn"
                            onClick={() => setActiveSession(p => ({ ...p, currentReps: Math.max(1, p.currentReps - 1) }))}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="adjuster-input"
                            value={activeSession.currentReps}
                            onChange={(e) => setActiveSession(p => ({ ...p, currentReps: Number(e.target.value) }))}
                          />
                          <button
                            type="button"
                            className="adjuster-btn"
                            onClick={() => setActiveSession(p => ({ ...p, currentReps: p.currentReps + 1 }))}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Primary Action Button (Start Set / Finish Set / Next Set) */}
                    <div className="active-action-container">
                      {activeSession.status === 'ready' && (
                        <button
                          type="button"
                          className="btn btn-workout active-main-btn"
                          onClick={handleStartSet}
                        >
                          <Play size={22} />
                          <span>Start Set {currentSetNum}</span>
                        </button>
                      )}

                      {activeSession.status === 'in_set' && (
                        <div className="in-set-action-wrap">
                          <div className="live-tut-banner">
                            <span className="live-tut-label">TIME UNDER TENSION</span>
                            <span className="live-tut-digits">{formatTime(activeSession.liveTutSeconds)}</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-success active-main-btn pulse-glow"
                            onClick={handleFinishSet}
                          >
                            <Check size={22} />
                            <span>Finish Set {currentSetNum}</span>
                          </button>
                        </div>
                      )}

                      {activeSession.status === 'resting' && (
                        <div className="resting-action-wrap">
                          <div className="live-rest-banner">
                            <span className="live-rest-label">REST INTERVAL</span>
                            <span className="live-rest-digits">{formatTime(activeSession.liveRestSeconds)}</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-workout active-main-btn"
                            onClick={handleNextSet}
                          >
                            <ArrowRight size={22} />
                            <span>
                              {currentSetNum < totalSetsForEx ? `Start Set ${currentSetNum + 1}` : 'Next Exercise'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Minimalist Upcoming Queue Preview */}
                    <div className="active-queue-preview">
                      <span className="queue-label">Upcoming in this session:</span>
                      <div className="queue-tags">
                        {activeSession.planExercises.slice(activeSession.currentExerciseIndex + 1).map((ex, i) => (
                          <span key={i} className="queue-pill">{ex.name}</span>
                        ))}
                        {activeSession.currentExerciseIndex === activeSession.planExercises.length - 1 && (
                          <span className="queue-pill final-pill">Final Exercise • Almost done!</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancel / Discard Session Button at bottom */}
                <div className="active-bottom-actions">
                  <button
                    type="button"
                    className="btn-discard-session"
                    onClick={handleBackClick}
                  >
                    Cancel Routine
                  </button>
                </div>
              </div>
            </div>
          );
        }}
      </SlideOverPage>
    </div>
  );
}
