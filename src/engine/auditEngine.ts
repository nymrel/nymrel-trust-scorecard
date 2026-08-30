import { AuditProvenance, AuditResult, CheckItem, PresetSite } from '../types';
import { PRESET_SITES } from './fixtures';
import { evaluateDiscovery } from './evaluators/discoveryEvaluator';
import { evaluateEntityGraph } from './evaluators/entityGraphEvaluator';
import { evaluateIntentOffers } from './evaluators/intentOffersEvaluator';
import { evaluateMachinePayments } from './evaluators/machinePaymentsEvaluator';
import { evaluateCrawlerAccess } from './evaluators/crawlerAccessEvaluator';
import { calculateAuditScore } from './scoring';

export interface AuditTargetInput {
  url: string;
  presetId?: string;
  rawHtml?: string;
  jsonLdStrings?: string[];
  robotsTxt?: string;
  llmsTxt?: string;
  llmsFullTxt?: string;
  ucpManifest?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export function cleanDomain(urlOrDomain: string): string {
  let cleaned = urlOrDomain.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }
  try {
    const parsed = new URL(cleaned);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return urlOrDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

export function runAudit(input: AuditTargetInput): AuditResult {
  const domain = cleanDomain(input.url);

  // Check if target matches any preset
  let matchedPreset: PresetSite | undefined;
  if (input.presetId) {
    matchedPreset = PRESET_SITES.find((p) => p.id === input.presetId);
  } else {
    matchedPreset = PRESET_SITES.find((p) => {
      const pDomain = cleanDomain(p.url);
      return pDomain === domain || domain.includes(pDomain) || pDomain.includes(domain);
    });
  }

  const hasManualEvidence = [
    input.rawHtml,
    input.jsonLdStrings,
    input.robotsTxt,
    input.llmsTxt,
    input.llmsFullTxt,
    input.ucpManifest,
    input.headers,
  ].some((value) => value !== undefined);

  if (!matchedPreset && !hasManualEvidence) {
    return {
      status: 'unavailable',
      domain,
      entityName: domain,
      provenance: {
        kind: 'no_evidence',
        label: 'Not live verified',
        description: 'No website request was made. Enter manual evidence or choose an example fixture to calculate a deterministic score.',
        liveVerified: false,
      },
    };
  }

  // Only example fixtures or explicitly supplied evidence may be evaluated.
  // This browser-only app never fills missing website evidence from a domain.
  const rawHtml = input.rawHtml ?? matchedPreset?.mockData.rawHtml;
  const jsonLdStrings = input.jsonLdStrings ?? matchedPreset?.mockData.jsonLdStrings ?? [];
  const robotsTxt = input.robotsTxt ?? matchedPreset?.mockData.robotsTxt;
  const llmsTxt = input.llmsTxt ?? matchedPreset?.mockData.llmsTxt;
  const llmsFullTxt = input.llmsFullTxt ?? matchedPreset?.mockData.llmsFullTxt;
  const ucpManifest = input.ucpManifest ?? matchedPreset?.mockData.ucpManifest;
  const headers = input.headers ?? matchedPreset?.mockData.headers;

  // Execute all 5 evaluators
  const allChecks: CheckItem[] = [];

  // 1. Discovery
  const discoveryChecks = evaluateDiscovery({
    llmsTxt,
    llmsFullTxt,
    robotsTxt,
    domain,
  });
  allChecks.push(...discoveryChecks);

  // 2. Entity Graph
  const entityChecks = evaluateEntityGraph({
    jsonLdStrings,
    ucpManifest,
    domain,
  });
  allChecks.push(...entityChecks);

  // 3. Intent & Offers
  const offerChecks = evaluateIntentOffers({
    jsonLdStrings,
    rawHtml,
    domain,
  });
  allChecks.push(...offerChecks);

  // 4. Machine Payments
  const paymentChecks = evaluateMachinePayments({
    ucpManifest,
    headers,
    rawHtml,
    domain,
  });
  allChecks.push(...paymentChecks);

  // 5. Crawler Access
  const crawlerChecks = evaluateCrawlerAccess({
    robotsTxt,
    domain,
  });
  allChecks.push(...crawlerChecks);

  const entityName = matchedPreset?.name ?? domain;
  const provenance: AuditProvenance = matchedPreset
    ? {
        kind: 'example_fixture' as const,
        label: 'Example fixture' as const,
        description: `Deterministic example data for ${matchedPreset.name}; it is not a live audit of ${domain}.`,
        liveVerified: false as const,
        fixtureId: matchedPreset.id,
      }
    : {
        kind: 'manual_evidence' as const,
        label: 'Manual evidence' as const,
        description: 'Score calculated only from evidence supplied in this browser. No website request or live verification occurred.',
        liveVerified: false as const,
      };

  return calculateAuditScore(allChecks, domain, entityName, provenance);
}
