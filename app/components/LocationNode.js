"use client";

import React from 'react';
import styles from './LocationNode.module.css';
import { saveAudit, saveCert } from '../../lib/db';

export default function LocationNode({ locationId, locationData, onRequestSignature }) {
  // Los datos vienen de Firestore en tiempo real a través de props
  const auditData = locationData?.audit || null;
  const certData = locationData?.cert || null;

  const handleAuditClick = () => {
    if (auditData) return; // Ya está auditado
    onRequestSignature('Auditado', locationId, async (name, errorRate, dateStr) => {
      await saveAudit(locationId, { name, date: dateStr });
    });
  };

  const handleCertClick = () => {
    if (certData) return; // Ya está certificado
    onRequestSignature('Certificado', locationId, async (name, errorRate, dateStr) => {
      await saveCert(locationId, { name, errorRate, date: dateStr });
    });
  };

  return (
    <div className={`${styles.node} ${auditData ? styles.audited : ''} ${certData ? styles.certified : ''}`}>
      <div className={styles.idWrapper}>
        <span className={styles.locationId}>{locationId}</span>
      </div>
      
      <div className={styles.checksContainer}>
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
