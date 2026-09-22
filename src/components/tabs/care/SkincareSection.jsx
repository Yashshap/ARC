import React, { useState } from 'react';
import { Sun, Moon, Plus } from 'lucide-react';
import RoutineCard from './RoutineCard';

export default function SkincareSection({
  amSteps = [],
  pmSteps = [],
  onToggleStep,
  onOpenDetail,
  onOpenAddStep,
}) {
  const [isAmOpen, setIsAmOpen] = useState(true);
  const [isPmOpen, setIsPmOpen] = useState(true);

  const amCompleted = amSteps.filter(s => s.completed).length;
  const amTotal = amSteps.length;

  const pmCompleted = pmSteps.filter(s => s.completed).length;
  const pmTotal = pmSteps.length;

  const totalSkinSteps = amTotal + pmTotal;
  const completedSkinSteps = amCompleted + pmCompleted;
  const skinPercent = totalSkinSteps > 0 ? Math.round((completedSkinSteps / totalSkinSteps) * 100) : 0;

  return (
    <div className="skincare-section">
      {/* Progress bar in front of Add Step button */}
      <div className="care-action-header-row glass-card">
        <div className="care-progress-compact">
          <div className="care-progress-compact-info">
            <span className="compact-progress-label">Today's Skincare</span>
            <span className="compact-progress-val">
              {completedSkinSteps}/{totalSkinSteps} ({skinPercent}%)
            </span>
          </div>
          <div className="care-progress-bar-track">
            <div
              className="care-progress-bar-fill"
              style={{ width: `${skinPercent}%` }}
            />
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm btn-add-compact"
          onClick={() => onOpenAddStep('AM')}
        >
          <Plus size={14} /> Add Step
        </button>
      </div>

      {/* AM Routine */}
      <RoutineCard
        title="Morning Routine"
        type="AM"
        icon={Sun}
        iconBg="rgba(245, 158, 11, 0.15)"
        iconColor="#f59e0b"
        steps={amSteps}
        completedCount={amCompleted}
        totalCount={amTotal}
        isOpen={isAmOpen}
        onToggleOpen={() => setIsAmOpen(!isAmOpen)}
        onStepClick={(step) =>
          onOpenDetail({
            type: 'step',
            routineType: 'AM',
            id: step.id,
            name: step.step,
            completed: step.completed,
          })
        }
        onToggleStep={(stepId) => onToggleStep('AM', stepId)}
      />

      {/* PM Routine */}
      <RoutineCard
        title="Evening Routine"
        type="PM"
        icon={Moon}
        iconBg="rgba(168, 85, 247, 0.15)"
        iconColor="#c084fc"
        steps={pmSteps}
        completedCount={pmCompleted}
        totalCount={pmTotal}
        isOpen={isPmOpen}
        onToggleOpen={() => setIsPmOpen(!isPmOpen)}
        onStepClick={(step) =>
          onOpenDetail({
            type: 'step',
            routineType: 'PM',
            id: step.id,
            name: step.step,
            completed: step.completed,
          })
        }
        onToggleStep={(stepId) => onToggleStep('PM', stepId)}
      />
    </div>
  );
}
