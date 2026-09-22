import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Pill, Sun, Moon, Plus, Trash2, Check, Clock, ChevronDown, ChevronUp, Pencil, X } from 'lucide-react';

export default function CareAndPillsTab() {
  const {
    data,
    toggleSkinStep,
    addSkinStep,
    removeSkinStep,
    updateSkinStep,
    togglePillTaken,
    addPill,
    updatePill,
    removePill
  } = useApp();

  const [activeSegment, setActiveSegment] = useState('skincare'); // 'skincare' | 'pills'

  // Collapsible cards state
  const [isAmOpen, setIsAmOpen] = useState(true);
  const [isPmOpen, setIsPmOpen] = useState(true);

  // Skincare modal state
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [targetRoutine, setTargetRoutine] = useState('AM'); // 'AM' | 'PM'
  const [newStepName, setNewStepName] = useState('');

  // Pill modal state
  const [isAddPillOpen, setIsAddPillOpen] = useState(false);
  const [pillName, setPillName] = useState('');
  const [pillDosage, setPillDosage] = useState('');
  const [pillTime, setPillTime] = useState('09:00 AM');
  const [pillWithFood, setPillWithFood] = useState(true);

  // Bottom Sheet state for viewing, editing, and deleting a step or pill
  const [sheetItem, setSheetItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedTime, setEditedTime] = useState('');

  const openDetailCard = (itemConfig) => {
    setSheetItem(itemConfig);
    setEditedName(itemConfig.name || '');
    setEditedTime(itemConfig.time || '');
    setIsEditing(false);
  };

  const closeDetailCard = () => {
    setSheetItem(null);
    setIsEditing(false);
    setEditedName('');
    setEditedTime('');
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (sheetItem) {
      setEditedName(sheetItem.name || '');
      setEditedTime(sheetItem.time || '');
    }
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!sheetItem || !editedName.trim()) return;
    const trimmedName = editedName.trim();
    const trimmedTime = editedTime.trim() || sheetItem.time || '09:00 AM';

    if (sheetItem.type === 'step') {
      updateSkinStep(sheetItem.routineType, sheetItem.id, trimmedName);
      setSheetItem(prev => ({ ...prev, name: trimmedName }));
    } else if (sheetItem.type === 'pill') {
      updatePill(sheetItem.id, { name: trimmedName, time: trimmedTime });
      setSheetItem(prev => ({ ...prev, name: trimmedName, time: trimmedTime }));
    }
    setIsEditing(false);
  };

  const handleDeleteItem = () => {
    if (!sheetItem) return;
    if (sheetItem.type === 'step') {
      removeSkinStep(sheetItem.routineType, sheetItem.id);
    } else if (sheetItem.type === 'pill') {
      removePill(sheetItem.id);
    }
    closeDetailCard();
  };

  // Skincare calculations
  const amSteps = data.care.skinRoutineAM || [];
  const amCompleted = amSteps.filter(s => s.completed).length;
  const amTotal = amSteps.length;

  const pmSteps = data.care.skinRoutinePM || [];
  const pmCompleted = pmSteps.filter(s => s.completed).length;
  const pmTotal = pmSteps.length;

  const totalSkinSteps = amTotal + pmTotal;
  const completedSkinSteps = amCompleted + pmCompleted;
  const skinPercent = totalSkinSteps > 0 ? Math.round((completedSkinSteps / totalSkinSteps) * 100) : 0;

  // Pills calculations
  const totalPills = data.care.pills.length;
  const takenPills = data.care.pills.filter(p => p.taken).length;
  const pillsPercent = totalPills > 0 ? Math.round((takenPills / totalPills) * 100) : 0;

  const handleAddStepSubmit = (e) => {
    e.preventDefault();
    if (!newStepName.trim()) return;
    addSkinStep(targetRoutine, newStepName.trim());
    setNewStepName('');
    setIsAddStepOpen(false);
  };

  const handleAddPillSubmit = (e) => {
    e.preventDefault();
    if (!pillName.trim()) return;
    addPill({
      name: pillName.trim(),
      dosage: pillDosage.trim() || '1 dose',
      time: pillTime,
      withFood: pillWithFood,
    });
    setPillName('');
    setPillDosage('');
    setIsAddPillOpen(false);
  };

  return (
    <div className="tab-container care-tab">
      {/* Top Segmented Control */}
      <div className="segmented-control care-segmented-switch">
        <button
          className={`segment-btn ${activeSegment === 'skincare' ? 'active' : ''}`}
          onClick={() => setActiveSegment('skincare')}
        >
          <Sparkles size={16} /> Skincare Routine
        </button>
        <button
          className={`segment-btn ${activeSegment === 'pills' ? 'active' : ''}`}
          onClick={() => setActiveSegment('pills')}
        >
          <Pill size={16} /> Pills & Vitamins
        </button>
      </div>

      {activeSegment === 'skincare' ? (
        /* ================= SKINCARE VIEW ================= */
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
              onClick={() => {
                setTargetRoutine('AM');
                setIsAddStepOpen(true);
              }}
            >
              <Plus size={14} /> Add Step
            </button>
          </div>

          {/* Collapsible Card 1: AM Routine (On Top) */}
          <div className="routine-collapsible-card glass-card">
            <div
              className="routine-collapse-header"
              onClick={() => setIsAmOpen(!isAmOpen)}
              role="button"
              tabIndex={0}
            >
              <div className="routine-collapse-title-group">
                <div className="routine-collapse-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <Sun size={18} />
                </div>
                <div>
                  <h3 className="routine-collapse-title">Morning Routine</h3>
                </div>
              </div>

              <div className="routine-collapse-right">
                <span className={`routine-badge-count ${amCompleted === amTotal && amTotal > 0 ? 'all-done' : ''}`}>
                  {amCompleted}/{amTotal}
                </span>
                <button className="btn-icon-xs" aria-label="Toggle Morning Routine">
                  {isAmOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {isAmOpen && (
              <div className="routine-collapse-body">
                <div className="care-steps-list">
                  {amSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`care-step-item glass-card ${step.completed ? 'completed' : ''}`}
                      onClick={() => openDetailCard({
                        type: 'step',
                        routineType: 'AM',
                        id: step.id,
                        name: step.step,
                        completed: step.completed,
                      })}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="step-num-badge">
                        <span className="step-num">{idx + 1}</span>
                      </div>

                      <div className="step-info">
                        <div className="step-row-inline">
                          <span className={`step-name ${step.completed ? 'completed-text' : ''}`} title={step.step}>
                            {step.step}
                          </span>
                        </div>
                      </div>

                      {/* Radio button to confirm completion */}
                      <div
                        className={`item-radio-wrap ${step.completed ? 'checked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSkinStep('AM', step.id);
                        }}
                        role="radio"
                        aria-checked={step.completed}
                        title={step.completed ? "Mark incomplete" : "Confirm completed"}
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

          {/* Collapsible Card 2: PM Routine (Below It) */}
          <div className="routine-collapsible-card glass-card">
            <div
              className="routine-collapse-header"
              onClick={() => setIsPmOpen(!isPmOpen)}
              role="button"
              tabIndex={0}
            >
              <div className="routine-collapse-title-group">
                <div className="routine-collapse-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                  <Moon size={18} />
                </div>
                <div>
                  <h3 className="routine-collapse-title">Evening Routine</h3>
                </div>
              </div>

              <div className="routine-collapse-right">
                <span className={`routine-badge-count ${pmCompleted === pmTotal && pmTotal > 0 ? 'all-done' : ''}`}>
                  {pmCompleted}/{pmTotal}
                </span>
                <button className="btn-icon-xs" aria-label="Toggle Evening Routine">
                  {isPmOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {isPmOpen && (
              <div className="routine-collapse-body">
                <div className="care-steps-list">
                  {pmSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`care-step-item glass-card ${step.completed ? 'completed' : ''}`}
                      onClick={() => openDetailCard({
                        type: 'step',
                        routineType: 'PM',
                        id: step.id,
                        name: step.step,
                        completed: step.completed,
                      })}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="step-num-badge">
                        <span className="step-num">{idx + 1}</span>
                      </div>

                      <div className="step-info">
                        <div className="step-row-inline">
                          <span className={`step-name ${step.completed ? 'completed-text' : ''}`} title={step.step}>
                            {step.step}
                          </span>
                        </div>
                      </div>

                      {/* Radio button to confirm completion */}
                      <div
                        className={`item-radio-wrap ${step.completed ? 'checked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSkinStep('PM', step.id);
                        }}
                        role="radio"
                        aria-checked={step.completed}
                        title={step.completed ? "Mark incomplete" : "Confirm completed"}
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
        </div>
      ) : (
        /* ================= PILLS & SUPPLEMENTS VIEW ================= */
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
              onClick={() => setIsAddPillOpen(true)}
            >
              <Plus size={14} /> Add Pill
            </button>
          </div>

          {/* Pills List - Tap card to view/edit/delete, radio button to confirm taken */}
          <div className="pills-list">
            {data.care.pills.map((pill) => (
              <div
                key={pill.id}
                className={`pill-card-compact glass-card ${pill.taken ? 'pill-taken' : ''}`}
                onClick={() => openDetailCard({
                  type: 'pill',
                  id: pill.id,
                  name: pill.name,
                  dosage: pill.dosage,
                  time: pill.time,
                  taken: pill.taken,
                  takenAt: pill.takenAt
                })}
                role="button"
                tabIndex={0}
              >
                <div className="pill-info-compact">
                  <span className={`pill-name ${pill.taken ? 'taken-text' : ''}`}>{pill.name}</span>
                  <div className="item-sub-desc">
                    {pill.taken ? (
                      <span className="item-sub-timestamp">
                        Taken at {pill.takenAt || pill.time}
                      </span>
                    ) : (
                      <span className="item-sub-timestamp pending">
                        Scheduled for {pill.time}{pill.dosage ? ` • ${pill.dosage}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Radio button to confirm pill taken */}
                <div
                  className={`item-radio-wrap ${pill.taken ? 'checked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePillTaken(pill.id);
                  }}
                  role="radio"
                  aria-checked={pill.taken}
                  title={pill.taken ? "Mark not taken" : "Confirm taken"}
                >
                  <div className={`item-radio-circle ${pill.taken ? 'checked' : ''}`}>
                    {pill.taken && <div className="item-radio-dot" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Sheet Card: View, Edit Name (Edit -> Save), and Delete */}
      {sheetItem && (
        <div className="modal-overlay" onClick={closeDetailCard}>
          <div className="modal-content glass-card item-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />

            <div className="sheet-header-row">
              <div className="sheet-badge-tag">
                {sheetItem.type === 'step' ? (
                  sheetItem.routineType === 'AM' ? (
                    <><Sun size={14} className="badge-icon-sun" /> Morning Skincare Step</>
                  ) : (
                    <><Moon size={14} className="badge-icon-moon" /> Evening Skincare Step</>
                  )
                ) : (
                  <><Pill size={14} className="badge-icon-pill" /> Pill & Vitamin</>
                )}
              </div>
              <button
                type="button"
                className="btn-modal-close-round"
                onClick={closeDetailCard}
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
                    <span className="sheet-name-text">{sheetItem.name}</span>
                  </div>
                )}
              </div>

              {/* In skincare: No timing or pending context */}
              {/* In pills: When editing, do not show taken at time; instead show option to edit scheduled time */}
              {sheetItem.type === 'pill' && (
                isEditing ? (
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
                        Taken at {sheetItem.takenAt || sheetItem.time}
                      </span>
                    ) : (
                      <span className="sheet-sub-timestamp pending">
                        Scheduled for {sheetItem.time}{sheetItem.dosage ? ` • ${sheetItem.dosage}` : ''}
                      </span>
                    )}
                  </div>
                )
              )}
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
      )}

      {/* Add Step Modal (Asks whether to add in Morning or Evening) */}
      {isAddStepOpen && (
        <div className="modal-overlay" onClick={() => setIsAddStepOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            <h3 className="modal-title">Add Skincare Step</h3>
            <form onSubmit={handleAddStepSubmit}>
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
                  onClick={() => setIsAddStepOpen(false)}
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
      )}

      {/* Add Pill Modal */}
      {isAddPillOpen && (
        <div className="modal-overlay" onClick={() => setIsAddPillOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            <h3 className="modal-title">Add Pill / Supplement</h3>
            <form onSubmit={handleAddPillSubmit}>
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
                  onClick={() => setIsAddPillOpen(false)}
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
      )}
    </div>
  );
}
