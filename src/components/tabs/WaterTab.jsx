import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import WaterHeaderHero from './water/WaterHeaderHero';
import WaterBottlesGrid from './water/WaterBottlesGrid';
import WaterQuickLogGrid from './water/WaterQuickLogGrid';
import WaterLogsCollapsible from './water/WaterLogsCollapsible';
import WaterBottleEditModal from './water/WaterBottleEditModal';

export default function WaterTab() {
  const { data, addWater, removeWaterLog, decreaseWater, setWaterTarget } = useApp();
  const { target, current, logs } = data.water;

  // Goal in Liters: 3, 4, or 5
  const currentGoalLiters = Math.min(5, Math.max(3, Math.round(target / 1000))) || 3;

  // Collapsible state for logs
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // Selected glass for quick filling
  const [selectedGlass, setSelectedGlass] = useState(250);

  // Long-press modal state
  const [selectedBottleForEdit, setSelectedBottleForEdit] = useState(null);
  const longPressTimerRef = useRef(null);

  const handleSelectGoal = (liters) => {
    setWaterTarget(liters * 1000);
  };

  const handleAddGlass = (amount, label) => {
    setSelectedGlass(amount);
    addWater(amount, label);
  };

  const handleTouchStart = (bottle) => {
    longPressTimerRef.current = setTimeout(() => {
      if (bottle.filledMl > 0) {
        setSelectedBottleForEdit(bottle);
      }
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handleRemoveWaterAmount = (amountToRemove) => {
    decreaseWater(amountToRemove);
    setSelectedBottleForEdit(null);
  };

  // Metric calculations
  const totalLitersTarget = currentGoalLiters;
  const currentLiters = (current / 1000).toFixed(2);
  const remainingMl = Math.max(0, currentGoalLiters * 1000 - current);
  const totalPercentage = Math.min(
    100,
    Math.round((current / (currentGoalLiters * 1000)) * 100)
  );

  // 5 Bottles calculation (1,000 ml per bottle)
  const bottles = [1, 2, 3, 4, 5].map((bottleIndex) => {
    const isActive = bottleIndex <= currentGoalLiters;
    const bottleStartMl = (bottleIndex - 1) * 1000;

    let filledMl = 0;
    if (current >= bottleIndex * 1000) {
      filledMl = 1000;
    } else if (current > bottleStartMl) {
      filledMl = current - bottleStartMl;
    }

    const fillPercent = Math.min(100, Math.round((filledMl / 1000) * 100));

    return {
      index: bottleIndex,
      isActive,
      filledMl,
      fillPercent,
    };
  });

  return (
    <div className="tab-container blue-minimal-tab">
      {/* Header with Title & Goal Selector */}
      <WaterHeaderHero
        currentGoalLiters={currentGoalLiters}
        onSelectGoal={handleSelectGoal}
        totalPercentage={totalPercentage}
        currentLiters={currentLiters}
        totalLitersTarget={totalLitersTarget}
        remainingMl={remainingMl}
      />

      {/* 5 Bottles Display */}
      <WaterBottlesGrid
        bottles={bottles}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />

      {/* Quick Log Glasses Grid */}
      <WaterQuickLogGrid
        selectedGlass={selectedGlass}
        onSelectAndAdd={handleAddGlass}
      />

      {/* Collapsible Logs Section */}
      <WaterLogsCollapsible
        logs={logs}
        isOpen={isLogsOpen}
        onToggleOpen={() => setIsLogsOpen(!isLogsOpen)}
        onRemoveLog={removeWaterLog}
      />

      {/* Long-Press Bottle Edit Modal */}
      {selectedBottleForEdit && (
        <WaterBottleEditModal
          selectedBottle={selectedBottleForEdit}
          onClose={() => setSelectedBottleForEdit(null)}
          onRemoveAmount={handleRemoveWaterAmount}
        />
      )}
    </div>
  );
}
