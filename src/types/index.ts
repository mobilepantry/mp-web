import { Timestamp } from 'firebase/firestore';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export type BusinessType = 'restaurant' | 'grocery' | 'caterer' | 'bakery' | 'corporate' | 'other';

export interface Donor {
  id: string;
  email: string;
  businessName: string;
  contactName: string;
  phone: string;
  address: Address;
  businessType: BusinessType;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PickupStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type TimeWindow = 'morning' | 'afternoon' | 'evening';

export interface PickupRequest {
  id: string;
  donorId: string;
  status: PickupStatus;
  foodDescription: string;
  estimatedWeight: number;
  pickupAddress: Address;
  pickupDate: Timestamp;
  pickupTimeWindow: TimeWindow;
  contactOnArrival: string;
  specialInstructions?: string;
  actualWeight?: number;
  confirmedAt?: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// For creating new records (omit auto-generated fields)
export type CreateDonorInput = Omit<Donor, 'id' | 'createdAt' | 'updatedAt'>;
export type CreatePickupInput = Omit<PickupRequest, 'id' | 'status' | 'confirmedAt' | 'completedAt' | 'createdAt' | 'updatedAt'>;

// For updating records
export type UpdateDonorInput = Partial<Omit<Donor, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdatePickupInput = Partial<Omit<PickupRequest, 'id' | 'donorId' | 'createdAt'>>;
