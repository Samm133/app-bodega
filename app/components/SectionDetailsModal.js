"use client";

import React from 'react';
import LocationNode from './LocationNode';
import styles from './SectionDetailsModal.module.css';

export default function SectionDetailsModal({ isOpen, sectionPrefix, onClose, onRequestSignature, locationsMap }) {
  if (!isOpen) return null;

  // Genera ubicaciones: 001/009 tiene 4, las demás tienen 8
  const isLimitedSection = sectionPrefix === '001/009';
  const locationCount = isLimitedSection ? 4 : 8;
  const locations = Array.from({ length: locationCount }, (_, i) => {
    const suffix = String(i + 1).padStart(3, '0');
    return `${sectionPrefix}/${suffix}`;
  });

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Detalles de la Sección: {sectionPrefix}</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <p className={styles.modalDesc}>
          Por favor, revisa y firma cada una de las ubicaciones correspondientes a esta zona.
        </p>

        <div className={styles.gridContainer}>
          {locations.map(locId => {
            const docId = locId.replaceAll('/', '_');
            const locationData = locationsMap ? (locationsMap[docId] || {}) : {};
            return (
              <LocationNode 
                key={locId} 
                locationId={locId} 
                locationData={locationData}
                onRequestSignature={onRequestSignature} 
              />
            );
          })}
        </div>
        
        <div className={styles.modalActions}>
          <button type="button" className={styles.btnDone} onClick={onClose}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
