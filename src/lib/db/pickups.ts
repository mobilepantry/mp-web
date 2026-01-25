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
import type { PickupRequest, CreatePickupInput, UpdatePickupInput, PickupStatus } from '@/types';

const COLLECTION = 'pickupRequests';

/**
 * Creates a new pickup request
 */
export async function createPickupRequest(data: CreatePickupInput): Promise<PickupRequest> {
  const docRef = doc(collection(db, COLLECTION));
  const requestData = {
    ...data,
    status: 'pending' as PickupStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, requestData);

  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...snapshot.data() } as PickupRequest;
}

/**
 * Retrieves a pickup request by ID
 */
export async function getPickupRequest(requestId: string): Promise<PickupRequest | null> {
  const docRef = doc(db, COLLECTION, requestId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as PickupRequest;
}

/**
 * Retrieves all pickup requests for a specific donor
 */
export async function getPickupRequestsByDonor(donorId: string): Promise<PickupRequest[]> {
  const q = query(
    collection(db, COLLECTION),
    where('donorId', '==', donorId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PickupRequest));
}

/**
 * Retrieves all pickup requests, optionally filtered by status
 */
export async function getAllPickupRequests(status?: PickupStatus): Promise<PickupRequest[]> {
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
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PickupRequest));
}

/**
 * Updates a pickup request
 */
export async function updatePickupRequest(
  requestId: string,
  data: UpdatePickupInput
): Promise<void> {
  const docRef = doc(db, COLLECTION, requestId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Retrieves all pending pickup requests (convenience function for admin)
 */
export async function getPendingPickupRequests(): Promise<PickupRequest[]> {
  return getAllPickupRequests('pending');
}
