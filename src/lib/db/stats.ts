import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PickupRequest } from '@/types';

/**
 * Gets the total pounds of food rescued (from completed pickups)
 */
export async function getTotalPoundsRescued(): Promise<number> {
  const q = query(collection(db, 'pickupRequests'), where('status', '==', 'completed'));
  const snapshot = await getDocs(q);

  return snapshot.docs.reduce((total, doc) => {
    const data = doc.data() as PickupRequest;
    return total + (data.actualWeight ?? data.estimatedWeight);
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
 * Gets the count of active donors (donors with at least one pickup request)
 */
export async function getActiveDonorsCount(): Promise<number> {
  const snapshot = await getDocs(collection(db, 'donors'));
  return snapshot.size;
}

/**
 * Gets donation stats for a specific donor
 */
export async function getDonorStats(
  donorId: string
): Promise<{ totalPounds: number; totalRescues: number }> {
  const q = query(
    collection(db, 'pickupRequests'),
    where('donorId', '==', donorId),
    where('status', '==', 'completed')
  );
  const snapshot = await getDocs(q);

  const totalPounds = snapshot.docs.reduce((total, doc) => {
    const data = doc.data() as PickupRequest;
    return total + (data.actualWeight ?? data.estimatedWeight);
  }, 0);

  return {
    totalPounds,
    totalRescues: snapshot.size,
  };
}
