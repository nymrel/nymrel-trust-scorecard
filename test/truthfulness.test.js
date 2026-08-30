import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repo = resolve(import.meta.dirname, '..');
const source = (relativePath) => readFileSync(resolve(repo, relativePath), 'utf8');

test('audit engine labels preset data as an example fixture and carries provenance', () => {
  const auditEngine = source('src/engine/auditEngine.ts');

  assert.match(auditEngine, /label: 'Example fixture'/);
  assert.match(auditEngine, /fixtureId: matchedPreset\.id/);
  assert.match(auditEngine, /liveVerified: false as const/);
});

test('unknown domains have an unavailable, unscored result instead of fabricated evidence', () => {
  const auditEngine = source('src/engine/auditEngine.ts');

  assert.match(auditEngine, /if \(!matchedPreset && !hasManualEvidence\)/);
  assert.match(auditEngine, /status: 'unavailable'/);
  assert.match(auditEngine, /label: 'Not live verified'/);
  assert.doesNotMatch(auditEngine, /<!DOCTYPE html>/);
  assert.doesNotMatch(auditEngine, /Sitemap: https:\/\/\$\{domain\}/);
});

test('demo mode contains no browser fetch or live-probe progress copy', () => {
  const app = source('src/App.tsx');
  const hero = source('src/components/AuditHero.tsx');

  assert.doesNotMatch(app, /\bfetch\s*\(/);
  assert.doesNotMatch(app, /Probing robots\.txt/);
  assert.match(app, /No website request is made/);
  assert.match(hero, /Example fixtures:/);
  assert.match(hero, /A domain alone will not receive a score/);
});

test('result view gates score-only controls and displays provenance', () => {
  const app = source('src/App.tsx');
  const radar = source('src/components/ScorecardRadar.tsx');

  assert.match(app, /isScoredAudit\(auditResult\)/);
  assert.match(radar, /\{score\.provenance\.label\}/);
  assert.match(radar, /<strong>\{score\.provenance\.label\}:<\/strong>/);
});

test('missing robots evidence is unknown rather than permissive by default', () => {
  const crawler = source('src/engine/evaluators/crawlerAccessEvaluator.ts');

  assert.match(crawler, /No robots\.txt evidence was supplied, so crawler access cannot be evaluated\./);
  assert.match(crawler, /AI search bot access is unknown without supplied robots\.txt evidence\./);
  assert.doesNotMatch(crawler, /Permissive default: AI search bots/);
});
