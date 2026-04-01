/**
 * P.3: Ops Dashboard Updates
 *
 * Verifies:
 * - Admin dashboard with produce rescue metrics
 * - Request detail with temp/grade logging
 * - Supplier list (not donor list)
 * - Slack notifications with produce-specific details
 * - Status flow includes "picked-up"
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '..');

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf-8');
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(SRC, relativePath));
}

// ─── P.3.1: Admin Dashboard Home ───────────────────────────────────────────

describe('P.3.1: Admin Dashboard Home and Metrics', () => {
  it('admin dashboard page exists', () => {
    expect(fileExists('pages/admin/index.tsx')).toBe(true);
  });

  it('admin dashboard shows pending alerts metric', () => {
    const content = readFile('pages/admin/index.tsx');
    expect(content.toLowerCase()).toMatch(/pending.*alert/);
  });

  it('admin dashboard shows weekly lbs rescued metric', () => {
    const content = readFile('pages/admin/index.tsx');
    expect(content.toLowerCase()).toMatch(/lbs.*rescued|weekly.*pound|rescued.*week/);
  });

  it('admin dashboard shows active suppliers metric', () => {
    const content = readFile('pages/admin/index.tsx');
    expect(content.toLowerCase()).toMatch(/active.*supplier/);
  });

  it('admin dashboard shows avg pickup temp metric', () => {
    const content = readFile('pages/admin/index.tsx');
    expect(content.toLowerCase()).toMatch(/avg.*temp|temperature/);
  });

  it('admin dashboard uses stats helper functions', () => {
    const content = readFile('pages/admin/index.tsx');
    expect(content).toMatch(/getAlertCountByStatus|getWeeklyPoundsRescued|getActiveSuppliersCount|getAvgPickupTemperature/);
  });

  it('admin dashboard has SEO title', () => {
    const content = readFile('pages/admin/index.tsx');
    expect(content).toContain('Ops Dashboard | MobilePantry');
  });
});

// ─── P.3.2: Admin Request Detail ────────────────────────────────────────────

describe('P.3.2: Admin Request Detail with Produce Fields', () => {
  it('admin request detail page exists', () => {
    expect(fileExists('pages/admin/requests/[id].tsx')).toBe(true);
  });

  it('request detail shows produce fields', () => {
    const content = readFile('pages/admin/requests/[id].tsx');
    expect(content).toContain('produceDescription');
    expect(content).toContain('produceCategory');
    expect(content).toContain('estimatedWeightLbs');
  });

  it('request detail has confirm button (pending → confirmed)', () => {
    const content = readFile('pages/admin/requests/[id].tsx');
    expect(content.toLowerCase()).toMatch(/confirm/);
  });

  it('request detail has mark picked up button (confirmed → picked-up)', () => {
    const content = readFile('pages/admin/requests/[id].tsx');
    expect(content.toLowerCase()).toMatch(/picked.up|mark.*pick/i);
  });

  it('request detail has completion modal with weight/temp/grade', () => {
    const content = readFile('pages/admin/requests/[id].tsx');
    expect(content).toContain('actualWeightLbs');
    expect(content).toContain('temperatureAtPickup');
    expect(content).toContain('actualGrade');
  });

  it('request detail shows temperature warning for >41F', () => {
    const content = readFile('pages/admin/requests/[id].tsx');
    expect(content).toMatch(/41/);
  });

  it('request detail has cancel functionality', () => {
    const content = readFile('pages/admin/requests/[id].tsx');
    expect(content.toLowerCase()).toMatch(/cancel/);
  });

  it('request detail shows supplier info', () => {
    const content = readFile('pages/admin/requests/[id].tsx');
    expect(content).toMatch(/supplier|businessName/);
  });
});

// ─── P.3.3: Admin Lists and Slack Notifications ────────────────────────────

describe('P.3.3: Admin Lists and Slack Notifications', () => {
  it('admin requests list page exists', () => {
    expect(fileExists('pages/admin/requests/index.tsx')).toBe(true);
  });

  it('admin requests list has status filter tabs including picked-up', () => {
    const content = readFile('pages/admin/requests/index.tsx');
    expect(content).toContain('pending');
    expect(content).toContain('confirmed');
    expect(content).toContain('picked-up');
    expect(content).toContain('completed');
    expect(content).toContain('cancelled');
  });

  it('admin suppliers list page exists (renamed from donors)', () => {
    expect(fileExists('pages/admin/suppliers/index.tsx')).toBe(true);
  });

  it('admin suppliers list uses supplier terminology', () => {
    const content = readFile('pages/admin/suppliers/index.tsx');
    expect(content.toLowerCase()).toMatch(/supplier/);
  });

  it('slack.ts sends produce-specific notification', () => {
    const content = readFile('lib/slack.ts');
    expect(content).toContain('Surplus Alert');
    expect(content).toContain('produceDescription');
    expect(content).toContain('produceCategory');
    expect(content).toContain('estimatedWeightLbs');
  });

  it('slack.ts includes produce category emojis', () => {
    const content = readFile('lib/slack.ts');
    const categories = ['fruits', 'vegetables', 'leafy-greens', 'root-vegetables', 'herbs', 'mixed', 'other'];
    for (const cat of categories) {
      expect(content).toContain(cat);
    }
  });

  it('slack.ts includes grade formatting', () => {
    const content = readFile('lib/slack.ts');
    expect(content).toContain('Minor cosmetic');
    expect(content).toContain('Noticeable blemishes');
    expect(content).toContain('Very ripe');
  });

  it('slack.ts includes time window formatting', () => {
    const content = readFile('lib/slack.ts');
    expect(content).toContain('Morning (8am');
    expect(content).toContain('Afternoon (12pm');
    expect(content).toContain('Evening (5pm');
  });

  it('slack.ts includes Google Maps link', () => {
    const content = readFile('lib/slack.ts');
    expect(content).toContain('maps.google.com');
  });

  it('slack.ts has backward-compat alias', () => {
    const content = readFile('lib/slack.ts');
    expect(content).toContain('sendPickupNotification');
  });

  it('API endpoint exists at /api/surplus-alerts', () => {
    expect(fileExists('pages/api/surplus-alerts.ts')).toBe(true);
  });

  it('API endpoint creates alert and sends Slack notification', () => {
    const content = readFile('pages/api/surplus-alerts.ts');
    expect(content).toMatch(/createSurplusAlert/);
    expect(content).toMatch(/sendSurplusAlertNotification|slack/i);
  });
});

// ─── Status Flow ────────────────────────────────────────────────────────────

describe('P.3: Status Flow includes picked-up', () => {
  it('AlertStatus type includes picked-up', () => {
    const content = readFile('types/index.ts');
    expect(content).toContain("'picked-up'");
  });

  it('surplus-alerts.ts updateAlertStatus function exists', () => {
    const content = readFile('lib/db/surplus-alerts.ts');
    expect(content).toContain('export async function updateAlertStatus');
  });
});
