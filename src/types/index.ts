import { Timestamp } from 'firebase/firestore';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

// --- Supplier (was Donor) ---

export type SupplierType =
  | 'distributor'
  | 'wholesale'
  | 'farm'
  | 'grocery'
  | 'restaurant'
  | 'processor'
  | 'other';

export interface Supplier {
  id: string;
  email: string;
  businessName: string;
  contactName: string;
  phone: string;
  address: Address;
  businessType: SupplierType;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --- Surplus Alert (was PickupRequest) ---

export type AlertStatus = 'pending' | 'confirmed' | 'picked-up' | 'completed' | 'cancelled';
export type TimeWindow = 'morning' | 'afternoon' | 'evening';
export type ProduceCategory =
  | 'fruits'
  | 'vegetables'
  | 'leafy-greens'
  | 'root-vegetables'
  | 'herbs'
  | 'mixed'
  | 'other';
export type ProduceGrade = 'A' | 'B' | 'C';
export type AlertType = 'ad-hoc' | 'standing';

export interface SurplusAlert {
  id: string;
  supplierId: string;
  status: AlertStatus;
  produceDescription: string;
  produceCategory: ProduceCategory[];
  estimatedWeightLbs: number;
  estimatedCaseCount?: number;
  produceGrade?: ProduceGrade;
  pickupAddress: Address;
  pickupDate: string;
  pickupTimeWindow: TimeWindow;
  alertType: AlertType;
  contactOnArrival: string;
  specialInstructions?: string;
  actualWeightLbs?: number;
  temperatureAtPickup?: number;
  actualGrade?: ProduceGrade;
  confirmedAt?: Timestamp;
  pickedUpAt?: Timestamp;
  completedAt?: Timestamp;
  cancelledAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// For creating new records (omit auto-generated fields)
export type CreateSupplierInput = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateSurplusAlertInput = Omit<
  SurplusAlert,
  'id' | 'status' | 'actualWeightLbs' | 'temperatureAtPickup' | 'actualGrade' | 'createdAt' | 'updatedAt'
>;

// For updating records
export type UpdateSupplierInput = Partial<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateSurplusAlertInput = Partial<Omit<SurplusAlert, 'id' | 'supplierId' | 'createdAt'>>;

// Backward-compat aliases (to ease migration of pages)
/** @deprecated Use Supplier */
export type Donor = Supplier;
/** @deprecated Use SupplierType */
export type BusinessType = SupplierType;
/** @deprecated Use AlertStatus */
export type PickupStatus = AlertStatus;
/** @deprecated Use SurplusAlert */
export type PickupRequest = SurplusAlert;
/** @deprecated Use CreateSupplierInput */
export type CreateDonorInput = CreateSupplierInput;
/** @deprecated Use CreateSurplusAlertInput */
export type CreatePickupInput = CreateSurplusAlertInput;
/** @deprecated Use UpdateSupplierInput */
export type UpdateDonorInput = UpdateSupplierInput;
/** @deprecated Use UpdateSurplusAlertInput */
export type UpdatePickupInput = UpdateSurplusAlertInput;
