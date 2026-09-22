import React from 'react';
import { Droplets, RotateCcw, Trash2 } from 'lucide-react';

export default function WaterBottleEditModal({
  selectedBottle,
  onClose,
  onRemoveAmount,
}) {
  if (!selectedBottle) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content blue-bottle-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-pill" />

        <div className="blue-modal-header">
          <div className="blue-modal-icon">
            <Droplets size={22} />
          </div>
          <div>
            <h3 className="modal-title" style={{ margin: 0 }}>
              Bottle #{selectedBottle.index}
            </h3>
            <span className="blue-modal-sub">
              Currently holds <strong>{selectedBottle.filledMl} ml</strong>
            </span>
          </div>
        </div>

        <p className="blue-modal-desc">
          Accidentally filled this bottle? Choose how much water to remove:
        </p>

        <div className="blue-modal-options">
          {/* Option 1: Empty entire bottle */}
          <button
            className="btn btn-water blue-modal-btn"
            onClick={() => onRemoveAmount(selectedBottle.filledMl)}
          >
            <RotateCcw size={16} />
            Empty this bottle (-{selectedBottle.filledMl} ml)
          </button>

          {/* Option 2: Remove 500ml if bottle has >= 500ml */}
          {selectedBottle.filledMl >= 500 &&
            selectedBottle.filledMl !== 500 && (
              <button
                className="btn btn-secondary blue-modal-btn"
                onClick={() => onRemoveAmount(500)}
              >
                <Trash2 size={16} />
                Remove 500 ml
              </button>
            )}

          {/* Option 3: Remove 250ml if bottle has >= 250ml */}
          {selectedBottle.filledMl >= 250 && (
            <button
              className="btn btn-secondary blue-modal-btn"
              onClick={() => onRemoveAmount(250)}
            >
              <Trash2 size={16} />
              Remove 250 ml
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{ marginTop: '6px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
