/**
 * P.2: Supplier Portal Rebrand
 *
 * Verifies:
 * - Route files exist at /supplier/ paths
 * - Auth pages exist with supplier terminology
 * - Surplus alert form captures all required fields
 * - Validation schemas enforce required fields
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '..');

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(SRC, relativePath));
}

function fileContains(relativePath: string, text: string): boolean {
  const content = fs.readFileSync(path.join(SRC, relativePath), 'utf-8');
  return content.includes(text);
}

// ─── P.2.1: Auth Pages ─────────────────────────────────────────────────────

describe('P.2.1: Auth Pages for Supplier Terminology', () => {
  it('login page exists', () => {
    expect(fileExists('pages/auth/login.tsx')).toBe(true);
  });

  it('signup page exists', () => {
    expect(fileExists('pages/auth/signup.tsx')).toBe(true);
  });

  it('signup page references supplier terminology', () => {
    expect(fileContains('pages/auth/signup.tsx', 'Supplier')).toBe(true);
  });

  it('signup page includes all business types', () => {
    const content = fs.readFileSync(path.join(SRC, 'pages/auth/signup.tsx'), 'utf-8');
    const requiredTypes = ['distributor', 'wholesale', 'farm', 'grocery', 'restaurant', 'processor', 'other'];
    for (const type of requiredTypes) {
      expect(content.toLowerCase()).toContain(type);
    }
  });

  it('login page uses surplus/supplier language', () => {
    const content = fs.readFileSync(path.join(SRC, 'pages/auth/login.tsx'), 'utf-8');
    // Should mention "surplus" or "supplier" somewhere
    expect(content.toLowerCase()).toMatch(/surplus|supplier/);
  });

  it('login page has SEO title', () => {
    expect(fileContains('pages/auth/login.tsx', 'Log In | MobilePantry')).toBe(true);
  });

  it('signup page has SEO title', () => {
    expect(fileContains('pages/auth/signup.tsx', 'Supplier Account')).toBe(true);
  });
});

// ─── P.2.2: Surplus Alert Form ──────────────────────────────────────────────

describe('P.2.2: Surplus Alert Form', () => {
  it('alert form page exists at /supplier/alert', () => {
    expect(fileExists('pages/supplier/alert.tsx')).toBe(true);
  });

  it('alert form uses surplusAlertSchema or Zod validation', () => {
    const content = fs.readFileSync(path.join(SRC, 'pages/supplier/alert.tsx'), 'utf-8');
    expect(content).toMatch(/surplusAlertSchema|zodResolver/);
  });

  it('alert form includes produce description field', () => {
    expect(fileContains('pages/supplier/alert.tsx', 'produceDescription')).toBe(true);
  });

  it('alert form includes produce category multi-select', () => {
    expect(fileContains('pages/supplier/alert.tsx', 'produceCategory')).toBe(true);
  });

  it('alert form includes weight field', () => {
    expect(fileContains('pages/supplier/alert.tsx', 'estimatedWeightLbs')).toBe(true);
  });

  it('alert form includes case count field', () => {
    expect(fileContains('pages/supplier/alert.tsx', 'estimatedCaseCount')).toBe(true);
  });

  it('alert form includes produce grade field', () => {
    expect(fileContains('pages/supplier/alert.tsx', 'produceGrade')).toBe(true);
  });

  it('alert form includes alert type (ad-hoc / standing)', () => {
    const content = fs.readFileSync(path.join(SRC, 'pages/supplier/alert.tsx'), 'utf-8');
    expect(content).toContain('alertType');
    expect(content).toContain('ad-hoc');
    expect(content).toContain('standing');
  });

  it('alert form includes pickup date field', () => {
    expect(fileContains('pages/supplier/alert.tsx', 'pickupDate')).toBe(true);
  });

  it('alert form includes pickup time window field', () => {
    expect(fileContains('pages/supplier/alert.tsx', 'pickupTimeWindow')).toBe(true);
  });

  it('alert form includes contact on arrival field', () => {
    expect(fileContains('pages/supplier/alert.tsx', 'contactOnArrival')).toBe(true);
  });

  it('alert form includes special instructions field', () => {
    expect(fileContains('pages/supplier/alert.tsx', 'specialInstructions')).toBe(true);
  });

  it('alert form submits to surplus-alerts API', () => {
    expect(fileContains('pages/supplier/alert.tsx', 'surplus-alerts')).toBe(true);
  });

  it('alert form has SEO title', () => {
    expect(fileContains('pages/supplier/alert.tsx', 'Surplus Alert | MobilePantry')).toBe(true);
  });
});

// ─── P.2.3: Supplier Dashboard and Alert History ────────────────────────────

describe('P.2.3: Supplier Dashboard and Alert History', () => {
  it('dashboard page exists at /supplier/dashboard', () => {
    expect(fileExists('pages/supplier/dashboard.tsx')).toBe(true);
  });

  it('dashboard shows impact stats', () => {
    const content = fs.readFileSync(path.join(SRC, 'pages/supplier/dashboard.tsx'), 'utf-8');
    expect(content).toMatch(/pounds rescued|lbs rescued/i);
    expect(content).toMatch(/alerts? submitted/i);
  });

  it('dashboard shows pending alerts section', () => {
    expect(fileContains('pages/supplier/dashboard.tsx', 'pending')).toBe(true);
  });

  it('dashboard has submit new alert button', () => {
    const content = fs.readFileSync(path.join(SRC, 'pages/supplier/dashboard.tsx'), 'utf-8');
    expect(content).toMatch(/submit.*alert|new.*alert/i);
  });

  it('dashboard has SEO title', () => {
    expect(fileContains('pages/supplier/dashboard.tsx', 'Dashboard | MobilePantry')).toBe(true);
  });

  it('history page exists at /supplier/history', () => {
    expect(fileExists('pages/supplier/history.tsx')).toBe(true);
  });

  it('history page has status filter tabs', () => {
    const content = fs.readFileSync(path.join(SRC, 'pages/supplier/history.tsx'), 'utf-8');
    expect(content).toContain('pending');
    expect(content).toContain('confirmed');
    expect(content).toContain('completed');
    expect(content).toContain('cancelled');
  });

  it('history page includes picked-up status', () => {
    expect(fileContains('pages/supplier/history.tsx', 'picked-up')).toBe(true);
  });

  it('history page has SEO title', () => {
    expect(fileContains('pages/supplier/history.tsx', 'History | MobilePantry')).toBe(true);
  });

  it('settings page exists at /supplier/settings', () => {
    expect(fileExists('pages/supplier/settings.tsx')).toBe(true);
  });

  it('settings page uses supplier terminology', () => {
    const content = fs.readFileSync(path.join(SRC, 'pages/supplier/settings.tsx'), 'utf-8');
    expect(content.toLowerCase()).toMatch(/supplier|business/);
  });

  it('settings page has SEO title', () => {
    expect(fileContains('pages/supplier/settings.tsx', 'Settings | MobilePantry')).toBe(true);
  });
});

// ─── P.2.4: Alert Detail Page ───────────────────────────────────────────────

describe('P.2.4: Alert Detail and Confirmation Page', () => {
  it('alert detail page exists at /supplier/alert/[id]', () => {
    expect(fileExists('pages/supplier/alert/[id].tsx')).toBe(true);
  });

  it('alert detail shows status-specific messaging', () => {
    const content = fs.readFileSync(path.join(SRC, 'pages/supplier/alert/[id].tsx'), 'utf-8');
    expect(content).toMatch(/pending/i);
    expect(content).toMatch(/confirmed/i);
    expect(content).toMatch(/picked.up/i);
    expect(content).toMatch(/completed/i);
    expect(content).toMatch(/cancelled/i);
  });

  it('alert detail shows produce information', () => {
    const content = fs.readFileSync(path.join(SRC, 'pages/supplier/alert/[id].tsx'), 'utf-8');
    expect(content).toContain('produceDescription');
    expect(content).toContain('produceCategory');
  });

  it('alert detail shows pickup logistics', () => {
    const content = fs.readFileSync(path.join(SRC, 'pages/supplier/alert/[id].tsx'), 'utf-8');
    expect(content).toContain('pickupAddress');
    expect(content).toContain('pickupDate');
  });

  it('alert detail has SEO title', () => {
    expect(fileContains('pages/supplier/alert/[id].tsx', 'Alert Details | MobilePantry')).toBe(true);
  });
});
