import { describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRuntime } from '../../src/operations/runtime.js';
import { createAuthorityRuntime, sourceRef } from '../../src/authority/runtime.js';
import { createSemanticRuntime, assertionRef } from '../../src/semantics/runtime.js';
import { createWorkflowRuntime, workflowOccurrenceRef } from '../../src/workflows/runtime.js';
import { createProjectionRuntime, manifestRevisionRef } from '../../src/projections/runtime.js';
import {
  createReproductionRuntime,
  regenerationAttemptRef,
} from '../../src/reproduction/runtime.js';
import { createReadModelRuntime } from '../../src/read-models/runtime.js';
import { ExpflowError } from '../../src/core/errors.js';
import type { AuthoritySourceInput } from '../../src/authority/types.js';

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), 'expflow-read-models-'));
}

function cleanup(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

function writeProjectFile(root: string, relativePath: string, content: string): void {
  const target = resolve(root, ...relativePath.split('/'));
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content, 'utf-8');
}

function sourceInput(overrides: Partial<AuthoritySourceInput> = {}): AuthoritySourceInput {
  return {
    factScope: ['requirements'],
    issuer: { kind: 'user', name: 'tester' },
    limitations: ['test source only'],
    origin: 'file:authority/source.json',
    readableRepresentation: 'authority/SOURCE.md',
    schemaUri: 'https://example.org/source.schema.json',
    schemaVersionDeclared: '1.0',
    sourceType: 'test-authority',
    subjectScope: { exclude: [], include: ['**/*'], root: 'docs' },
    ...overrides,
  };
}

async function initializedProject(): Promise<{
  readonly root: string;
  readonly initOperationId: string;
  readonly inputTree: string;
  readonly syncOperationId: string;
  readonly outputTree: string;
}> {
  const root = tempProject();
  const runtime = createRuntime();
  writeProjectFile(root, 'docs/a.txt', 'alpha');
  const init = await runtime.init({ root });
  writeProjectFile(root, 'docs/out.txt', 'output');
  const sync = await runtime.sync({ root });
  return {
    initOperationId: init.operation_id,
    inputTree: init.new_head ?? '',
    outputTree: sync.new_head ?? '',
    root,
    syncOperationId: sync.operation_id,
  };
}

describe('Phase 3 stable read models', () => {
  it('exposes a deterministic versioned envelope and distinct authority states', async () => {
    const { root } = await initializedProject();
    try {
      const authority = createAuthorityRuntime(root);
      const readModels = createReadModelRuntime(root);
      const accepted = await authority.createSourceRevision(sourceInput());
      const rejected = await authority.createSourceRevision(
        sourceInput({
          origin: 'file:authority/rejected.json',
          readableRepresentation: 'authority/REJECTED.md',
          subjectScope: { exclude: [], include: ['**/*'], root: 'src' },
        }),
      );
      const proposed = await authority.createSourceRevision(
        sourceInput({
          origin: 'file:authority/proposed.json',
          readableRepresentation: 'authority/PROPOSED.md',
          subjectScope: { exclude: [], include: ['**/*'], root: 'tests' },
        }),
      );
      await authority.recordSourceRegistrationDecision({
        automated: true,
        madeBy: { kind: 'policy', name: 'trusted-local-source' },
        outcome: 'accepted',
        rationale: 'Accepted for test.',
        sourceRevisionRef: sourceRef(accepted),
      });
      await authority.recordSourceRegistrationDecision({
        automated: false,
        madeBy: { kind: 'user', name: 'reviewer' },
        outcome: 'rejected',
        rationale: 'Rejected for test.',
        sourceRevisionRef: sourceRef(rejected),
      });

      const first = await readModels.list({ collection: 'authority_sources', limit: 10 });
      const second = await readModels.list({ collection: 'authority_sources', limit: 10 });

      expect(first.envelope).toEqual(second.envelope);
      expect(first.envelope.read_model_version).toBe('1.0.0');
      expect(first.envelope.material_head_tree_revision_id).toBeTruthy();
      expect(first.items.map((item) => [item.record_ref, item.state])).toEqual([
        [sourceRef(accepted), 'accepted'],
        [sourceRef(rejected), 'rejected'],
        [sourceRef(proposed), 'proposed'],
      ]);
    } finally {
      cleanup(root);
    }
  });

  it('preserves authority supersession and stale effective-interval states', async () => {
    const { root } = await initializedProject();
    try {
      const authority = createAuthorityRuntime(root);
      const readModels = createReadModelRuntime(root);
      const original = await authority.createSourceRevision(
        sourceInput({
          origin: 'file:authority/original.json',
          readableRepresentation: 'authority/ORIGINAL.md',
        }),
      );
      const expired = await authority.createSourceRevision(
        sourceInput({
          effectiveInterval: {
            end: '2000-01-01T00:00:00.000Z',
            start: '1999-01-01T00:00:00.000Z',
          },
          origin: 'file:authority/expired.json',
          readableRepresentation: 'authority/EXPIRED.md',
          subjectScope: { exclude: [], include: ['**/*'], root: 'expired' },
        }),
      );
      const replacement = await authority.createSourceRevision(
        sourceInput({
          origin: 'file:authority/replacement.json',
          readableRepresentation: 'authority/REPLACEMENT.md',
          sourceId: original.source_id,
          supersedesSourceRevisionRef: sourceRef(original),
        }),
      );

      await authority.recordSourceRegistrationDecision({
        automated: true,
        madeBy: { kind: 'policy', name: 'trusted-local-source' },
        outcome: 'accepted',
        rationale: 'Accepted original for test.',
        sourceRevisionRef: sourceRef(original),
      });
      await authority.recordSourceRegistrationDecision({
        automated: true,
        madeBy: { kind: 'policy', name: 'trusted-local-source' },
        outcome: 'accepted',
        rationale: 'Accepted expired source for test.',
        sourceRevisionRef: sourceRef(expired),
      });
      await authority.recordSourceRegistrationDecision({
        automated: true,
        madeBy: { kind: 'policy', name: 'trusted-local-source' },
        outcome: 'accepted',
        rationale: 'Accepted replacement for test.',
        sourceRevisionRef: sourceRef(replacement),
      });

      const states = new Map(
        (await readModels.list({ collection: 'authority_sources', limit: 10 })).items.map(
          (item) => [item.record_ref, item.state],
        ),
      );

      expect(states.get(sourceRef(original))).toBe('superseded');
      expect(states.get(sourceRef(expired))).toBe('stale');
      expect(states.get(sourceRef(replacement))).toBe('accepted');
    } finally {
      cleanup(root);
    }
  });

  it('paginates with stable cursors and rejects invalid cursor and limit inputs', async () => {
    const { root, inputTree } = await initializedProject();
    try {
      const semantics = createSemanticRuntime(root);
      const readModels = createReadModelRuntime(root);
      for (const label of ['one', 'two', 'three']) {
        await semantics.recordAssertion({
          assertionType: 'completion_declaration',
          claims: [{ predicate: 'label', value: label }],
          issuer: { kind: 'user', name: 'tester' },
          subjectRefs: [`tree:${inputTree}`],
        });
      }

      const first = await readModels.list({ collection: 'semantic_assertions', limit: 2 });
      expect(first.items).toHaveLength(2);
      expect(first.page.next_cursor).not.toBeNull();

      const second = await readModels.list({
        collection: 'semantic_assertions',
        cursor: first.page.next_cursor ?? '',
        limit: 2,
      });
      expect(second.items).toHaveLength(1);
      expect(new Set([...first.items, ...second.items].map((item) => item.record_ref)).size).toBe(
        3,
      );

      await expect(
        readModels.list({ collection: 'semantic_assertions', cursor: 'not-a-cursor' }),
      ).rejects.toMatchObject<Partial<ExpflowError>>({ code: 'read_model_invalid_cursor' });
      await expect(
        readModels.list({ collection: 'semantic_assertions', limit: 101 }),
      ).rejects.toMatchObject<Partial<ExpflowError>>({ code: 'read_model_invalid_limit' });
    } finally {
      cleanup(root);
    }
  });

  it('projects workflow, projection, reproduction, and material linkage without collapsing states', async () => {
    const { root, initOperationId, inputTree, outputTree, syncOperationId } =
      await initializedProject();
    try {
      const semantics = createSemanticRuntime(root);
      const workflows = createWorkflowRuntime(root);
      const projections = createProjectionRuntime(root);
      const reproduction = createReproductionRuntime(root);
      const readModels = createReadModelRuntime(root);

      const assertion = await semantics.recordAssertion({
        assertionType: 'completion_declaration',
        claims: [{ predicate: 'completed', value: true }],
        issuer: { kind: 'user', name: 'tester' },
        subjectRefs: [`tree:${inputTree}`],
      });
      await semantics.declareConflict({
        authorityScope: 'workflow_completion',
        competingClaimRefs: [assertionRef(assertion), 'external:claim'],
        severity: 'review',
        subjectRefs: [`tree:${inputTree}`],
      });
      const workflow = await workflows.startWorkflowOccurrence({
        inputPathSelector: { exclude: [], include: ['docs/**'], root: '.' },
        inputTreeRevisionId: inputTree,
        startOperationId: initOperationId,
      });
      const outputWorkflow = await workflows.attachWorkflowOutput({
        completionOperationId: syncOperationId,
        outputPathSelector: { exclude: [], include: ['docs/out.txt'], root: '.' },
        outputTreeRevisionId: outputTree,
        workflowOccurrenceId: workflowOccurrenceRef(workflow),
      });
      const manifest = await projections.recordManifestRevision({
        acceptedBy: { kind: 'policy', name: 'deterministic-template' },
        contentDigest: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        manifestKind: 'import_tree',
        projectorClass: 'deterministic_template',
        projectorName: 'test-template',
        projectorVersion: '1',
        readableLocator: '.expflow/projections/import.json',
        status: 'accepted',
        treeRevisionId: outputTree,
      });
      const unknown = await reproduction.recordRegenerationAttempt({
        inputTreeRevisionId: inputTree,
        modelProfile: 'test-model',
        promptDigest: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        sourceWorkflowOccurrenceId: workflow.workflow_occurrence_id,
        status: 'unknown',
        targetKind: 'workflow',
        toolProfile: 'test-tool',
      });
      await reproduction.recordReuseResult({
        acceptanceDecisionRef: 'efsd_0123456789ABCDEFGHJKMNPQRS',
        newInputTreeRevisionId: inputTree,
        outputWorkflowOccurrenceId: workflowOccurrenceRef(outputWorkflow),
        policyGate: { authorityAccepted: true, licenseAccepted: true },
        referenceManifestRevisionId: manifestRevisionRef(manifest),
        referenceWorkflowOccurrenceId: workflow.workflow_occurrence_id,
        status: 'completed',
      });

      await expect(
        readModels.list({ collection: 'workflow_occurrences', state: 'complete' }),
      ).resolves.toMatchObject({ items: [] });
      expect((await readModels.list({ collection: 'semantic_conflicts' })).items[0]?.state).toBe(
        'conflicted',
      );
      expect((await readModels.list({ collection: 'manifest_revisions' })).items[0]?.state).toBe(
        'accepted',
      );
      expect(
        (await readModels.list({ collection: 'regeneration_attempts' })).items[0],
      ).toMatchObject({
        record_ref: regenerationAttemptRef(unknown),
        state: 'unknown',
      });
      expect((await readModels.list({ collection: 'reuse_results' })).items[0]?.state).toBe(
        'complete',
      );
      const material = await readModels.list({ collection: 'material_tree_entries' });
      expect(
        material.items.some((item) => item.material_refs.some((ref) => ref.kind === 'path')),
      ).toBe(true);
    } finally {
      cleanup(root);
    }
  });

  it('does not create advanced record directories when reading an empty initialized project', async () => {
    const root = tempProject();
    try {
      writeProjectFile(root, 'docs/a.txt', 'alpha');
      await createRuntime().init({ root });
      const recordsDir = resolve(root, '.expflow', 'records', 'semantic-assertions');
      expect(existsSync(recordsDir)).toBe(false);

      const overview = await createReadModelRuntime(root).overview();

      expect(overview.envelope.completeness.status).toBe('complete');
      expect(existsSync(recordsDir)).toBe(false);
    } finally {
      cleanup(root);
    }
  });

  it('keeps representative large collection reads bounded', async () => {
    const { root, inputTree } = await initializedProject();
    try {
      const semantics = createSemanticRuntime(root);
      for (let index = 0; index < 120; index += 1) {
        await semantics.recordAssertion({
          assertionType: 'completion_declaration',
          claims: [{ predicate: 'index', value: index }],
          issuer: { kind: 'user', name: 'tester' },
          subjectRefs: [`tree:${inputTree}`],
        });
      }

      const started = Date.now();
      const page = await createReadModelRuntime(root).list({
        collection: 'semantic_assertions',
        limit: 100,
      });
      const elapsedMs = Date.now() - started;

      expect(page.items).toHaveLength(100);
      expect(page.page.total_count).toBe(120);
      expect(page.page.next_cursor).not.toBeNull();
      expect(elapsedMs).toBeLessThan(2_000);
    } finally {
      cleanup(root);
    }
  });
});
