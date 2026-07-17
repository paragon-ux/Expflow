import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createExpflowId } from '../core/ids.js';
import { writeJsonFileExclusive } from '../core/json.js';
import { normalizeProjectRoot } from '../core/paths.js';
import { readTreeRevision, storePaths } from '../material/store.js';
import { createRuntime } from '../operations/runtime.js';
import { defaultPathSelector, scanWorkingTree } from '../scan/scanner.js';
import type { LegacyInventoryEntry, LegacyMigrationInput, LegacyMigrationReport } from './types.js';

const DEFAULT_TYPED_FOLDERS = [
  'input',
  'inputs',
  'output',
  'outputs',
  'actual',
  'expected',
  'history',
  'artifacts',
] as const;

export interface MigrationRuntime {
  migrateLegacyProject(input?: LegacyMigrationInput): Promise<LegacyMigrationReport>;
}

function typedFolderFor(path: string, typedFolders: readonly string[]): string | null {
  const firstSegment = path.split('/')[0] ?? '';
  return typedFolders.includes(firstSegment) ? firstSegment : null;
}

function inventoryFor(root: string, typedFolders: readonly string[]): LegacyInventoryEntry[] {
  return scanWorkingTree(root, defaultPathSelector()).map((file) => ({
    byte_size: file.byte_size,
    content_digest: file.content_digest,
    relative_path: file.relative_path,
    typed_folder: typedFolderFor(file.relative_path, typedFolders),
  }));
}

function ambiguityReport(inventory: readonly LegacyInventoryEntry[]): string[] {
  const historyEntries = inventory.filter((entry) => entry.typed_folder === 'history');
  return historyEntries.length > 1
    ? ['Legacy history folder contains multiple files; old-version ordering remains explicit.']
    : [];
}

function unsupportedFeatures(inventory: readonly LegacyInventoryEntry[]): string[] {
  return inventory.some((entry) => entry.typed_folder === null)
    ? ['Files outside recognized typed folders were preserved as ordinary material files.']
    : [];
}

export function createMigrationRuntime(): MigrationRuntime {
  return {
    async migrateLegacyProject(input: LegacyMigrationInput = {}): Promise<LegacyMigrationReport> {
      await Promise.resolve();
      const projectRoot = normalizeProjectRoot(input.root);
      const typedFolders = input.typedFolders ?? DEFAULT_TYPED_FOLDERS;
      const inventory = inventoryFor(projectRoot, typedFolders);
      const initReceipt = await createRuntime().init({
        requestedBy: { kind: 'system', name: 'expflow-migration' },
        root: projectRoot,
      });
      const tree = readTreeRevision(projectRoot, initReceipt.new_head ?? '');
      const migrationId = createExpflowId('efmg');
      const report: LegacyMigrationReport = {
        ambiguity_report: ambiguityReport(inventory),
        authority_fabricated: false,
        created_at: new Date().toISOString(),
        identity_map: tree.entries
          .filter(
            (entry) =>
              entry.entry_kind === 'file' &&
              entry.node_id !== null &&
              entry.node_id !== undefined &&
              entry.node_revision !== null &&
              entry.node_revision !== undefined,
          )
          .map((entry) => ({
            basis: 'migration_declared',
            node_ref: `${entry.node_id ?? ''}@${String(entry.node_revision ?? 0)}`,
            relative_path: entry.relative_path,
          })),
        initial_tree_revision_id: tree.tree_revision_id,
        inventory,
        limitations: [
          'Migration preserves material files and available folder evidence only.',
          'Migration does not fabricate authority, semantic acceptance, completion, or verification decisions.',
          'Original source files remain in place until a later acceptance decision.',
        ],
        migration_id: migrationId,
        project_root: projectRoot,
        rollback: {
          original_source_retained: true,
          retry_behavior: 'Remove only the generated .expflow directory before retrying migration.',
        },
        schema_version: '2.3',
        unsupported_features: unsupportedFeatures(inventory),
        user_paths_preserved: true,
      };
      const reportDir = resolve(storePaths(projectRoot).stateDir, 'migration');
      mkdirSync(reportDir, { recursive: true });
      writeJsonFileExclusive(resolve(reportDir, `${migrationId}.json`), report);
      return report;
    },
  };
}
