/**
 * P.5: Polish & Launch Prep
 *
 * Verifies:
 * - SEO meta tags on all pages
 * - robots.txt exists and is correct
 * - Error/loading states present
 * - Testing and launch checklists exist
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '..');
const ROOT = path.resolve(SRC, '..');

function readFile(relativePath: string, fromRoot = false): string {
  const base = fromRoot ? ROOT : SRC;
  return fs.readFileSync(path.join(base, relativePath), 'utf-8');
}

function fileExists(relativePath: string, fromRoot = false): boolean {
  const base = fromRoot ? ROOT : SRC;
  return fs.existsSync(path.join(base, relativePath));
}

// ─── P.5.1: Mobile Responsiveness ───────────────────────────────────────────

describe('P.5.1: Mobile Responsiveness', () => {
  const pagesToCheck = [
    'pages/supplier/dashboard.tsx',
    'pages/supplier/alert.tsx',
    'pages/supplier/history.tsx',
    'pages/supplier/settings.tsx',
    'pages/supplier/alert/[id].tsx',
    'pages/admin/index.tsx',
    'pages/admin/requests/index.tsx',
    'pages/admin/requests/[id].tsx',
    'pages/auth/login.tsx',
    'pages/auth/signup.tsx',
  ];

  for (const page of pagesToCheck) {
    it(`${page} uses responsive classes`, () => {
      const content = readFile(page);
      // Should use Tailwind responsive prefixes (sm:, md:, lg:) or responsive layout classes
      expect(content).toMatch(/sm:|md:|lg:|container|max-w-|flex.*col|grid/);
    });
  }
});

// ─── P.5.2: Error Handling and Loading States ───────────────────────────────

describe('P.5.2: Error Handling and Loading States', () => {
  it('supplier dashboard has loading state', () => {
    const content = readFile('pages/supplier/dashboard.tsx');
    expect(content).toMatch(/loading|Loader|spinner|skeleton/i);
  });

  it('supplier dashboard has error handling', () => {
    const content = readFile('pages/supplier/dashboard.tsx');
    expect(content).toMatch(/error|catch|try/i);
  });

  it('supplier history has loading state', () => {
    const content = readFile('pages/supplier/history.tsx');
    expect(content).toMatch(/loading|Loader|spinner/i);
  });

  it('admin dashboard has loading state', () => {
    const content = readFile('pages/admin/index.tsx');
    expect(content).toMatch(/loading|Loader|spinner/i);
  });

  it('admin dashboard has error handling', () => {
    const content = readFile('pages/admin/index.tsx');
    expect(content).toMatch(/error|catch|try/i);
  });

  it('supplier dashboard has empty state message', () => {
    const content = readFile('pages/supplier/dashboard.tsx');
    expect(content.toLowerCase()).toMatch(/no.*alert|get started|submit.*first/i);
  });

  it('admin dashboard has empty state message', () => {
    const content = readFile('pages/admin/index.tsx');
    expect(content.toLowerCase()).toMatch(/no.*pending|all.*caught|no.*alert/i);
  });

  it('alert form has submit button disabled state', () => {
    const content = readFile('pages/supplier/alert.tsx');
    expect(content).toMatch(/disabled|isSubmitting|submitting/i);
  });
});

// ─── P.5.3: SEO and Meta Tags ───────────────────────────────────────────────

describe('P.5.3: SEO and Meta Tags', () => {
  it('login page has correct title', () => {
    const content = readFile('pages/auth/login.tsx');
    expect(content).toContain('Log In | MobilePantry');
  });

  it('signup page has correct title', () => {
    const content = readFile('pages/auth/signup.tsx');
    expect(content).toMatch(/Supplier Account.*MobilePantry|Create Supplier/);
  });

  it('supplier dashboard has correct title', () => {
    const content = readFile('pages/supplier/dashboard.tsx');
    expect(content).toContain('Dashboard | MobilePantry');
  });

  it('surplus alert form has correct title', () => {
    const content = readFile('pages/supplier/alert.tsx');
    expect(content).toContain('Surplus Alert | MobilePantry');
  });

  it('admin dashboard has correct title', () => {
    const content = readFile('pages/admin/index.tsx');
    expect(content).toContain('Ops Dashboard | MobilePantry');
  });

  it('robots.txt exists', () => {
    expect(fileExists('public/robots.txt', true)).toBe(true);
  });

  it('robots.txt allows auth pages', () => {
    const content = readFile('public/robots.txt', true);
    expect(content).toContain('Allow: /auth/login');
    expect(content).toContain('Allow: /auth/signup');
  });

  it('robots.txt disallows supplier and admin pages', () => {
    const content = readFile('public/robots.txt', true);
    expect(content).toContain('Disallow: /supplier/');
    expect(content).toContain('Disallow: /admin/');
  });

  it('robots.txt disallows API routes', () => {
    const content = readFile('public/robots.txt', true);
    expect(content).toContain('Disallow: /api/');
  });
});

// ─── P.5.4: Testing and Launch Checklists ───────────────────────────────────

describe('P.5.4: Testing Checklist and Launch Runbook', () => {
  it('testing checklist exists', () => {
    expect(fileExists('docs/TESTING_CHECKLIST.md', true)).toBe(true);
  });

  it('testing checklist covers supplier flow', () => {
    const content = readFile('docs/TESTING_CHECKLIST.md', true);
    expect(content.toLowerCase()).toMatch(/supplier.*flow|supplier.*signup/i);
  });

  it('testing checklist covers admin flow', () => {
    const content = readFile('docs/TESTING_CHECKLIST.md', true);
    expect(content.toLowerCase()).toMatch(/admin.*flow|admin.*login/i);
  });

  it('testing checklist covers mobile', () => {
    const content = readFile('docs/TESTING_CHECKLIST.md', true);
    expect(content.toLowerCase()).toMatch(/mobile/);
  });

  it('launch checklist exists', () => {
    expect(fileExists('docs/LAUNCH_CHECKLIST.md', true)).toBe(true);
  });

  it('launch checklist covers DNS config', () => {
    const content = readFile('docs/LAUNCH_CHECKLIST.md', true);
    expect(content.toLowerCase()).toMatch(/dns|subdomain|vercel/i);
  });

  it('launch checklist covers Firebase auth domains', () => {
    const content = readFile('docs/LAUNCH_CHECKLIST.md', true);
    expect(content.toLowerCase()).toMatch(/firebase.*auth|authorized.*domain/i);
  });
});
