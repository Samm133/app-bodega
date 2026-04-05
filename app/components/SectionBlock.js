"use client";

import React, { useState, useEffect } from 'react';
import styles from './SectionBlock.module.css';

export default function SectionBlock({ sectionPrefix, onClick, refreshVersion }) {
  const [progress, setProgress] = useState(0);

  // Calcula el progreso leyendo del localStorage
  useEffect(() => {
    let totalScore = 0;
    const MAX_SCORE = 16; // 8 casillas x 2 checks (auditoría y certificación)

    for (let i = 1; i <= 8; i++) {
        const suffix = String(i).padStart(3, '0');
        const locId = `${sectionPrefix}/${suffix}`;
        const saved = localStorage.getItem(`loc_${locId}`);
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.audit) totalScore += 1;
                if (parsed.cert)  totalScore += 1;
            } catch (e) {
                // Ignore parse errors
            }
        }
    }

    const percentage = Math.round((totalScore / MAX_SCORE) * 100);
    setProgress(percentage);
  }, [sectionPrefix, refreshVersion]);

  // Color gradient: starts grey bg, turns greener/more vibrant as it completes
  // We can interpolate or use simple distinct classes. 
  // Let's use inline styles to set a CSS custom property or width for a progress bar.
  
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
