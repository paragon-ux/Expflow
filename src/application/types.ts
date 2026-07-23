/**
 * Expflow 1.2.0 Application Command Service — Types
 *
 * Shared types for the actor-ambivalent command architecture.
 * All durable operations flow through the application command service.
 */

// ── Actor model ──────────────────────────────────────────────

export type ActorClass = 'human' | 'agent' | 'ci' | 'service' | 'tool' | 'unknown';

export interface Actor {
  identifier: string;
  class: ActorClass;
  interface: 'cli' | 'gui' | 'http-api' | 'library';
  tool?: string;
  rationale?: string;
  evidenceRefs?: string[];
  timestamp: string;
}

// ── Operation outcome ────────────────────────────────────────

export type OperationOutcome =
  | 'committed'
  | 'blocked'
  | 'cancelled'
  | 'partial'
  | 'unknown';

// ── Error codes ──────────────────────────────────────────────

export type ErrorCode =
  | 'STALE_PLAN'
  | 'STALE_HEAD'
  | 'CONFLICTING_DRIFT'
  | 'UNINITIALIZED'
  | 'INVALID_INPUT'
  | 'OPERATION_FAILED'
  | 'USAGE_ERROR'
  | 'INTERNAL_ERROR';

export interface ApplicationError {
  code: ErrorCode;
  message: string;
  remediation?: string;
}

// ── Result envelope ──────────────────────────────────────────

export interface ApplicationResult<T = unknown> {
  ok: boolean;
  operation: string;
  outcome: OperationOutcome;
  receiptId?: string;
  result?: T;
  planToken?: string;
  error?: ApplicationError;
  warnings: string[];
  blockers: string[];
  actor: Actor;
  timestamp: string;
}

// ── Plan token ───────────────────────────────────────────────

export interface Plan<T = unknown> {
  token: string;
  expectedHead: string | null;
  operation: string;
  plan: T;
  createdAt: string;
}

export class StalePlanError extends Error {
  constructor(
    public readonly expectedHead: string,
    public readonly actualHead: string,
  ) {
    super(`Plan was generated for head ${expectedHead}, but current head is ${actualHead}`);
    this.name = 'StalePlanError';
  }
}

// ── Command families ─────────────────────────────────────────

export type CommandFamily =
  | 'project'
  | 'material'
  | 'workflow'
  | 'evidence'
  | 'authority'
  | 'conflicts'
  | 'decisions'
  | 'package'
  | 'reporting';

// ── Capability descriptor ────────────────────────────────────

export interface CapabilityDescriptor {
  version: string;
  commandFamilies: CommandFamily[];
  features: {
    jsonOutput: boolean;
    nonInteractive: boolean;
    planApply: boolean;
    actorAttribution: boolean;
    capabilityDiscovery: boolean;
  };
  supportedOs: string[];
  nodeVersions: string[];
}

// ── Command options ──────────────────────────────────────────

export interface CommandOptions {
  json?: boolean;
  nonInteractive?: boolean;
  yes?: boolean;
  dryRun?: boolean;
  expectedHead?: string;
  planToken?: string;
  force?: boolean;
}
