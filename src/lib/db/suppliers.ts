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
import type { Supplier, CreateSupplierInput, UpdateSupplierInput } from '@/types';

// Keep existing Firestore collection name to avoid data migration
const COLLECTION = 'donors';

/**
 * Creates a new supplier document in Firestore
 * Uses the Firebase Auth UID as the document ID
 */
export async function createSupplier(userId: string, data: CreateSupplierInput): Promise<Supplier> {
  const docRef = doc(db, COLLECTION, userId);
  const supplierData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, supplierData);

  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...snapshot.data() } as Supplier;
}

/**
 * Retrieves a supplier by their document ID (Firebase Auth UID)
 */
export async function getSupplier(supplierId: string): Promise<Supplier | null> {
  if (!supplierId) return null;
  const docRef = doc(db, COLLECTION, supplierId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as Supplier;
}

/**
 * Retrieves a supplier by their email address
 */
export async function getSupplierByEmail(email: string): Promise<Supplier | null> {
  const q = query(collection(db, COLLECTION), where('email', '==', email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Supplier;
}

/**
 * Updates an existing supplier document
 */
export async function updateSupplier(supplierId: string, data: UpdateSupplierInput): Promise<void> {
  const docRef = doc(db, COLLECTION, supplierId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Retrieves all suppliers (for admin use)
 */
export async function getAllSuppliers(): Promise<Supplier[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Supplier));
}

// Backward-compat aliases
/** @deprecated Use createSupplier */
export const createDonor = createSupplier;
/** @deprecated Use getSupplier */
export const getDonor = getSupplier;
/** @deprecated Use getSupplierByEmail */
export const getDonorByEmail = getSupplierByEmail;
/** @deprecated Use updateSupplier */
export const updateDonor = updateSupplier;
/** @deprecated Use getAllSuppliers */
export const getAllDonors = getAllSuppliers;
