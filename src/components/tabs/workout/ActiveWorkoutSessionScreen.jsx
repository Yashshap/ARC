import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Play, Check, ArrowRight } from 'lucide-react';
import { formatTime } from '../../../utils/timeFormatters';

export default function ActiveWorkoutSessionScreen({
  plan,
  onClose,
  onSaveWorkout,
}) {
  const [session, setSession] = useState(() => {
    if (!plan) return null;
    const firstEx = plan.exercises?.[0];
    const firstSet = firstEx?.sets?.[0];
    return {
      planId: plan.id,
      planTitle: plan.title,
      category: plan.category || 'Strength',
      planExercises: plan.exercises || [],
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
    };
  });

  // Active workout timer (ticks every second while component is mounted)
  useEffect(() => {
    const timer = setInterval(() => {
      setSession(prev => {
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
          liveRestSeconds: newRest,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!session || !plan) return null;

  const currentEx = session.planExercises[session.currentExerciseIndex];
  const currentSetNum = session.currentSetIndex + 1;
  const totalSetsForEx = currentEx?.sets?.length || 1;

  const handleBackClick = () => {
    if (session.recordedSets?.length > 0 || session.status === 'in_set') {
      if (typeof window !== 'undefined' && window.confirm('Exit workout routine? Your current progress will not be saved.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleStartSet = () => {
    setSession(prev => ({
      ...prev,
      status: 'in_set',
      setStartTime: Date.now(),
      liveTutSeconds: 0,
    }));
  };

  const handleFinishSet = () => {
    if (!currentEx) return;
    const tut = Math.max(1, session.liveTutSeconds);

    const recordedItem = {
      exerciseName: currentEx.name,
      setNumber: session.currentSetIndex + 1,
      weight: Number(session.currentWeight) || 0,
      reps: Number(session.currentReps) || 0,
      tutSeconds: tut,
      restSeconds: 0,
    };

    setSession(prev => ({
      ...prev,
      status: 'resting',
      restStartTime: Date.now(),
      liveRestSeconds: 0,
      recordedSets: [...prev.recordedSets, recordedItem],
    }));
  };

  const handleNextSet = () => {
    const nextSetIdx = session.currentSetIndex + 1;
    const restTaken = session.liveRestSeconds;

    const updatedRecorded = [...session.recordedSets];
    if (updatedRecorded.length > 0) {
      updatedRecorded[updatedRecorded.length - 1].restSeconds = restTaken;
    }

    if (nextSetIdx < currentEx.sets.length) {
      const nextSetData = currentEx.sets[nextSetIdx];
      setSession(prev => ({
        ...prev,
        currentSetIndex: nextSetIdx,
        currentWeight: nextSetData?.targetWeight ?? prev.currentWeight,
        currentReps: nextSetData?.targetReps ?? prev.currentReps,
        status: 'in_set',
        setStartTime: Date.now(),
        liveTutSeconds: 0,
        liveRestSeconds: 0,
        recordedSets: updatedRecorded,
      }));
    } else {
      const nextExIdx = session.currentExerciseIndex + 1;
      if (nextExIdx < session.planExercises.length) {
        const nextExData = session.planExercises[nextExIdx];
        const firstSetOfNextEx = nextExData.sets[0];
        setSession(prev => ({
          ...prev,
          currentExerciseIndex: nextExIdx,
          currentSetIndex: 0,
          currentWeight: firstSetOfNextEx?.targetWeight ?? 50,
          currentReps: firstSetOfNextEx?.targetReps ?? 10,
          status: 'in_set',
          setStartTime: Date.now(),
          liveTutSeconds: 0,
          liveRestSeconds: 0,
          recordedSets: updatedRecorded,
        }));
      } else {
        handleCompleteWorkout(updatedRecorded);
      }
    }
  };

  const handleCompleteWorkout = (setsToSave = null) => {
    const finalSets = setsToSave || session.recordedSets;
    const durationMins = Math.max(1, Math.round(session.elapsedSessionSeconds / 60));
    const totalTUT = finalSets.reduce((acc, s) => acc + (s.tutSeconds || 0), 0);
    const totalRest = finalSets.reduce((acc, s) => acc + (s.restSeconds || 0), 0);
    const totalVol = finalSets.reduce((acc, s) => acc + ((s.weight || 0) * (s.reps || 0)), 0);

    const exerciseMap = {};
    finalSets.forEach(s => {
      if (!exerciseMap[s.exerciseName]) {
        exerciseMap[s.exerciseName] = { name: s.exerciseName, sets: [] };
      }
      exerciseMap[s.exerciseName].sets.push(s);
    });

    const newWorkoutLog = {
      id: 'w_' + Date.now(),
      title: session.planTitle,
      category: session.category,
      duration: durationMins,
      calories: Math.round(durationMins * 7.5),
      totalTUTSeconds: totalTUT,
      totalRestSeconds: totalRest,
      totalVolumeKg: totalVol,
      exercises: Object.values(exerciseMap),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
    };

    if (onSaveWorkout) {
      onSaveWorkout(newWorkoutLog);
    }
    onClose();
  };

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

        <h2 className="details-screen-header-title active-nav-title">{session.planTitle}</h2>

        <button
          type="button"
          className="btn-finish-session-nav"
          onClick={() => {
            if (typeof window !== 'undefined' && window.confirm('Finish and save this workout session?')) {
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
            <span className="active-clock-time">{formatTime(session.elapsedSessionSeconds)}</span>
          </div>
          <div className="active-session-meta-pill">
            <span>{session.category}</span>
            <span className="bullet">•</span>
            <span>Ex {session.currentExerciseIndex + 1} of {session.planExercises.length}</span>
            <span className="bullet">•</span>
            <span>{session.recordedSets.length} sets logged</span>
          </div>
        </div>

        {/* Current Exercise & Set Card */}
        {currentEx && (
          <div className="active-exercise-box glass-card">
            <div className="active-exercise-header">
              <div>
                <span className="active-ex-subtitle">
                  Exercise {session.currentExerciseIndex + 1} of {session.planExercises.length}
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
                    onClick={() => setSession(p => ({ ...p, currentWeight: Math.max(0, p.currentWeight - 2.5) }))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="adjuster-input"
                    value={session.currentWeight}
                    readOnly={session.status === 'in_set'}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (session.status === 'in_set' && val > session.currentWeight) return;
                      setSession(p => ({ ...p, currentWeight: val }));
                    }}
                  />
                  <button
                    type="button"
                    className="adjuster-btn"
                    disabled={session.status === 'in_set'}
                    onClick={() => setSession(p => ({ ...p, currentWeight: p.currentWeight + 2.5 }))}
                    title={session.status === 'in_set' ? "Cannot increase weight once set is started" : "Increase weight"}
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
                    onClick={() => setSession(p => ({ ...p, currentReps: Math.max(1, p.currentReps - 1) }))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="adjuster-input"
                    value={session.currentReps}
                    onChange={(e) => setSession(p => ({ ...p, currentReps: Number(e.target.value) }))}
                  />
                  <button
                    type="button"
                    className="adjuster-btn"
                    onClick={() => setSession(p => ({ ...p, currentReps: p.currentReps + 1 }))}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="active-action-container">
              {session.status === 'ready' && (
                <button
                  type="button"
                  className="btn btn-workout active-main-btn"
                  onClick={handleStartSet}
                >
                  <Play size={22} />
                  <span>Start Set {currentSetNum}</span>
                </button>
              )}

              {session.status === 'in_set' && (
                <div className="in-set-action-wrap">
                  <div className="live-tut-banner">
                    <span className="live-tut-label">TIME UNDER TENSION</span>
                    <span className="live-tut-digits">{formatTime(session.liveTutSeconds)}</span>
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

              {session.status === 'resting' && (
                <div className="resting-action-wrap">
                  <div className="live-rest-banner">
                    <span className="live-rest-label">REST INTERVAL</span>
                    <span className="live-rest-digits">{formatTime(session.liveRestSeconds)}</span>
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
                {session.planExercises.slice(session.currentExerciseIndex + 1).map((ex, i) => (
                  <span key={i} className="queue-pill">{ex.name}</span>
                ))}
                {session.currentExerciseIndex === session.planExercises.length - 1 && (
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
}
