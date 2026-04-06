import { doc, setDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

// Convierte ID de ubicación al formato de doc Firestore (reemplaza / con _)
export const toDocId = (locationId) => locationId.replaceAll('/', '_');

/**
 * Suscribe a todos los documentos de la colección 'locations' en tiempo real.
 * Retorna la función de cancelación (unsubscribe).
 */
export function subscribeToLocations(callback) {
  return onSnapshot(collection(db, 'locations'), (snapshot) => {
    const map = {};
    snapshot.forEach(docSnap => {
      map[docSnap.id] = docSnap.data();
    });
    callback(map);
  });
}

/** Guarda la auditoría de una ubicación en Firestore */
export async function saveAudit(locationId, auditData) {
  const docId = toDocId(locationId);
  await setDoc(doc(db, 'locations', docId), { audit: auditData }, { merge: true });
}

/** Guarda la certificación de una ubicación en Firestore */
export async function saveCert(locationId, certData) {
  const docId = toDocId(locationId);
  await setDoc(doc(db, 'locations', docId), { cert: certData }, { merge: true });
}
