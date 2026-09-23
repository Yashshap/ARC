import React, { useState, useRef } from 'react';
import { Upload, FileJson, CheckCircle2 } from 'lucide-react';

export default function ImportDataModal({ isOpen, onClose, onImport }) {
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setImportError('');

    const reader = new window.FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text === 'string') {
          // Verify valid JSON
          JSON.parse(text);
          setImportJsonText(text);
        }
      } catch {
        setImportError('Selected file is not valid JSON. Please pick a valid ARC backup file.');
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!importJsonText.trim()) {
      setImportError('Please select a backup file or paste your backup JSON.');
      return;
    }

    setIsProcessing(true);
    setImportError('');

    try {
      const parsed = JSON.parse(importJsonText);
      const success = await onImport(parsed);
      if (success) {
        setImportJsonText('');
        setSelectedFileName('');
        onClose();
      } else {
        setImportError('Invalid backup file structure. Ensure this is an ARC or VitalSync backup.');
      }
    } catch {
      setImportError('Invalid JSON format. Please verify your backup file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-pill" />
        <h3 className="modal-title">Restore / Import Data</h3>
        <p className="modal-description">
          Restore your full history, workouts, meals, and settings from a previously saved backup file.
        </p>

        {/* Hidden native file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".json,application/json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Primary Option: Choose Backup File */}
        <div className="file-picker-box" style={{ marginBottom: '16px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '14px',
              borderStyle: 'dashed',
              borderWidth: '2px',
              borderColor: selectedFileName ? 'var(--color-success)' : 'var(--border-strong)',
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
            }}
          >
            {selectedFileName ? (
              <>
                <CheckCircle2 size={18} className="text-success" />
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                  {selectedFileName}
                </span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Select Backup File (.json)</span>
              </>
            )}
          </button>
        </div>

        {/* Alternative: Or paste raw JSON */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileJson size={14} />
              <span>Or Paste JSON Text</span>
            </label>
            <textarea
              className="input-field json-textarea"
              rows="6"
              placeholder="Paste backup JSON content here..."
              value={importJsonText}
              onChange={(e) => {
                setImportJsonText(e.target.value);
                setImportError('');
              }}
            />
          </div>

          {importError && (
            <p className="error-text" style={{ marginBottom: '14px', color: 'var(--color-danger)' }}>
              {importError}
            </p>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isProcessing || !importJsonText.trim()}
            >
              {isProcessing ? 'Restoring...' : 'Restore Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
