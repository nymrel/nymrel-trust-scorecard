import test from 'node:test';
import assert from 'node:assert/strict';

// Scoring engine logic test
function computeGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 88) return 'A';
  if (score >= 75) return 'B';
  if (score >= 50) return 'C';
  if (score >= 25) return 'D';
  return 'F';
}

function calculateScore(checks) {
  const dims = {
    discovery: { score: 0, maxScore: 0 },
    entityGraph: { score: 0, maxScore: 0 },
    intentAndOffers: { score: 0, maxScore: 0 },
    machinePayments: { score: 0, maxScore: 0 },
    aiCrawlerAccess: { score: 0, maxScore: 0 },
  };

  for (const check of checks) {
    if (dims[check.dimension]) {
      dims[check.dimension].score += check.score;
      dims[check.dimension].maxScore += check.maxScore;
    }
  }

  let totalRaw = 0;
  for (const key of Object.keys(dims)) {
    const dim = dims[key];
    const targetMax = 20;
    if (dim.maxScore > 0) {
      const ratio = Math.min(1, Math.max(0, dim.score / dim.maxScore));
      totalRaw += ratio * targetMax;
    }
  }

  const totalScore = Math.min(100, Math.max(0, Math.round(totalRaw)));
  const grade = computeGrade(totalScore);
  const mti = Math.round((totalScore / 100) * 100) / 100;
  return { totalScore, grade, mti };
}

test('scoring engine computes accurate 100/100 and Grade A+', () => {
  const perfectChecks = [
    { dimension: 'discovery', score: 20, maxScore: 20 },
    { dimension: 'entityGraph', score: 20, maxScore: 20 },
    { dimension: 'intentAndOffers', score: 20, maxScore: 20 },
    { dimension: 'machinePayments', score: 20, maxScore: 20 },
    { dimension: 'aiCrawlerAccess', score: 20, maxScore: 20 },
  ];

  const result = calculateScore(perfectChecks);
  assert.equal(result.totalScore, 100);
  assert.equal(result.grade, 'A+');
  assert.equal(result.mti, 1.0);
});

test('scoring engine computes Grade B for 80/100', () => {
  const checks = [
    { dimension: 'discovery', score: 16, maxScore: 20 },
    { dimension: 'entityGraph', score: 16, maxScore: 20 },
    { dimension: 'intentAndOffers', score: 16, maxScore: 20 },
    { dimension: 'machinePayments', score: 16, maxScore: 20 },
    { dimension: 'aiCrawlerAccess', score: 16, maxScore: 20 },
  ];

  const result = calculateScore(checks);
  assert.equal(result.totalScore, 80);
  assert.equal(result.grade, 'B');
  assert.equal(result.mti, 0.8);
});

test('grade boundaries work deterministically', () => {
  assert.equal(computeGrade(100), 'A+');
  assert.equal(computeGrade(95), 'A+');
  assert.equal(computeGrade(94), 'A');
  assert.equal(computeGrade(88), 'A');
  assert.equal(computeGrade(87), 'B');
  assert.equal(computeGrade(75), 'B');
  assert.equal(computeGrade(74), 'C');
  assert.equal(computeGrade(50), 'C');
  assert.equal(computeGrade(49), 'D');
  assert.equal(computeGrade(25), 'D');
  assert.equal(computeGrade(24), 'F');
  assert.equal(computeGrade(0), 'F');
});
