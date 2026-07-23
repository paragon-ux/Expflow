import type { RequestedBy } from '../material/types.js';

export const PORTABLE_PACKAGE_VERSION = '1.0.0';

export type PortableEvidencePolicy = 'include_normalized' | 'external_reference_only';
export type PortableImportEffect = 'create' | 'exists_same' | 'collision' | 'missing_external';
export type PortableResumeState = 'ready' | 'blocked' | 'partial';

export interface PortablePackagePayload {
  readonly kind:
    | 'object'
    | 'tree_revision'
    | 'node_revision'
    | 'operation_receipt'
    | 'authority_source'
    | 'authority_decision'
    | 'authority_document'
    | 'semantic_assertion'
    | 'semantic_decision'
    | 'semantic_conflict'
    | 'semantic_review_request'
    | 'source_correspondence'
    | 'artifact_cluster'
    | 'workflow_occurrence'
    | 'virtual_artifact'
    | 'materialization_event'
    | 'evidence_intake';
  readonly ref: string;
  readonly path: string;
  readonly digest: string;
  readonly byte_size: number;
}

export interface PortablePackageExternalReference {
  readonly ref: string;
  readonly locator: string;
  readonly reason: string;
}

export interface PortablePackageManifest {
  readonly schema_version: '2.5';
  readonly package_format_version: typeof PORTABLE_PACKAGE_VERSION;
  readonly package_id: string;
  readonly producer: {
    readonly name: 'expflow';
    readonly package_version: string;
  };
  readonly source_project_id: string;
  readonly selected_workflow_occurrence_id: string;
  readonly selected_tree_revision_ids: readonly string[];
  readonly selected_material_head: string | null;
  readonly evidence_policy: PortableEvidencePolicy;
  readonly created_at: string;
  readonly created_by: RequestedBy;
  readonly payloads: readonly PortablePackagePayload[];
  readonly external_references: readonly PortablePackageExternalReference[];
  readonly warnings: readonly string[];
  readonly readiness: {
    readonly status: PortableResumeState;
    readonly unresolved_dependency_refs: readonly string[];
  };
}

export interface ExportPortablePackageInput {
  readonly root?: string;
  readonly workflowOccurrenceId: string;
  readonly outputDirectory: string;
  readonly requestedBy: RequestedBy;
  readonly evidencePolicy?: PortableEvidencePolicy;
}

export interface ValidatePortablePackageInput {
  readonly packageDirectory: string;
}

export interface PlanPortableImportInput {
  readonly root?: string;
  readonly packageDirectory: string;
}

export interface ExecutePortableImportInput extends PlanPortableImportInput {
  readonly allowCollisions?: false;
}

export interface PortableImportEffectRecord {
  readonly effect: PortableImportEffect;
  readonly kind: PortablePackagePayload['kind'] | 'external_reference';
  readonly ref: string;
  readonly path?: string;
  readonly reason?: string;
}

export interface PortableImportPlan {
  readonly package_id: string;
  readonly package_format_version: typeof PORTABLE_PACKAGE_VERSION;
  readonly target_project_id: string;
  readonly source_project_id: string;
  readonly selected_workflow_occurrence_id: string;
  readonly effects: readonly PortableImportEffectRecord[];
  readonly blocking: boolean;
  readonly resume: {
    readonly state: PortableResumeState;
    readonly workflow_occurrence_id: string;
    readonly unresolved_dependency_refs: readonly string[];
    readonly can_resume_materialization: boolean;
    readonly can_resume_verification: boolean;
    readonly can_resume_reuse: boolean;
  };
}

export interface PortableImportResult {
  readonly package_id: string;
  readonly imported_payloads: readonly string[];
  readonly skipped_payloads: readonly string[];
  readonly resume: PortableImportPlan['resume'];
}

export interface PortablePackageRuntime {
  exportPackage(input: ExportPortablePackageInput): Promise<PortablePackageManifest>;
  validatePackage(input: ValidatePortablePackageInput): Promise<PortablePackageManifest>;
  planImport(input: PlanPortableImportInput): Promise<PortableImportPlan>;
  importPackage(input: ExecutePortableImportInput): Promise<PortableImportResult>;
}
