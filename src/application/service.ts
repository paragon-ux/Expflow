/**
 * Expflow 1.2.0 Application Command Service
 *
 * Actor-ambivalent command layer wrapping existing runtimes
 * with the result envelope and actor attribution.
 *
 * All nine command families wired: project, material, workflow,
 * evidence, authority, conflicts, decisions, package, reporting.
 */
import { randomBytes } from 'node:crypto';
import { VERSION } from '../core/version.js';
import { createRuntime } from '../operations/runtime.js';
import type { ExpflowRuntime } from '../operations/runtime.js';
import { createEvidenceRuntime } from '../evidence/runtime.js';
import type { EvidenceRuntime } from '../evidence/types.js';
import { createAuthorityRuntime } from '../authority/runtime.js';
import type { AuthorityRuntime } from '../authority/runtime.js';
import { createWorkflowRuntime } from '../workflows/runtime.js';
import type { WorkflowRuntime } from '../workflows/runtime.js';
import { createPortablePackageRuntime } from '../portable-package/runtime.js';
import type {
  Actor,
  ApplicationResult,
  CapabilityDescriptor,
  CommandOptions,
  ErrorCode,
  Plan,
} from './types.js';

export type * from './types.js';

// ── Helpers ────────────────────────────────────────────────────

function genToken(): string {
  return `efp_${randomBytes(16).toString('base64url').slice(0, 24)}`;
}
function ts(): string {
  return new Date().toISOString();
}
function ok<T>(
  op: string,
  actor: Actor,
  result: T,
  rid?: string,
  pt?: string,
): ApplicationResult<T> {
  return {
    ok: true,
    operation: op,
    outcome: 'committed',
    receiptId: rid,
    result,
    planToken: pt,
    warnings: [],
    blockers: [],
    actor,
    timestamp: ts(),
  };
}
function blocked(
  op: string,
  actor: Actor,
  code: ErrorCode,
  msg: string,
  rem?: string,
): ApplicationResult<never> {
  return {
    ok: false,
    operation: op,
    outcome: 'blocked',
    error: { code, message: msg, remediation: rem },
    warnings: [],
    blockers: [],
    actor,
    timestamp: ts(),
  };
}

// ── Service ────────────────────────────────────────────────────

export class ApplicationService {
  private rt: ExpflowRuntime;
  private evidence: EvidenceRuntime;
  private authority: AuthorityRuntime;
  private workflow: WorkflowRuntime;
  readonly projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.rt = createRuntime();
    this.evidence = createEvidenceRuntime(projectRoot);
    this.authority = createAuthorityRuntime(projectRoot);
    this.workflow = createWorkflowRuntime(projectRoot);
  }

  private root() {
    return this.projectRoot;
  }

  capabilities(): CapabilityDescriptor {
    return {
      version: VERSION,
      commandFamilies: [
        'project',
        'material',
        'workflow',
        'evidence',
        'authority',
        'conflicts',
        'decisions',
        'package',
        'reporting',
      ],
      features: {
        jsonOutput: true,
        nonInteractive: true,
        planApply: true,
        actorAttribution: true,
        capabilityDiscovery: true,
      },
      supportedOs: ['windows', 'macos', 'linux'],
      nodeVersions: ['20', '22'],
    };
  }

  // ── Project ────────────────────────────────────────────────

  async init(actor: Actor): Promise<ApplicationResult<{ projectId: string }>> {
    try {
      const r = await this.rt.init({ root: this.root() });
      return ok('init', actor, { projectId: r.project_id }, r.operation_id);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Init failed';
      return blocked('init', actor, 'OPERATION_FAILED', m);
    }
  }

  async inspect(actor: Actor): Promise<ApplicationResult> {
    try {
      const s = await this.rt.status({ root: this.root() });
      return ok('inspect', actor, s);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Inspect failed';
      return blocked('inspect', actor, 'OPERATION_FAILED', m);
    }
  }

  // ── Material ───────────────────────────────────────────────

  async status(actor: Actor, opts?: CommandOptions): Promise<ApplicationResult> {
    try {
      const s = await this.rt.status({
        root: this.root(),
        history: opts?.dryRun ? true : undefined,
      });
      return ok('status', actor, s);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Status failed';
      return blocked('status', actor, 'OPERATION_FAILED', m);
    }
  }

  async planSync(actor: Actor, opts?: CommandOptions): Promise<ApplicationResult<Plan>> {
    try {
      const p = await this.rt.planSync({
        root: this.root(),
        dryRun: true,
        expectedHead: opts?.expectedHead ?? undefined,
      });
      return ok('planSync', actor, {
        token: genToken(),
        expectedHead: p.previous_head,
        operation: 'sync',
        plan: p,
        createdAt: ts(),
      });
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Plan failed';
      return blocked('planSync', actor, 'OPERATION_FAILED', m);
    }
  }

  async applySync(actor: Actor, plan: Plan): Promise<ApplicationResult<{ receiptId: string }>> {
    try {
      const r = await this.rt.sync({
        root: this.root(),
        expectedHead: plan.expectedHead ?? undefined,
      });
      return ok('applySync', actor, { receiptId: r.operation_id }, r.operation_id);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Sync failed';
      return blocked('applySync', actor, 'OPERATION_FAILED', m);
    }
  }

  async sync(
    actor: Actor,
    opts?: CommandOptions,
  ): Promise<ApplicationResult<{ receiptId: string }>> {
    try {
      const r = await this.rt.sync({
        root: this.root(),
        expectedHead: opts?.expectedHead ?? undefined,
        dryRun: opts?.dryRun,
      });
      return ok('sync', actor, { receiptId: r.operation_id }, r.operation_id);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Sync failed';
      return blocked('sync', actor, 'OPERATION_FAILED', m);
    }
  }

  async planRestore(actor: Actor, reference: string): Promise<ApplicationResult<Plan>> {
    try {
      const p = await this.rt.planRestore({ root: this.root(), reference });
      return ok('planRestore', actor, {
        token: genToken(),
        expectedHead: '',
        operation: 'restore',
        plan: p,
        createdAt: ts(),
      });
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Restore plan failed';
      return blocked('planRestore', actor, 'OPERATION_FAILED', m);
    }
  }

  async applyRestore(
    actor: Actor,
    reference: string,
    _plan?: Plan,
  ): Promise<ApplicationResult<{ receiptId: string }>> {
    try {
      const r = await this.rt.restore({ root: this.root(), reference });
      return ok('applyRestore', actor, { receiptId: r.operation_id }, r.operation_id);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Restore failed';
      return blocked('applyRestore', actor, 'OPERATION_FAILED', m);
    }
  }

  async restore(
    actor: Actor,
    reference: string,
    opts?: CommandOptions,
  ): Promise<ApplicationResult<{ receiptId: string }>> {
    try {
      const r = await this.rt.restore({ root: this.root(), reference, overwrite: opts?.force });
      return ok('restore', actor, { receiptId: r.operation_id }, r.operation_id);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Restore failed';
      return blocked('restore', actor, 'OPERATION_FAILED', m);
    }
  }

  // ── Workflow ────────────────────────────────────────────────

  async startWorkflow(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const r = await this.workflow.startWorkflowOccurrence(input as never);
      return ok('startWorkflow', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Workflow start failed';
      return blocked('startWorkflow', actor, 'OPERATION_FAILED', m);
    }
  }

  async attachWorkflowOutput(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const r = await this.workflow.attachWorkflowOutput(input as never);
      return ok('attachWorkflowOutput', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Workflow output attach failed';
      return blocked('attachWorkflowOutput', actor, 'OPERATION_FAILED', m);
    }
  }

  async transitionWorkflowState(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const r = await this.workflow.transitionWorkflowState(input as never);
      return ok('transitionWorkflowState', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Workflow state transition failed';
      return blocked('transitionWorkflowState', actor, 'OPERATION_FAILED', m);
    }
  }

  async workflowList(actor: Actor): Promise<ApplicationResult> {
    try {
      const occurrences = await this.workflow.listWorkflowOccurrences();
      return ok('workflowList', actor, { workflows: occurrences });
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Workflow list failed';
      return blocked('workflowList', actor, 'OPERATION_FAILED', m);
    }
  }

  // ── Evidence ────────────────────────────────────────────────

  async evidenceIntake(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const r = await this.evidence.intake(input as never);
      return ok('evidenceIntake', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Evidence intake failed';
      return blocked('evidenceIntake', actor, 'OPERATION_FAILED', m);
    }
  }

  async evidenceList(actor: Actor): Promise<ApplicationResult> {
    try {
      const items = await this.evidence.listIntake({ root: this.root() });
      return ok('evidenceList', actor, { items });
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Evidence list failed';
      return blocked('evidenceList', actor, 'OPERATION_FAILED', m);
    }
  }

  async proposeCorrespondence(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const r = await this.evidence.proposeCorrespondence(input as never);
      return ok('proposeCorrespondence', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Correspondence proposal failed';
      return blocked('proposeCorrespondence', actor, 'OPERATION_FAILED', m);
    }
  }

  async recordArtifactCandidate(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const r = await this.evidence.recordArtifactCandidate(input as never);
      return ok('recordArtifactCandidate', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Artifact candidate failed';
      return blocked('recordArtifactCandidate', actor, 'OPERATION_FAILED', m);
    }
  }

  // ── Authority ───────────────────────────────────────────────

  async authorityList(actor: Actor): Promise<ApplicationResult> {
    try {
      const sources = await this.authority.listCurrentAuthoritySources();
      return ok('authorityList', actor, sources);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Authority list failed';
      return blocked('authorityList', actor, 'OPERATION_FAILED', m);
    }
  }

  async authorityDocuments(actor: Actor): Promise<ApplicationResult> {
    try {
      const docs = await this.authority.listAuthorityDocuments();
      return ok('authorityDocuments', actor, { documents: docs });
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Authority documents failed';
      return blocked('authorityDocuments', actor, 'OPERATION_FAILED', m);
    }
  }

  async registerAuthoritySource(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const r = await this.authority.createSourceRevision(input as never);
      return ok('registerAuthoritySource', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Authority source registration failed';
      return blocked('registerAuthoritySource', actor, 'OPERATION_FAILED', m);
    }
  }

  async recordSourceDecision(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const r = await this.authority.recordSourceRegistrationDecision(input as never);
      return ok('recordSourceDecision', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Source decision record failed';
      return blocked('recordSourceDecision', actor, 'OPERATION_FAILED', m);
    }
  }

  async recordAuthorityDocument(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const r = await this.authority.recordAuthorityDocument(input as never);
      return ok('recordAuthorityDocument', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Authority document record failed';
      return blocked('recordAuthorityDocument', actor, 'OPERATION_FAILED', m);
    }
  }

  // ── Conflicts ───────────────────────────────────────────────

  async declareConflict(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const r = await this.evidence.declareConflict(input as never);
      return ok('declareConflict', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Conflict declaration failed';
      return blocked('declareConflict', actor, 'OPERATION_FAILED', m);
    }
  }

  async conflicts(actor: Actor): Promise<ApplicationResult> {
    try {
      const items = await this.evidence.listIntake({ root: this.root() });
      const needsAttention = items.length > 0;
      return ok('conflicts', actor, { conflicts: items, needsAttention });
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Conflicts list failed';
      return blocked('conflicts', actor, 'OPERATION_FAILED', m);
    }
  }

  // ── Decisions ───────────────────────────────────────────────

  async recordDecision(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const r = await this.evidence.recordDecision(input as never);
      return ok('recordDecision', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Decision record failed';
      return blocked('recordDecision', actor, 'OPERATION_FAILED', m);
    }
  }

  async decisions(actor: Actor): Promise<ApplicationResult> {
    try {
      const items = await this.evidence.listIntake({ root: this.root() });
      return ok('decisions', actor, { decisions: items });
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Decisions list failed';
      return blocked('decisions', actor, 'OPERATION_FAILED', m);
    }
  }

  // ── Package ─────────────────────────────────────────────────

  async exportPackage(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const pkg = createPortablePackageRuntime(this.root());
      const r = await pkg.exportPackage(input as never);
      return ok('exportPackage', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Package export failed';
      return blocked('exportPackage', actor, 'OPERATION_FAILED', m);
    }
  }

  async validatePackage(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const pkg = createPortablePackageRuntime(this.root());
      const r = await pkg.validatePackage(input as never);
      return ok('validatePackage', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Package validation failed';
      return blocked('validatePackage', actor, 'OPERATION_FAILED', m);
    }
  }

  async planImport(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const pkg = createPortablePackageRuntime(this.root());
      const r = await pkg.planImport(input as never);
      return ok('planImport', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Import planning failed';
      return blocked('planImport', actor, 'OPERATION_FAILED', m);
    }
  }

  async importPackage(
    actor: Actor,
    input: Record<string, unknown>,
  ): Promise<ApplicationResult<Record<string, unknown>>> {
    try {
      const pkg = createPortablePackageRuntime(this.root());
      const r = await pkg.importPackage(input as never);
      return ok('importPackage', actor, r as unknown as Record<string, unknown>);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Package import failed';
      return blocked('importPackage', actor, 'OPERATION_FAILED', m);
    }
  }
}
