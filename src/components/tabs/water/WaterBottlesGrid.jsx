import React from 'react';

export default function WaterBottlesGrid({
  bottles = [],
  onTouchStart,
  onTouchEnd,
}) {
  return (
    <div className="blue-section">
      <div className="blue-section-header">
        <h3 className="blue-section-title">5 Bottles</h3>
        <span className="blue-section-hint">Hold bottle to remove water</span>
      </div>

      <div className="blue-bottles-row">
        {bottles.map((b) => (
          <div
            key={b.index}
            className={`blue-bottle-wrapper ${b.isActive ? 'active' : 'inactive'} ${
              b.filledMl > 0 ? 'has-water' : ''
            }`}
            onMouseDown={() => onTouchStart(b)}
            onMouseUp={() => onTouchEnd(b)}
            onMouseLeave={() => onTouchEnd(b)}
            onTouchStart={() => onTouchStart(b)}
            onTouchEnd={() => onTouchEnd(b)}
            onTouchCancel={() => onTouchEnd(b)}
            title={
              b.filledMl > 0
                ? `Bottle ${b.index}: ${b.filledMl}ml (Long-press to remove)`
                : `Bottle ${b.index}`
            }
          >
            {/* Bottle Cap */}
            <div className="blue-bottle-cap" />

            {/* Bottle Body */}
            <div className="blue-bottle-body">
              {/* Liquid Fill */}
              <div
                className="blue-bottle-fill"
                style={{ height: `${b.fillPercent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
