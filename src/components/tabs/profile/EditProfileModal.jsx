import React, { useState } from 'react';

export default function EditProfileModal({
  isOpen,
  profile,
  onClose,
  onSave,
}) {
  const [name, setName] = useState(() => profile?.name || '');
  const [goal, setGoal] = useState(() => profile?.goal || '');
  const [age, setAge] = useState(() => (profile?.age ?? '').toString());
  const [height, setHeight] = useState(() => (profile?.height ?? '').toString());
  const [weight, setWeight] = useState(() => (profile?.weight ?? '').toString());
  const [targetWeight, setTargetWeight] = useState(() => (profile?.targetWeight ?? '').toString());

  if (!isOpen || !profile) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parseNum = (val) => {
      const trimmed = String(val ?? '').trim();
      if (!trimmed) return null;
      const n = Number(trimmed);
      return !isNaN(n) && n > 0 ? n : null;
    };

    onSave({
      name: name.trim() || profile.name,
      goal: goal.trim() || profile.goal,
      age: parseNum(age) ?? profile.age,
      height: parseNum(height),
      weight: parseNum(weight),
      targetWeight: parseNum(targetWeight),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-pill" />
        <h3 className="modal-title">Edit User Profile</h3>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Fitness / Health Goal</label>
            <input
              type="text"
              className="input-field"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Lean Muscle & Metabolic Health"
              required
            />
          </div>

          <div className="input-row-grid">
            <div className="input-group">
              <label className="input-label">Age</label>
              <input
                type="number"
                className="input-field"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Height (cm)</label>
              <input
                type="number"
                className="input-field"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-row-grid">
            <div className="input-group">
              <label className="input-label">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
