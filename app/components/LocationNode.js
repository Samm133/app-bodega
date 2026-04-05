"use client";

import React, { useState, useEffect } from 'react';
import styles from './LocationNode.module.css';

export default function LocationNode({ locationId, onRequestSignature, onUpdate }) {
  const [auditData, setAuditData] = useState(null);
  const [certData, setCertData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`loc_${locationId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.audit) setAuditData(parsed.audit);
        if (parsed.cert) setCertData(parsed.cert);
      } catch (e) {
        console.error("Error parsing localstorage data");
      }
    }
  }, [locationId]);

  useEffect(() => {
    if (auditData || certData) {
      localStorage.setItem(`loc_${locationId}`, JSON.stringify({
        audit: auditData,
        cert: certData
      }));
      if (onUpdate) onUpdate();
    }
  }, [auditData, certData, locationId]);

  const handleAuditClick = () => {
    onRequestSignature('Auditado', locationId, (name, errorRate, dateStr) => {
      setAuditData({ name, date: dateStr });
    });
  };

  const handleCertClick = () => {
    onRequestSignature('Certificado', locationId, (name, errorRate, dateStr) => {
      setCertData({ name, errorRate, date: dateStr });
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
