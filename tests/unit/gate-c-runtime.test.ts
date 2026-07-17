import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRuntime } from '../../src/operations/runtime.js';
import {
  createSemanticRuntime,
  assertionRef,
  semanticDecisionRef,
} from '../../src/semantics/runtime.js';
import { createWorkflowRuntime, workflowOccurrenceRef } from '../../src/workflows/runtime.js';
import { createProjectionRuntime, manifestRevisionRef } from '../../src/projections/runtime.js';
import {
  createReproductionRuntime,
  equivalenceEvaluationRef,
  regenerationAttemptRef,
} from '../../src/reproduction/runtime.js';
import { ExpflowError } from '../../src/core/errors.js';

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), 'expflow-gate-c-rest-'));
}

function cleanup(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

function writeProjectFile(root: string, relativePath: string, content: string): void {
  const target = resolve(root, ...relativePath.split('/'));
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content, 'utf-8');
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

describe('Gate C ownership and reproduction runtime', () => {
  it('keeps semantic proposals, decisions, and conflicts as distinct immutable records', async () => {
    const { root, inputTree } = await initializedProject();
    try {
      const semantics = createSemanticRuntime(root);
      const assertion = await semantics.recordAssertion({
        assertionType: 'completion_declaration',
        claims: [{ predicate: 'completed', value: true }],
        issuer: { kind: 'user', name: 'tester' },
        subjectRefs: [`tree:${inputTree}`],
      });

      expect(await semantics.listDecisions()).toEqual([]);

      const accepted = await semantics.recordSemanticDecision({
        automated: false,
        decisionKind: 'workflow_completion',
        madeBy: { kind: 'user', name: 'reviewer' },
        outcome: 'accepted',
        proposalRefs: [assertionRef(assertion)],
        rationale: 'Accepted for test.',
        subjectRefs: [`tree:${inputTree}`],
      });
      const superseding = await semantics.recordSemanticDecision({
        automated: false,
        decisionKind: 'workflow_completion',
        madeBy: { kind: 'user', name: 'reviewer' },
        outcome: 'revoked',
        proposalRefs: [assertionRef(assertion)],
        rationale: 'Revoked for test.',
        subjectRefs: [`tree:${inputTree}`],
        supersedesDecisionRef: semanticDecisionRef(accepted),
      });
      const conflict = await semantics.declareConflict({
        authorityScope: 'workflow_completion',
        competingClaimRefs: [assertionRef(assertion), semanticDecisionRef(superseding)],
        severity: 'review',
        subjectRefs: [`tree:${inputTree}`],
      });
      await semantics.recordSemanticDecision({
        automated: false,
        decisionKind: 'conflict_resolution',
        madeBy: { kind: 'user', name: 'reviewer' },
        outcome: 'accepted',
        proposalRefs: [conflict.conflict_id],
        rationale: 'Resolved but retained.',
        subjectRefs: [`tree:${inputTree}`],
      });

      expect(await semantics.listAssertions()).toHaveLength(1);
      expect(await semantics.listDecisions()).toHaveLength(3);
      expect(await semantics.listConflicts()).toEqual([conflict]);
      expect((await semantics.listSemanticChanges()).map((change) => change.family)).toContain(
        'conflicts',
      );
    } finally {
      cleanup(root);
    }
  });

  it('rejects semantic assertion shape drift before immutable write', async () => {
    const { root, inputTree } = await initializedProject();
    try {
      const semantics = createSemanticRuntime(root);

      await expect(
        semantics.recordAssertion({
          assertionType: 'completion_declaration',
          claims: [{ predicate: 'completed', value: true }],
          issuer: { extra: true, kind: 'user', name: 'tester' },
          subjectRefs: [`tree:${inputTree}`],
        } as unknown as Parameters<typeof semantics.recordAssertion>[0]),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'schema_invalid',
      });

      await expect(
        semantics.recordAssertion({
          assertionType: 'completion_declaration',
          claims: [{ predicate: 'completed' }],
          issuer: { kind: 'user', name: 'tester' },
          subjectRefs: [`tree:${inputTree}`],
        } as unknown as Parameters<typeof semantics.recordAssertion>[0]),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'schema_invalid',
      });

      await expect(
        semantics.recordAssertion({
          assertionType: 'completion_declaration',
          claims: [{ extra: true, predicate: 'completed', value: true }],
          issuer: { kind: 'user', name: 'tester' },
          subjectRefs: [`tree:${inputTree}`],
        } as unknown as Parameters<typeof semantics.recordAssertion>[0]),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'schema_invalid',
      });

      expect(await semantics.listAssertions()).toEqual([]);
    } finally {
      cleanup(root);
    }
  });

  it('records workflow output without implying accepted completion', async () => {
    const { root, initOperationId, inputTree, outputTree, syncOperationId } =
      await initializedProject();
    try {
      const workflows = createWorkflowRuntime(root);
      const workflow = await workflows.startWorkflowOccurrence({
        inputPathSelector: { exclude: [], include: ['docs/**'], root: '.' },
        inputTreeRevisionId: inputTree,
        startOperationId: initOperationId,
      });
      const output = await workflows.attachWorkflowOutput({
        completionOperationId: syncOperationId,
        outputPathSelector: { exclude: [], include: ['docs/out.txt'], root: '.' },
        outputTreeRevisionId: outputTree,
        workflowOccurrenceId: workflowOccurrenceRef(workflow),
      });
      const artifact = await workflows.recordVirtualArtifact({
        displayName: 'Generated output',
        generationEventRef: 'projection:test',
        workflowOccurrenceId: workflowOccurrenceRef(output),
      });
      const event = await workflows.recordMaterializationEvent({
        assertedBy: { kind: 'user', name: 'tester' },
        eventKind: 'copy',
        materialNodeRef: 'node:docs/out.txt',
        virtualArtifactId: artifact.virtual_artifact_id,
      });

      expect(output.material_status).toBe('outputs_present');
      expect(output.completion_status).toBe('none');
      expect(output.supersedes_occurrence_ref).toBe(workflow.workflow_occurrence_id);
      expect(await workflows.listVirtualArtifacts()).toEqual([artifact]);
      expect(await workflows.listMaterializationEvents()).toEqual([event]);
    } finally {
      cleanup(root);
    }
  });

  it('requires an immutable decision ref before accepting workflow completion', async () => {
    const { root, initOperationId, inputTree } = await initializedProject();
    try {
      const workflows = createWorkflowRuntime(root);
      const workflow = await workflows.startWorkflowOccurrence({
        inputPathSelector: { exclude: [], include: ['docs/**'], root: '.' },
        inputTreeRevisionId: inputTree,
        startOperationId: initOperationId,
      });

      await expect(
        workflows.transitionWorkflowState({
          completionDecisionRef: null,
          completionStatus: 'accepted',
          workflowOccurrenceId: workflowOccurrenceRef(workflow),
        } as unknown as Parameters<typeof workflows.transitionWorkflowState>[0]),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'schema_invalid',
      });
    } finally {
      cleanup(root);
    }
  });

  it('rejects workflow selector shape drift before immutable write', async () => {
    const { root, initOperationId, inputTree } = await initializedProject();
    try {
      const workflows = createWorkflowRuntime(root);

      await expect(
        workflows.startWorkflowOccurrence({
          inputPathSelector: {
            exclude: [],
            include: ['docs/**'],
            root: '.',
            unexpected: true,
          },
          inputTreeRevisionId: inputTree,
          startOperationId: initOperationId,
        } as unknown as Parameters<typeof workflows.startWorkflowOccurrence>[0]),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'schema_invalid',
      });
    } finally {
      cleanup(root);
    }
  });

  it('keeps projections scanner-excluded and derives accepted manifest heads', async () => {
    const { root, outputTree } = await initializedProject();
    try {
      const material = createRuntime();
      const projections = createProjectionRuntime(root);
      const proposed = await projections.recordManifestRevision({
        contentDigest: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        manifestKind: 'workflow_time_import_export',
        model: 'test-model',
        projectorClass: 'model_assisted',
        projectorName: 'test-projector',
        projectorVersion: '1',
        promptDigest: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        readableLocator: '.expflow/projections/model.json',
        treeRevisionId: outputTree,
      });
      await expect(
        projections.recordManifestRevision({
          manifestKind: 'import_tree',
          projectorClass: 'deterministic_template',
          projectorName: 'test-template',
          projectorVersion: '1',
          readableLocator: '.expflow/projections/missing-digest.json',
          treeRevisionId: outputTree,
        } as unknown as Parameters<typeof projections.recordManifestRevision>[0]),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'schema_invalid',
      });
      const accepted = await projections.recordManifestRevision({
        acceptedBy: { kind: 'policy', name: 'deterministic-template' },
        contentDigest: 'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        manifestKind: 'import_tree',
        projectorClass: 'deterministic_template',
        projectorName: 'test-template',
        projectorVersion: '1',
        readableLocator: '.expflow/projections/import.json',
        status: 'accepted',
        treeRevisionId: outputTree,
      });
      const terminalStatusDigests = {
        conflicted: 'sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        stale: 'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
        superseded: 'sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      } as const;
      for (const status of ['stale', 'superseded', 'conflicted'] as const) {
        await projections.recordManifestRevision({
          contentDigest: terminalStatusDigests[status],
          manifestKind: 'import_tree',
          projectorClass: 'deterministic_template',
          projectorName: 'test-template',
          projectorVersion: '1',
          readableLocator: `.expflow/projections/${status}.json`,
          staleReason: status === 'stale' ? 'Input tree changed.' : null,
          status,
          supersededBy: manifestRevisionRef(accepted),
          treeRevisionId: outputTree,
        });
      }
      writeProjectFile(root, '.expflow/projections/local.json', '{"internal":true}');

      expect(proposed.status).toBe('proposed');
      expect(await projections.listManifestHeads()).toEqual([
        {
          key: 'import_tree:project',
          manifest_revision_ref: manifestRevisionRef(accepted),
          status: 'accepted',
        },
      ]);
      expect((await material.status({ root })).working_tree_state).toBe('clean');
    } finally {
      cleanup(root);
    }
  });

  it('preserves unknown regeneration attempts and gates structural reuse', async () => {
    const { root, initOperationId, inputTree, outputTree } = await initializedProject();
    try {
      const workflows = createWorkflowRuntime(root);
      const projections = createProjectionRuntime(root);
      const reproduction = createReproductionRuntime(root);
      const workflow = await workflows.startWorkflowOccurrence({
        inputPathSelector: { exclude: [], include: ['docs/**'], root: '.' },
        inputTreeRevisionId: inputTree,
        startOperationId: initOperationId,
      });
      const outputWorkflow = await workflows.attachWorkflowOutput({
        outputPathSelector: { exclude: [], include: ['docs/**'], root: '.' },
        outputTreeRevisionId: outputTree,
        workflowOccurrenceId: workflowOccurrenceRef(workflow),
      });
      const manifest = await projections.recordManifestRevision({
        acceptedBy: { kind: 'policy', name: 'deterministic-template' },
        contentDigest: 'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
        manifestKind: 'import_tree',
        projectorClass: 'deterministic_template',
        projectorName: 'test-template',
        projectorVersion: '1',
        readableLocator: '.expflow/projections/reuse.json',
        status: 'accepted',
        treeRevisionId: outputTree,
      });
      const unknown = await reproduction.recordRegenerationAttempt({
        inputTreeRevisionId: inputTree,
        modelProfile: 'test-model',
        promptDigest: 'sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        sourceWorkflowOccurrenceId: workflow.workflow_occurrence_id,
        status: 'unknown',
        targetKind: 'workflow',
        toolProfile: 'test-tool',
      });
      await expect(
        reproduction.recordRegenerationAttempt({
          inputTreeRevisionId: inputTree,
          modelProfile: 'test-model',
          sourceWorkflowOccurrenceId: workflow.workflow_occurrence_id,
          status: 'queued',
          targetKind: 'workflow',
          toolProfile: 'test-tool',
        } as unknown as Parameters<typeof reproduction.recordRegenerationAttempt>[0]),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'schema_invalid',
      });
      const retry = await reproduction.recordRegenerationAttempt({
        inputTreeRevisionId: inputTree,
        modelProfile: 'test-model',
        outputRefs: [workflowOccurrenceRef(outputWorkflow)],
        promptDigest: 'sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        sourceWorkflowOccurrenceId: workflow.workflow_occurrence_id,
        status: 'completed',
        targetKind: 'workflow',
        toolProfile: 'test-tool',
      });
      const evaluation = await reproduction.recordEquivalenceEvaluation({
        classification: 'workflow_equivalent',
        evaluator: { kind: 'user', name: 'tester' },
        evidenceRefs: [regenerationAttemptRef(retry)],
        referenceRefs: [workflow.workflow_occurrence_id],
        subjectRef: regenerationAttemptRef(retry),
      });

      await expect(
        reproduction.recordReuseResult({
          newInputTreeRevisionId: inputTree,
          outputWorkflowOccurrenceId: workflowOccurrenceRef(outputWorkflow),
          referenceManifestRevisionId: manifestRevisionRef(manifest),
          referenceWorkflowOccurrenceId: workflow.workflow_occurrence_id,
          status: 'completed',
        }),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'reuse_policy_gate_failed',
      });

      const reuse = await reproduction.recordReuseResult({
        acceptanceDecisionRef: 'efsd_0123456789ABCDEFGHJKMNPQRS',
        equivalenceEvaluationRefs: [equivalenceEvaluationRef(evaluation)],
        newInputTreeRevisionId: inputTree,
        outputWorkflowOccurrenceId: workflowOccurrenceRef(outputWorkflow),
        policyGate: { authorityAccepted: true, licenseAccepted: true },
        referenceManifestRevisionId: manifestRevisionRef(manifest),
        referenceWorkflowOccurrenceId: workflow.workflow_occurrence_id,
        status: 'completed',
      });

      expect(regenerationAttemptRef(unknown)).not.toBe(regenerationAttemptRef(retry));
      expect(await reproduction.listRegenerationAttempts()).toHaveLength(2);
      expect(reuse.status).toBe('completed');
      expect(outputWorkflow.reuse_status).toBe('not_evaluated');
    } finally {
      cleanup(root);
    }
  });
});
