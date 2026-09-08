import type {
  AuditProvenance,
  AuditResult,
  AuditUnavailableReason,
  CheckItem,
  EvidenceKind,
  PresetSite,
} from '../types';
import { evaluateCrawlerAccess } from './evaluators/crawlerAccessEvaluator';
import { evaluateDiscovery } from './evaluators/discoveryEvaluator';
import { evaluateEntityGraph } from './evaluators/entityGraphEvaluator';
import { evaluateIntentOffers } from './evaluators/intentOffersEvaluator';
import { evaluateMachinePayments } from './evaluators/machinePaymentsEvaluator';
import { PRESET_SITES } from './fixtures';
import {
  cleanDomain,
  type AuditTargetInput,
  type NormalizedAuditTargetInput,
  validateAuditInput,
} from './inputBoundary';
import { calculateAuditScore } from './scoring';

export { cleanDomain } from './inputBoundary';
export type { AuditTargetInput } from './inputBoundary';

function unavailable(
  reason: AuditUnavailableReason,
  domain: string,
  description: string,
): AuditResult {
  return {
    status: 'unavailable',
    reason,
    domain,
    entityName: domain,
    provenance: {
      kind: 'no_evidence',
      label: 'No diagnostic score',
      description,
      liveVerified: false,
    },
  };
}

function fixtureEvidenceKinds(fixture: PresetSite): EvidenceKind[] {
  const kinds: EvidenceKind[] = ['html', 'json-ld', 'robots.txt'];
  if (fixture.mockData.llmsTxt !== undefined) kinds.push('llms.txt');
  if (fixture.mockData.llmsFullTxt !== undefined) kinds.push('llms-full.txt');
  if (fixture.mockData.ucpManifest !== undefined) kinds.push('ucp-manifest');
  if (fixture.mockData.headers !== undefined) kinds.push('headers');
  return kinds;
}

export function runAudit(input: AuditTargetInput): AuditResult {
  const boundary = validateAuditInput(input);
  if (!boundary.ok) {
    return unavailable('invalid_input', boundary.domain, boundary.message);
  }

  const normalized: NormalizedAuditTargetInput = boundary.value;
  let matchedFixture: PresetSite | undefined;
  if (normalized.presetId !== undefined) {
    matchedFixture = PRESET_SITES.find((fixture) => fixture.id === normalized.presetId);
    if (!matchedFixture) {
      return unavailable(
        'unknown_fixture',
        normalized.domain,
        'The requested illustrative fixture does not exist.',
      );
    }
    if (cleanDomain(matchedFixture.url) !== normalized.domain) {
      return unavailable(
        'invalid_input',
        normalized.domain,
        'The fixture identifier does not match its canonical illustrative domain.',
      );
    }
  }

  if (!matchedFixture && normalized.evidenceKinds.length === 0) {
    return unavailable(
      'no_evidence',
      normalized.domain,
      'No website request was made. Supply bounded evidence or choose an illustrative fixture to calculate a deterministic diagnostic score.',
    );
  }

  const rawHtml = normalized.rawHtml ?? matchedFixture?.mockData.rawHtml;
  const jsonLdStrings = normalized.jsonLdStrings ?? matchedFixture?.mockData.jsonLdStrings ?? [];
  const robotsTxt = normalized.robotsTxt ?? matchedFixture?.mockData.robotsTxt;
  const llmsTxt = normalized.llmsTxt ?? matchedFixture?.mockData.llmsTxt;
  const llmsFullTxt = normalized.llmsFullTxt ?? matchedFixture?.mockData.llmsFullTxt;
  const ucpManifest = normalized.ucpManifest ?? matchedFixture?.mockData.ucpManifest;
  const headers = normalized.headers ?? matchedFixture?.mockData.headers;

  const allChecks: CheckItem[] = [
    ...evaluateDiscovery({ domain: normalized.domain, llmsFullTxt, llmsTxt, robotsTxt }),
    ...evaluateEntityGraph({ domain: normalized.domain, jsonLdStrings, ucpManifest }),
    ...evaluateIntentOffers({ domain: normalized.domain, jsonLdStrings, rawHtml }),
    ...evaluateMachinePayments({ domain: normalized.domain, headers, rawHtml, ucpManifest }),
    ...evaluateCrawlerAccess({ domain: normalized.domain, robotsTxt }),
  ];

  const provenance: AuditProvenance = matchedFixture
    ? {
        kind: 'illustrative_fixture',
        label: 'Illustrative fixture',
        description: `Synthetic fixture ${matchedFixture.fixtureVersion} for ${matchedFixture.name}; it is not a current audit of ${normalized.domain}.`,
        liveVerified: false,
        evidenceKinds: fixtureEvidenceKinds(matchedFixture),
        fixtureId: matchedFixture.id,
      }
    : {
        kind: 'manual_evidence',
        label: 'Manual evidence',
        description:
          'Calculated only from bounded evidence supplied in this browser. Missing evidence scores as absent; no network request or independent verification occurred.',
        liveVerified: false,
        evidenceKinds: normalized.evidenceKinds,
      };

  return calculateAuditScore(
    allChecks,
    normalized.domain,
    matchedFixture?.name ?? normalized.domain,
    provenance,
  );
}
