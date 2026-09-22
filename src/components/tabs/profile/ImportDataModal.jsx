import React, { useState } from 'react';

export default function ImportDataModal({ isOpen, onClose, onImport }) {
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJsonText);
      const success = await onImport(parsed);
      if (success) {
        setImportJsonText('');
        setImportError('');
        onClose();
      } else {
        setImportError('Invalid backup file structure.');
      }
    } catch {
      setImportError('Invalid JSON format. Please verify your backup file.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-pill" />
        <h3 className="modal-title">Restore / Import Data</h3>
        <p className="modal-description">
          Paste the JSON data from your previous export below:
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <textarea
              className="input-field json-textarea"
              rows="8"
              placeholder="Paste JSON here..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              required
              autoFocus
            />
          </div>

          {importError && <p className="error-text">{importError}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Import Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
