export interface LegacyInventoryEntry {
  readonly relative_path: string;
  readonly typed_folder: string | null;
  readonly byte_size: number;
  readonly content_digest: string;
}

export interface LegacyMigrationReport {
  readonly migration_id: string;
  readonly schema_version: '2.3';
  readonly created_at: string;
  readonly project_root: string;
  readonly initial_tree_revision_id: string;
  readonly inventory: readonly LegacyInventoryEntry[];
  readonly identity_map: readonly {
    readonly relative_path: string;
    readonly node_ref: string;
    readonly basis: 'migration_declared';
  }[];
  readonly ambiguity_report: readonly string[];
  readonly unsupported_features: readonly string[];
  readonly limitations: readonly string[];
  readonly user_paths_preserved: true;
  readonly authority_fabricated: false;
  readonly rollback: {
    readonly original_source_retained: true;
    readonly retry_behavior: string;
  };
}

export interface LegacyMigrationInput {
  readonly root?: string;
  readonly typedFolders?: readonly string[];
}
