/** Shared diagnostic contracts for the Nymrel Trust Scorecard. */

export type CheckStatus = 'PASS' | 'WARN' | 'FAIL' | 'INFO';

export type DimensionKey =
  | 'discovery'
  | 'entityGraph'
  | 'intentAndOffers'
  | 'machinePayments'
  | 'aiCrawlerAccess';

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export type EvidenceKind =
  | 'html'
  | 'json-ld'
  | 'robots.txt'
  | 'llms.txt'
  | 'llms-full.txt'
  | 'ucp-manifest'
  | 'headers';

export interface CheckItem {
  id: string;
  name: string;
  dimension: DimensionKey;
  status: CheckStatus;
  score: number;
  maxScore: number;
  message: string;
  details?: Record<string, unknown> | undefined;
  remediation?: string | undefined;
  codeSnippet?:
    | {
        language: 'json' | 'typescript' | 'html' | 'markdown' | 'bash';
        filename: string;
        code: string;
        description: string;
      }
    | undefined;
}

export interface DimensionScore {
  key: DimensionKey;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  passedCount: number;
  warningCount: number;
  failedCount: number;
  checks: CheckItem[];
}

export interface AuditProvenance {
  kind: 'illustrative_fixture' | 'manual_evidence';
  label: 'Illustrative fixture' | 'Manual evidence';
  description: string;
  liveVerified: false;
  evidenceKinds: EvidenceKind[];
  fixtureId?: string;
}

export interface AuditScore {
  status: 'scored';
  totalScore: number;
  maxScore: 100;
  grade: Grade;
  machineTrustIndex: number;
  summary: string;
  verdict: string;
  dimensions: Record<DimensionKey, DimensionScore>;
  checks: CheckItem[];
  entityName: string;
  domain: string;
  provenance: AuditProvenance;
}

export type AuditUnavailableReason = 'invalid_input' | 'no_evidence' | 'unknown_fixture';

export interface AuditUnavailable {
  status: 'unavailable';
  reason: AuditUnavailableReason;
  domain: string;
  entityName: string;
  provenance: {
    kind: 'no_evidence';
    label: 'No diagnostic score';
    description: string;
    liveVerified: false;
  };
}

export type AuditResult = AuditScore | AuditUnavailable;

export function isScoredAudit(result: AuditResult): result is AuditScore {
  return result.status === 'scored';
}

export interface PresetSite {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  icon: string;
  fixtureVersion: string;
  mockData: {
    rawHtml: string;
    jsonLdStrings: string[];
    robotsTxt: string;
    llmsTxt?: string;
    llmsFullTxt?: string;
    ucpManifest?: Record<string, unknown>;
    headers?: Record<string, string>;
  };
}

export interface BadgeOptions {
  theme: 'warm-paper' | 'cedar' | 'terracotta' | 'minimal-stone';
  format: 'pill' | 'shield' | 'compact';
  label?: string;
}
