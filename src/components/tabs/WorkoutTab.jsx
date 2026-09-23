import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import SlideOverPage from '../common/SlideOverPage';
import { Play, Plus, ChevronRight, Edit3 } from 'lucide-react';

import PlanEditorModal from './workout/PlanEditorModal';
import TodayWorkoutSessionsScreen from './workout/TodayWorkoutSessionsScreen';
import ActiveWorkoutSessionScreen from './workout/ActiveWorkoutSessionScreen';

export default function WorkoutTab() {
  const { data, addWorkout, removeWorkout, saveWorkoutPlan } = useApp();
  const { todayWorkouts = [], plans = [] } = data.workout || {};

  // Sub-screens and modals navigation state
  const [showTodayWorkoutScreen, setShowTodayWorkoutScreen] = useState(false);
  const [selectedPlanForWorkout, setSelectedPlanForWorkout] = useState(null);
  const [isPlanEditorOpen, setIsPlanEditorOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const handleOpenEditPlan = (plan = null) => {
    setEditingPlan(plan);
    setIsPlanEditorOpen(true);
  };

  const handleStartWorkout = (plan) => {
    setSelectedPlanForWorkout(plan);
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
            type="button"
            className="btn btn-workout btn-sm"
            onClick={() => handleOpenEditPlan(null)}
          >
            <Plus size={15} /> Custom Plan
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="empty-state-card glass-card" style={{ padding: '28px 20px', textAlign: 'center', borderRadius: '16px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '14px' }}>
              No workout plans created yet. Build your first custom routine!
            </p>
            <button
              type="button"
              className="btn btn-workout btn-sm"
              onClick={() => handleOpenEditPlan(null)}
            >
              <Plus size={15} /> Create Custom Plan
            </button>
          </div>
        ) : (
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
                    type="button"
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
                  type="button"
                  className="btn btn-workout plan-start-btn"
                  onClick={() => handleStartWorkout(plan)}
                >
                  <Play size={16} /> Start Routine
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- TODAY'S WORKOUT SESSIONS SUB-PAGE ---------------- */}
      <SlideOverPage
        isOpen={showTodayWorkoutScreen}
        onClose={() => setShowTodayWorkoutScreen(false)}
        zIndex={500}
      >
        {({ close }) => (
          <TodayWorkoutSessionsScreen
            onClose={close}
            workouts={todayWorkouts}
            onRemoveWorkout={removeWorkout}
          />
        )}
      </SlideOverPage>

      {/* ---------------- ACTIVE WORKOUT ROUTINE SUB-PAGE ---------------- */}
      <SlideOverPage
        isOpen={Boolean(selectedPlanForWorkout)}
        onClose={() => setSelectedPlanForWorkout(null)}
        zIndex={520}
      >
        {({ close }) => (
          <ActiveWorkoutSessionScreen
            key={selectedPlanForWorkout?.id || 'session'}
            plan={selectedPlanForWorkout}
            onClose={close}
            onSaveWorkout={addWorkout}
          />
        )}
      </SlideOverPage>

      {/* ---------------- EDIT / CREATE PLAN MODAL ---------------- */}
      <PlanEditorModal
        key={isPlanEditorOpen ? (editingPlan?.id || 'new_plan') : 'closed'}
        isOpen={isPlanEditorOpen}
        onClose={() => setIsPlanEditorOpen(false)}
        initialPlan={editingPlan}
        onSave={saveWorkoutPlan}
      />
    </div>
  );
}
