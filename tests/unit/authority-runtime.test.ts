import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRuntime } from '../../src/operations/runtime.js';
import { createAuthorityRuntime, sourceRef } from '../../src/authority/runtime.js';
import { ExpflowError } from '../../src/core/errors.js';
import type { AuthoritySourceInput } from '../../src/authority/types.js';

function tempProject(): string {
  return mkdtempSync(join(tmpdir(), 'expflow-gate-c-'));
}

function cleanup(path: string): void {
  rmSync(path, { recursive: true, force: true });
}

function writeProjectFile(root: string, relativePath: string, content: string): void {
  const target = resolve(root, ...relativePath.split('/'));
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content, 'utf-8');
}

function sourceInput(overrides: Partial<AuthoritySourceInput> = {}): AuthoritySourceInput {
  return {
    factScope: ['requirements'],
    issuer: { kind: 'user', name: 'tester' },
    limitations: ['test source only'],
    origin: 'file:authority/source.json',
    readableRepresentation: 'authority/SOURCE.md',
    schemaUri: 'https://example.org/source.schema.json',
    schemaVersionDeclared: '1.0',
    sourceType: 'test-authority',
    subjectScope: { exclude: [], include: ['**/*'], root: 'docs' },
    ...overrides,
  };
}

async function initializedProject(): Promise<string> {
  const root = tempProject();
  writeProjectFile(root, 'docs/a.txt', 'alpha');
  await createRuntime().init({ root });
  return root;
}

describe('Gate C Phase 9 authority runtime', () => {
  it('keeps source descriptors proposed until an immutable registration decision accepts them', async () => {
    const root = await initializedProject();
    try {
      const authority = createAuthorityRuntime(root);
      const source = await authority.createSourceRevision(sourceInput());

      const proposedOnly = await authority.listCurrentAuthoritySources();
      expect(proposedOnly.accepted_source_refs).toEqual([]);

      await authority.recordAuthorityDocument({
        contentDigest: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        profile: 'split',
        readableLocator: 'authority/SOURCE.md',
        sections: [
          {
            anchor: 'source',
            authority_role: 'registered_authority_source',
            source_revision_refs: [sourceRef(source)],
          },
        ],
      });
      const afterDocument = await authority.listCurrentAuthoritySources();
      expect(afterDocument.accepted_source_refs).toEqual([]);

      const decision = await authority.recordSourceRegistrationDecision({
        automated: true,
        consequences: ['The source can support facts in its declared fact scope.'],
        evidenceRefs: ['validation:authority-source-schema'],
        madeBy: { kind: 'policy', name: 'trusted-local-source', version: '1' },
        outcome: 'accepted',
        policyProfile: 'default',
        rationale: 'The source was produced locally and passed schema validation.',
        sourceRevisionRef: sourceRef(source),
      });

      const accepted = await authority.listCurrentAuthoritySources();
      expect(decision.source_revision_ref).toBe(sourceRef(source));
      expect(accepted.accepted_source_refs).toEqual([sourceRef(source)]);
      expect(accepted.accepted_sources[0]?.source_id).toBe(source.source_id);
    } finally {
      cleanup(root);
    }
  });

  it('rejects invalid caller-supplied authority source ids before writing records', async () => {
    const root = await initializedProject();
    try {
      const authority = createAuthorityRuntime(root);

      await expect(
        authority.createSourceRevision(
          sourceInput({
            sourceId: '../outside',
          }),
        ),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'schema_invalid',
      });
    } finally {
      cleanup(root);
    }
  });

  it('derives revocation from later decisions without mutating source records', async () => {
    const root = await initializedProject();
    try {
      const authority = createAuthorityRuntime(root);
      const source = await authority.createSourceRevision(sourceInput());
      await authority.recordSourceRegistrationDecision({
        automated: true,
        madeBy: { kind: 'policy', name: 'trusted-local-source' },
        outcome: 'accepted',
        rationale: 'Accepted for test.',
        sourceRevisionRef: sourceRef(source),
      });
      await authority.recordSourceRegistrationDecision({
        automated: false,
        madeBy: { kind: 'user', name: 'reviewer' },
        outcome: 'revoked',
        rationale: 'Revoked by review.',
        sourceRevisionRef: sourceRef(source),
      });

      const status = await authority.listCurrentAuthoritySources();
      expect(status.accepted_source_refs).toEqual([]);
      expect(status.decisions).toHaveLength(2);
    } finally {
      cleanup(root);
    }
  });

  it('filters current authority through supersession and effective intervals', async () => {
    const root = await initializedProject();
    try {
      const authority = createAuthorityRuntime(root);
      const expired = await authority.createSourceRevision(
        sourceInput({
          effectiveInterval: {
            end: '2001-01-01T00:00:00.000Z',
            start: '2000-01-01T00:00:00.000Z',
          },
          origin: 'file:authority/expired.json',
          readableRepresentation: 'authority/EXPIRED.md',
        }),
      );
      await authority.recordSourceRegistrationDecision({
        automated: true,
        madeBy: { kind: 'policy', name: 'trusted-local-source' },
        outcome: 'accepted',
        rationale: 'Accepted but outside its effective interval.',
        sourceRevisionRef: sourceRef(expired),
      });

      const first = await authority.createSourceRevision(
        sourceInput({
          origin: 'file:authority/current.json',
          readableRepresentation: 'authority/CURRENT.md',
          subjectScope: { exclude: [], include: ['**/*'], root: 'src' },
        }),
      );
      await authority.recordSourceRegistrationDecision({
        automated: true,
        madeBy: { kind: 'policy', name: 'trusted-local-source' },
        outcome: 'accepted',
        rationale: 'Accepted for test.',
        sourceRevisionRef: sourceRef(first),
      });

      const replacement = await authority.createSourceRevision(
        sourceInput({
          origin: 'file:authority/replacement.json',
          readableRepresentation: 'authority/REPLACEMENT.md',
          subjectScope: { exclude: [], include: ['**/*'], root: 'src' },
          supersedesSourceRevisionRef: sourceRef(first),
        }),
      );
      await authority.recordSourceRegistrationDecision({
        automated: true,
        madeBy: { kind: 'policy', name: 'trusted-local-source' },
        outcome: 'accepted',
        rationale: 'Accepted replacement for test.',
        sourceRevisionRef: sourceRef(replacement),
      });

      const status = await authority.listCurrentAuthoritySources();
      expect(status.accepted_source_refs).toEqual([sourceRef(replacement)]);
    } finally {
      cleanup(root);
    }
  });

  it('blocks overlapping accepted sources with conflicting authority scope', async () => {
    const root = await initializedProject();
    try {
      const authority = createAuthorityRuntime(root);
      const first = await authority.createSourceRevision(sourceInput());
      const second = await authority.createSourceRevision(
        sourceInput({
          origin: 'file:authority/second.json',
          readableRepresentation: 'authority/SECOND.md',
          subjectScope: { exclude: [], include: ['**/*'], root: 'docs/sub' },
        }),
      );

      await authority.recordSourceRegistrationDecision({
        automated: true,
        madeBy: { kind: 'policy', name: 'trusted-local-source' },
        outcome: 'accepted',
        rationale: 'Accepted for test.',
        sourceRevisionRef: sourceRef(first),
      });

      await expect(
        authority.recordSourceRegistrationDecision({
          automated: true,
          madeBy: { kind: 'policy', name: 'trusted-local-source' },
          outcome: 'accepted',
          rationale: 'Conflicts with first source.',
          sourceRevisionRef: sourceRef(second),
        }),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'authority_scope_conflict',
      });
    } finally {
      cleanup(root);
    }
  });

  it('enforces split authority document shape', async () => {
    const root = await initializedProject();
    try {
      const authority = createAuthorityRuntime(root);
      const source = await authority.createSourceRevision(sourceInput());

      await expect(
        authority.recordAuthorityDocument({
          contentDigest: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          profile: 'split',
          readableLocator: 'authority/SOURCE.md',
          sections: [
            {
              anchor: 'one',
              authority_role: 'registered_authority_source',
              source_revision_refs: [sourceRef(source)],
            },
            {
              anchor: 'two',
              authority_role: 'user_provided_event_history',
              source_revision_refs: [sourceRef(source)],
            },
          ],
        }),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'schema_invalid',
      });
    } finally {
      cleanup(root);
    }
  });

  it('enforces authority document schema constraints before immutable write', async () => {
    const root = await initializedProject();
    try {
      const authority = createAuthorityRuntime(root);
      const source = await authority.createSourceRevision(sourceInput());

      await expect(
        authority.recordAuthorityDocument({
          contentDigest: 'not-a-digest',
          profile: 'unified',
          readableLocator: 'authority/SOURCE.md',
          sections: [
            {
              anchor: 'source',
              authority_role: 'registered_authority_source',
              source_revision_refs: [sourceRef(source)],
            },
          ],
        }),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'schema_invalid',
      });

      await expect(
        authority.recordAuthorityDocument({
          contentDigest: 'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
          profile: 'unified',
          readableLocator: 'authority/SOURCE.md',
          sections: [],
        }),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'schema_invalid',
      });

      await expect(
        authority.recordAuthorityDocument({
          contentDigest: 'sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
          profile: 'unified',
          readableLocator: 'authority/SOURCE.md',
          sections: [
            {
              anchor: 'source',
              authority_role: 'registered_authority_source',
              source_revision_refs: [],
            },
          ],
        }),
      ).rejects.toMatchObject<Partial<ExpflowError>>({
        code: 'schema_invalid',
      });
    } finally {
      cleanup(root);
    }
  });
});
