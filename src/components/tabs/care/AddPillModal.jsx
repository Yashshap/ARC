import React, { useState } from 'react';

export default function AddPillModal({
  isOpen,
  onClose,
  onAdd,
}) {
  const [pillName, setPillName] = useState('');
  const [pillDosage, setPillDosage] = useState('');
  const [pillTime, setPillTime] = useState('09:00 AM');
  const [pillWithFood, setPillWithFood] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pillName.trim()) return;
    onAdd({
      name: pillName.trim(),
      dosage: pillDosage.trim() || '1 dose',
      time: pillTime,
      withFood: pillWithFood,
    });
    setPillName('');
    setPillDosage('');
    setPillTime('09:00 AM');
    setPillWithFood(true);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-pill" />
        <h3 className="modal-title">Add Pill / Supplement</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Supplement / Medication Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Vitamin C (1000mg)"
              value={pillName}
              onChange={(e) => setPillName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-row-grid">
            <div className="input-group">
              <label className="input-label">Dosage</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., 1 tablet, 2 capsules"
                value={pillDosage}
                onChange={(e) => setPillDosage(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Scheduled Time</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 08:30 AM"
                value={pillTime}
                onChange={(e) => setPillTime(e.target.value)}
              />
            </div>
          </div>

          <div className="checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={pillWithFood}
                onChange={(e) => setPillWithFood(e.target.checked)}
              />
              <span>Must be taken with food / meals</span>
            </label>
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
              Save Pill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
