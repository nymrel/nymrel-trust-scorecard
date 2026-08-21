import { AuditScore, CheckItem, DimensionKey, DimensionScore, Grade } from '../types';
import { dimensions as dimensionConfigs } from '../theme/tokens';

export function calculateAuditScore(checks: CheckItem[], domain: string, entityName?: string): AuditScore {
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
    totalScore,
    maxScore: 100,
    grade,
    machineTrustIndex,
    summary,
    verdict,
    timestamp: new Date().toISOString(),
    dimensions: dimensionsMap,
    checks,
    entityName: entityName || domain,
    domain,
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
      summary: `${domain} demonstrates exceptional dual-audience readiness with verifiable machine trust, active agent endpoints, and unrestricted search crawler discoverability.`,
      verdict: 'Full Autonomous Agent Ready — AI purchasing agents can independently discover, evaluate, and transact without human intervention.',
    };
  }
  if (grade === 'B') {
    return {
      summary: `${domain} has strong machine trust foundations and crawler access. Adding dedicated UCP checkout endpoints or /llms-full.txt will elevate it to top-tier agent readiness.`,
      verdict: 'Agent-Friendly Platform — Strong structured data and crawler access; minor improvements needed in autonomous checkout or UCP endpoints.',
    };
  }
  if (grade === 'C') {
    return {
      summary: `${domain} has basic metadata or schema present, but lacks formal AI agent orientation (/llms.txt), verified parent entity provenance, or machine payment rails.`,
      verdict: 'Partial AI Readiness — Missing key agentic commerce protocols and machine trust provenance.',
    };
  }
  if (grade === 'D') {
    return {
      summary: `${domain} is built strictly for legacy human browser navigation. AI agents encounter sparse schema, unverified pricing, and no programmatic commerce interfaces.`,
      verdict: 'Legacy Web Structure — Opaque to autonomous agents with minimal machine-readable data.',
    };
  }
  return {
    summary: `${domain} blocks AI search crawlers or lacks any machine-readable entity or offer schema. Autonomous agents cannot discover or verify its services.`,
    verdict: 'Agent-Hostile / Opaque — AI agents are actively blocked or unable to parse services.',
  };
}
