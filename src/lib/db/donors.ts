import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Donor, CreateDonorInput, UpdateDonorInput } from '@/types';

const COLLECTION = 'donors';

/**
 * Creates a new donor document in Firestore
 * Uses the Firebase Auth UID as the document ID
 */
export async function createDonor(userId: string, data: CreateDonorInput): Promise<Donor> {
  const docRef = doc(db, COLLECTION, userId);
  const donorData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, donorData);

  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...snapshot.data() } as Donor;
}

/**
 * Retrieves a donor by their document ID (Firebase Auth UID)
 */
export async function getDonor(donorId: string): Promise<Donor | null> {
  const docRef = doc(db, COLLECTION, donorId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as Donor;
}

/**
 * Retrieves a donor by their email address
 */
export async function getDonorByEmail(email: string): Promise<Donor | null> {
  const q = query(collection(db, COLLECTION), where('email', '==', email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Donor;
}

/**
 * Updates an existing donor document
 */
export async function updateDonor(donorId: string, data: UpdateDonorInput): Promise<void> {
  const docRef = doc(db, COLLECTION, donorId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Retrieves all donors (for admin use)
 */
export async function getAllDonors(): Promise<Donor[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Donor));
}
