import { execFileSync } from 'node:child_process';
import { isAbsolute, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMarkedReferences } from './check-config-references.js';

const CONTRACT_PATH = '.config-reference-reconciliation.yaml';
const VALID_ROLE_CLASSES = new Set([
  'active-authority',
  'active-evidence',
  'frozen-evidence',
  'immutable-architecture',
  'operational-automation',
]);
const VALID_ROLE_KINDS = new Set(['file', 'directory']);
const REQUIRED_CONTRACT_ROLES = [
  'repository_governance',
  'active_workflow',
  'active_status',
  'glossary',
  'reconciliation_policy',
  'phase_reports',
];
const LEGACY_ROOT_DOCS = [
  'docs/ARCHITECTURE_DECISIONS.md',
  'docs/AUTHORITY_AND_SEMANTIC_MODEL.md',
  'docs/CURRENT_STATUS_MATRIX.md',
  'docs/DATA_MODEL.md',
  'docs/ERROR_REGISTRY.md',
  'docs/EXTENSION_BOUNDARY.md',
  'docs/GLOSSARY.md',
  'docs/IDENTITY_AND_REVISION_MODEL.md',
  'docs/MATERIAL_RECORD_FORMAT.md',
  'docs/MVP_SCOPE.md',
  'docs/PROTOCOL_CORE_SPEC.md',
  'docs/RELEASE_PUBLISHING.md',
  'docs/SECURITY_MODEL.md',
  'docs/STORAGE_AND_RECOVERY.md',
  'docs/TEST_MATRIX.md',
  'docs/V1_COMPATIBILITY.md',
  'docs/WORKFLOW_AND_PROJECTION_MODEL.md',
  'docs/release_notes/GITHUB_RELEASE_NOTE_V1_0_1.md',
];

export type SkillContractMode = 'staged' | 'commit-range';

export interface SkillContractOptions {
  mode?: SkillContractMode;
  base?: string;
  head?: string;
}

interface RoleDeclaration {
  name: string;
  path: string;
  className: string;
  kind: 'file' | 'directory';
  line: number;
}

interface ContractDeclaration {
  roles: RoleDeclaration[];
  roleDuplicates: string[];
  surfaces: Map<string, string[]>;
  protectedTargets: string[];
  protectedSidecar: string | null;
  commands: Map<string, string>;
  problems: string[];
}

interface Snapshot {
  label: string;
  files: Set<string>;
  read(pathValue: string): string | null;
}

interface ValidationStats {
  rolesDeclared: number;
  surfacesDeclared: number;
  surfaceFilesChecked: number;
  skillsChecked: number;
  workflowFilesChecked: number;
  markedWorkflowReferencesChecked: number;
  contractRoleChanges: number;
}

export interface SkillContractResult {
  ok: boolean;
  output: string;
  failures: string[];
  stats: ValidationStats;
}

function toRepoPath(pathValue: string): string {
  return pathValue.replace(/\\/g, '/').replace(/^\.\//, '');
}

function toNativePath(pathValue: string): string {
  return pathValue.split('/').join(sep);
}

function stripInlineComment(value: string): string {
  return value
    .replace(/\s+#.*$/, '')
    .trim()
    .replace(/^["']|["']$/g, '');
}

function runGit(repoRoot: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function tryRunGit(repoRoot: string, args: string[]): string | null {
  try {
    return runGit(repoRoot, args);
  } catch {
    return null;
  }
}

function resolveRepoRoot(repoRootInput?: string): string {
  return repoRootInput
    ? resolve(repoRootInput)
    : runGit(process.cwd(), ['rev-parse', '--show-toplevel']).trim();
}

function readIndex(repoRoot: string, pathValue: string): string | null {
  return tryRunGit(repoRoot, ['show', `:${pathValue}`]);
}

function readRevision(repoRoot: string, revision: string, pathValue: string): string | null {
  return tryRunGit(repoRoot, ['show', `${revision}:${pathValue}`]);
}

function resolveCommit(repoRoot: string, revision: string): string | null {
  return tryRunGit(repoRoot, ['rev-parse', '--verify', `${revision}^{commit}`])?.trim() ?? null;
}

function parseGitFiles(output: string): Set<string> {
  return new Set(output.split('\0').filter(Boolean).map(toRepoPath));
}

function stagedSnapshot(repoRoot: string): Snapshot {
  return {
    label: 'staged index',
    files: parseGitFiles(runGit(repoRoot, ['ls-files', '-z'])),
    read: (pathValue: string) => readIndex(repoRoot, pathValue),
  };
}

function revisionSnapshot(repoRoot: string, revision: string): Snapshot {
  return {
    label: revision,
    files: parseGitFiles(runGit(repoRoot, ['ls-tree', '-r', '--name-only', '-z', revision])),
    read: (pathValue: string) => readRevision(repoRoot, revision, pathValue),
  };
}

function normalizeContractPath(value: string): string {
  return toRepoPath(stripInlineComment(value));
}

function parseContract(content: string): ContractDeclaration {
  const roles: RoleDeclaration[] = [];
  const roleDuplicates: string[] = [];
  const surfaces = new Map<string, string[]>();
  const commands = new Map<string, string>();
  const protectedTargets: string[] = [];
  const problems: string[] = [];
  let protectedSidecar: string | null = null;
  let section = '';
  let currentRole: RoleDeclaration | null = null;
  let currentSurface = '';
  const seenRoles = new Set<string>();

  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const lineNumber = index + 1;
    if (!line.trim() || line.trimStart().startsWith('#')) {
      continue;
    }

    const topLevel = /^([A-Za-z][A-Za-z0-9_]*):(?:\s*(.*))?$/.exec(line);
    if (topLevel) {
      section = topLevel[1] ?? '';
      currentRole = null;
      currentSurface = '';
      if (section === 'protected_sidecar') {
        protectedSidecar = normalizeContractPath(topLevel[2] ?? '');
      }
      continue;
    }

    if (section === 'roles') {
      const roleHeader = /^  ([a-z][a-z0-9_]*):\s*$/.exec(line);
      if (roleHeader?.[1]) {
        const roleName = roleHeader[1];
        if (seenRoles.has(roleName)) {
          roleDuplicates.push(roleName);
        }
        seenRoles.add(roleName);
        currentRole = {
          name: roleName,
          path: '',
          className: '',
          kind: 'file',
          line: lineNumber,
        };
        roles.push(currentRole);
        continue;
      }

      const roleProperty = /^    (path|class|kind):\s*(.+?)\s*$/.exec(line);
      if (roleProperty?.[1] && currentRole) {
        const value = normalizeContractPath(roleProperty[2] ?? '');
        if (roleProperty[1] === 'path') {
          currentRole.path = value;
        } else if (roleProperty[1] === 'class') {
          currentRole.className = value;
        } else if (roleProperty[1] === 'kind') {
          currentRole.kind = value as RoleDeclaration['kind'];
        }
        continue;
      }
    }

    if (section === 'surfaces') {
      const surfaceHeader = /^  ([a-z][a-z0-9_]*):\s*$/.exec(line);
      if (surfaceHeader?.[1]) {
        currentSurface = surfaceHeader[1];
        if (!surfaces.has(currentSurface)) {
          surfaces.set(currentSurface, []);
        }
        continue;
      }
      const surfacePattern = /^    -\s*(.+?)\s*$/.exec(line);
      if (surfacePattern?.[1] && currentSurface) {
        surfaces.get(currentSurface)?.push(normalizeContractPath(surfacePattern[1]));
        continue;
      }
    }

    if (section === 'protected_targets') {
      const protectedPattern = /^  -\s*(.+?)\s*$/.exec(line);
      if (protectedPattern?.[1]) {
        protectedTargets.push(normalizeContractPath(protectedPattern[1]));
        continue;
      }
    }

    if (section === 'commands') {
      const command = /^  ([a-z][a-z0-9_]*):\s*(.+?)\s*$/.exec(line);
      if (command?.[1]) {
        commands.set(command[1], stripInlineComment(command[2] ?? ''));
        continue;
      }
    }
  }

  return {
    roles,
    roleDuplicates,
    surfaces,
    protectedTargets,
    protectedSidecar,
    commands,
    problems,
  };
}

function isSafeRepoPath(pathValue: string): boolean {
  const nativePath = toNativePath(pathValue);
  return (
    pathValue.length > 0 &&
    !isAbsolute(nativePath) &&
    !pathValue.startsWith('../') &&
    !pathValue.includes('/../') &&
    !/^[a-z]:[\\/]/i.test(pathValue)
  );
}

function hasSnapshotPath(snapshot: Snapshot, role: RoleDeclaration): boolean {
  const pathValue = role.kind === 'directory' ? role.path.replace(/\/?$/, '/') : role.path;
  if (role.kind === 'directory') {
    return [...snapshot.files].some((file) => file.startsWith(pathValue));
  }
  return snapshot.files.has(role.path);
}

function globToRegExp(pattern: string): RegExp {
  let output = '^';
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index] ?? '';
    const next = pattern[index + 1] ?? '';
    if (char === '*' && next === '*') {
      output += '.*';
      index += 1;
    } else if (char === '*') {
      output += '[^/]*';
    } else {
      output += char.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
    }
  }
  output += '$';
  return new RegExp(output);
}

function expandPatterns(snapshot: Snapshot, patterns: string[]): string[] {
  const matches = new Set<string>();
  for (const pattern of patterns) {
    if (!pattern.includes('*')) {
      if (snapshot.files.has(pattern)) {
        matches.add(pattern);
      }
      continue;
    }
    const matcher = globToRegExp(pattern);
    for (const file of snapshot.files) {
      if (matcher.test(file)) {
        matches.add(file);
      }
    }
  }
  return [...matches].sort((left, right) => left.localeCompare(right));
}

function parseFrontmatter(content: string): { ok: boolean; name?: string; problems: string[] } {
  const problems: string[] = [];
  if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) {
    return { ok: false, problems: ['missing YAML frontmatter'] };
  }
  const lines = content.split(/\r?\n/);
  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (endIndex === -1) {
    return { ok: false, problems: ['unterminated YAML frontmatter'] };
  }

  const keys = new Set<string>();
  for (const line of lines.slice(1, endIndex)) {
    const match = /^([A-Za-z][A-Za-z0-9_-]*):/.exec(line);
    if (match?.[1]) {
      keys.add(match[1]);
    }
  }
  for (const required of ['name', 'description']) {
    if (!keys.has(required)) {
      problems.push(`missing frontmatter ${required}`);
    }
  }
  for (const key of keys) {
    if (key !== 'name' && key !== 'description') {
      problems.push(`unsupported frontmatter field ${key}`);
    }
  }

  const nameLine = lines.slice(1, endIndex).find((line) => line.startsWith('name:'));
  return {
    ok: problems.length === 0,
    name: nameLine ? nameLine.replace(/^name:\s*/, '').trim() : undefined,
    problems,
  };
}

function sectionLines(content: string, heading: string): string[] | null {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) {
    return null;
  }
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if ((lines[index] ?? '').startsWith('## ')) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end);
}

function rolesFromSkill(content: string): string[] | null {
  const lines = sectionLines(content, 'Required Reading Roles');
  if (lines === null) {
    return null;
  }
  const roles: string[] = [];
  for (const line of lines) {
    const match = /`([a-z][a-z0-9_]*)`/.exec(line);
    if (match?.[1]) {
      roles.push(match[1]);
    }
  }
  return roles;
}

function classRank(className: string): number {
  if (className === 'active-authority') {
    return 1;
  }
  if (className === 'operational-automation' || className === 'active-evidence') {
    return 2;
  }
  if (className === 'immutable-architecture') {
    return 3;
  }
  if (className === 'frozen-evidence') {
    return 4;
  }
  return 99;
}

function hasDisallowedLegacyPath(content: string, legacyPath: string): boolean {
  let offset = 0;
  while (offset < content.length) {
    const index = content.indexOf(legacyPath, offset);
    if (index === -1) {
      return false;
    }
    const prefix = content.slice(Math.max(0, index - 'docs/releases/v1.1.0/files/'.length), index);
    if (prefix !== 'docs/releases/v1.1.0/files/') {
      return true;
    }
    offset = index + legacyPath.length;
  }
  return false;
}

function validateRole(role: RoleDeclaration, snapshot: Snapshot, failures: string[]): void {
  if (!role.path) {
    failures.push(`${CONTRACT_PATH}:${role.line}: role ${role.name} is missing path`);
  }
  if (!role.className) {
    failures.push(`${CONTRACT_PATH}:${role.line}: role ${role.name} is missing class`);
  }
  if (!VALID_ROLE_CLASSES.has(role.className)) {
    failures.push(
      `${CONTRACT_PATH}:${role.line}: role ${role.name} has invalid class ${role.className}`,
    );
  }
  if (!VALID_ROLE_KINDS.has(role.kind)) {
    failures.push(`${CONTRACT_PATH}:${role.line}: role ${role.name} has invalid kind ${role.kind}`);
  }
  if (role.path && !isSafeRepoPath(role.path)) {
    failures.push(`${CONTRACT_PATH}:${role.line}: role ${role.name} path is not repository-local`);
  }
  if (role.path && isSafeRepoPath(role.path) && !hasSnapshotPath(snapshot, role)) {
    failures.push(
      `${CONTRACT_PATH}:${role.line}: role ${role.name} target does not exist in ${snapshot.label}: ${role.path}`,
    );
  }
}

function validateSkill(
  snapshot: Snapshot,
  pathValue: string,
  content: string,
  roleByName: Map<string, RoleDeclaration>,
  failures: string[],
): string | null {
  const frontmatter = parseFrontmatter(content);
  for (const problem of frontmatter.problems) {
    failures.push(`${pathValue}: ${problem}`);
  }

  const roles = rolesFromSkill(content);
  if (roles === null) {
    failures.push(`${pathValue}: missing Required Reading Roles section`);
  } else if (roles.length === 0) {
    failures.push(`${pathValue}: Required Reading Roles section declares no roles`);
  } else {
    let previousRank = 0;
    for (const roleName of roles) {
      const role = roleByName.get(roleName);
      if (!role) {
        failures.push(`${pathValue}: unknown required reading role ${roleName}`);
        continue;
      }
      const rank = classRank(role.className);
      if (rank < previousRank) {
        failures.push(`${pathValue}: active authority roles must precede historical/frozen roles`);
      }
      previousRank = Math.max(previousRank, rank);
    }
  }

  const oldRequiredReading = sectionLines(content, 'Required Reading');
  if (oldRequiredReading !== null) {
    const requiredText = oldRequiredReading.join('\n');
    if (/\b(?:AGENTS\.md|docs\/|[A-Za-z0-9_-]+\.md)\b/.test(requiredText)) {
      failures.push(`${pathValue}: required reading must use semantic roles, not document paths`);
    }
  }

  for (const legacyPath of LEGACY_ROOT_DOCS) {
    if (hasDisallowedLegacyPath(content, legacyPath)) {
      failures.push(`${pathValue}: stale moved legacy document path remains: ${legacyPath}`);
    }
  }

  if (!snapshot.files.has(pathValue)) {
    failures.push(`${pathValue}: skill is not present in ${snapshot.label}`);
  }

  return frontmatter.name ?? null;
}

function validateWorkflow(
  repoRoot: string,
  snapshot: Snapshot,
  pathValue: string,
  content: string,
  failures: string[],
  stats: ValidationStats,
): void {
  for (const legacyPath of LEGACY_ROOT_DOCS) {
    if (hasDisallowedLegacyPath(content, legacyPath)) {
      failures.push(`${pathValue}: stale moved legacy document path remains: ${legacyPath}`);
    }
  }

  if (/--notes-file\s+docs\//.test(content)) {
    failures.push(
      `${pathValue}: workflow notes-file input must use a declared variable or marked reference`,
    );
  }

  const parsed = parseMarkedReferences(repoRoot, pathValue, content);
  for (const problem of parsed.problems) {
    failures.push(`${problem.sourcePath}:${problem.line}: ${problem.message}`);
  }
  for (const reference of parsed.references) {
    stats.markedWorkflowReferencesChecked += 1;
    if (!snapshot.files.has(reference.targetPath)) {
      failures.push(
        `${pathValue}:${reference.line}: marked workflow reference does not exist in ${snapshot.label}: ${reference.targetPath}`,
      );
    }
  }
}

function emptyStats(): ValidationStats {
  return {
    rolesDeclared: 0,
    surfacesDeclared: 0,
    surfaceFilesChecked: 0,
    skillsChecked: 0,
    workflowFilesChecked: 0,
    markedWorkflowReferencesChecked: 0,
    contractRoleChanges: 0,
  };
}

function diffContractRoles(
  baseContract: ContractDeclaration,
  headContract: ContractDeclaration,
): number {
  const baseRoles = new Map(baseContract.roles.map((role) => [role.name, role]));
  let changes = 0;
  for (const headRole of headContract.roles) {
    const baseRole = baseRoles.get(headRole.name);
    if (
      !baseRole ||
      baseRole.path !== headRole.path ||
      baseRole.className !== headRole.className ||
      baseRole.kind !== headRole.kind
    ) {
      changes += 1;
    }
  }
  for (const baseRole of baseContract.roles) {
    if (!headContract.roles.some((role) => role.name === baseRole.name)) {
      changes += 1;
    }
  }
  return changes;
}

function validateSnapshot(
  repoRoot: string,
  snapshot: Snapshot,
  baseSnapshot?: Snapshot,
): SkillContractResult {
  const stats = emptyStats();
  const failures: string[] = [];
  const content = snapshot.read(CONTRACT_PATH);
  if (content === null) {
    failures.push(
      `${CONTRACT_PATH}: missing repository config-reference contract in ${snapshot.label}`,
    );
    return formatResult(failures, stats);
  }

  const contract = parseContract(content);
  failures.push(...contract.problems);
  stats.rolesDeclared = contract.roles.length;
  stats.surfacesDeclared = contract.surfaces.size;

  for (const duplicate of contract.roleDuplicates) {
    failures.push(`${CONTRACT_PATH}: duplicate role declaration ${duplicate}`);
  }

  const roleByName = new Map<string, RoleDeclaration>();
  for (const role of contract.roles) {
    roleByName.set(role.name, role);
    validateRole(role, snapshot, failures);
  }

  for (const requiredRole of REQUIRED_CONTRACT_ROLES) {
    if (!roleByName.has(requiredRole)) {
      failures.push(`${CONTRACT_PATH}: missing required semantic role ${requiredRole}`);
    }
  }

  if (!contract.protectedSidecar) {
    failures.push(`${CONTRACT_PATH}: missing protected_sidecar`);
  } else if (!snapshot.files.has(contract.protectedSidecar)) {
    failures.push(
      `${CONTRACT_PATH}: protected sidecar does not exist: ${contract.protectedSidecar}`,
    );
  }

  const surfaceFiles = new Set<string>();
  for (const patterns of contract.surfaces.values()) {
    for (const file of expandPatterns(snapshot, patterns)) {
      surfaceFiles.add(file);
    }
  }
  stats.surfaceFilesChecked = surfaceFiles.size;

  const skillNames = new Map<string, string>();
  for (const file of surfaceFiles) {
    const fileContent = snapshot.read(file);
    if (fileContent === null) {
      failures.push(`${file}: declared surface file could not be read from ${snapshot.label}`);
      continue;
    }
    if (/^\.agents\/skills\/[^/]+\/SKILL\.md$/.test(file)) {
      stats.skillsChecked += 1;
      const skillName = validateSkill(snapshot, file, fileContent, roleByName, failures);
      if (skillName) {
        const existing = skillNames.get(skillName);
        if (existing) {
          failures.push(
            `${file}: duplicate repository skill name ${skillName}; first seen in ${existing}`,
          );
        } else {
          skillNames.set(skillName, file);
        }
      }
      continue;
    }
    if (/^\.github\/workflows\/.+\.ya?ml$/.test(file)) {
      stats.workflowFilesChecked += 1;
      validateWorkflow(repoRoot, snapshot, file, fileContent, failures, stats);
    }
  }

  if (baseSnapshot) {
    const baseContent = baseSnapshot.read(CONTRACT_PATH);
    if (baseContent) {
      stats.contractRoleChanges = diffContractRoles(parseContract(baseContent), contract);
    }
  }

  return formatResult(failures, stats);
}

function formatResult(failures: string[], stats: ValidationStats): SkillContractResult {
  const output =
    failures.length === 0
      ? [
          'Skill contract validation',
          `Roles declared: ${stats.rolesDeclared}`,
          `Surfaces declared: ${stats.surfacesDeclared}`,
          `Surface files checked: ${stats.surfaceFilesChecked}`,
          `Repository skills checked: ${stats.skillsChecked}`,
          `Workflow files checked: ${stats.workflowFilesChecked}`,
          `Marked workflow references checked: ${stats.markedWorkflowReferencesChecked}`,
          `Contract role changes: ${stats.contractRoleChanges}`,
          'PASS',
        ].join('\n')
      : [
          'Skill contract validation failed',
          '',
          ...failures,
          '',
          'Resolve the contract, role, skill, or workflow path issue and rerun:',
          '  npm run check:skill-contracts',
        ].join('\n');

  return {
    ok: failures.length === 0,
    output,
    failures,
    stats,
  };
}

export function checkSkillContracts(
  repoRootInput?: string,
  options: SkillContractOptions = {},
): SkillContractResult {
  const repoRoot = resolveRepoRoot(repoRootInput);
  const mode = options.mode ?? 'staged';
  if (mode === 'staged') {
    return validateSnapshot(repoRoot, stagedSnapshot(repoRoot));
  }

  if (!options.base || !options.head) {
    return formatResult(['Commit-range mode requires both --base and --head.'], emptyStats());
  }
  const base = resolveCommit(repoRoot, options.base);
  const head = resolveCommit(repoRoot, options.head);
  if (base === null) {
    return formatResult([`Invalid Git revision for --base: ${options.base}`], emptyStats());
  }
  if (head === null) {
    return formatResult([`Invalid Git revision for --head: ${options.head}`], emptyStats());
  }

  return validateSnapshot(
    repoRoot,
    revisionSnapshot(repoRoot, head),
    revisionSnapshot(repoRoot, base),
  );
}

const USAGE = `Usage:
  npm run check:skill-contracts
  npm run check:skill-contracts -- --staged
  npm run check:skill-contracts -- --base <base-sha> --head <head-sha>

Options:
  --staged        Validate the complete Git index snapshot. This is the default.
  --base <sha>    Base commit for commit-range mode.
  --head <sha>    Head commit for commit-range mode.
  --help          Show this help text.`;

type ParsedCli =
  | { kind: 'run'; options: SkillContractOptions }
  | { kind: 'help'; output: string }
  | { kind: 'error'; output: string };

export function parseSkillContractCliArgs(args: string[]): ParsedCli {
  let staged = false;
  let base: string | undefined;
  let head: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help') {
      return { kind: 'help', output: USAGE };
    }
    if (arg === '--staged') {
      staged = true;
      continue;
    }
    if (arg === '--base') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        return { kind: 'error', output: `Missing value for --base.\n\n${USAGE}` };
      }
      base = value;
      index += 1;
      continue;
    }
    if (arg === '--head') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        return { kind: 'error', output: `Missing value for --head.\n\n${USAGE}` };
      }
      head = value;
      index += 1;
      continue;
    }
    return { kind: 'error', output: `Unknown argument: ${arg}\n\n${USAGE}` };
  }

  if (staged && (base || head)) {
    return {
      kind: 'error',
      output: `--staged cannot be combined with --base or --head.\n\n${USAGE}`,
    };
  }
  if ((base && !head) || (head && !base)) {
    return {
      kind: 'error',
      output: `Commit-range mode requires both --base and --head.\n\n${USAGE}`,
    };
  }
  if (base && head) {
    return { kind: 'run', options: { mode: 'commit-range', base, head } };
  }
  return { kind: 'run', options: { mode: 'staged' } };
}

function main(): void {
  const parsed = parseSkillContractCliArgs(process.argv.slice(2));
  if (parsed.kind === 'help') {
    console.log(parsed.output);
    return;
  }
  if (parsed.kind === 'error') {
    console.error(parsed.output);
    process.exitCode = 2;
    return;
  }

  const result = checkSkillContracts(undefined, parsed.options);
  console.log(result.output);
  if (!result.ok) {
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main();
}
