import { describe, expect, it } from 'vitest';

import { generateBadgeArtifact, generateBadgeSvg } from '../src/engine/badgeGenerator';
import { generateRemediationBundle } from '../src/engine/remediationEngine';
import type { CheckItem } from '../src/types';

describe('badge artifact generation', () => {
  it('escapes attacker-controlled labels and clamps values', () => {
    const svg = generateBadgeSvg(400, 'A+', {
      label: '<script>alert(1)</script>\u0000',
      format: 'pill',
      theme: 'warm-paper',
    });

    expect(svg).toContain('&lt;script&gt;');
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('>100<');
    expect(svg).toContain('illustrative diagnostic 100/100');
  });

  it.each(['pill', 'shield', 'compact'] as const)('generates accessible %s SVG', (format) => {
    const svg = generateBadgeSvg(72, 'C', { format, theme: 'cedar' });
    expect(svg).toMatch(/^<svg/);
    expect(svg).toContain('role="img"');
    expect(svg).toContain('<title>');
  });

  it('creates a local data URI and safe filename without a hosted badge endpoint', () => {
    const artifact = generateBadgeArtifact('../Example.COM/path', 50, 'C');
    expect(artifact.dataUri).toMatch(/^data:image\/svg\+xml/);
    expect(artifact.fileName).toMatch(/^nymrel-illustrative-score-/);
    expect(JSON.stringify(artifact)).not.toContain('/api/badge');
  });
});

describe('remediation candidates', () => {
  const issue = (dimension: CheckItem['dimension']): CheckItem => ({
    id: `issue-${dimension}`,
    name: 'Issue',
    dimension,
    status: 'WARN',
    score: 0,
    maxScore: 1,
    message: 'Evidence gap.',
  });

  it('uses operator-fill templates without unverified package or certification claims', () => {
    const bundles = generateRemediationBundle('example.com', [
      issue('entityGraph'),
      issue('discovery'),
      issue('machinePayments'),
      issue('aiCrawlerAccess'),
    ]);
    const serialized = JSON.stringify(bundles);

    expect(bundles).toHaveLength(3);
    expect(serialized).toContain('OPERATOR-FILL');
    expect(serialized).not.toMatch(/npm install|@nymrel\/machine-trust|@nymrel\/open-ucp/);
    expect(serialized).not.toMatch(/certified|guaranteed|score\.nymrel\.com/);
    expect(serialized).toContain('does not guarantee');
    expect(serialized).toContain('does not certify');
  });

  it('returns no bundle for passing checks', () => {
    expect(
      generateRemediationBundle('example.com', [
        {
          ...issue('discovery'),
          status: 'PASS',
          score: 1,
        },
      ]),
    ).toEqual([]);
  });
});
