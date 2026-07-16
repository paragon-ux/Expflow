/**
 * Prohibited-scope audit — repository-contract test.
 *
 * Verifies that the TypeScript scaffold contains no product runtime behavior.
 * This test enforces the Phase 1 closed-world allowlist (Section 23).
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { REPO_ROOT } from '../../src/schemas/discovery.js';

function collectTypeScriptFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      results.push(...collectTypeScriptFiles(full));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.mjs'))) {
      results.push(full);
    }
  }
  return results;
}

// Prohibited runtime patterns — networking, databases, external integrations
const PROHIBITED_IMPORTS = [
  'child_process',
  'worker_threads',
  'net',
  'http',
  'https',
  'ws',
  'express',
  'fastify',
  'sqlite',
  'better-sqlite3',
  'pg',
  'mysql',
  'mongodb',
  'redis',
  'amqplib',
  'kafkajs',
];

describe('Prohibited-scope audit', () => {
  const srcDir = resolve(REPO_ROOT, 'src');

  it('src/ directory exists', () => {
    expect(existsSync(srcDir)).toBe(true);
  });

  const srcFiles = collectTypeScriptFiles(srcDir).filter(
    (f) => !f.includes('node_modules') && !f.includes('dist'),
  );

  it('src/ contains TypeScript files', () => {
    expect(srcFiles.length).toBeGreaterThan(0);
  });

  for (const file of srcFiles) {
    const rel = relative(srcDir, file);
    const content = readFileSync(file, 'utf-8');

    it(`src/${rel}: no prohibited imports`, () => {
      for (const imp of PROHIBITED_IMPORTS) {
        if (content.includes(`"${imp}"`) || content.includes(`'${imp}'`)) {
          throw new Error(`Prohibited import '${imp}' in src/${rel}`);
        }
      }
    });
  }

  // Verify no command handler modules exist
  it('no command handler modules exist', () => {
    const cliDir = resolve(srcDir, 'cli');
    if (existsSync(cliDir)) {
      const files = readdirSync(cliDir);
      const handlers = [
        'init-command.ts',
        'sync-command.ts',
        'status-command.ts',
        'restore-command.ts',
      ];
      for (const handler of handlers) {
        expect(files).not.toContain(handler);
      }
    }
  });
});
