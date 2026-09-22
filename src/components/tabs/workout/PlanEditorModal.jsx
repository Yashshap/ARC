import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';

const DEFAULT_NEW_PLAN = {
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
};

export default function PlanEditorModal({
  isOpen,
  onClose,
  initialPlan = null,
  onSave,
}) {
  const [editingPlan, setEditingPlan] = useState(() => {
    if (initialPlan) return JSON.parse(JSON.stringify(initialPlan));
    return { id: 'plan_' + Date.now(), ...DEFAULT_NEW_PLAN };
  });

  if (!isOpen || !editingPlan) return null;

  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!editingPlan.title.trim()) return;
    if (onSave) {
      onSave(editingPlan);
    }
    onClose();
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

  const handleRemoveExerciseFromPlan = (exIndex) => {
    setEditingPlan(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== exIndex)
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

  const handleRemoveSetFromExercise = (exIndex, stIndex) => {
    setEditingPlan(prev => {
      const updated = { ...prev };
      updated.exercises[exIndex].sets = updated.exercises[exIndex].sets
        .filter((_, idx) => idx !== stIndex)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return updated;
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
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
              onClick={onClose}
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
  );
}
