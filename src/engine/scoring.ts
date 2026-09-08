import type {
  AuditProvenance,
  AuditScore,
  CheckItem,
  DimensionKey,
  DimensionScore,
  Grade,
} from '../types';
import { dimensions as dimensionConfigs } from '../theme/tokens';

export function calculateAuditScore(
  checks: CheckItem[],
  domain: string,
  entityName: string | undefined,
  provenance: AuditProvenance,
): AuditScore {
  const dimensionKeys: DimensionKey[] = [
    'discovery',
    'entityGraph',
    'intentAndOffers',
    'machinePayments',
    'aiCrawlerAccess',
  ];

  const dimensionsMap: Record<DimensionKey, DimensionScore> = {
    discovery: createEmptyDimensionScore('discovery'),
    entityGraph: createEmptyDimensionScore('entityGraph'),
    intentAndOffers: createEmptyDimensionScore('intentAndOffers'),
    machinePayments: createEmptyDimensionScore('machinePayments'),
    aiCrawlerAccess: createEmptyDimensionScore('aiCrawlerAccess'),
  };

  for (const check of checks) {
    const dim = dimensionsMap[check.dimension];
    if (!dim) continue;

    dim.checks.push(check);
    dim.score += check.score;
    dim.maxScore += check.maxScore;

    if (check.status === 'PASS') dim.passedCount++;
    else if (check.status === 'WARN') dim.warningCount++;
    else if (check.status === 'FAIL') dim.failedCount++;
  }

  // Normalize each dimension to its target 20-point weight
  let totalScoreRaw = 0;
  for (const key of dimensionKeys) {
    const dim = dimensionsMap[key];
    const targetMax = dimensionConfigs[key].weight; // 20 pts

    if (dim.maxScore > 0) {
      const ratio = Math.min(1, Math.max(0, dim.score / dim.maxScore));
      dim.score = Math.round(ratio * targetMax * 10) / 10;
      dim.maxScore = targetMax;
      dim.percentage = Math.round(ratio * 100);
    } else {
      dim.score = 0;
      dim.maxScore = targetMax;
      dim.percentage = 0;
    }

    totalScoreRaw += dim.score;
  }

  const totalScore = Math.min(100, Math.max(0, Math.round(totalScoreRaw)));
  const grade = computeGrade(totalScore);
  const machineTrustIndex = Math.round((totalScore / 100) * 100) / 100;
  const { summary, verdict } = generateVerdict(grade, domain);

  return {
    status: 'scored',
    totalScore,
    maxScore: 100,
    grade,
    machineTrustIndex,
    summary,
    verdict,
    dimensions: dimensionsMap,
    checks,
    entityName: entityName || domain,
    domain,
    provenance,
  };
}

function createEmptyDimensionScore(key: DimensionKey): DimensionScore {
  return {
    key,
    name: dimensionConfigs[key].name,
    score: 0,
    maxScore: 0,
    percentage: 0,
    passedCount: 0,
    warningCount: 0,
    failedCount: 0,
    checks: [],
  };
}

export function computeGrade(score: number): Grade {
  if (score >= 95) return 'A+';
  if (score >= 88) return 'A';
  if (score >= 75) return 'B';
  if (score >= 50) return 'C';
  if (score >= 25) return 'D';
  return 'F';
}

function generateVerdict(grade: Grade, domain: string): { summary: string; verdict: string } {
  if (grade === 'A+' || grade === 'A') {
    return {
      summary: `The supplied snapshot for ${domain} satisfies most checks in this diagnostic model.`,
      verdict:
        'High modeled coverage — independently verify every live endpoint, policy, price, and transaction path before relying on this result.',
    };
  }
  if (grade === 'B') {
    return {
      summary: `The supplied snapshot for ${domain} satisfies many modeled discovery and machine-readability checks.`,
      verdict:
        'Strong diagnostic coverage — review the missing or partial evidence before making a readiness claim.',
    };
  }
  if (grade === 'C') {
    return {
      summary: `The supplied snapshot for ${domain} covers part of the diagnostic model and leaves material evidence gaps.`,
      verdict:
        'Partial diagnostic coverage — validate the listed gaps and live behavior before treating the surface as agent-ready.',
    };
  }
  if (grade === 'D') {
    return {
      summary: `The supplied snapshot for ${domain} contains limited machine-readable evidence in this model.`,
      verdict:
        'Low diagnostic coverage — the result describes supplied evidence only and does not establish the live site state.',
    };
  }
  return {
    summary: `The supplied snapshot for ${domain} satisfies few checks in this diagnostic model.`,
    verdict:
      'Insufficient diagnostic evidence — do not infer live blocking, discoverability, or transaction behavior from this score alone.',
  };
}
