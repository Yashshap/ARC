import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Pill, Sparkles } from 'lucide-react';
import SkincareSection from './care/SkincareSection';
import PillsSection from './care/PillsSection';
import CareItemDetailSheet from './care/CareItemDetailSheet';
import AddSkincareStepModal from './care/AddSkincareStepModal';
import AddPillModal from './care/AddPillModal';

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
    removePill,
  } = useApp();

  const [activeSegment, setActiveSegment] = useState('skincare'); // 'skincare' | 'pills'
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [addStepRoutine, setAddStepRoutine] = useState('AM');
  const [isAddPillOpen, setIsAddPillOpen] = useState(false);
  const [sheetItem, setSheetItem] = useState(null);

  const handleOpenAddStep = (routine = 'AM') => {
    setAddStepRoutine(routine);
    setIsAddStepOpen(true);
  };

  const handleDeleteItem = (item) => {
    if (!item) return;
    if (item.type === 'step') {
      removeSkinStep(item.routineType, item.id);
    } else if (item.type === 'pill') {
      removePill(item.id);
    }
  };

  const handleSaveStep = (routineType, id, newName) => {
    updateSkinStep(routineType, id, newName);
  };

  const handleSavePill = (id, updates) => {
    updatePill(id, updates);
  };

  const handleAddStep = (routineType, name) => {
    addSkinStep(routineType, name);
  };

  const handleAddPill = (pillData) => {
    addPill(pillData);
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
        <SkincareSection
          amSteps={data.care.skinRoutineAM || []}
          pmSteps={data.care.skinRoutinePM || []}
          onToggleStep={toggleSkinStep}
          onOpenDetail={setSheetItem}
          onOpenAddStep={handleOpenAddStep}
        />
      ) : (
        <PillsSection
          pills={data.care.pills || []}
          onTogglePill={togglePillTaken}
          onOpenDetail={setSheetItem}
          onOpenAddPill={() => setIsAddPillOpen(true)}
        />
      )}

      {/* Item Detail & Edit Sheet */}
      {sheetItem && (
        <CareItemDetailSheet
          key={`${sheetItem.type}_${sheetItem.id}`}
          sheetItem={sheetItem}
          onClose={() => setSheetItem(null)}
          onSaveStep={handleSaveStep}
          onSavePill={handleSavePill}
          onDelete={handleDeleteItem}
        />
      )}

      {/* Add Skincare Step Modal */}
      <AddSkincareStepModal
        key={isAddStepOpen ? addStepRoutine : 'closed'}
        isOpen={isAddStepOpen}
        initialRoutine={addStepRoutine}
        onClose={() => setIsAddStepOpen(false)}
        onAdd={handleAddStep}
      />

      {/* Add Pill Modal */}
      <AddPillModal
        key={isAddPillOpen ? 'open' : 'closed'}
        isOpen={isAddPillOpen}
        onClose={() => setIsAddPillOpen(false)}
        onAdd={handleAddPill}
      />
    </div>
  );
}
