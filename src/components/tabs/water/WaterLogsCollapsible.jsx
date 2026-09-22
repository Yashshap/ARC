import React from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export default function WaterLogsCollapsible({
  logs = [],
  isOpen,
  onToggleOpen,
  onRemoveLog,
}) {
  return (
    <div className="blue-section">
      <div className="blue-collapsible-card">
        <button
          className="blue-collapsible-trigger"
          onClick={onToggleOpen}
        >
          <div className="blue-collapsible-title-wrap">
            <span className="blue-collapsible-title">Today's Water Logs</span>
            <span className="blue-collapsible-count">{logs.length} entries</span>
          </div>
          <div className="blue-collapsible-arrow">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {isOpen && (
          <div className="blue-collapsible-content">
            {logs.length === 0 ? (
              <div className="blue-empty-state">
                <p>No intake recorded yet today.</p>
                <span>Tap any glass above to begin logging.</span>
              </div>
            ) : (
              <div className="blue-logs-list">
                {logs.map((item) => (
                  <div key={item.id} className="blue-log-row">
                    <div className="blue-log-left">
                      <div className="blue-log-dot" />
                      <div>
                        <span className="blue-log-label">{item.label}</span>
                        <span className="blue-log-time">{item.time}</span>
                      </div>
                    </div>

                    <div className="blue-log-right">
                      <span
                        className={`blue-log-amount ${
                          item.amount < 0 ? 'negative' : ''
                        }`}
                      >
                        {item.amount > 0 ? `+${item.amount}` : item.amount} ml
                      </span>
                      <button
                        className="blue-delete-btn"
                        onClick={() => onRemoveLog(item.id)}
                        title="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
