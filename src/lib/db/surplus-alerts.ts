import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SurplusAlert, CreateSurplusAlertInput, UpdateSurplusAlertInput, AlertStatus } from '@/types';

// Keep existing Firestore collection name to avoid data migration
const COLLECTION = 'pickupRequests';

/**
 * Creates a new surplus alert
 */
export async function createSurplusAlert(data: CreateSurplusAlertInput): Promise<SurplusAlert> {
  const docRef = doc(collection(db, COLLECTION));
  const alertData = {
    ...data,
    status: 'pending' as AlertStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, alertData);

  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...snapshot.data() } as SurplusAlert;
}

/**
 * Maps raw Firestore data to SurplusAlert, handling legacy field names
 */
function mapAlertData(id: string, data: Record<string, unknown>): SurplusAlert {
  return {
    id,
    // Handle legacy 'donorId' field from old documents
    supplierId: (data.supplierId || data.donorId) as string,
    ...data,
  } as SurplusAlert;
}

/**
 * Retrieves a surplus alert by ID
 */
export async function getSurplusAlert(alertId: string): Promise<SurplusAlert | null> {
  const docRef = doc(db, COLLECTION, alertId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return mapAlertData(snapshot.id, snapshot.data() as Record<string, unknown>);
}

/**
 * Retrieves all surplus alerts for a specific supplier
 */
export async function getAlertsBySupplier(supplierId: string): Promise<SurplusAlert[]> {
  // Query both new 'supplierId' and legacy 'donorId' fields
  const q1 = query(
    collection(db, COLLECTION),
    where('supplierId', '==', supplierId),
    orderBy('createdAt', 'desc')
  );
  const q2 = query(
    collection(db, COLLECTION),
    where('donorId', '==', supplierId),
    orderBy('createdAt', 'desc')
  );

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const seen = new Set<string>();
  const results: SurplusAlert[] = [];

  for (const docSnap of [...snap1.docs, ...snap2.docs]) {
    if (!seen.has(docSnap.id)) {
      seen.add(docSnap.id);
      results.push(mapAlertData(docSnap.id, docSnap.data() as Record<string, unknown>));
    }
  }

  return results;
}

/**
 * Retrieves all surplus alerts, optionally filtered by status
 */
export async function getAllSurplusAlerts(status?: AlertStatus): Promise<SurplusAlert[]> {
  let q;
  if (status) {
    q = query(
      collection(db, COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => mapAlertData(docSnap.id, docSnap.data() as Record<string, unknown>));
}

/**
 * Updates a surplus alert
 */
export async function updateSurplusAlert(
  alertId: string,
  data: UpdateSurplusAlertInput
): Promise<void> {
  const docRef = doc(db, COLLECTION, alertId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Updates a surplus alert's status with optional extra fields
 */
export async function updateAlertStatus(
  alertId: string,
  status: AlertStatus,
  extraFields?: Partial<SurplusAlert>
): Promise<void> {
  const docRef = doc(db, COLLECTION, alertId);
  await updateDoc(docRef, {
    status,
    ...extraFields,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Retrieves all pending surplus alerts (convenience function for admin)
 */
export async function getPendingAlerts(): Promise<SurplusAlert[]> {
  return getAllSurplusAlerts('pending');
}

// Backward-compat aliases
/** @deprecated Use createSurplusAlert */
export const createPickupRequest = createSurplusAlert;
/** @deprecated Use getSurplusAlert */
export const getPickupRequest = getSurplusAlert;
/** @deprecated Use getAlertsBySupplier */
export const getPickupRequestsByDonor = getAlertsBySupplier;
/** @deprecated Use getAllSurplusAlerts */
export const getAllPickupRequests = getAllSurplusAlerts;
/** @deprecated Use updateSurplusAlert */
export const updatePickupRequest = updateSurplusAlert;
/** @deprecated Use getPendingAlerts */
export const getPendingPickupRequests = getPendingAlerts;
