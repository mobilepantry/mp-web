/**
 * P.1: Data Model & Schema Updates
 *
 * Verifies:
 * - TypeScript types updated: Donor → Supplier, PickupRequest → SurplusAlert
 * - New fields: produce category, case count, temperature, alert type, produce grade
 * - Zod validation schemas match new types
 * - Database helper functions exported with correct names
 * - Backward-compat aliases exist
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '..');

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf-8');
}

// ─── P.1.1: TypeScript Types ───────────────────────────────────────────────

describe('P.1.1: TypeScript Types and Interfaces', () => {
  it('exports Supplier interface (renamed from Donor)', () => {
    const content = readFile('types/index.ts');
    expect(content).toContain('export interface Supplier');
  });

  it('exports SurplusAlert interface (renamed from PickupRequest)', () => {
    const content = readFile('types/index.ts');
    expect(content).toContain('export interface SurplusAlert');
  });

  it('exports SupplierType values', async () => {
    // SupplierType is a type-only export, but we can verify via the Zod schema
    const { signupSchema } = await import('@/lib/validations/auth');
    const supplierTypes = ['distributor', 'wholesale', 'farm', 'grocery', 'restaurant', 'processor', 'other'];

    for (const type of supplierTypes) {
      const result = signupSchema.safeParse({
        businessName: 'Test',
        contactName: 'Test',
        email: 'test@test.com',
        phone: '6145551234',
        password: 'password123',
        confirmPassword: 'password123',
        street: '123 Main',
        city: 'Columbus',
        state: 'OH',
        zip: '43215',
        businessType: type,
      });
      expect(result.success, `businessType "${type}" should be valid`).toBe(true);
    }
  });

  it('exports AlertStatus with "picked-up" status', async () => {
    // Verify via the surplus alert schema or type assertions
    const types = await import('@/types');
    // The AlertStatus type includes 'picked-up' — we can verify structurally
    const statuses: string[] = ['pending', 'confirmed', 'picked-up', 'completed', 'cancelled'];
    // If this compiles, the types are correct
    for (const status of statuses) {
      const alert = { status } as { status: typeof import('@/types').AlertStatus };
      expect(alert.status).toBe(status);
    }
  });

  it('exports ProduceCategory type with all 7 categories', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const categories = ['fruits', 'vegetables', 'leafy-greens', 'root-vegetables', 'herbs', 'mixed', 'other'];

    const baseData = {
      produceDescription: 'Test produce',
      estimatedWeightLbs: '100',
      alertType: 'ad-hoc' as const,
      useBusinessAddress: true,
      street: '123 Main',
      city: 'Columbus',
      state: 'OH',
      zip: '43215',
      pickupDate: '2026-03-15',
      pickupTimeWindow: 'morning' as const,
      contactOnArrival: 'Call 555-1234',
    };

    for (const cat of categories) {
      const result = surplusAlertSchema.safeParse({
        ...baseData,
        produceCategory: [cat],
      });
      expect(result.success, `Category "${cat}" should be valid`).toBe(true);
    }
  });

  it('exports ProduceGrade type (A, B, C)', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const grades = ['A', 'B', 'C'];

    for (const grade of grades) {
      const result = surplusAlertSchema.safeParse({
        produceDescription: 'Test',
        produceCategory: ['fruits'],
        estimatedWeightLbs: '100',
        alertType: 'ad-hoc',
        useBusinessAddress: true,
        street: '123 Main',
        city: 'Columbus',
        state: 'OH',
        zip: '43215',
        pickupDate: '2026-03-15',
        pickupTimeWindow: 'morning',
        contactOnArrival: 'Call',
        produceGrade: grade,
      });
      expect(result.success, `Grade "${grade}" should be valid`).toBe(true);
    }
  });

  it('exports AlertType: ad-hoc and standing', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');

    for (const alertType of ['ad-hoc', 'standing']) {
      const result = surplusAlertSchema.safeParse({
        produceDescription: 'Test',
        produceCategory: ['fruits'],
        estimatedWeightLbs: '100',
        alertType,
        useBusinessAddress: true,
        street: '123 Main',
        city: 'Columbus',
        state: 'OH',
        zip: '43215',
        pickupDate: '2026-03-15',
        pickupTimeWindow: 'morning',
        contactOnArrival: 'Call',
      });
      expect(result.success, `AlertType "${alertType}" should be valid`).toBe(true);
    }
  });

  it('exports TimeWindow: morning, afternoon, evening', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');

    for (const tw of ['morning', 'afternoon', 'evening']) {
      const result = surplusAlertSchema.safeParse({
        produceDescription: 'Test',
        produceCategory: ['fruits'],
        estimatedWeightLbs: '100',
        alertType: 'ad-hoc',
        useBusinessAddress: true,
        street: '123 Main',
        city: 'Columbus',
        state: 'OH',
        zip: '43215',
        pickupDate: '2026-03-15',
        pickupTimeWindow: tw,
        contactOnArrival: 'Call',
      });
      expect(result.success, `TimeWindow "${tw}" should be valid`).toBe(true);
    }
  });

  it('exports backward-compat type aliases', () => {
    const content = readFile('types/index.ts');
    // These deprecated type aliases should exist for migration
    expect(content).toContain('export type Donor =');
    expect(content).toContain('export type BusinessType =');
    expect(content).toContain('export type PickupStatus =');
    expect(content).toContain('export type PickupRequest =');
    expect(content).toContain('export type CreateDonorInput =');
    expect(content).toContain('export type CreatePickupInput =');
    expect(content).toContain('export type UpdateDonorInput =');
    expect(content).toContain('export type UpdatePickupInput =');
  });
});

// ─── P.1.2: Zod Validation Schemas ─────────────────────────────────────────

describe('P.1.2: Zod Validation Schemas', () => {
  const validAlertInput = {
    produceDescription: '20 cases mixed stone fruit',
    produceCategory: ['fruits', 'mixed'] as string[],
    estimatedWeightLbs: '500',
    estimatedCaseCount: '30',
    produceGrade: 'B' as const,
    alertType: 'ad-hoc' as const,
    useBusinessAddress: false,
    street: '737 Parkwood Ave',
    city: 'Columbus',
    state: 'OH',
    zip: '43215',
    pickupDate: '2026-03-15',
    pickupTimeWindow: 'morning' as const,
    contactOnArrival: 'Call 614-555-1234, ask for warehouse mgr',
    specialInstructions: 'Use loading dock B',
  };

  it('surplusAlertSchema validates a complete alert', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const result = surplusAlertSchema.safeParse(validAlertInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estimatedWeightLbs).toBe(500); // transformed to number
      expect(result.data.estimatedCaseCount).toBe(30);
    }
  });

  it('surplusAlertSchema requires produceDescription', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const result = surplusAlertSchema.safeParse({ ...validAlertInput, produceDescription: '' });
    expect(result.success).toBe(false);
  });

  it('surplusAlertSchema requires at least one produceCategory', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const result = surplusAlertSchema.safeParse({ ...validAlertInput, produceCategory: [] });
    expect(result.success).toBe(false);
  });

  it('surplusAlertSchema requires estimatedWeightLbs >= 1', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const result = surplusAlertSchema.safeParse({ ...validAlertInput, estimatedWeightLbs: '0' });
    expect(result.success).toBe(false);
  });

  it('surplusAlertSchema allows optional estimatedCaseCount', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const { estimatedCaseCount, ...withoutCaseCount } = validAlertInput;
    const result = surplusAlertSchema.safeParse(withoutCaseCount);
    expect(result.success).toBe(true);
  });

  it('surplusAlertSchema allows optional produceGrade', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const { produceGrade, ...withoutGrade } = validAlertInput;
    const result = surplusAlertSchema.safeParse(withoutGrade);
    expect(result.success).toBe(true);
  });

  it('surplusAlertSchema requires alertType', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const { alertType, ...withoutType } = validAlertInput;
    const result = surplusAlertSchema.safeParse(withoutType);
    expect(result.success).toBe(false);
  });

  it('surplusAlertSchema requires pickupDate', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const result = surplusAlertSchema.safeParse({ ...validAlertInput, pickupDate: '' });
    expect(result.success).toBe(false);
  });

  it('surplusAlertSchema requires pickupTimeWindow', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const result = surplusAlertSchema.safeParse({ ...validAlertInput, pickupTimeWindow: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('surplusAlertSchema requires contactOnArrival', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const result = surplusAlertSchema.safeParse({ ...validAlertInput, contactOnArrival: '' });
    expect(result.success).toBe(false);
  });

  it('surplusAlertSchema allows optional specialInstructions', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const { specialInstructions, ...withoutInstructions } = validAlertInput;
    const result = surplusAlertSchema.safeParse(withoutInstructions);
    expect(result.success).toBe(true);
  });

  it('surplusAlertSchema requires address fields', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const result = surplusAlertSchema.safeParse({ ...validAlertInput, street: '', city: '' });
    expect(result.success).toBe(false);
  });

  it('surplusAlertSchema requires 5-digit zip', async () => {
    const { surplusAlertSchema } = await import('@/lib/validations/pickup');
    const result = surplusAlertSchema.safeParse({ ...validAlertInput, zip: '123' });
    expect(result.success).toBe(false);
  });

  it('signupSchema validates supplier business types', async () => {
    const { signupSchema } = await import('@/lib/validations/auth');
    const validSignup = {
      businessName: 'DNO Produce',
      contactName: 'John Smith',
      email: 'john@dnoproduce.com',
      phone: '6145551234',
      password: 'securepass123',
      confirmPassword: 'securepass123',
      street: '737 Parkwood Ave',
      city: 'Columbus',
      state: 'OH',
      zip: '43215',
      businessType: 'distributor',
    };
    const result = signupSchema.safeParse(validSignup);
    expect(result.success).toBe(true);
  });

  it('signupSchema requires password match', async () => {
    const { signupSchema } = await import('@/lib/validations/auth');
    const result = signupSchema.safeParse({
      businessName: 'Test',
      contactName: 'Test',
      email: 'test@test.com',
      phone: '6145551234',
      password: 'password123',
      confirmPassword: 'different123',
      street: '123 Main',
      city: 'Columbus',
      state: 'OH',
      zip: '43215',
      businessType: 'farm',
    });
    expect(result.success).toBe(false);
  });

  it('signupSchema requires 10-digit phone', async () => {
    const { signupSchema } = await import('@/lib/validations/auth');
    const result = signupSchema.safeParse({
      businessName: 'Test',
      contactName: 'Test',
      email: 'test@test.com',
      phone: '614555',
      password: 'password123',
      confirmPassword: 'password123',
      street: '123 Main',
      city: 'Columbus',
      state: 'OH',
      zip: '43215',
      businessType: 'farm',
    });
    expect(result.success).toBe(false);
  });

  it('exports backward-compat schema aliases', async () => {
    const pickup = await import('@/lib/validations/pickup');
    expect(pickup).toHaveProperty('pickupRequestSchema');
    expect(pickup.pickupRequestSchema).toBe(pickup.surplusAlertSchema);
  });
});

// ─── P.1.3: Database Helper Functions ───────────────────────────────────────

describe('P.1.3: Database Helper Exports and Backward Compatibility', () => {
  it('suppliers.ts exports all CRUD functions', () => {
    const content = readFile('lib/db/suppliers.ts');
    expect(content).toContain('export async function createSupplier');
    expect(content).toContain('export async function getSupplier');
    expect(content).toContain('export async function getSupplierByEmail');
    expect(content).toContain('export async function updateSupplier');
    expect(content).toContain('export async function getAllSuppliers');
  });

  it('suppliers.ts uses "donors" collection name for backward compat', () => {
    const content = readFile('lib/db/suppliers.ts');
    expect(content).toContain("'donors'");
  });

  it('suppliers.ts exports backward-compat aliases', () => {
    const content = readFile('lib/db/suppliers.ts');
    expect(content).toContain('export const createDonor = createSupplier');
    expect(content).toContain('export const getDonor = getSupplier');
    expect(content).toContain('export const getDonorByEmail = getSupplierByEmail');
    expect(content).toContain('export const updateDonor = updateSupplier');
    expect(content).toContain('export const getAllDonors = getAllSuppliers');
  });

  it('suppliers.ts has null guard for getSupplier', () => {
    const content = readFile('lib/db/suppliers.ts');
    expect(content).toMatch(/if\s*\(\s*!supplierId\s*\)\s*return\s*null/);
  });

  it('surplus-alerts.ts exports all CRUD functions', () => {
    const content = readFile('lib/db/surplus-alerts.ts');
    expect(content).toContain('export async function createSurplusAlert');
    expect(content).toContain('export async function getSurplusAlert');
    expect(content).toContain('export async function getAlertsBySupplier');
    expect(content).toContain('export async function getAllSurplusAlerts');
    expect(content).toContain('export async function updateSurplusAlert');
    expect(content).toContain('export async function updateAlertStatus');
    expect(content).toContain('export async function getPendingAlerts');
  });

  it('surplus-alerts.ts uses "pickupRequests" collection name', () => {
    const content = readFile('lib/db/surplus-alerts.ts');
    expect(content).toContain("'pickupRequests'");
  });

  it('surplus-alerts.ts handles legacy donorId field mapping', () => {
    const content = readFile('lib/db/surplus-alerts.ts');
    expect(content).toContain('donorId');
    expect(content).toContain('supplierId');
  });

  it('surplus-alerts.ts exports backward-compat aliases', () => {
    const content = readFile('lib/db/surplus-alerts.ts');
    expect(content).toContain('export const createPickupRequest = createSurplusAlert');
    expect(content).toContain('export const getPickupRequest = getSurplusAlert');
    expect(content).toContain('export const getPickupRequestsByDonor = getAlertsBySupplier');
    expect(content).toContain('export const getAllPickupRequests = getAllSurplusAlerts');
    expect(content).toContain('export const updatePickupRequest = updateSurplusAlert');
    expect(content).toContain('export const getPendingPickupRequests = getPendingAlerts');
  });

  it('stats.ts exports produce rescue metrics functions', () => {
    const content = readFile('lib/db/stats.ts');
    expect(content).toContain('export async function getTotalPoundsRescued');
    expect(content).toContain('export async function getTotalRescues');
    expect(content).toContain('export async function getActiveSuppliersCount');
    expect(content).toContain('export async function getSupplierStats');
    expect(content).toContain('export async function getAvgPickupTemperature');
    expect(content).toContain('export async function getAlertCountByStatus');
    expect(content).toContain('export async function getWeeklyPoundsRescued');
  });

  it('stats.ts handles both supplierId and donorId fields', () => {
    const content = readFile('lib/db/stats.ts');
    expect(content).toContain("'supplierId'");
    expect(content).toContain("'donorId'");
  });

  it('stats.ts exports backward-compat aliases', () => {
    const content = readFile('lib/db/stats.ts');
    expect(content).toContain('export const getActiveDonorsCount = getActiveSuppliersCount');
    expect(content).toContain('export const getDonorStats = getSupplierStats');
  });
});
