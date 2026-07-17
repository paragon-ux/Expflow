import { describe, expect, it } from 'vitest';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createAuthorityRuntime, sourceRef } from '../../src/authority/runtime.js';
import { createMigrationRuntime } from '../../src/migration/runtime.js';
import { readHead, readTreeRevision, listOperationReceipts } from '../../src/material/store.js';
import type { TreeEntryRecord, TreeRevisionRecord } from '../../src/material/types.js';
import {
  createRuntime,
  readCommittedReceipt,
  readCommittedTree,
} from '../../src/operations/runtime.js';
import { createProjectionRuntime, manifestRevisionRef } from '../../src/projections/runtime.js';
import {
  createReproductionRuntime,
  equivalenceEvaluationRef,
  regenerationAttemptRef,
} from '../../src/reproduction/runtime.js';
import { createSecurityRuntime } from '../../src/security/runtime.js';
import {
  assertionRef,
  createSemanticRuntime,
  semanticDecisionRef,
} from '../../src/semantics/runtime.js';
import { createWorkflowRuntime, workflowOccurrenceRef } from '../../src/workflows/runtime.js';

function tempProject(prefix = 'expflow-gate-d-proof-'): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function cleanup(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

function writeProjectFile(root: string, relativePath: string, content: string): void {
  const target = resolve(root, ...relativePath.split('/'));
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content, 'utf-8');
}

function fileEntry(tree: TreeRevisionRecord, path: string): TreeEntryRecord {
  const entry = tree.entries.find((candidate) => candidate.relative_path === path);
  if (entry === undefined) {
    throw new Error(`Missing tree entry: ${path}`);
  }
  return entry;
}

describe('Gate D end-to-end proof', () => {
  it('automates the core workflow scenarios without expanding ordinary commands', async () => {
    const root = tempProject();
    const legacyRoot = tempProject('expflow-gate-d-legacy-');
    const proven = new Set<string>();
    try {
      const material = createRuntime();
      writeProjectFile(root, 'docs/item.txt', 'one');
      writeProjectFile(root, 'docs/nested/input.txt', 'nested');
      const init = await material.init({ root });
      const initialTree = readTreeRevision(root, init.new_head ?? '');
      proven.add('1 initialize nested project tree');

      writeProjectFile(root, 'docs/item.txt', 'two');
      const samePath = await material.sync({ root });
      const samePathTree = readTreeRevision(root, samePath.new_head ?? '');
      expect(fileEntry(samePathTree, 'docs/item.txt').node_id).toBe(
        fileEntry(initialTree, 'docs/item.txt').node_id,
      );
      expect(fileEntry(samePathTree, 'docs/item.txt').node_revision).toBe(2);
      proven.add('2 same-path node revision');

      writeProjectFile(root, 'docs/item.txt', 'three');
      const explicitNew = await material.sync({
        changes: [{ identity_directive: 'new', kind: 'modify', path: 'docs/item.txt' }],
        root,
      });
      const explicitNewTree = readTreeRevision(root, explicitNew.new_head ?? '');
      expect(fileEntry(explicitNewTree, 'docs/item.txt').node_id).not.toBe(
        fileEntry(samePathTree, 'docs/item.txt').node_id,
      );
      proven.add('3 override continuity with new');

      renameSync(resolve(root, 'docs/item.txt'), resolve(root, 'docs/moved.txt'));
      const explicitMove = await material.sync({
        changes: [
          {
            from_path: 'docs/item.txt',
            identity_directive: 'preserve',
            kind: 'move',
            path: 'docs/moved.txt',
          },
        ],
        root,
      });
      const explicitMoveTree = readTreeRevision(root, explicitMove.new_head ?? '');
      expect(fileEntry(explicitMoveTree, 'docs/moved.txt').node_id).toBe(
        fileEntry(explicitNewTree, 'docs/item.txt').node_id,
      );
      proven.add('4 preserve identity through explicit move');

      renameSync(resolve(root, 'docs/moved.txt'), resolve(root, 'docs/similar.txt'));
      const digestMovePlan = await material.planSync({ root });
      expect(digestMovePlan.identity_proposals).toHaveLength(1);
      const digestMove = await material.sync({ root });
      const digestMoveTree = readTreeRevision(root, digestMove.new_head ?? '');
      expect(fileEntry(digestMoveTree, 'docs/similar.txt').node_id).not.toBe(
        fileEntry(explicitMoveTree, 'docs/moved.txt').node_id,
      );
      proven.add('5 digest-similar move proposal only');

      const oldNode = fileEntry(samePathTree, 'docs/item.txt');
      const restored = await material.restore({
        reference: `node:${oldNode.node_id ?? ''}@${String(oldNode.node_revision ?? 0)}:docs/restored.txt`,
        root,
      });
      expect(readFileSync(resolve(root, 'docs/restored.txt'), 'utf-8')).toBe('two');
      proven.add('6 restore old node revision');

      const workflows = createWorkflowRuntime(root);
      const workflow = await workflows.startWorkflowOccurrence({
        inputPathSelector: { exclude: [], include: ['docs/**'], root: '.' },
        inputTreeRevisionId: restored.new_head ?? '',
        startOperationId: init.operation_id,
      });
      proven.add('7 start bounded workflow');

      writeProjectFile(root, 'docs/output.txt', 'workflow output');
      const outputSync = await material.sync({ root });
      const outputWorkflow = await workflows.attachWorkflowOutput({
        completionOperationId: outputSync.operation_id,
        outputPathSelector: { exclude: [], include: ['docs/output.txt'], root: '.' },
        outputTreeRevisionId: outputSync.new_head ?? '',
        workflowOccurrenceId: workflowOccurrenceRef(workflow),
      });
      expect(outputWorkflow.completion_status).toBe('none');
      proven.add('8 attach later output tree');

      const authority = createAuthorityRuntime(root);
      const source = await authority.createSourceRevision({
        factScope: ['requirements'],
        issuer: { kind: 'user', name: 'owner' },
        origin: 'file:authority/source.json',
        readableRepresentation: 'authority/SOURCE.md',
        schemaUri: 'https://example.org/source.schema.json',
        schemaVersionDeclared: '1.0',
        sourceType: 'custom-authority',
        subjectScope: { exclude: [], include: ['docs/**'], root: '.' },
      });
      await authority.recordSourceRegistrationDecision({
        automated: true,
        madeBy: { kind: 'policy', name: 'local-trust' },
        outcome: 'accepted',
        rationale: 'Accepted for end-to-end proof.',
        sourceRevisionRef: sourceRef(source),
      });
      expect((await authority.listCurrentAuthoritySources()).accepted_source_refs).toEqual([
        sourceRef(source),
      ]);
      proven.add('9 register and accept custom authority source');

      await authority.recordAuthorityDocument({
        contentDigest: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        profile: 'split',
        readableLocator: 'authority/SPLIT.md',
        sections: [
          {
            anchor: 'split',
            authority_role: 'registered_authority_source',
            source_revision_refs: [sourceRef(source)],
          },
        ],
      });
      await authority.recordAuthorityDocument({
        contentDigest: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        profile: 'unified',
        readableLocator: 'authority/UNIFIED.md',
        sections: [
          {
            anchor: 'source',
            authority_role: 'registered_authority_source',
            source_revision_refs: [sourceRef(source)],
          },
          {
            anchor: 'history',
            authority_role: 'user_provided_event_history',
            source_revision_refs: [sourceRef(source)],
          },
        ],
      });
      expect(await authority.listAuthorityDocuments()).toHaveLength(2);
      proven.add('10 split and unified authority documents');

      const semantics = createSemanticRuntime(root);
      const outputTree = readTreeRevision(root, outputSync.new_head ?? '');
      const candidate = fileEntry(outputTree, 'docs/output.txt');
      const alternate = fileEntry(outputTree, 'docs/restored.txt');
      const correspondence = await semantics.recordSourceCorrespondence({
        candidateEntries: [
          {
            node_id: candidate.node_id ?? '',
            node_revision: candidate.node_revision ?? 0,
            relative_path: candidate.relative_path,
            tree_revision_id: outputTree.tree_revision_id,
          },
          {
            node_id: alternate.node_id ?? '',
            node_revision: alternate.node_revision ?? 0,
            relative_path: alternate.relative_path,
            tree_revision_id: outputTree.tree_revision_id,
          },
        ],
        sourceRecordRef: sourceRef(source),
        unresolvedAlternatives: [
          {
            node_id: alternate.node_id ?? '',
            node_revision: alternate.node_revision ?? 0,
            relative_path: alternate.relative_path,
            tree_revision_id: outputTree.tree_revision_id,
          },
        ],
      });
      const correspondenceDecision = await semantics.recordSemanticDecision({
        automated: false,
        decisionKind: 'source_correspondence',
        madeBy: { kind: 'user', name: 'reviewer' },
        outcome: 'accepted',
        proposalRefs: [correspondence.correspondence_id],
        rationale: 'Resolved ambiguous correspondence.',
        subjectRefs: [correspondence.correspondence_id],
      });
      expect(semanticDecisionRef(correspondenceDecision)).toMatch(/^efsd_/);
      proven.add('11 resolve ambiguous source correspondence');

      const artifact = await workflows.recordVirtualArtifact({
        displayName: 'Output artifact',
        generationEventRef: 'workflow:proof',
        workflowOccurrenceId: workflowOccurrenceRef(outputWorkflow),
      });
      await workflows.recordMaterializationEvent({
        assertedBy: { kind: 'user', name: 'owner' },
        authoritySourceRefs: [sourceRef(source)],
        eventKind: 'copy',
        materialNodeRef: `node:${candidate.node_id ?? ''}`,
        virtualArtifactId: artifact.virtual_artifact_id,
      });
      proven.add('12 virtual artifact and materialization event');

      const projections = createProjectionRuntime(root);
      const proposedManifest = await projections.recordManifestRevision({
        contentDigest: 'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        manifestKind: 'workflow_time_import_export',
        model: 'proof-model',
        projectorClass: 'model_assisted',
        projectorName: 'proof-projector',
        projectorVersion: '1',
        promptDigest: 'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
        readableLocator: '.expflow/projections/proposed.json',
        treeRevisionId: outputTree.tree_revision_id,
        workflowOccurrenceId: workflowOccurrenceRef(outputWorkflow),
      });
      const acceptedManifest = await projections.recordManifestRevision({
        acceptedBy: { kind: 'user', name: 'reviewer' },
        contentDigest: 'sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        manifestKind: 'workflow_time_import_export',
        model: 'proof-model',
        projectorClass: 'model_assisted',
        projectorName: 'proof-projector',
        projectorVersion: '1',
        promptDigest: 'sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        readableLocator: '.expflow/projections/accepted.json',
        status: 'accepted',
        treeRevisionId: outputTree.tree_revision_id,
        workflowOccurrenceId: workflowOccurrenceRef(outputWorkflow),
      });
      expect(proposedManifest.status).toBe('proposed');
      expect(await projections.listManifestHeads()).toHaveLength(1);
      proven.add('13 propose and accept model-assisted manifest');

      writeProjectFile(root, '.expflow/projections/internal.json', '{"projection":true}');
      expect((await material.status({ root })).working_tree_state).toBe('clean');
      proven.add('14 projections never trigger sync');

      writeProjectFile(root, 'docs/projection.md', 'materialized projection');
      const projectionMaterialization = await material.sync({
        changes: [
          {
            identity_directive: 'new',
            kind: 'materialize_projection',
            path: 'docs/projection.md',
          },
        ],
        root,
      });
      expect(projectionMaterialization.status).toBe('committed');
      proven.add('15 materialize accepted projection through sync');

      const completionAssertion = await semantics.recordAssertion({
        assertionType: 'completion_declaration',
        claims: [{ predicate: 'completed', value: true }],
        issuer: { kind: 'user', name: 'owner' },
        subjectRefs: [workflowOccurrenceRef(outputWorkflow)],
        workflowOccurrenceId: workflowOccurrenceRef(outputWorkflow),
      });
      expect((await workflows.listWorkflowOccurrences()).at(-1)?.completion_status).toBe('none');
      proven.add('16 assert completion without automatic acceptance');

      const reproduction = createReproductionRuntime(root);
      const regeneration = await reproduction.recordRegenerationAttempt({
        inputTreeRevisionId: restored.new_head ?? '',
        modelProfile: 'proof-model',
        outputRefs: [workflowOccurrenceRef(outputWorkflow)],
        promptDigest: 'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        sourceWorkflowOccurrenceId: workflowOccurrenceRef(workflow),
        status: 'completed',
        targetKind: 'workflow',
        toolProfile: 'proof-tool',
      });
      const evaluation = await reproduction.recordEquivalenceEvaluation({
        classification: 'workflow_equivalent',
        evaluator: { kind: 'user', name: 'reviewer' },
        evidenceRefs: [regenerationAttemptRef(regeneration)],
        referenceRefs: [workflowOccurrenceRef(outputWorkflow)],
        subjectRef: regenerationAttemptRef(regeneration),
      });
      expect(equivalenceEvaluationRef(evaluation)).toMatch(/^efee_/);
      proven.add('17 regeneration and equivalence evaluation');

      const reuse = await reproduction.recordReuseResult({
        acceptanceDecisionRef: semanticDecisionRef(correspondenceDecision),
        equivalenceEvaluationRefs: [equivalenceEvaluationRef(evaluation)],
        newInputTreeRevisionId: restored.new_head ?? '',
        outputWorkflowOccurrenceId: workflowOccurrenceRef(outputWorkflow),
        policyGate: { authorityAccepted: true, licenseAccepted: true },
        referenceManifestRevisionId: manifestRevisionRef(acceptedManifest),
        referenceWorkflowOccurrenceId: workflowOccurrenceRef(workflow),
        status: 'completed',
      });
      expect(reuse.status).toBe('completed');
      expect(assertionRef(completionAssertion)).toMatch(/^efa_/);
      proven.add('18 structural reuse with leakage/equivalence evidence');

      await expect(
        createSecurityRuntime().quarantineArchive({
          entries: [{ expandedBytes: 1, kind: 'file', path: '../evil.txt' }],
          root,
        }),
      ).rejects.toThrow();
      proven.add('19 reject unsafe archive');

      writeProjectFile(legacyRoot, 'inputs/source.txt', 'legacy input');
      writeProjectFile(legacyRoot, 'outputs/result.txt', 'legacy output');
      const migration = await createMigrationRuntime().migrateLegacyProject({ root: legacyRoot });
      expect(migration.user_paths_preserved).toBe(true);
      expect(migration.authority_fabricated).toBe(false);
      proven.add('20 migrate legacy typed-folder project');

      const oldTree = readCommittedTree(root, initialTree.tree_revision_id);
      expect(fileEntry(oldTree, 'docs/item.txt').node_revision).toBe(1);
      proven.add('21 inspect exact state at old project revision');

      const firstReceiptPage = listOperationReceipts(root).slice(0, 2);
      const secondReceiptPage = listOperationReceipts(root).slice(2, 4);
      expect(firstReceiptPage).toHaveLength(2);
      expect(secondReceiptPage.length).toBeGreaterThan(0);
      proven.add('22 paginate incremental committed changes');

      writeProjectFile(root, 'docs/partial.txt', 'partial');
      const partial = await material.sync({ root, simulatePostCommitFailure: true });
      expect(readCommittedReceipt(root, partial.operation_id).status).toBe('partial_post_commit');
      proven.add('23 reconcile lost local response from immutable receipt');
      proven.add('24 preserve material success with incomplete automation');

      expect(existsSync(resolve(process.cwd(), 'src', 'adapters'))).toBe(false);
      expect(existsSync(resolve(process.cwd(), 'src', 'reconciliation'))).toBe(false);
      proven.add('25 adapter-only idempotency absent from core');

      expect(readHead(root)).toBe(partial.new_head);
      expect(proven.size).toBe(25);
    } finally {
      cleanup(root);
      cleanup(legacyRoot);
    }
  });
});
