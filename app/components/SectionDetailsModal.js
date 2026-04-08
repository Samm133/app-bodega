"use client";

import React from 'react';
import LocationNode from './LocationNode';
import styles from './SectionDetailsModal.module.css';

export default function SectionDetailsModal({ isOpen, sectionPrefix, onClose, onRequestSignature, locationsMap }) {
  if (!isOpen) return null;

  // Genera ubicaciones: 001/009 tiene 4, 003/001-005 tienen 10, las demás tienen 8
  const sectionsWith10 = ['003/001', '003/002', '003/003', '003/004', '003/005'];
  let locationCount = 8;
  if (sectionPrefix === '001/009') locationCount = 4;
  else if (sectionsWith10.includes(sectionPrefix)) locationCount = 10;
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
