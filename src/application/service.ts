/**
 * Expflow 1.2.0 Application Command Service
 *
 * Actor-ambivalent command layer wrapping the existing ExpflowRuntime
 * with the new result envelope and actor attribution.
 */
import { randomBytes } from 'node:crypto';
import { VERSION } from '../core/version.js';
import { createRuntime } from '../operations/runtime.js';
import type { ExpflowRuntime } from '../operations/runtime.js';
import type {
  Actor,
  ApplicationResult,
  CapabilityDescriptor,
  CommandOptions,
  ErrorCode,
  Plan,
} from './types.js';

export type * from './types.js';

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

export class ApplicationService {
  private rt: ExpflowRuntime;
  readonly projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.rt = createRuntime();
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

  // ── Scaffolds (TODO: wire to runtime in Phase 5/6) ────────
  // eslint-disable-next-line @typescript-eslint/require-await
  async workflowList(actor: Actor): Promise<ApplicationResult> {
    return ok('workflowList', actor, { workflows: [] });
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async conflicts(actor: Actor): Promise<ApplicationResult> {
    return ok('conflicts', actor, { conflicts: [], needsAttention: false });
  }
}
