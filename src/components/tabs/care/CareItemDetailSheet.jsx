import React, { useState } from 'react';
import { Sun, Moon, Pill, X, Check, Trash2, Pencil } from 'lucide-react';

export default function CareItemDetailSheet({
  sheetItem,
  onClose,
  onSaveStep,
  onSavePill,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentName, setCurrentName] = useState(() => sheetItem?.name || '');
  const [currentTime, setCurrentTime] = useState(() => sheetItem?.time || '');
  const [editedName, setEditedName] = useState(() => sheetItem?.name || '');
  const [editedTime, setEditedTime] = useState(() => sheetItem?.time || '');

  if (!sheetItem) return null;

  const handleStartEdit = () => {
    setEditedName(currentName);
    setEditedTime(currentTime);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedName(currentName);
    setEditedTime(currentTime);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!editedName.trim()) return;
    const trimmedName = editedName.trim();
    const trimmedTime = editedTime.trim() || currentTime || '09:00 AM';

    if (sheetItem.type === 'step') {
      onSaveStep(sheetItem.routineType, sheetItem.id, trimmedName);
      setCurrentName(trimmedName);
    } else if (sheetItem.type === 'pill') {
      onSavePill(sheetItem.id, { name: trimmedName, time: trimmedTime });
      setCurrentName(trimmedName);
      setCurrentTime(trimmedTime);
    }
    setIsEditing(false);
  };

  const handleDeleteItem = () => {
    onDelete(sheetItem);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card item-bottom-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-drag-pill" />

        <div className="sheet-header-row">
          <div className="sheet-badge-tag">
            {sheetItem.type === 'step' ? (
              sheetItem.routineType === 'AM' ? (
                <>
                  <Sun size={14} className="badge-icon-sun" /> Morning Skincare Step
                </>
              ) : (
                <>
                  <Moon size={14} className="badge-icon-moon" /> Evening Skincare Step
                </>
              )
            ) : (
              <>
                <Pill size={14} className="badge-icon-pill" /> Pill & Vitamin
              </>
            )}
          </div>
          <button
            type="button"
            className="btn-modal-close-round"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sheet-field-container">
          <div className="input-group">
            <label className="input-label">
              {sheetItem.type === 'step' ? 'Step Name' : 'Medication Name'}
            </label>

            {isEditing ? (
              <input
                type="text"
                className="input-field sheet-name-input-active"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter name..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                }}
              />
            ) : (
              <div className="sheet-name-display-box">
                <span className="sheet-name-text">{currentName}</span>
              </div>
            )}
          </div>

          {/* In pills: When editing, show option to edit scheduled time */}
          {sheetItem.type === 'pill' &&
            (isEditing ? (
              <div className="input-group">
                <label className="input-label">Scheduled Time</label>
                <input
                  type="text"
                  className="input-field sheet-name-input-active"
                  value={editedTime}
                  onChange={(e) => setEditedTime(e.target.value)}
                  placeholder="e.g. 09:00 AM"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveEdit();
                    }
                  }}
                />
              </div>
            ) : (
              <div className="sheet-context-info">
                {sheetItem.taken ? (
                  <span className="sheet-sub-timestamp">
                    Taken at {sheetItem.takenAt || currentTime}
                  </span>
                ) : (
                  <span className="sheet-sub-timestamp pending">
                    Scheduled for {currentTime}
                    {sheetItem.dosage ? ` • ${sheetItem.dosage}` : ''}
                  </span>
                )}
              </div>
            ))}
        </div>

        <div className="sheet-actions-row">
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn btn-secondary sheet-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-care sheet-btn btn-save"
                onClick={handleSaveEdit}
                disabled={!editedName.trim()}
              >
                <Check size={16} /> Save
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-danger sheet-btn"
                onClick={handleDeleteItem}
              >
                <Trash2 size={16} /> Delete
              </button>
              <button
                type="button"
                className="btn btn-secondary sheet-btn"
                onClick={handleStartEdit}
              >
                <Pencil size={16} /> Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
