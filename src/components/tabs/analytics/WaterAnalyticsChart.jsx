import React from 'react';

export default function WaterAnalyticsChart({ water }) {
  if (!water || !water.weeklyHistory) return null;

  const maxWaterVal = Math.max(
    ...water.weeklyHistory.map(h => h.amount),
    water.target || 3000,
    3000
  );
  const targetY = 140 - ((water.target || 3000) / maxWaterVal) * 110;

  return (
    <div className="section-block">
      <div className="section-heading-outside">
        <h3 className="section-outside-title">Water Intake</h3>
      </div>
      <div className="chart-card glass-card">
        <div className="chart-svg-wrap">
          <svg viewBox="0 0 320 160" className="analytics-svg">
            {/* Target Line */}
            <line
              x1="20"
              y1={targetY}
              x2="300"
              y2={targetY}
              stroke="var(--color-water-light)"
              strokeDasharray="4 4"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <text x="302" y={targetY + 4} fill="var(--text-muted)" fontSize="8">
              Goal
            </text>

            {/* Bars for each day */}
            {water.weeklyHistory.map((item, idx) => {
              const x = 32 + idx * 38;
              const barHeight = Math.max(4, (item.amount / maxWaterVal) * 110);
              const y = 140 - barHeight;
              const isGoalMet = item.amount >= item.target;

              return (
                <g key={item.day}>
                  <rect
                    x={x}
                    y={y}
                    width="20"
                    height={barHeight}
                    rx="4"
                    fill={isGoalMet ? 'var(--color-water-light)' : 'rgba(56, 189, 248, 0.4)'}
                    className="chart-bar"
                  />
                  <text
                    x={x + 10}
                    y={y - 4}
                    fill="var(--text-secondary)"
                    fontSize="7"
                    textAnchor="middle"
                  >
                    {item.amount >= 1000 ? `${(item.amount / 1000).toFixed(1)}L` : `${item.amount}ml`}
                  </text>
                  <text
                    x={x + 10}
                    y="154"
                    fill="var(--text-muted)"
                    fontSize="9"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {item.day}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
