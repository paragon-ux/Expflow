export type OperationKind = 'init' | 'sync' | 'restore';
export type ReceiptStatus =
  'committed' | 'no_change' | 'rejected' | 'partial_post_commit' | 'failed';
export type IdentityDirective = 'auto' | 'preserve' | 'new' | 'replace';
export type ChangeKind =
  'add' | 'modify' | 'move' | 'delete' | 'restore' | 'materialize_projection';
export type ContinuityBasis =
  | 'new_explicit'
  | 'same_path_default'
  | 'preserve_explicit'
  | 'replace_explicit'
  | 'migration_declared';

export interface RequestedBy {
  readonly kind: 'user' | 'agent' | 'policy' | 'integration' | 'model' | 'system';
  readonly name: string;
  readonly version?: string | null;
  readonly model?: string | null;
}

export interface PathSelectorRecord {
  readonly root?: string;
  readonly include: readonly string[];
  readonly exclude: readonly string[];
  readonly description?: string | null;
}

export interface OperationChange {
  readonly kind: ChangeKind;
  readonly path: string;
  readonly from_path?: string | null;
  readonly identity_directive: IdentityDirective;
  readonly node_id?: string | null;
  readonly node_revision?: number | null;
  readonly basis_note?: string | null;
}

export interface AutomationOptions {
  readonly run_structural_validation: boolean;
  readonly run_semantic_assertions: boolean;
  readonly detect_workflows: boolean;
  readonly project_manifests: boolean;
  readonly semantic_refresh_on_no_change?: boolean;
}

export interface OperationPlanRecord {
  readonly schema_version: '2.3';
  readonly operation_id: string;
  readonly project_id: string;
  readonly operation_type: OperationKind;
  readonly requested_at: string;
  readonly requested_by: RequestedBy;
  readonly expected_head: string | null;
  readonly scope: PathSelectorRecord;
  readonly changed_path_hints?: readonly string[];
  readonly changes: readonly OperationChange[];
  readonly authority_source_refs?: readonly string[];
  readonly workflow_hints?: readonly object[];
  readonly automation: AutomationOptions;
}

export interface ProjectRecord {
  readonly schema_version: '2.3';
  readonly project_id: string;
  readonly root_path: string;
  readonly created_at: string;
  readonly head_tree_revision_id: string | null;
  readonly projection_root: '.expflow/projections';
  readonly managed_exclusions: readonly string[];
  readonly policy_profile?: string;
  readonly hook_profile?: string | null;
  readonly authority_document_profile?: 'split' | 'unified' | 'mixed';
  readonly current_manifest_heads?: Record<string, string | null>;
}

export interface NodeRevisionRecord {
  readonly schema_version: '2.3';
  readonly node_id: string;
  readonly revision: number;
  readonly previous_revision?: number | null;
  readonly original_filename: string;
  readonly media_type?: string | null;
  readonly object_locator: string;
  readonly content_digest: string;
  readonly byte_size: number;
  readonly storage_method: 'copy' | 'reflink';
  readonly created_at: string;
  readonly created_by_operation: string;
  readonly source_kind?:
    | 'working_tree'
    | 'historical_restore'
    | 'external_import'
    | 'generated_materialization'
    | 'migration';
  readonly continuity_basis: ContinuityBasis;
}

export interface TreeEntryRecord {
  readonly relative_path: string;
  readonly entry_kind: 'file' | 'directory' | 'external_reference';
  readonly node_id?: string | null;
  readonly node_revision?: number | null;
  readonly external_locator?: string | null;
  readonly folder_name?: string | null;
  readonly filename?: string | null;
  readonly occupancy_status: 'present' | 'historical' | 'missing' | 'external';
  readonly node_content_digest?: string | null;
}

export interface TreeRevisionRecord {
  readonly schema_version: '2.3';
  readonly tree_revision_id: string;
  readonly sequence: number;
  readonly project_id: string;
  readonly parent_tree_revision_id?: string | null;
  readonly created_at: string;
  readonly created_by_operation: string;
  readonly source:
    'initialization' | 'sync' | 'restore' | 'migration' | 'projection_materialization';
  readonly scope?: PathSelectorRecord;
  readonly entries: readonly TreeEntryRecord[];
  readonly removed_paths?: readonly string[];
  readonly content_digest: string;
  readonly notes?: string | null;
}

export interface ValidationResultRecord {
  readonly schema_version: '2.3';
  readonly validation_id: string;
  readonly operation_id: string;
  readonly validator: string;
  readonly validator_version?: string | null;
  readonly status: 'pass' | 'warn' | 'fail' | 'error';
  readonly blocking: boolean;
  readonly checked_at: string;
  readonly findings: readonly {
    readonly code: string;
    readonly message: string;
    readonly relative_path?: string | null;
    readonly details?: object | null;
  }[];
}

export interface OperationReceiptRecord {
  readonly schema_version: '2.3';
  readonly operation_id: string;
  readonly project_id: string;
  readonly status: ReceiptStatus;
  readonly started_at: string;
  readonly finished_at: string;
  readonly previous_head?: string | null;
  readonly new_head?: string | null;
  readonly node_revision_refs?: readonly string[];
  readonly validation_refs: readonly string[];
  readonly assertion_refs?: readonly string[];
  readonly decision_refs?: readonly string[];
  readonly manifest_revision_refs?: readonly string[];
  readonly workflow_occurrence_refs?: readonly string[];
  readonly warnings: readonly string[];
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly recoverable: boolean;
    readonly recommended_action?: string | null;
  } | null;
}

export interface StatusReportRecord {
  readonly schema_version: '2.3';
  readonly project_id: string;
  readonly head_tree_revision_id: string | null;
  readonly working_tree_state: 'clean' | 'drifted' | 'invalid' | 'uninitialized';
  readonly generated_at: string;
  readonly pending_changes?: readonly object[];
  readonly unresolved_items: readonly string[];
  readonly open_conflict_refs?: readonly string[];
  readonly review_request_refs?: readonly string[];
  readonly workflow_occurrence_refs?: readonly string[];
  readonly manifest_heads: Record<string, { manifest_revision_ref: string | null; status: string }>;
  readonly automation_state: {
    readonly pending_hooks: readonly string[];
    readonly failed_hooks: readonly string[];
  };
  readonly recommended_action?: string | null;
}

export interface ScannedFile {
  readonly relative_path: string;
  readonly absolute_path: string;
  readonly filename: string;
  readonly folder_name: string | null;
  readonly byte_size: number;
  readonly content_digest: string;
}

export interface IdentityProposal {
  readonly kind: 'digest_similarity_without_identity_preservation';
  readonly from_path: string;
  readonly path: string;
  readonly previous_node_id: string;
  readonly content_digest: string;
}

export interface CandidateNodeRevision {
  readonly record: NodeRevisionRecord;
  readonly source_path: string;
}

export interface CandidateTree {
  readonly operation_id: string;
  readonly project_id: string;
  readonly parent_tree_revision_id: string | null;
  readonly sequence: number;
  readonly source: TreeRevisionRecord['source'];
  readonly scope: PathSelectorRecord;
  readonly entries: readonly TreeEntryRecord[];
  readonly removed_paths: readonly string[];
  readonly new_node_revisions: readonly CandidateNodeRevision[];
  readonly identity_proposals: readonly IdentityProposal[];
  readonly content_digest: string;
}
