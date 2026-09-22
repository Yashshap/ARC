import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function RoutineCard({
  title,
  icon: Icon,
  iconBg,
  iconColor,
  steps,
  completedCount,
  totalCount,
  isOpen,
  onToggleOpen,
  onStepClick,
  onToggleStep,
}) {
  const isAllDone = completedCount === totalCount && totalCount > 0;

  return (
    <div className="routine-collapsible-card glass-card">
      <div
        className="routine-collapse-header"
        onClick={onToggleOpen}
        role="button"
        tabIndex={0}
      >
        <div className="routine-collapse-title-group">
          <div
            className="routine-collapse-icon-box"
            style={{ background: iconBg, color: iconColor }}
          >
            <Icon size={18} />
          </div>
          <div>
            <h3 className="routine-collapse-title">{title}</h3>
          </div>
        </div>

        <div className="routine-collapse-right">
          <span className={`routine-badge-count ${isAllDone ? 'all-done' : ''}`}>
            {completedCount}/{totalCount}
          </span>
          <button className="btn-icon-xs" aria-label={`Toggle ${title}`}>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="routine-collapse-body">
          <div className="care-steps-list">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`care-step-item glass-card ${step.completed ? 'completed' : ''}`}
                onClick={() => onStepClick(step)}
                role="button"
                tabIndex={0}
              >
                <div className="step-num-badge">
                  <span className="step-num">{idx + 1}</span>
                </div>

                <div className="step-info">
                  <div className="step-row-inline">
                    <span
                      className={`step-name ${step.completed ? 'completed-text' : ''}`}
                      title={step.step}
                    >
                      {step.step}
                    </span>
                  </div>
                </div>

                {/* Radio button to confirm completion */}
                <div
                  className={`item-radio-wrap ${step.completed ? 'checked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStep(step.id);
                  }}
                  role="radio"
                  aria-checked={step.completed}
                  title={step.completed ? 'Mark incomplete' : 'Confirm completed'}
                >
                  <div className={`item-radio-circle ${step.completed ? 'checked' : ''}`}>
                    {step.completed && <div className="item-radio-dot" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
