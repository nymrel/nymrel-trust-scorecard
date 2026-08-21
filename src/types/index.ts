/**
 * Type Definitions for @nymrel/trust-scorecard
 * Dual-Audience AI Agent Readiness & Machine Trust Engine
 */

export type CheckStatus = 'PASS' | 'WARN' | 'FAIL' | 'INFO';

export type DimensionKey =
  | 'discovery'
  | 'entityGraph'
  | 'intentAndOffers'
  | 'machinePayments'
  | 'aiCrawlerAccess';

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface CheckItem {
  id: string;
  name: string;
  dimension: DimensionKey;
  status: CheckStatus;
  score: number;
  maxScore: number;
  message: string;
  details?: Record<string, unknown>;
  remediation?: string;
  codeSnippet?: {
    language: 'json' | 'typescript' | 'html' | 'markdown' | 'bash';
    filename: string;
    code: string;
    description: string;
  };
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

export interface AuditScore {
  totalScore: number;
  maxScore: number;
  grade: Grade;
  machineTrustIndex: number; // 0.00 - 1.00
  summary: string;
  verdict: string;
  timestamp: string;
  dimensions: Record<DimensionKey, DimensionScore>;
  checks: CheckItem[];
  entityName?: string;
  domain: string;
}

export interface PresetSite {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  icon: string;
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
  showGrade?: boolean;
}

export interface RawSiteInput {
  url: string;
  html?: string;
  robotsTxt?: string;
  llmsTxt?: string;
  ucpJson?: string;
}
