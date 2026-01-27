import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const collectionRoot = 'nordico_locations';

function isIsoDateString(value: any) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value);
}

function serializeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeForFirestore);
  if (typeof obj === 'object') {
    const out: any = {};
    for (const k of Object.keys(obj)) {
      out[k] = serializeForFirestore(obj[k]);
    }
    return out;
  }
  return obj;
}

function parseDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string' && isIsoDateString(obj)) return new Date(obj);
  if (Array.isArray(obj)) return obj.map(parseDates);
  if (typeof obj === 'object') {
    const out: any = {};
    for (const k of Object.keys(obj)) {
      out[k] = parseDates(obj[k]);
    }
    return out;
  }
  return obj;
}

export async function loadLocationData(location: string): Promise<any | null> {
  if (!location) return null;
  try {
    const ref = doc(db, collectionRoot, location);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return parseDates(data);
  } catch (error) {
    console.error('Failed to load location data from Firestore', error);
    return null;
  }
}

export async function saveLocationData(location: string, data: any) {
  if (!location) return;
  try {
    const ref = doc(db, collectionRoot, location);
    const payload = serializeForFirestore(data || {});
    await setDoc(ref, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('Failed to save location data to Firestore', error);
    throw error;
  }
}
