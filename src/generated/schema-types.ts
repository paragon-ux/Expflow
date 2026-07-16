/**
 * Generated Gate A schema descriptors.
 *
 * This file is a static type/catalog artifact. It does not load schemas or
 * implement runtime validation.
 */

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { readonly [key: string]: JsonValue };

export interface ExpflowSchemaRecord {
  readonly schema_version?: '2.3';
  readonly [key: string]: JsonValue | undefined;
}

export interface ArtifactCluster extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'artifact-cluster.schema.json';
}
export interface AuthorityDocument extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'authority-document.schema.json';
}
export interface AuthoritySource extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'authority-source.schema.json';
}
export interface Conflict extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'conflict.schema.json';
}
export interface EquivalenceEvaluation extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'equivalence-evaluation.schema.json';
}
export interface HookEnvelope extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'hook-envelope.schema.json';
}
export interface ManifestRevision extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'manifest-revision.schema.json';
}
export interface MaterializationEvent extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'materialization-event.schema.json';
}
export interface NodeRevision extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'node-revision.schema.json';
}
export interface OperationPlan extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'operation-plan.schema.json';
}
export interface OperationReceipt extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'operation-receipt.schema.json';
}
export interface PathSelector extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'path-selector.schema.json';
}
export interface Project extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'project.schema.json';
}
export interface RegenerationAttempt extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'regeneration-attempt.schema.json';
}
export interface ReuseResult extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'reuse-result.schema.json';
}
export interface ReviewRequest extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'review-request.schema.json';
}
export interface SemanticAssertion extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'semantic-assertion.schema.json';
}
export interface SemanticDecision extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'semantic-decision.schema.json';
}
export interface SourceCorrespondence extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'source-correspondence.schema.json';
}
export interface SourceRegistrationDecision extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'source-registration-decision.schema.json';
}
export interface StatusReport extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'status-report.schema.json';
}
export interface TreeEntry extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'tree-entry.schema.json';
}
export interface TreeRevision extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'tree-revision.schema.json';
}
export interface ValidationResult extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'validation-result.schema.json';
}
export interface VirtualArtifact extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'virtual-artifact.schema.json';
}
export interface WorkflowOccurrence extends ExpflowSchemaRecord {
  readonly __schemaFile?: 'workflow-occurrence.schema.json';
}

export interface CoreSchemaDescriptor {
  readonly file: string;
  readonly id: string;
  readonly title: string;
  readonly typeName: string;
}

export const CORE_SCHEMA_DESCRIPTORS = [
  {
    file: 'artifact-cluster.schema.json',
    id: 'https://expflow.dev/schemas/2.3/artifact-cluster.schema.json',
    title: 'Derived Artifact Cluster View',
    typeName: 'ArtifactCluster',
  },
  {
    file: 'authority-document.schema.json',
    id: 'https://expflow.dev/schemas/2.3/authority-document.schema.json',
    title: 'Readable Authority Document Profile',
    typeName: 'AuthorityDocument',
  },
  {
    file: 'authority-source.schema.json',
    id: 'https://expflow.dev/schemas/2.3/authority-source.schema.json',
    title: 'Extensible Authority Source Revision',
    typeName: 'AuthoritySource',
  },
  {
    file: 'conflict.schema.json',
    id: 'https://expflow.dev/schemas/2.3/conflict.schema.json',
    title: 'Immutable Conflict Declaration',
    typeName: 'Conflict',
  },
  {
    file: 'equivalence-evaluation.schema.json',
    id: 'https://expflow.dev/schemas/2.3/equivalence-evaluation.schema.json',
    title: 'Regeneration or Workflow Equivalence Evaluation',
    typeName: 'EquivalenceEvaluation',
  },
  {
    file: 'hook-envelope.schema.json',
    id: 'https://expflow.dev/schemas/2.3/hook-envelope.schema.json',
    title: 'Python Hook Envelope',
    typeName: 'HookEnvelope',
  },
  {
    file: 'manifest-revision.schema.json',
    id: 'https://expflow.dev/schemas/2.3/manifest-revision.schema.json',
    title: 'Versioned Manifest Revision',
    typeName: 'ManifestRevision',
  },
  {
    file: 'materialization-event.schema.json',
    id: 'https://expflow.dev/schemas/2.3/materialization-event.schema.json',
    title: 'Virtual-to-Material Materialization Event',
    typeName: 'MaterializationEvent',
  },
  {
    file: 'node-revision.schema.json',
    id: 'https://expflow.dev/schemas/2.3/node-revision.schema.json',
    title: 'Immutable Material Node Revision',
    typeName: 'NodeRevision',
  },
  {
    file: 'operation-plan.schema.json',
    id: 'https://expflow.dev/schemas/2.3/operation-plan.schema.json',
    title: 'Expflow Operation Plan',
    typeName: 'OperationPlan',
  },
  {
    file: 'operation-receipt.schema.json',
    id: 'https://expflow.dev/schemas/2.3/operation-receipt.schema.json',
    title: 'Operation Receipt',
    typeName: 'OperationReceipt',
  },
  {
    file: 'path-selector.schema.json',
    id: 'https://expflow.dev/schemas/2.3/path-selector.schema.json',
    title: 'Path Selector',
    typeName: 'PathSelector',
  },
  {
    file: 'project.schema.json',
    id: 'https://expflow.dev/schemas/2.3/project.schema.json',
    title: 'Expflow Project',
    typeName: 'Project',
  },
  {
    file: 'regeneration-attempt.schema.json',
    id: 'https://expflow.dev/schemas/2.3/regeneration-attempt.schema.json',
    title: 'Regeneration Attempt',
    typeName: 'RegenerationAttempt',
  },
  {
    file: 'reuse-result.schema.json',
    id: 'https://expflow.dev/schemas/2.3/reuse-result.schema.json',
    title: 'Structural Workflow Reuse Result',
    typeName: 'ReuseResult',
  },
  {
    file: 'review-request.schema.json',
    id: 'https://expflow.dev/schemas/2.3/review-request.schema.json',
    title: 'Review Request',
    typeName: 'ReviewRequest',
  },
  {
    file: 'semantic-assertion.schema.json',
    id: 'https://expflow.dev/schemas/2.3/semantic-assertion.schema.json',
    title: 'Attributed Semantic Assertion',
    typeName: 'SemanticAssertion',
  },
  {
    file: 'semantic-decision.schema.json',
    id: 'https://expflow.dev/schemas/2.3/semantic-decision.schema.json',
    title: 'Immutable Semantic Decision',
    typeName: 'SemanticDecision',
  },
  {
    file: 'source-correspondence.schema.json',
    id: 'https://expflow.dev/schemas/2.3/source-correspondence.schema.json',
    title: 'Optional Import Source Correspondence Proposal',
    typeName: 'SourceCorrespondence',
  },
  {
    file: 'source-registration-decision.schema.json',
    id: 'https://expflow.dev/schemas/2.3/source-registration-decision.schema.json',
    title: 'Authority Source Registration Decision',
    typeName: 'SourceRegistrationDecision',
  },
  {
    file: 'status-report.schema.json',
    id: 'https://expflow.dev/schemas/2.3/status-report.schema.json',
    title: 'Integrated Project Status Report',
    typeName: 'StatusReport',
  },
  {
    file: 'tree-entry.schema.json',
    id: 'https://expflow.dev/schemas/2.3/tree-entry.schema.json',
    title: 'Tree Path Occupancy',
    typeName: 'TreeEntry',
  },
  {
    file: 'tree-revision.schema.json',
    id: 'https://expflow.dev/schemas/2.3/tree-revision.schema.json',
    title: 'Immutable Relative Tree Revision',
    typeName: 'TreeRevision',
  },
  {
    file: 'validation-result.schema.json',
    id: 'https://expflow.dev/schemas/2.3/validation-result.schema.json',
    title: 'Validation Result',
    typeName: 'ValidationResult',
  },
  {
    file: 'virtual-artifact.schema.json',
    id: 'https://expflow.dev/schemas/2.3/virtual-artifact.schema.json',
    title: 'Virtual Generated Artifact',
    typeName: 'VirtualArtifact',
  },
  {
    file: 'workflow-occurrence.schema.json',
    id: 'https://expflow.dev/schemas/2.3/workflow-occurrence.schema.json',
    title: 'Workflow Occurrence',
    typeName: 'WorkflowOccurrence',
  },
] as const satisfies readonly CoreSchemaDescriptor[];

export type CoreSchemaFile = (typeof CORE_SCHEMA_DESCRIPTORS)[number]['file'];
export type CoreSchemaId = (typeof CORE_SCHEMA_DESCRIPTORS)[number]['id'];
export type CoreSchemaTypeName = (typeof CORE_SCHEMA_DESCRIPTORS)[number]['typeName'];
