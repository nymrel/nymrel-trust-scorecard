import { describe, expect, it } from 'vitest';

import { calculateAuditScore, computeGrade } from '../src/engine/scoring';
import type { AuditProvenance, CheckItem, DimensionKey } from '../src/types';

const provenance: AuditProvenance = {
  kind: 'manual_evidence',
  label: 'Manual evidence',
  description: 'Test evidence.',
  liveVerified: false,
  evidenceKinds: ['json-ld'],
};

const dimensions: DimensionKey[] = [
  'discovery',
  'entityGraph',
  'intentAndOffers',
  'machinePayments',
  'aiCrawlerAccess',
];

function checks(score: number, maxScore = 10): CheckItem[] {
  return dimensions.map((dimension) => ({
    id: `check-${dimension}`,
    name: dimension,
    dimension,
    status: score === maxScore ? 'PASS' : score === 0 ? 'FAIL' : 'WARN',
    score,
    maxScore,
    message: 'Test check.',
  }));
}

describe('grade boundaries', () => {
  it.each([
    [100, 'A+'],
    [95, 'A+'],
    [94, 'A'],
    [88, 'A'],
    [87, 'B'],
    [75, 'B'],
    [74, 'C'],
    [50, 'C'],
    [49, 'D'],
    [25, 'D'],
    [24, 'F'],
    [0, 'F'],
  ] as const)('maps %i to %s', (score, grade) => {
    expect(computeGrade(score)).toBe(grade);
  });
});

describe('score normalization', () => {
  it('normalizes each dimension to its declared 20-point weight', () => {
    const result = calculateAuditScore(checks(5), 'example.com', 'Example', provenance);

    expect(result.totalScore).toBe(50);
    expect(result.machineTrustIndex).toBe(0.5);
    expect(result.grade).toBe('C');
    for (const dimension of dimensions) {
      expect(result.dimensions[dimension]).toMatchObject({
        score: 10,
        maxScore: 20,
        percentage: 50,
        warningCount: 1,
      });
    }
  });

  it('clamps evaluator values and creates empty dimension records', () => {
    const over = calculateAuditScore(checks(20), 'high.example', undefined, provenance);
    expect(over.totalScore).toBe(100);
    expect(over.grade).toBe('A+');
    expect(over.entityName).toBe('high.example');

    const empty = calculateAuditScore([], 'empty.example', '', provenance);
    expect(empty.totalScore).toBe(0);
    expect(empty.grade).toBe('F');
    expect(empty.dimensions.discovery).toMatchObject({
      score: 0,
      maxScore: 20,
      percentage: 0,
    });
  });

  it.each([
    [10, 'High modeled coverage'],
    [8, 'Strong diagnostic coverage'],
    [6, 'Partial diagnostic coverage'],
    [3, 'Low diagnostic coverage'],
    [0, 'Insufficient diagnostic evidence'],
  ] as const)('keeps verdicts evidence-scoped for representative checks', (value, phrase) => {
    const result = calculateAuditScore(checks(value), 'example.com', undefined, provenance);
    expect(result.verdict).toContain(phrase);
    expect(result.verdict).not.toMatch(/certif|guarantee/i);
  });
});
