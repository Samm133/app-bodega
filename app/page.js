"use client";

import React, { useState, useEffect } from 'react';
import SectionBlock from './components/SectionBlock';
import SectionDetailsModal from './components/SectionDetailsModal';
import SignatureModal from './components/SignatureModal';
import styles from './page.module.css';
import { subscribeToLocations } from '../lib/db';

// Estructura matricial de la bodega
const gridData = [
  // Pasillo 1 (Fila 1) - Termina en 001/012 (antiguos 020)
  { id: '001/001', col: 2, row: 1 },
  { id: '001/002', col: 3, row: 1 },
  { id: '001/003', col: 4, row: 1 },
  { id: '001/004', col: 5, row: 1 },
  { id: '001/005', col: 6, row: 1 },
  { id: '001/006', col: 7, row: 1 },
  { id: '001/007', col: 8, row: 1 },
  { id: '001/008', col: 9, row: 1 },
  { id: '001/009', col: 10, row: 1 },
  { id: '001/010', col: 11, row: 1 },
  { id: '001/011', col: 12, row: 1 }, // Antes 020/002
  { id: '001/012', col: 12, row: 2 }, // Antes 020/003 (dobla hacia abajo)

  // Pilar debajo de 001/003
  { type: 'pillar', col: 4, row: 2 },

  // Aislados (Fila 3)
  { id: '600/001', col: 1, row: 3 },
  { type: 'pillar', col: 5, row: 3 },
  { type: 'transit', id: 'Zona de Tránsito', col: 6, row: 3, colSpan: 3, rowSpan: 2 },
  { type: 'pillar', col: 9, row: 3 },
  { id: '003/006', col: 10, row: 3 },

  // Pilar Cerca del pasillo 2 derecho
  { type: 'pillar', col: 12, row: 3 },

  // Pasillo Transversal Derecho
  { id: '002/001', col: 12, row: 4 },
  { id: '002/002', col: 12, row: 5 },
  { id: '002/003', col: 12, row: 6 },

  // Pasillo 2 (Fila 5)
  { id: '003/005', col: 6, row: 5 },
  { id: '003/004', col: 7, row: 5 },
  { id: '003/003', col: 8, row: 5 },
  { id: '003/002', col: 9, row: 5 },
  { id: '003/001', col: 10, row: 5 },

  // Bloques Transversal Izquierdo
  { id: '005/003', col: 2, row: 5 },
  { id: '030/001', col: 3, row: 5, colSpan: 2 },
  { id: '005/002', col: 2, row: 6 },
  { id: '005/001', col: 2, row: 7 },

  // Pasillo 3 (Espalda con espalda)
  // Cara Superior de Pasillo 3
  { id: '004/001', col: 6, row: 7 },
  { id: '004/002', col: 7, row: 7 },
  { id: '004/003', col: 8, row: 7 },
  { id: '004/004', col: 9, row: 7 },
  { id: '004/005', col: 10, row: 7 },

  // Cara Inferior de Pasillo 3 (Empieza en 004/011, termina en 004/006)
  { type: 'pillar', col: 4, row: 8 },
  { id: '004/011', col: 5, row: 8 },
  { id: '004/010', col: 6, row: 8 },
  { id: '004/009', col: 7, row: 8 },
  { id: '004/008', col: 8, row: 8 },
  { id: '004/007', col: 9, row: 8 },
  { id: '004/006', col: 10, row: 8 },
];

export default function Home() {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false, actionName: '', locationId: '', callback: null
  });
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [locationsMap, setLocationsMap] = useState({});
  const [globalStats, setGlobalStats] = useState({ progress: 0, errorRate: 0 });

  // Suscripción única y global a Firestore en tiempo real
  useEffect(() => {
    const unsubscribe = subscribeToLocations((map) => {
      setLocationsMap(map);
    });
    return unsubscribe; // Limpieza al desmontar
  }, []);

  // Calcula las estadísticas globales cada vez que cambia el mapa de ubicaciones
  useEffect(() => {
    let totalPossible = 0;
    let completedPoints = 0;
    let totalError = 0;
    let certifiedCount = 0;

    gridData.forEach(item => {
      if (item.type !== 'pillar' && item.type !== 'transit') {
        totalPossible += 16; // 8 casillas x 2 checks por casilla

        for (let i = 1; i <= 8; i++) {
          const suffix = String(i).padStart(3, '0');
          const locId = `${item.id}/${suffix}`;
          const docId = locId.replaceAll('/', '_');
          const data = locationsMap[docId];

          if (data) {
            if (data.audit) completedPoints += 1;
            if (data.cert) {
              completedPoints += 1;
              certifiedCount += 1;
              totalError += (data.cert.errorRate || 0);
            }
          }
        }
      }
    });

    const progressPercent = totalPossible === 0 ? 0 : Math.round((completedPoints / totalPossible) * 100);
    const errorPercent = certifiedCount === 0 ? 0 : (totalError / certifiedCount).toFixed(2);
    setGlobalStats({ progress: progressPercent, errorRate: parseFloat(errorPercent) });
  }, [locationsMap]);

  const handleRequestSignature = (actionName, locationId, callback) => {
    setModalConfig({ isOpen: true, actionName, locationId, callback });
  };
  const handleConfirmSignature = (name, errorRate) => {
    if (modalConfig.callback) {
      modalConfig.callback(name, errorRate, new Date().toLocaleString('es-ES'));
    }
    setModalConfig({ ...modalConfig, isOpen: false });
  };
  const openSectionDetails = (sectionPrefix) => {
    setActiveSection(sectionPrefix);
    setDetailsModalOpen(true);
  };

  // Construye el objeto de datos para una sección a partir del mapa global
  const getSectionData = (sectionPrefix) => {
    const data = {};
    for (let i = 1; i <= 8; i++) {
      const suffix = String(i).padStart(3, '0');
      const locId = `${sectionPrefix}/${suffix}`;
      const docId = locId.replaceAll('/', '_');
      data[locId] = locationsMap[docId] || {};
    }
    return data;
  };

  const isErrorCritical = globalStats.errorRate > 1.0;

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Bodega ACP</h1>
        <div className={styles.titleInfo}>
          La disposición física de los pasillos ha sido mapeada fielmente.
        </div>
      </header>

      <div className={styles.mapContainer}>
        <div className={styles.mapGrid}>
          {gridData.map((item, index) => {
            const gridStyle = {
              gridColumn: `${item.col} / span ${item.colSpan || 1}`,
              gridRow: `${item.row} / span ${item.rowSpan || 1}`
            };

            if (item.type === 'pillar') {
              return <div key={`pillar-${index}`} className={styles.pillar} style={gridStyle}></div>;
            }
            if (item.type === 'transit') {
              return (
                <div key="transit" className={styles.transitArea} style={gridStyle}>
                  {item.id}
                </div>
              );
            }
            return (
              <div key={item.id} style={gridStyle}>
                <SectionBlock
                  sectionPrefix={item.id}
                  onClick={openSectionDetails}
                  sectionData={getSectionData(item.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.globalDashboard}>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Avance Global</div>
          <div className={`${styles.statValue} ${styles.progressValue}`}>
            {globalStats.progress}%
          </div>
          <div className={styles.statBarBg}>
            <div className={styles.statBarFill} style={{ width: `${globalStats.progress}%`, background: 'var(--success-color)' }}></div>
          </div>
        </div>

        <div className={styles.statBox}>
          <div className={styles.statLabel}>Error Promedio (Límite 1%)</div>
          <div className={`${styles.statValue} ${isErrorCritical ? styles.errorCritical : styles.errorSafe}`}>
            {globalStats.errorRate}%
          </div>
          <div className={styles.statBarBg}>
            <div className={styles.statBarFill} style={{
              width: `${Math.min(globalStats.errorRate * 10, 100)}%`,
              background: isErrorCritical ? '#ef4444' : 'var(--success-color)',
              transition: 'all 0.3s'
            }}></div>
          </div>
        </div>
      </div>

      <SectionDetailsModal
        isOpen={detailsModalOpen}
        sectionPrefix={activeSection}
        onClose={() => setDetailsModalOpen(false)}
        onRequestSignature={handleRequestSignature}
        locationsMap={locationsMap}
      />
      <SignatureModal
        isOpen={modalConfig.isOpen}
        actionName={modalConfig.actionName}
        locationId={modalConfig.locationId}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleConfirmSignature}
      />
    </main>
  );
}
