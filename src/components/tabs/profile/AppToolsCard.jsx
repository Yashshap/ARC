import React from 'react';
import { Smartphone, Download, Upload, RotateCcw } from 'lucide-react';

export default function AppToolsCard({
  onOpenAndroid,
  onExportData,
  onOpenImport,
  onResetData,
}) {
  return (
    <div className="section-block">
      <div className="section-heading-outside">
        <h3 className="section-outside-title">App Tools & Android Build</h3>
      </div>

      <div className="tools-card glass-card">
        <button className="tool-action-row" onClick={onOpenAndroid}>
          <div className="tool-icon-wrap android-icon">
            <Smartphone size={20} />
          </div>
          <div className="tool-info">
            <span className="tool-name">Wrap for Android (Capacitor)</span>
            <span className="tool-desc">View step-by-step commands to build APK</span>
          </div>
        </button>

        <div className="tool-divider" />

        <button className="tool-action-row" onClick={onExportData}>
          <div className="tool-icon-wrap export-icon">
            <Download size={20} />
          </div>
          <div className="tool-info">
            <span className="tool-name">Export Backup (JSON)</span>
            <span className="tool-desc">Save all your logs and routines locally</span>
          </div>
        </button>

        <div className="tool-divider" />

        <button className="tool-action-row" onClick={onOpenImport}>
          <div className="tool-icon-wrap import-icon">
            <Upload size={20} />
          </div>
          <div className="tool-info">
            <span className="tool-name">Restore / Import Data</span>
            <span className="tool-desc">Load backup JSON into your tracker</span>
          </div>
        </button>

        <div className="tool-divider" />

        <button
          className="tool-action-row text-danger"
          onClick={onResetData}
        >
          <div className="tool-icon-wrap reset-icon">
            <RotateCcw size={20} />
          </div>
          <div className="tool-info">
            <span className="tool-name">Reset All Data</span>
            <span className="tool-desc">Clear local storage and restore defaults</span>
          </div>
        </button>
      </div>
    </div>
  );
}
