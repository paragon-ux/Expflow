export type ArchiveEntryKind = 'file' | 'directory' | 'symlink' | 'device';
export type RemoteProcessingMode = 'local_only' | 'remote_allowed_with_redaction';

export interface SecurityPolicy {
  readonly maxArchiveFiles: number;
  readonly maxArchiveExpandedBytes: number;
  readonly maxArchiveEntryBytes: number;
  readonly maxArchiveDepth: number;
  readonly allowArchiveLinks: boolean;
  readonly remoteProcessing: RemoteProcessingMode;
  readonly redactSecretsBeforeRemote: boolean;
  readonly allowedLicenses: readonly string[];
  readonly blockedReuseRestrictions: readonly string[];
  readonly hookTimeoutMs: number;
  readonly hookInputLimitBytes: number;
  readonly hookOutputLimitBytes: number;
  readonly networkAccess: 'blocked';
  readonly environmentProfile: 'minimal';
  readonly allowGeneratedCodeExecution: false;
}

export interface ArchiveEntryInput {
  readonly path: string;
  readonly kind: ArchiveEntryKind;
  readonly expandedBytes: number;
  readonly compressedBytes?: number;
  readonly linkTarget?: string | null;
}

export interface ArchiveQuarantineReport {
  readonly quarantine_id: string;
  readonly quarantine_locator: string;
  readonly created_at: string;
  readonly status: 'accepted';
  readonly accepted_entries: readonly string[];
  readonly expanded_bytes: number;
  readonly compressed_bytes: number;
  readonly policy: {
    readonly max_files: number;
    readonly max_expanded_bytes: number;
    readonly max_entry_bytes: number;
    readonly max_depth: number;
  };
}

export interface SecretFinding {
  readonly kind: 'aws_access_key' | 'private_key' | 'generic_secret';
  readonly start: number;
  readonly end: number;
}

export interface SourceContentPreparation {
  readonly prepared_at: string;
  readonly control_instructions: readonly string[];
  readonly source_data: {
    readonly source_ref: string;
    readonly content: string;
    readonly content_is_instruction: false;
  };
  readonly secret_findings: readonly SecretFinding[];
  readonly remote_disclosure: RemoteDisclosureRecord | null;
}

export interface RemoteDisclosureRecord {
  readonly disclosure_id: string;
  readonly disclosed_at: string;
  readonly source_ref: string;
  readonly policy_profile: RemoteProcessingMode;
  readonly redacted_secret_count: number;
  readonly disclosed_bytes: number;
}

export interface PrepareSourceContentInput {
  readonly sourceRef: string;
  readonly content: string;
  readonly remoteProcessingRequested?: boolean;
  readonly policy?: Partial<SecurityPolicy>;
}

export interface ReusePolicyInput {
  readonly licenseExpression?: string | null;
  readonly reuseRestrictions?: readonly string[];
  readonly policy?: Partial<SecurityPolicy>;
}
