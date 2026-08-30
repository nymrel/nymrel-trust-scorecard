import type { EvidenceKind } from '../types';

export const INPUT_LIMITS = Object.freeze({
  headers: 64,
  headerNameBytes: 128,
  headerValueBytes: 8 * 1024,
  htmlBytes: 512 * 1024,
  jsonDepth: 12,
  jsonLdDocuments: 32,
  jsonLdDocumentBytes: 128 * 1024,
  jsonNodes: 2_000,
  manifestBytes: 256 * 1024,
  presetIdBytes: 64,
  textEvidenceBytes: 512 * 1024,
  urlBytes: 2_048,
});

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

export interface NormalizedAuditTargetInput extends AuditTargetInput {
  domain: string;
  evidenceKinds: EvidenceKind[];
}

export type InputBoundaryResult =
  | { ok: true; value: NormalizedAuditTargetInput }
  | { ok: false; domain: string; message: string };

const ALLOWED_INPUT_KEYS = new Set([
  'headers',
  'jsonLdStrings',
  'llmsFullTxt',
  'llmsTxt',
  'presetId',
  'rawHtml',
  'robotsTxt',
  'ucpManifest',
  'url',
]);
const encoder = new TextEncoder();

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function byteLength(value: string): number {
  return encoder.encode(value).byteLength;
}

function containsControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0);
    return codePoint !== undefined && (codePoint <= 31 || codePoint === 127);
  });
}

function normalizeDomain(value: unknown): { ok: true; domain: string } | { ok: false } {
  if (typeof value !== 'string') return { ok: false };
  const trimmed = value.trim();
  if (trimmed.length === 0 || byteLength(trimmed) > INPUT_LIMITS.urlBytes) {
    return { ok: false };
  }

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmed);
  if (hasScheme && !/^https?:/i.test(trimmed)) return { ok: false };

  try {
    const parsed = new URL(hasScheme ? trimmed : `https://${trimmed}`);
    if (!['http:', 'https:'].includes(parsed.protocol)) return { ok: false };
    if (parsed.username.length > 0 || parsed.password.length > 0) return { ok: false };

    const domain = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (domain.length === 0 || domain.length > 253 || domain.includes('..')) return { ok: false };
    const labels = domain.split('.');
    if (
      labels.some(
        (label) =>
          label.length === 0 ||
          label.length > 63 ||
          !/^[a-z\d-]+$/.test(label) ||
          label.startsWith('-') ||
          label.endsWith('-'),
      )
    ) {
      return { ok: false };
    }
    return { ok: true, domain };
  } catch {
    return { ok: false };
  }
}

function readBoundedString(
  record: Record<string, unknown>,
  key: string,
  maximumBytes: number,
): { present: false } | { present: true; value: string } | { error: true } {
  if (!Object.hasOwn(record, key)) return { present: false };
  const value = record[key];
  if (typeof value !== 'string' || byteLength(value) > maximumBytes) return { error: true };
  return { present: true, value };
}

function validateJsonValue(value: unknown, depth: number, state: { nodes: number }): boolean {
  state.nodes += 1;
  if (state.nodes > INPUT_LIMITS.jsonNodes || depth > INPUT_LIMITS.jsonDepth) return false;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) {
    return value.every((item) => validateJsonValue(item, depth + 1, state));
  }
  if (!isPlainRecord(value)) return false;
  return Object.entries(value).every(
    ([key, child]) => byteLength(key) <= 256 && validateJsonValue(child, depth + 1, state),
  );
}

export function validateAuditInput(input: unknown): InputBoundaryResult {
  if (!isPlainRecord(input)) {
    return {
      ok: false,
      domain: 'invalid-domain',
      message: 'The diagnostic input must be an object.',
    };
  }
  if (Object.keys(input).some((key) => !ALLOWED_INPUT_KEYS.has(key))) {
    return {
      ok: false,
      domain: 'invalid-domain',
      message: 'The diagnostic input contains an unsupported field.',
    };
  }

  const {
    headers: rawHeaders,
    jsonLdStrings: rawJsonLdStrings,
    presetId: rawPresetId,
    ucpManifest: rawUcpManifest,
    url: rawUrl,
  } = input;

  const domainResult = normalizeDomain(rawUrl);
  if (!domainResult.ok) {
    return {
      ok: false,
      domain: 'invalid-domain',
      message: 'Enter a valid HTTP or HTTPS domain without credentials.',
    };
  }
  const { domain } = domainResult;
  const normalized: NormalizedAuditTargetInput = {
    domain,
    evidenceKinds: [],
    url: `https://${domain}`,
  };

  if (Object.hasOwn(input, 'presetId')) {
    if (
      typeof rawPresetId !== 'string' ||
      byteLength(rawPresetId) > INPUT_LIMITS.presetIdBytes ||
      !/^[a-z\d-]+$/.test(rawPresetId)
    ) {
      return { ok: false, domain, message: 'The requested fixture identifier is invalid.' };
    }
    normalized.presetId = rawPresetId;
  }

  const stringFields = [
    ['rawHtml', INPUT_LIMITS.htmlBytes, 'html'],
    ['robotsTxt', INPUT_LIMITS.textEvidenceBytes, 'robots.txt'],
    ['llmsTxt', INPUT_LIMITS.textEvidenceBytes, 'llms.txt'],
    ['llmsFullTxt', INPUT_LIMITS.textEvidenceBytes, 'llms-full.txt'],
  ] as const;
  for (const [field, limit, evidenceKind] of stringFields) {
    const result = readBoundedString(input, field, limit);
    if ('error' in result) {
      return { ok: false, domain, message: `${field} must be a bounded string.` };
    }
    if (result.present) {
      normalized[field] = result.value;
      normalized.evidenceKinds.push(evidenceKind);
    }
  }

  if (Object.hasOwn(input, 'jsonLdStrings')) {
    if (
      !Array.isArray(rawJsonLdStrings) ||
      rawJsonLdStrings.length > INPUT_LIMITS.jsonLdDocuments ||
      rawJsonLdStrings.some(
        (document) =>
          typeof document !== 'string' || byteLength(document) > INPUT_LIMITS.jsonLdDocumentBytes,
      )
    ) {
      return { ok: false, domain, message: 'JSON-LD evidence exceeds the document bounds.' };
    }
    normalized.jsonLdStrings = [...rawJsonLdStrings];
    normalized.evidenceKinds.push('json-ld');
  }

  if (Object.hasOwn(input, 'headers')) {
    if (!isPlainRecord(rawHeaders) || Object.keys(rawHeaders).length > INPUT_LIMITS.headers) {
      return { ok: false, domain, message: 'Header evidence must be a bounded string map.' };
    }
    const headers: Record<string, string> = {};
    for (const [rawName, rawValue] of Object.entries(rawHeaders)) {
      if (
        typeof rawValue !== 'string' ||
        byteLength(rawName) > INPUT_LIMITS.headerNameBytes ||
        byteLength(rawValue) > INPUT_LIMITS.headerValueBytes ||
        containsControlCharacter(rawName)
      ) {
        return { ok: false, domain, message: 'Header evidence contains an invalid entry.' };
      }
      headers[rawName.toLowerCase()] = rawValue;
    }
    normalized.headers = headers;
    normalized.evidenceKinds.push('headers');
  }

  if (Object.hasOwn(input, 'ucpManifest')) {
    const state = { nodes: 0 };
    if (!isPlainRecord(rawUcpManifest) || !validateJsonValue(rawUcpManifest, 0, state)) {
      return { ok: false, domain, message: 'The manifest evidence is not bounded JSON data.' };
    }
    let serialized: string;
    try {
      serialized = JSON.stringify(rawUcpManifest);
    } catch {
      return { ok: false, domain, message: 'The manifest evidence cannot be serialized.' };
    }
    if (byteLength(serialized) > INPUT_LIMITS.manifestBytes) {
      return { ok: false, domain, message: 'The manifest evidence exceeds the size bound.' };
    }
    normalized.ucpManifest = structuredClone(rawUcpManifest);
    normalized.evidenceKinds.push('ucp-manifest');
  }

  if (normalized.presetId && normalized.evidenceKinds.length > 0) {
    return {
      ok: false,
      domain,
      message: 'Illustrative fixtures cannot be mixed with manually supplied evidence.',
    };
  }

  return { ok: true, value: normalized };
}

export function cleanDomain(value: string): string {
  const result = normalizeDomain(value);
  return result.ok ? result.domain : 'invalid-domain';
}
