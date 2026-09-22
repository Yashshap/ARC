import React from 'react';
import { Plus } from 'lucide-react';

export default function PillsSection({
  pills = [],
  onTogglePill,
  onOpenDetail,
  onOpenAddPill,
}) {
  const totalPills = pills.length;
  const takenPills = pills.filter(p => p.taken).length;
  const pillsPercent = totalPills > 0 ? Math.round((takenPills / totalPills) * 100) : 0;

  return (
    <div className="pills-section">
      {/* Progress bar in front of Add Pill button */}
      <div className="care-action-header-row glass-card">
        <div className="care-progress-compact">
          <div className="care-progress-compact-info">
            <span className="compact-progress-label">Today's Vitamins</span>
            <span className="compact-progress-val">
              {takenPills}/{totalPills} ({pillsPercent}%)
            </span>
          </div>
          <div className="care-progress-bar-track">
            <div
              className="care-progress-bar-fill"
              style={{ width: `${pillsPercent}%` }}
            />
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm btn-add-compact"
          onClick={onOpenAddPill}
        >
          <Plus size={14} /> Add Pill
        </button>
      </div>

      {/* Pills List */}
      <div className="pills-list">
        {pills.map((pill) => (
          <div
            key={pill.id}
            className={`pill-card-compact glass-card ${pill.taken ? 'pill-taken' : ''}`}
            onClick={() =>
              onOpenDetail({
                type: 'pill',
                id: pill.id,
                name: pill.name,
                dosage: pill.dosage,
                time: pill.time,
                taken: pill.taken,
                takenAt: pill.takenAt,
              })
            }
            role="button"
            tabIndex={0}
          >
            <div className="pill-info-compact">
              <span className={`pill-name ${pill.taken ? 'taken-text' : ''}`}>
                {pill.name}
              </span>
              <div className="item-sub-desc">
                {pill.taken ? (
                  <span className="item-sub-timestamp">
                    Taken at {pill.takenAt || pill.time}
                  </span>
                ) : (
                  <span className="item-sub-timestamp pending">
                    Scheduled for {pill.time}
                    {pill.dosage ? ` • ${pill.dosage}` : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Radio button to confirm pill taken */}
            <div
              className={`item-radio-wrap ${pill.taken ? 'checked' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePill(pill.id);
              }}
              role="radio"
              aria-checked={pill.taken}
              title={pill.taken ? 'Mark not taken' : 'Confirm taken'}
            >
              <div className={`item-radio-circle ${pill.taken ? 'checked' : ''}`}>
                {pill.taken && <div className="item-radio-dot" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
