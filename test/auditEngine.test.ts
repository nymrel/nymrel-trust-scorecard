import { describe, expect, it } from 'vitest';

import { runAudit, type AuditTargetInput } from '../src/engine/auditEngine';
import { PRESET_SITES } from '../src/engine/fixtures';
import { INPUT_LIMITS, validateAuditInput } from '../src/engine/inputBoundary';

describe('audit boundary and provenance', () => {
  it('never turns a domain label into evidence', () => {
    const result = runAudit({ url: 'https://nymrel.com' });

    expect(result).toMatchObject({
      status: 'unavailable',
      reason: 'no_evidence',
      domain: 'nymrel.com',
      provenance: { liveVerified: false },
    });
  });

  it('scores only an explicitly selected matching fixture', () => {
    const result = runAudit({ url: 'nymrel.example', presetId: 'nymrel' });

    expect(result.status).toBe('scored');
    if (result.status !== 'scored') return;
    expect(result.provenance).toMatchObject({
      kind: 'illustrative_fixture',
      fixtureId: 'nymrel',
      liveVerified: false,
    });
    expect(result.domain).toBe('nymrel.example');
    expect(result.provenance.description).toContain('not a current audit');
  });

  it('rejects unknown, mismatched, and mixed fixtures', () => {
    expect(runAudit({ url: 'nymrel.example', presetId: 'missing' })).toMatchObject({
      status: 'unavailable',
      reason: 'unknown_fixture',
    });
    expect(runAudit({ url: 'other.example', presetId: 'nymrel' })).toMatchObject({
      status: 'unavailable',
      reason: 'invalid_input',
    });
    expect(
      runAudit({
        url: 'nymrel.example',
        presetId: 'nymrel',
        jsonLdStrings: ['{}'],
      }),
    ).toMatchObject({ status: 'unavailable', reason: 'invalid_input' });
  });

  it('scores bounded manual evidence without claiming verification', () => {
    const result = runAudit({
      url: 'manual.example',
      jsonLdStrings: [
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Manual Example',
          url: 'https://manual.example',
        }),
      ],
    });

    expect(result.status).toBe('scored');
    if (result.status !== 'scored') return;
    expect(result.provenance).toEqual({
      kind: 'manual_evidence',
      label: 'Manual evidence',
      description:
        'Calculated only from bounded evidence supplied in this browser. Missing evidence scores as absent; no network request or independent verification occurred.',
      liveVerified: false,
      evidenceKinds: ['json-ld'],
    });
  });

  it('is deterministic for identical evidence', () => {
    const input: AuditTargetInput = {
      url: 'deterministic.example',
      robotsTxt: 'User-agent: *\nAllow: /\nSitemap: https://deterministic.example/sitemap.xml',
      llmsTxt:
        '# Example\n\n> Deterministic fixture.\n\n## Resources\n- Home: https://deterministic.example\n\n## Docs\n- API: https://deterministic.example/api',
    };

    expect(runAudit(input)).toEqual(runAudit(input));
  });

  it('scores every versioned synthetic fixture without real-brand domains', () => {
    expect(PRESET_SITES.length).toBeGreaterThanOrEqual(4);
    for (const fixture of PRESET_SITES) {
      expect(fixture.url).toMatch(/\.example\/?$/);
      expect(fixture.fixtureVersion).toMatch(/^illustrative-/);
      const result = runAudit({ url: fixture.url, presetId: fixture.id });
      expect(result.status).toBe('scored');
      if (result.status === 'scored') {
        expect(result.provenance.kind).toBe('illustrative_fixture');
      }
    }
  });
});

describe('runtime input validation', () => {
  it.each([
    '',
    'ftp://example.com',
    'https://user:password@example.com',
    'https://bad..example',
    'https://-bad.example',
  ])('rejects invalid target %j', (url) => {
    expect(validateAuditInput({ url }).ok).toBe(false);
  });

  it('rejects unexpected keys and overlong values', () => {
    const unexpected = {
      url: 'example.com',
      unexpected: true,
    } as unknown as AuditTargetInput;
    expect(runAudit(unexpected)).toMatchObject({
      status: 'unavailable',
      reason: 'invalid_input',
    });
    expect(
      validateAuditInput({
        url: 'example.com',
        rawHtml: 'x'.repeat(INPUT_LIMITS.htmlBytes + 1),
      }).ok,
    ).toBe(false);
  });

  it('bounds headers and nested manifest data', () => {
    expect(
      validateAuditInput({
        url: 'example.com',
        headers: { 'bad\nname': 'value' },
      }).ok,
    ).toBe(false);

    let nested: Record<string, unknown> = {};
    for (let depth = 0; depth < INPUT_LIMITS.jsonDepth + 2; depth += 1) {
      nested = { child: nested };
    }
    expect(validateAuditInput({ url: 'example.com', ucpManifest: nested }).ok).toBe(false);
  });

  it('normalizes valid HTTP domains and evidence kinds', () => {
    const result = validateAuditInput({
      url: 'HTTP://WWW.Example.com/a/path',
      headers: { 'X-Test': 'value' },
      robotsTxt: 'User-agent: *\nAllow: /',
    });
    expect(result).toEqual({
      ok: true,
      value: {
        url: 'https://example.com',
        domain: 'example.com',
        evidenceKinds: ['robots.txt', 'headers'],
        headers: { 'x-test': 'value' },
        robotsTxt: 'User-agent: *\nAllow: /',
      },
    });
  });
});
