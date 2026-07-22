import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRuntime } from '../../src/operations/runtime.js';
import { createWorkflowRuntime, workflowOccurrenceRef } from '../../src/workflows/runtime.js';
import { createEvidenceRuntime } from '../../src/evidence/runtime.js';
import { createPortablePackageRuntime } from '../../src/portable-package/runtime.js';
import { createReadModelRuntime } from '../../src/read-models/runtime.js';
import { ExpflowError } from '../../src/core/errors.js';

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), 'expflow-portable-'));
}

function cleanup(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

function writeProjectFile(root: string, relativePath: string, content: string): void {
  const target = resolve(root, ...relativePath.split('/'));
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content, 'utf-8');
}

async function workflowProject(): Promise<{
  readonly root: string;
  readonly inputTree: string;
  readonly outputTree: string;
  readonly workflowId: string;
}> {
  const root = tempProject();
  const runtime = createRuntime();
  writeProjectFile(root, 'docs/input.txt', 'input');
  const init = await runtime.init({ root });
  const workflowRuntime = createWorkflowRuntime(root);
  const workflow = await workflowRuntime.startWorkflowOccurrence({
    inputPathSelector: { exclude: [], include: ['docs/**'], root: '.' },
    inputTreeRevisionId: init.new_head ?? '',
    startOperationId: init.operation_id,
  });
  writeProjectFile(root, 'docs/output.txt', 'output');
  const sync = await runtime.sync({ root });
  const completedWorkflow = await workflowRuntime.attachWorkflowOutput({
    completionOperationId: sync.operation_id,
    outputPathSelector: { exclude: [], include: ['docs/**'], root: '.' },
    outputTreeRevisionId: sync.new_head ?? '',
    workflowOccurrenceId: workflowOccurrenceRef(workflow),
  });
  await createEvidenceRuntime(root).intake({
    actor: { kind: 'user', name: 'analyst' },
    captureMethod: 'transcript',
    content: 'Workflow evidence.',
    encoding: 'utf-8',
    mediaType: 'text/plain',
    origin: 'transcript:portable-test',
    sourceType: 'workflow-evidence',
  });
  return {
    inputTree: init.new_head ?? '',
    outputTree: sync.new_head ?? '',
    root,
    workflowId: workflowOccurrenceRef(completedWorkflow),
  };
}

describe('Phase 5 portable workflow packages', () => {
  it('exports deterministic manifests and validates digest closure offline', async () => {
    const { root, workflowId } = await workflowProject();
    const packageDir = resolve(tempProject(), 'package');
    try {
      const runtime = createPortablePackageRuntime(root);
      const first = await runtime.exportPackage({
        outputDirectory: packageDir,
        requestedBy: { kind: 'user', name: 'exporter' },
        workflowOccurrenceId: workflowId,
      });
      const firstManifestBytes = readFileSync(resolve(packageDir, 'manifest.json'), 'utf-8');
      const second = await runtime.exportPackage({
        outputDirectory: packageDir,
        requestedBy: { kind: 'user', name: 'exporter' },
        workflowOccurrenceId: workflowId,
      });
      const secondManifestBytes = readFileSync(resolve(packageDir, 'manifest.json'), 'utf-8');

      expect(first.package_format_version).toBe('1.0.0');
      expect(first.selected_workflow_occurrence_id).toBe(workflowId);
      expect(first.payloads.map((payload) => payload.path)).toEqual(
        [...first.payloads.map((payload) => payload.path)].sort(),
      );
      expect(first.payloads.map((payload) => payload.path)).toEqual(
        second.payloads.map((payload) => payload.path),
      );
      expect(second).toEqual(first);
      expect(secondManifestBytes).toBe(firstManifestBytes);
      expect(JSON.parse(firstManifestBytes)).toMatchObject({
        package_format_version: '1.0.0',
        selected_workflow_occurrence_id: workflowId,
      });
      await expect(
        runtime.validatePackage({ packageDirectory: packageDir }),
      ).resolves.toMatchObject({
        selected_workflow_occurrence_id: workflowId,
      });
      await expect(
        runtime.validatePackage({ packageDirectory: resolve(root, 'missing-package') }),
      ).rejects.toBeInstanceOf(ExpflowError);
    } finally {
      cleanup(root);
      cleanup(resolve(packageDir, '..'));
    }
  });

  it('round-trips a selected workflow into a relocated clean project without accepting authority', async () => {
    const { root, workflowId } = await workflowProject();
    const target = tempProject();
    const packageDir = resolve(tempProject(), 'package');
    try {
      const sourceRuntime = createPortablePackageRuntime(root);
      await sourceRuntime.exportPackage({
        outputDirectory: packageDir,
        requestedBy: { kind: 'user', name: 'exporter' },
        workflowOccurrenceId: workflowId,
      });
      writeProjectFile(target, 'README.md', 'target');
      await createRuntime().init({ root: target });
      const targetRuntime = createPortablePackageRuntime(target);
      const plan = await targetRuntime.planImport({ packageDirectory: packageDir });

      expect(plan.blocking).toBe(false);
      expect(plan.effects.some((effect) => effect.effect === 'create')).toBe(true);
      expect(plan.effects.every((effect) => !effect.path?.includes(target))).toBe(true);
      const result = await targetRuntime.importPackage({ packageDirectory: packageDir });

      expect(result.resume.state).toBe('ready');
      expect(result.resume.workflow_occurrence_id).toBe(workflowId);
      expect(result.imported_payloads).toContain(workflowId);
      expect(
        (await createReadModelRuntime(target).list({ collection: 'workflow_occurrences' })).items,
      ).toEqual(expect.arrayContaining([expect.objectContaining({ record_ref: workflowId })]));
      expect(
        (await createReadModelRuntime(target).list({ collection: 'evidence_intake' })).items,
      ).toHaveLength(1);
    } finally {
      cleanup(root);
      cleanup(target);
      cleanup(resolve(packageDir, '..'));
    }
  });

  it('refuses path traversal, collision imports, and unresolved external evidence', async () => {
    const { root, workflowId } = await workflowProject();
    const target = tempProject();
    const packageDir = resolve(tempProject(), 'package');
    try {
      await createEvidenceRuntime(root).intake({
        actor: { kind: 'user', name: 'analyst' },
        captureMethod: 'external_reference',
        encoding: 'external',
        externalReference: 'https://example.invalid/evidence',
        mediaType: 'external/reference',
        origin: 'external:https://example.invalid/evidence',
        sourceType: 'workflow-evidence',
      });
      await createPortablePackageRuntime(root).exportPackage({
        outputDirectory: packageDir,
        requestedBy: { kind: 'user', name: 'exporter' },
        workflowOccurrenceId: workflowId,
      });
      const manifestPath = resolve(packageDir, 'manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as {
        payloads: { path: string }[];
      };
      manifest.payloads[0] = { ...manifest.payloads[0], path: '../escape.json' };
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
      await expect(
        createPortablePackageRuntime(root).validatePackage({ packageDirectory: packageDir }),
      ).rejects.toMatchObject<Partial<ExpflowError>>({ code: 'unsafe_relative_path' });

      await createPortablePackageRuntime(root).exportPackage({
        outputDirectory: packageDir,
        requestedBy: { kind: 'user', name: 'exporter' },
        workflowOccurrenceId: workflowId,
      });
      writeProjectFile(target, 'README.md', 'target');
      await createRuntime().init({ root: target });
      const cleanPlan = await createPortablePackageRuntime(target).planImport({
        packageDirectory: packageDir,
      });
      expect(cleanPlan.blocking).toBe(true);
      expect(cleanPlan.effects.some((effect) => effect.effect === 'missing_external')).toBe(true);
      await expect(
        createPortablePackageRuntime(target).importPackage({ packageDirectory: packageDir }),
      ).rejects.toMatchObject<Partial<ExpflowError>>({ code: 'portable_import_blocked' });
    } finally {
      cleanup(root);
      cleanup(target);
      cleanup(resolve(packageDir, '..'));
    }
  });
});
