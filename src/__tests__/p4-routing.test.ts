/**
 * P.4: App Shell, Routing & Subdomain Config
 *
 * Verifies:
 * - Marketing pages removed
 * - Root redirects based on auth state
 * - Navigation updated
 * - Route structure: /donor/ → /supplier/
 * - next.config redirects for old routes
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '..');
const ROOT = path.resolve(SRC, '..');

function fileExists(relativePath: string, fromRoot = false): boolean {
  const base = fromRoot ? ROOT : SRC;
  return fs.existsSync(path.join(base, relativePath));
}

function readFile(relativePath: string, fromRoot = false): string {
  const base = fromRoot ? ROOT : SRC;
  return fs.readFileSync(path.join(base, relativePath), 'utf-8');
}

// ─── P.4.1: Remove Marketing Pages and Update Routing ──────────────────────

describe('P.4.1: Marketing Pages Removed and Routing Updated', () => {
  it('no marketing about page', () => {
    expect(fileExists('pages/about.tsx')).toBe(false);
  });

  it('no marketing contact page', () => {
    expect(fileExists('pages/contact.tsx')).toBe(false);
  });

  it('index page redirects based on auth state', () => {
    const content = readFile('pages/index.tsx');
    expect(content).toMatch(/redirect|push|replace/i);
    expect(content).toMatch(/supplier.*dashboard|admin/i);
    expect(content).toMatch(/auth.*login|login/i);
  });

  it('supplier routes exist (renamed from /donor/)', () => {
    expect(fileExists('pages/supplier/dashboard.tsx')).toBe(true);
    expect(fileExists('pages/supplier/alert.tsx')).toBe(true);
    expect(fileExists('pages/supplier/alert/[id].tsx')).toBe(true);
    expect(fileExists('pages/supplier/history.tsx')).toBe(true);
    expect(fileExists('pages/supplier/settings.tsx')).toBe(true);
  });

  it('admin supplier routes exist (renamed from /admin/donors/)', () => {
    expect(fileExists('pages/admin/suppliers/index.tsx')).toBe(true);
  });

  it('old donor routes do not exist', () => {
    expect(fileExists('pages/donor/dashboard.tsx')).toBe(false);
    expect(fileExists('pages/donor/request.tsx')).toBe(false);
  });

  it('next.config has /donor/ → /supplier/ redirect', () => {
    const content = readFile('next.config.ts', true);
    expect(content).toContain('/donor/:path*');
    expect(content).toContain('/supplier/:path*');
  });

  it('next.config has /admin/donors/ → /admin/suppliers/ redirect', () => {
    const content = readFile('next.config.ts', true);
    expect(content).toContain('/admin/donors/:path*');
    expect(content).toContain('/admin/suppliers/:path*');
  });

  it('next.config redirects are permanent (301)', () => {
    const content = readFile('next.config.ts', true);
    expect(content).toContain('permanent: true');
  });
});

// ─── P.4.2: App Shell and Navigation ────────────────────────────────────────

describe('P.4.2: App Shell and Navigation', () => {
  it('Header component exists', () => {
    expect(fileExists('components/layout/Header.tsx')).toBe(true);
  });

  it('Header has no marketing nav links (About, Contact)', () => {
    const content = readFile('components/layout/Header.tsx');
    // Should not have links to /about or /contact
    expect(content).not.toMatch(/href=["']\/about["']/);
    expect(content).not.toMatch(/href=["']\/contact["']/);
  });

  it('Header has supplier navigation links', () => {
    const content = readFile('components/layout/Header.tsx');
    expect(content).toContain('/supplier/dashboard');
    expect(content).toContain('/supplier/alert');
    expect(content).toContain('/supplier/history');
  });

  it('Header has admin navigation links', () => {
    const content = readFile('components/layout/Header.tsx');
    expect(content).toContain('/admin');
    expect(content).toContain('/admin/suppliers');
  });

  it('Header has login/signup links for logged-out state', () => {
    const content = readFile('components/layout/Header.tsx');
    expect(content).toContain('/auth/login');
    expect(content).toContain('/auth/signup');
  });

  it('Footer component exists', () => {
    expect(fileExists('components/layout/Footer.tsx')).toBe(true);
  });

  it('Footer has no marketing links', () => {
    const content = readFile('components/layout/Footer.tsx');
    expect(content).not.toMatch(/href=["']\/about["']/);
    expect(content).not.toMatch(/href=["']\/contact["']/);
  });

  it('Footer links to mobilepantry.org (external)', () => {
    const content = readFile('components/layout/Footer.tsx');
    expect(content).toContain('mobilepantry.org');
  });

  it('Footer links to shop.mobilepantry.org (external)', () => {
    const content = readFile('components/layout/Footer.tsx');
    expect(content).toContain('shop.mobilepantry.org');
  });
});
