"use client";

import React from 'react';
import styles from './SectionBlock.module.css';

export default function SectionBlock({ sectionPrefix, onClick, sectionData }) {
  // Calcula el progreso desde los datos recibidos como props (vienen de Firestore en tiempo real)
  let totalScore = 0;
  const MAX_SCORE = 16; // 8 ubicaciones x 2 checks (auditoría y certificación)

  if (sectionData) {
    Object.values(sectionData).forEach(locData => {
      if (locData && locData.audit) totalScore += 1;
      if (locData && locData.cert) totalScore += 1;
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
    </div>
  );
}
