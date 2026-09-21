import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Pill, Sun, Moon, Plus, Trash2, Check, Clock, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

export default function CareAndPillsTab() {
  const {
    data,
    toggleSkinStep,
    addSkinStep,
    togglePillTaken,
    addPill,
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

  // Long-press options state for pills
  const longPressTimerRef = useRef(null);
  const isLongPressTriggered = useRef(false);
  const [selectedPillForOptions, setSelectedPillForOptions] = useState(null);

  // Pill confirmation modal state (taking or undoing)
  const [pillConfirmation, setPillConfirmation] = useState(null);

  const handlePillTouchStart = (pill) => {
    isLongPressTriggered.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      setSelectedPillForOptions(pill);
    }, 450);
  };

  const handlePillTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handlePillActionClick = (pill) => {
    if (pill.taken) {
      setPillConfirmation({
        pill,
        action: 'undo',
        title: 'Undo Medicine',
        message: `Are you sure you want to mark ${pill.name} as not taken?`,
        sub: pill.takenAt ? `Recorded as taken at ${pill.takenAt}` : (pill.time ? `Scheduled for ${pill.time}` : null),
        confirmText: 'Yes, Mark Not Taken',
        cancelText: 'Cancel'
      });
    } else {
      setPillConfirmation({
        pill,
        action: 'take',
        title: 'Take Medicine',
        message: `Have you taken ${pill.name}?`,
        sub: `Scheduled for ${pill.time}${pill.dosage ? ` • ${pill.dosage}` : ''}`,
        confirmText: 'Yes, Taken',
        cancelText: 'Cancel'
      });
    }
  };

  const handlePillCardClick = (pill) => {
    if (isLongPressTriggered.current) {
      return;
    }
    handlePillActionClick(pill);
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
                      onClick={() => toggleSkinStep('AM', step.id)}
                    >
                      <div className={`step-check-circle ${step.completed ? 'checked' : ''}`}>
                        {step.completed ? <Check size={14} /> : <span className="step-num">{idx + 1}</span>}
                      </div>

                      <div className="step-info">
                        <div className="step-row-inline">
                          <span className="step-name" title={step.step}>
                            {step.step}
                          </span>
                          {step.time && (
                            <span className="step-time-inline">({step.time})</span>
                          )}
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
                      onClick={() => toggleSkinStep('PM', step.id)}
                    >
                      <div className={`step-check-circle ${step.completed ? 'checked' : ''}`}>
                        {step.completed ? <Check size={14} /> : <span className="step-num">{idx + 1}</span>}
                      </div>

                      <div className="step-info">
                        <div className="step-row-inline">
                          <span className="step-name" title={step.step}>
                            {step.step}
                          </span>
                          {step.time && (
                            <span className="step-time-inline">({step.time})</span>
                          )}
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

          {/* Pills List - Clean minimalist cards with long-press for options */}
          <div className="pills-list">
            {data.care.pills.map((pill) => (
              <div
                key={pill.id}
                className={`pill-card-compact glass-card ${pill.taken ? 'pill-taken' : ''}`}
                onMouseDown={() => handlePillTouchStart(pill)}
                onMouseUp={handlePillTouchEnd}
                onMouseLeave={handlePillTouchEnd}
                onTouchStart={() => handlePillTouchStart(pill)}
                onTouchEnd={handlePillTouchEnd}
                onTouchCancel={handlePillTouchEnd}
                onClick={() => handlePillCardClick(pill)}
                role="button"
                tabIndex={0}
              >
                <div className="pill-info-compact">
                  <span className="pill-name">{pill.name}</span>
                </div>

                <div className="pill-actions-compact">
                  <button
                    type="button"
                    className={`btn-pill-action ${pill.taken ? 'btn-pill-taken' : 'btn-pill-take'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLongPressTriggered.current) return;
                      handlePillActionClick(pill);
                    }}
                    title={pill.taken ? `Taken at ${pill.takenAt || pill.time}. Click to undo.` : `Scheduled for ${pill.time}. Click to confirm taking.`}
                  >
                    {pill.taken ? (
                      <>
                        <Check size={13} /> {pill.takenAt || pill.time}
                      </>
                    ) : (
                      <>
                        <Clock size={13} /> {pill.time}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pill Long-Press Action Modal (Options like Delete or Not Taken) */}
      {selectedPillForOptions && (
        <div className="modal-overlay" onClick={() => setSelectedPillForOptions(null)}>
          <div className="modal-content glass-card pill-options-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            <div className="modal-header-clean">
              <h3 className="modal-title">{selectedPillForOptions.name}</h3>
              <span className="pill-options-status">
                Status: {selectedPillForOptions.taken ? `Taken at ${selectedPillForOptions.takenAt || selectedPillForOptions.time}` : `Scheduled for ${selectedPillForOptions.time}`}
              </span>
            </div>

            <div className="pill-options-list">
              {selectedPillForOptions.taken ? (
                <button
                  type="button"
                  className="btn btn-outline-warning pill-option-btn"
                  onClick={() => {
                    const p = selectedPillForOptions;
                    setSelectedPillForOptions(null);
                    handlePillActionClick(p);
                  }}
                >
                  <RotateCcw size={16} /> Mark as Not Taken
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-care pill-option-btn"
                  onClick={() => {
                    const p = selectedPillForOptions;
                    setSelectedPillForOptions(null);
                    handlePillActionClick(p);
                  }}
                >
                  <Check size={16} /> Mark as Taken
                </button>
              )}

              <button
                type="button"
                className="btn btn-danger pill-option-btn"
                onClick={() => {
                  removePill(selectedPillForOptions.id);
                  setSelectedPillForOptions(null);
                }}
              >
                <Trash2 size={16} /> Delete Medication
              </button>

              <button
                type="button"
                className="btn btn-ghost pill-option-btn"
                onClick={() => setSelectedPillForOptions(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pill Confirmation Modal (Take or Undo) */}
      {pillConfirmation && (
        <div className="modal-overlay" onClick={() => setPillConfirmation(null)}>
          <div className="modal-content glass-card pill-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-pill" />
            <div
              className="pill-confirm-icon-wrap"
              style={{
                background: pillConfirmation.action === 'undo' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                color: pillConfirmation.action === 'undo' ? '#f59e0b' : '#c084fc'
              }}
            >
              {pillConfirmation.action === 'undo' ? <RotateCcw size={26} /> : <Check size={26} />}
            </div>
            <h3 className="pill-confirm-title">{pillConfirmation.title}</h3>
            <p className="pill-confirm-message">{pillConfirmation.message}</p>
            {pillConfirmation.sub && (
              <span className="pill-confirm-sub">{pillConfirmation.sub}</span>
            )}
            <div className="pill-confirm-actions">
              <button
                type="button"
                className="btn btn-secondary pill-confirm-btn"
                onClick={() => setPillConfirmation(null)}
              >
                {pillConfirmation.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                className={`btn ${pillConfirmation.action === 'undo' ? 'btn-warning' : 'btn-care'} pill-confirm-btn`}
                onClick={() => {
                  togglePillTaken(pillConfirmation.pill.id);
                  setPillConfirmation(null);
                }}
              >
                {pillConfirmation.confirmText}
              </button>
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
