import React from 'react';

export default function CalorieAnalyticsChart({ diet }) {
  if (!diet || !diet.weeklyHistory) return null;

  const maxCalVal = Math.max(
    ...diet.weeklyHistory.map(h => h.calories),
    diet.targetCalories || 2500,
    2500
  );
  const targetY = 140 - ((diet.targetCalories || 2500) / maxCalVal) * 110;

  return (
    <div className="section-block">
      <div className="section-heading-outside">
        <h3 className="section-outside-title">Caloric Intake</h3>
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
              stroke="var(--color-diet-light)"
              strokeDasharray="4 4"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <text x="302" y={targetY + 4} fill="var(--text-muted)" fontSize="8">
              {diet.targetCalories}
            </text>

            {/* Bars for each day */}
            {diet.weeklyHistory.map((item, idx) => {
              const x = 32 + idx * 38;
              const barHeight = Math.max(4, (item.calories / maxCalVal) * 110);
              const y = 140 - barHeight;

              return (
                <g key={item.day}>
                  <rect
                    x={x}
                    y={y}
                    width="20"
                    height={barHeight}
                    rx="4"
                    fill="url(#dietGradientAnalytics)"
                    className="chart-bar"
                  />
                  <text
                    x={x + 10}
                    y={y - 4}
                    fill="var(--text-secondary)"
                    fontSize="7"
                    textAnchor="middle"
                  >
                    {item.calories}
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

            <defs>
              <linearGradient id="dietGradientAnalytics" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-diet-light)" />
                <stop offset="100%" stopColor="var(--color-diet)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
