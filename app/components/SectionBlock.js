"use client";

import React from 'react';
import styles from './SectionBlock.module.css';

export default function SectionBlock({ sectionPrefix, onClick, sectionData }) {
  // Calcula el progreso desde los datos recibidos como props (vienen de Firestore en tiempo real)
  let totalScore = 0;
  let pendingCount = 0; // Auditadas sin certificar
  const MAX_SCORE = 16;

  if (sectionData) {
    Object.values(sectionData).forEach(locData => {
      if (locData && locData.audit) totalScore += 1;
      if (locData && locData.cert) totalScore += 1;
      if (locData && locData.audit && !locData.cert) pendingCount += 1;
    });
  }

  const progress = Math.round((totalScore / MAX_SCORE) * 100);

  return (
    <div className={styles.sectionNode} onClick={() => onClick(sectionPrefix)}>
      <div className={styles.progressBackground} style={{ width: `${progress}%` }}></div>
      <div className={styles.content}>
        <span className={styles.title}>{sectionPrefix}</span>
        <span className={styles.percentage}>{progress}%</span>
      </div>
      {pendingCount > 0 && (
        <div className={styles.pendingDot} title={`${pendingCount} ubicación(es) pendiente(s) de certificar`}>
          {pendingCount}
        </div>
      )}
    </div>
  );
}
