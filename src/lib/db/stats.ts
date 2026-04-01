import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SurplusAlert } from '@/types';

/**
 * Gets the total pounds of produce rescued (from completed alerts)
 */
export async function getTotalPoundsRescued(): Promise<number> {
  const q = query(collection(db, 'pickupRequests'), where('status', '==', 'completed'));
  const snapshot = await getDocs(q);

  return snapshot.docs.reduce((total, doc) => {
    const data = doc.data() as SurplusAlert;
    return total + (data.actualWeightLbs ?? data.estimatedWeightLbs);
  }, 0);
}

/**
 * Gets the total number of completed rescues
 */
export async function getTotalRescues(): Promise<number> {
  const q = query(collection(db, 'pickupRequests'), where('status', '==', 'completed'));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Gets the count of active suppliers
 */
export async function getActiveSuppliersCount(): Promise<number> {
  const snapshot = await getDocs(collection(db, 'donors'));
  return snapshot.size;
}

/**
 * Gets stats for a specific supplier
 */
export async function getSupplierStats(
  supplierId: string
): Promise<{ totalPounds: number; totalRescues: number; totalAlerts: number }> {
  // Query both new 'supplierId' and legacy 'donorId' fields
  const [snap1, snap2] = await Promise.all([
    getDocs(query(collection(db, 'pickupRequests'), where('supplierId', '==', supplierId))),
    getDocs(query(collection(db, 'pickupRequests'), where('donorId', '==', supplierId))),
  ]);

  const seen = new Set<string>();
  const allDocs: SurplusAlert[] = [];
  for (const docSnap of [...snap1.docs, ...snap2.docs]) {
    if (!seen.has(docSnap.id)) {
      seen.add(docSnap.id);
      allDocs.push({ id: docSnap.id, ...docSnap.data() } as SurplusAlert);
    }
  }

  const completedDocs = allDocs.filter((a) => a.status === 'completed');
  const totalPounds = completedDocs.reduce((total, a) => {
    return total + (a.actualWeightLbs ?? a.estimatedWeightLbs);
  }, 0);

  return {
    totalPounds,
    totalRescues: completedDocs.length,
    totalAlerts: allDocs.length,
  };
}

/**
 * Gets the average temperature at pickup for completed alerts
 */
export async function getAvgPickupTemperature(): Promise<number | null> {
  const q = query(collection(db, 'pickupRequests'), where('status', '==', 'completed'));
  const snapshot = await getDocs(q);

  const temps: number[] = [];
  snapshot.docs.forEach((doc) => {
    const data = doc.data() as SurplusAlert;
    if (data.temperatureAtPickup !== undefined) {
      temps.push(data.temperatureAtPickup);
    }
  });

  if (temps.length === 0) return null;
  return temps.reduce((sum, t) => sum + t, 0) / temps.length;
}

/**
 * Gets the count of alerts by status
 */
export async function getAlertCountByStatus(
  status: string
): Promise<number> {
  const q = query(collection(db, 'pickupRequests'), where('status', '==', status));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Gets pounds rescued this week
 */
export async function getWeeklyPoundsRescued(): Promise<number> {
  const q = query(collection(db, 'pickupRequests'), where('status', '==', 'completed'));
  const snapshot = await getDocs(q);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return snapshot.docs.reduce((total, doc) => {
    const data = doc.data() as SurplusAlert;
    const completedAt = data.updatedAt?.toDate?.();
    if (completedAt && completedAt >= weekAgo) {
      return total + (data.actualWeightLbs ?? data.estimatedWeightLbs);
    }
    return total;
  }, 0);
}

// Backward-compat aliases
/** @deprecated Use getActiveSuppliersCount */
export const getActiveDonorsCount = getActiveSuppliersCount;
/** @deprecated Use getSupplierStats */
export const getDonorStats = getSupplierStats;
