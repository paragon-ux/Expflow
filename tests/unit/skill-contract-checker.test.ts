import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  checkSkillContracts,
  parseSkillContractCliArgs,
} from '../../tools/check-skill-contracts.js';

const tempRepos: string[] = [];
const GIT_TEST_TIMEOUT_MS = 45_000;

function git(cwd: string, args: string[]): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function write(repo: string, pathValue: string, content: string): void {
  const absolute = resolve(repo, pathValue);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, content, 'utf8');
}

function createRepo(): string {
  const repo = join(
    tmpdir(),
    `expflow-skill-contracts-${String(Date.now())}-${Math.random().toString(16).slice(2)}`,
  );
  mkdirSync(repo, { recursive: true });
  tempRepos.push(repo);
  git(repo, ['init']);
  git(repo, ['config', 'user.email', 'tests@example.invalid']);
  git(repo, ['config', 'user.name', 'Skill Contract Tests']);
  write(repo, 'README.md', '# Test repo\n');
  git(repo, ['add', '.']);
  git(repo, ['commit', '-m', 'initial']);
  return repo;
}

function commitAll(repo: string, message: string): void {
  git(repo, ['add', '.']);
  git(repo, ['commit', '-m', message]);
}

function head(repo: string): string {
  return git(repo, ['rev-parse', 'HEAD']).trim();
}

function removeRepo(repo: string): void {
  rmSync(repo, { recursive: true, force: true });
}

function validContract(overrides = ''): string {
  return `version: 1

checker:
  command: npm run check:config-references
  staged: true
  commit_range: true

commands:
  skill_contracts: npm run check:skill-contracts

surfaces:
  agent_governance:
    - AGENTS.md
  repository_skills:
    - .agents/skills/**/SKILL.md
  workflows:
    - .github/workflows/*.yml

roles:
  repository_governance:
    path: "AGENTS.md"
    class: active-authority

  active_workflow:
    path: docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md
    class: active-authority

  active_status:
    path: docs/internal/CURRENT_STATUS_MATRIX.md
    class: active-authority

  glossary:
    path: docs/internal/GLOSSARY.md
    class: active-authority

  reconciliation_policy:
    path: docs/internal/CONFIG_REFERENCE_RECONCILIATION.md
    class: active-authority

  phase_reports:
    path: docs/internal/phase_reports/
    class: active-evidence
    kind: directory

  historical_workflow:
    path: docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md
    class: immutable-architecture
${overrides}
protected_targets:
  - docs/architecture/**

protected_sidecar: docs/internal/PROTECTED_CONFIG_REFERENCE_INDEX.md
`;
}

function validSkill(
  roles = [
    'repository_governance',
    'active_workflow',
    'active_status',
    'glossary',
    'historical_workflow',
  ],
): string {
  const roleLines = roles.map((role, index) => `${String(index + 1)}. \`${role}\``).join('\n');
  return `---
name: test-skill
description: Test skill.
---

# Test Skill

## Required Reading Roles

${roleLines}
`;
}

function writeValidRepo(repo: string): void {
  write(repo, '.config-reference-reconciliation.yaml', validContract());
  write(repo, 'AGENTS.md', '# Agents\n');
  write(repo, 'docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md', '# Workflow\n');
  write(repo, 'docs/internal/CURRENT_STATUS_MATRIX.md', '# Status\n');
  write(repo, 'docs/internal/GLOSSARY.md', '# Glossary\n');
  write(repo, 'docs/internal/CONFIG_REFERENCE_RECONCILIATION.md', '# Policy\n');
  write(repo, 'docs/internal/phase_reports/.keep', 'placeholder\n');
  write(repo, 'docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md', '# Historical\n');
  write(repo, 'docs/internal/PROTECTED_CONFIG_REFERENCE_INDEX.md', '# Sidecar\n');
  write(repo, '.agents/skills/test-skill/SKILL.md', validSkill());
  write(repo, '.github/workflows/test.yml', 'name: Test\n');
}

afterEach(() => {
  for (const repo of tempRepos.splice(0)) {
    removeRepo(repo);
  }
});

describe('skill contract checker', () => {
  it(
    'passes a complete staged role contract',
    () => {
      const repo = createRepo();
      writeValidRepo(repo);
      git(repo, ['add', '.']);

      const result = checkSkillContracts(repo);
      expect(result.ok).toBe(true);
      expect(result.output).toContain('PASS');
      expect(result.stats.rolesDeclared).toBe(7);
      expect(result.stats.skillsChecked).toBe(1);
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'fails missing roles and unknown role consumers clearly',
    () => {
      const repo = createRepo();
      writeValidRepo(repo);
      write(
        repo,
        '.config-reference-reconciliation.yaml',
        validContract().replace(
          / {2}glossary:[\s\S]*?\n\n {2}reconciliation_policy:/,
          '  reconciliation_policy:',
        ),
      );
      write(
        repo,
        '.agents/skills/test-skill/SKILL.md',
        validSkill(['repository_governance', 'missing_role']),
      );
      git(repo, ['add', '.']);

      const result = checkSkillContracts(repo);
      expect(result.ok).toBe(false);
      expect(result.output).toContain('missing required semantic role glossary');
      expect(result.output).toContain('unknown required reading role missing_role');
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'rejects bare required-reading paths and moved legacy root docs',
    () => {
      const repo = createRepo();
      writeValidRepo(repo);
      write(
        repo,
        '.agents/skills/test-skill/SKILL.md',
        `---
name: test-skill
description: Test skill.
---

# Test Skill

## Required Reading

- Read in order: AGENTS.md, EXPFLOW_WORKFLOW_CURRENT.md, docs/DATA_MODEL.md
`,
      );
      git(repo, ['add', '.']);

      const result = checkSkillContracts(repo);
      expect(result.ok).toBe(false);
      expect(result.output).toContain('required reading must use semantic roles');
      expect(result.output).toContain(
        'stale moved legacy document path remains: docs/DATA_MODEL.md',
      );
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it(
    'lets a governed document move update one role mapping instead of every skill',
    () => {
      const repo = createRepo();
      writeValidRepo(repo);
      commitAll(repo, 'baseline role contract');
      const base = head(repo);

      git(repo, [
        'mv',
        'docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md',
        'docs/internal/WORKFLOW_MOVED.md',
      ]);
      write(
        repo,
        '.config-reference-reconciliation.yaml',
        validContract().replace(
          'path: docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md',
          'path: docs/internal/WORKFLOW_MOVED.md',
        ),
      );
      git(repo, ['add', '.']);
      expect(checkSkillContracts(repo).ok).toBe(true);

      commitAll(repo, 'move workflow role target');
      const movedHead = head(repo);
      const range = checkSkillContracts(repo, {
        mode: 'commit-range',
        base,
        head: movedHead,
      });
      expect(range.ok).toBe(true);
      expect(range.stats.contractRoleChanges).toBe(1);
    },
    GIT_TEST_TIMEOUT_MS,
  );

  it('rejects unsupported CLI arguments', () => {
    expect(parseSkillContractCliArgs([])).toMatchObject({
      kind: 'run',
      options: { mode: 'staged' },
    });
    expect(parseSkillContractCliArgs(['--help']).kind).toBe('help');
    expect(parseSkillContractCliArgs(['--unknown']).kind).toBe('error');
    expect(parseSkillContractCliArgs(['--base', 'abc']).kind).toBe('error');
    expect(parseSkillContractCliArgs(['--head', 'abc']).kind).toBe('error');
    expect(parseSkillContractCliArgs(['--staged', '--base', 'a', '--head', 'b']).kind).toBe(
      'error',
    );
  });
});
