import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function AddSkincareStepModal({
  isOpen,
  initialRoutine = 'AM',
  onClose,
  onAdd,
}) {
  const [targetRoutine, setTargetRoutine] = useState(initialRoutine);
  const [newStepName, setNewStepName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newStepName.trim()) return;
    onAdd(targetRoutine, newStepName.trim());
    setNewStepName('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-pill" />
        <h3 className="modal-title">Add Skincare Step</h3>
        <form onSubmit={handleSubmit}>
          {/* Routine Selector (Morning vs Evening) */}
          <div className="input-group">
            <label className="input-label">Select Routine</label>
            <div className="routine-select-row">
              <button
                type="button"
                className={`routine-select-btn ${targetRoutine === 'AM' ? 'active' : ''}`}
                onClick={() => setTargetRoutine('AM')}
              >
                <Sun size={15} /> Morning
              </button>
              <button
                type="button"
                className={`routine-select-btn ${targetRoutine === 'PM' ? 'active' : ''}`}
                onClick={() => setTargetRoutine('PM')}
              >
                <Moon size={15} /> Evening
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Product / Step Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Squalane Oil, Exfoliating Toner"
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-care">
              Add to {targetRoutine === 'AM' ? 'Morning' : 'Evening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
