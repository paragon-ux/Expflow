import { describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRuntime } from '../../src/operations/runtime.js';
import { createEvidenceRuntime } from '../../src/evidence/runtime.js';
import { createReadModelRuntime } from '../../src/read-models/runtime.js';
import { createSemanticRuntime } from '../../src/semantics/runtime.js';
import { sourceRef } from '../../src/authority/runtime.js';
import { listAuthoritySources } from '../../src/authority/store.js';
import { ExpflowError } from '../../src/core/errors.js';

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), 'expflow-evidence-'));
}

function cleanup(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

function writeProjectFile(root: string, relativePath: string, content: string): void {
  const target = resolve(root, ...relativePath.split('/'));
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content, 'utf-8');
}

async function initializedProject(): Promise<{ readonly root: string; readonly tree: string }> {
  const root = tempProject();
  writeProjectFile(root, 'docs/a.txt', 'alpha');
  const init = await createRuntime().init({ root });
  return { root, tree: init.new_head ?? '' };
}

describe('Phase 4 evidence intake and authority reconciliation', () => {
  it('normalizes attributed evidence, proposes authority without accepting it, and exposes read state', async () => {
    const { root } = await initializedProject();
    try {
      const evidence = createEvidenceRuntime(root);
      const record = await evidence.intake({
        actor: { kind: 'user', name: 'analyst' },
        authoritySource: {
          factScope: ['requirements'],
          schemaUri: 'https://example.org/source.schema.json',
          schemaVersionDeclared: '1.0',
          subjectScope: { exclude: [], include: ['**/*'], root: 'docs' },
        },
        captureMethod: 'transcript',
        content: 'User said the workflow output was reviewed.',
        encoding: 'utf-8',
        mediaType: 'text/plain',
        origin: 'transcript:local-session',
        sourceType: 'workflow-evidence',
      });

      expect(record.state).toBe('normalized');
      expect(record.normalized?.text).toContain('workflow output');
      expect(record.digest).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(record.authority_source_ref).toBeTruthy();
      expect(record.secret_finding_count).toBe(0);

      const authoritySource = listAuthoritySources(root)[0];
      expect(authoritySource).toBeDefined();
      if (authoritySource === undefined) {
        throw new Error('expected authority source proposal');
      }
      expect(record.authority_source_ref).toBe(sourceRef(authoritySource));
      expect(
        await createReadModelRuntime(root).list({ collection: 'evidence_intake' }),
      ).toMatchObject({
        items: [{ record_ref: record.intake_id, state: 'proposed' }],
      });
    } finally {
      cleanup(root);
    }
  });

  it('rejects unsupported boundaries without mutating intake state', async () => {
    const { root } = await initializedProject();
    try {
      await expect(
        createEvidenceRuntime(root).intake({
          actor: { kind: 'user', name: 'analyst' },
          captureMethod: 'archive',
          content: 'not an archive',
          encoding: 'utf-8',
          mediaType: 'text/plain',
          origin: 'file:bad.txt',
          sourceType: 'workflow-evidence',
        }),
      ).rejects.toMatchObject<Partial<ExpflowError>>({ code: 'evidence_unsupported_media' });
      expect(await createEvidenceRuntime(root).listIntake()).toEqual([]);
      expect(existsSync(resolve(root, '.expflow', 'records', 'evidence-intake'))).toBe(false);
    } finally {
      cleanup(root);
    }
  });

  it('quarantines unsafe archive evidence without executing or extracting it as authority', async () => {
    const { root } = await initializedProject();
    try {
      const record = await createEvidenceRuntime(root).intake({
        actor: { kind: 'user', name: 'analyst' },
        archiveEntries: [
          {
            expandedBytes: 10,
            kind: 'file',
            path: '../escape.txt',
          },
        ],
        captureMethod: 'archive',
        content: 'archive-bytes',
        encoding: 'utf-8',
        mediaType: 'application/zip',
        origin: 'file:unsafe.zip',
        sourceType: 'workflow-evidence',
      });

      expect(record.state).toBe('quarantined');
      expect(record.authority_source_ref).toBeNull();
      expect(record.quarantine?.reason_code).toBe('archive_rejected');
      expect(
        (await createReadModelRuntime(root).list({ collection: 'evidence_intake' })).items[0],
      ).toMatchObject({ record_ref: record.intake_id, state: 'blocked' });
    } finally {
      cleanup(root);
    }
  });

  it('keeps duplicate evidence idempotent and marks corroboration duplicates distinctly', async () => {
    const { root } = await initializedProject();
    try {
      const evidence = createEvidenceRuntime(root);
      const first = await evidence.intake({
        actor: { kind: 'user', name: 'analyst' },
        captureMethod: 'file',
        content: 'same bytes',
        encoding: 'utf-8',
        mediaType: 'text/plain',
        origin: 'file:first.txt',
        sourceType: 'workflow-evidence',
      });
      const retry = await evidence.intake({
        actor: { kind: 'user', name: 'analyst' },
        captureMethod: 'file',
        content: 'same bytes',
        encoding: 'utf-8',
        mediaType: 'text/plain',
        origin: 'file:first.txt',
        sourceType: 'workflow-evidence',
      });
      const duplicate = await evidence.intake({
        actor: { kind: 'user', name: 'analyst' },
        captureMethod: 'file',
        content: 'same bytes',
        encoding: 'utf-8',
        mediaType: 'text/plain',
        origin: 'file:second.txt',
        sourceType: 'workflow-evidence',
      });

      expect(retry.intake_id).toBe(first.intake_id);
      expect(duplicate.duplicate_of).toBe(first.intake_id);
      expect(await evidence.listIntake()).toHaveLength(2);
      expect(
        (await createReadModelRuntime(root).list({ collection: 'evidence_intake', state: 'stale' }))
          .items,
      ).toHaveLength(1);

      const [left, right] = await Promise.all([
        evidence.intake({
          actor: { kind: 'user', name: 'analyst' },
          captureMethod: 'file',
          content: 'concurrent bytes',
          encoding: 'utf-8',
          mediaType: 'text/plain',
          origin: 'file:concurrent.txt',
          sourceType: 'workflow-evidence',
        }),
        evidence.intake({
          actor: { kind: 'user', name: 'analyst' },
          captureMethod: 'file',
          content: 'concurrent bytes',
          encoding: 'utf-8',
          mediaType: 'text/plain',
          origin: 'file:concurrent.txt',
          sourceType: 'workflow-evidence',
        }),
      ]);
      expect(left.intake_id).toBe(right.intake_id);
      expect(
        (await evidence.listIntake()).filter((record) => record.origin === 'file:concurrent.txt'),
      ).toHaveLength(1);
    } finally {
      cleanup(root);
    }
  });

  it('records correspondence proposals, conflicts, artifact candidates, and human decisions separately', async () => {
    const { root, tree } = await initializedProject();
    try {
      const evidence = createEvidenceRuntime(root);
      const semantic = createSemanticRuntime(root);
      const intake = await evidence.intake({
        actor: { kind: 'user', name: 'analyst' },
        captureMethod: 'external_reference',
        encoding: 'external',
        externalReference: 'https://example.org/evidence/1',
        mediaType: 'external/reference',
        origin: 'external:https://example.org/evidence/1',
        sourceType: 'workflow-evidence',
      });
      const treeEntry = (
        await createReadModelRuntime(root).list({ collection: 'material_tree_entries' })
      ).items[0];
      const nodeRef = treeEntry?.material_refs.find((ref) => ref.kind === 'node')?.ref ?? '';
      const correspondence = await evidence.proposeCorrespondence({
        candidateEntries: [
          {
            node_id: nodeRef,
            node_revision: 1,
            relative_path: 'docs/a.txt',
            tree_revision_id: tree,
          },
        ],
        confidence: 0.75,
        intakeRef: intake.intake_id,
        relation: 'derived',
      });
      const artifact = await evidence.recordArtifactCandidate({
        artifactRef: 'artifact:docs/a.txt',
        confidence: 0.8,
        intakeRef: intake.intake_id,
        materialRefs: [`tree:${tree}`],
        path: 'docs/a.txt',
        version: '1',
      });
      const conflict = await evidence.declareConflict({
        authorityScope: 'workflow-evidence',
        competingClaimRefs: [correspondence.assertion_ref, artifact.assertion_ref],
        severity: 'review',
        subjectRefs: [intake.intake_id],
      });
      const decision = await evidence.recordDecision({
        action: 'defer',
        evidenceRefs: [conflict.conflict_ref],
        madeBy: { kind: 'user', name: 'reviewer' },
        proposalRefs: [correspondence.assertion_ref],
        rationale: 'Needs source review.',
        subjectRefs: [intake.intake_id],
      });

      expect((await semantic.listSourceCorrespondence())[0]?.source_record_ref).toBe(
        intake.intake_id,
      );
      expect((await semantic.listConflicts())[0]?.conflict_id).toBe(conflict.conflict_ref);
      expect((await semantic.listDecisions())[0]).toMatchObject({
        decision_id: decision.decision_ref,
        outcome: 'deferred',
      });
      await expect(
        evidence.proposeCorrespondence({
          candidateEntries: [],
          confidence: 2,
          intakeRef: intake.intake_id,
          relation: 'same',
        }),
      ).rejects.toMatchObject<Partial<ExpflowError>>({ code: 'schema_invalid' });
    } finally {
      cleanup(root);
    }
  });
});
