"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function SignatureModal({ isOpen, actionName, locationId, onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [errorRate, setErrorRate] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setName('');
      setErrorRate('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCertifying = actionName === 'Certificado';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim(), isCertifying ? Number(errorRate) || 0 : null);
      setName('');
      setErrorRate('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h2 className="modal-title">Firma Requerida</h2>
          <p className="modal-desc">
            Ingresa tu nombre para firmar la acción de <strong>{actionName}</strong> en la ubicación <strong>{locationId}</strong>.
          </p>
          
          <input
            ref={inputRef}
            type="text"
            className="modal-input"
            placeholder="Ej. Juan Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="off"
          />

          {isCertifying && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Porcentaje de Error (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="modal-input"
                style={{ marginBottom: '0' }}
                placeholder="Ej. 0.5"
                value={errorRate}
                onChange={(e) => setErrorRate(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm" disabled={!name.trim() || (isCertifying && errorRate === '')}>
              Firmar y Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
