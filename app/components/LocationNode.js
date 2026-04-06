"use client";

import React, { useState } from 'react';
import styles from './LocationNode.module.css';
import { saveAudit, saveCert, resetLocation } from '../../lib/db';

export default function LocationNode({ locationId, locationData, onRequestSignature }) {
  const [confirming, setConfirming] = useState(false);

  // Los datos vienen de Firestore en tiempo real a través de props
  const auditData = locationData?.audit || null;
  const certData = locationData?.cert || null;
  const hasData = auditData || certData;
  const pendingCert = auditData && !certData; // Auditado pero sin certificar

  const handleAuditClick = () => {
    if (auditData) return;
    onRequestSignature('Auditado', locationId, async (name, errorRate, dateStr) => {
      await saveAudit(locationId, { name, date: dateStr });
    });
  };

  const handleCertClick = () => {
    if (certData) return;
    onRequestSignature('Certificado', locationId, async (name, errorRate, dateStr) => {
      await saveCert(locationId, { name, errorRate, date: dateStr });
    });
  };

  const handleResetClick = (e) => {
    e.stopPropagation();
    setConfirming(true);
  };

  const confirmReset = async (e) => {
    e.stopPropagation();
    await resetLocation(locationId);
    setConfirming(false);
  };

  const cancelReset = (e) => {
    e.stopPropagation();
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className={`${styles.node} ${styles.confirmingReset}`}>
        <div className={styles.confirmText}>¿Borrar datos de esta ubicación?</div>
        <div className={styles.confirmActions}>
          <button className={styles.btnCancel} onClick={cancelReset}>No</button>
          <button className={styles.btnReset} onClick={confirmReset}>Sí, borrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.node} ${auditData ? styles.audited : ''} ${certData ? styles.certified : ''} ${pendingCert ? styles.pendingCert : ''}`}>
      <div className={styles.idWrapper}>
        <span className={styles.locationId}>{locationId}</span>
      </div>
      
      <div className={styles.checksContainer}>
        {pendingCert && (
          <div className={styles.pendingBadge} title="Auditado — pendiente de certificar">
            ⚠
          </div>
        )}
        <div className={styles.checkWrapper} title={auditData ? `Auditado por: ${auditData.name}\n${auditData.date}` : 'Marcar como Auditado'}>
          <label className={styles.customCheckbox} onClick={(e) => { e.preventDefault(); handleAuditClick(); }}>
            <input type="checkbox" checked={!!auditData} readOnly />
            <span className={`${styles.checkmark} ${styles.auditMark}`}></span>
          </label>
        </div>

        <div className={styles.checkWrapper} title={certData ? `Certificado por: ${certData.name}\n${certData.date}\nError: ${certData.errorRate}%` : 'Marcar como Certificado'}>
          <label className={styles.customCheckbox} onClick={(e) => { e.preventDefault(); handleCertClick(); }}>
            <input type="checkbox" checked={!!certData} readOnly />
            <span className={`${styles.checkmark} ${styles.certMark}`}></span>
          </label>
        </div>

        {hasData && (
          <button
            className={styles.resetBtn}
            onClick={handleResetClick}
            title="Resetear esta ubicación"
          >
            ↺
          </button>
        )}
      </div>
      
      {(auditData || certData) && (
        <div className={styles.infoTooltip}>
          {auditData && (
            <div className={styles.tooltipLine}>
              <span className={styles.tagAudit}>A:</span> {auditData.name} <span className={styles.date}>{auditData.date.split(',')[0]}</span>
            </div>
          )}
          {certData && (
            <div className={styles.tooltipLine}>
              <span className={styles.tagCert}>C:</span> {certData.name} <span className={styles.date}>{certData.date.split(',')[0]}</span>
              {certData.errorRate !== undefined && certData.errorRate !== null && (
                <span style={{ marginLeft: '4px', color: '#f87171' }}>(Error: {certData.errorRate}%)</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
