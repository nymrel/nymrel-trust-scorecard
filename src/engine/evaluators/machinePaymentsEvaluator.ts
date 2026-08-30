import type { CheckItem } from '../../types';
import { getBoolean, getObject, getString, getStringArray } from '../jsonData';

export interface MachinePaymentsInput {
  ucpManifest?: Record<string, unknown> | null | undefined;
  headers?: Record<string, string> | undefined;
  rawHtml?: string | undefined;
  domain: string;
}

export function evaluateMachinePayments(input: MachinePaymentsInput): CheckItem[] {
  const { domain, rawHtml = '', ucpManifest } = input;
  const headers = Object.fromEntries(
    Object.entries(input.headers ?? {}).map(([name, value]) => [name.toLowerCase(), value]),
  );
  const manifest = ucpManifest ?? undefined;
  const paymentCapabilities = getObject(manifest, 'paymentCapabilities');
  const protocols = getStringArray(paymentCapabilities, 'protocols');
  const endpoints = getObject(manifest, 'agentEndpoints');
  const checks: CheckItem[] = [];

  const hasManifest = manifest !== undefined && Object.keys(manifest).length > 0;
  const manifestVersion = getString(manifest, 'ucpVersion');
  checks.push({
    id: 'pay-001',
    name: 'UCP-oriented manifest evidence',
    dimension: 'machinePayments',
    status: hasManifest ? 'PASS' : 'WARN',
    score: hasManifest ? 6 : 0,
    maxScore: 6,
    message: hasManifest
      ? `A manifest object was supplied${manifestVersion ? ` with declared version ${manifestVersion}` : ''}; its live URL was not verified.`
      : 'No UCP-oriented manifest object was supplied.',
    details: { hasManifest, manifestVersion: manifestVersion ?? null },
    remediation: hasManifest
      ? undefined
      : 'Publish a reviewed manifest only when the declared endpoints and capabilities are live and testable.',
    codeSnippet: hasManifest
      ? undefined
      : {
          language: 'json',
          filename: '.well-known/ucp',
          description: 'Illustrative manifest skeleton; every value requires implementation proof',
          code: `{
  "ucpVersion": "OPERATOR-FILL",
  "merchant": {
    "name": "OPERATOR-FILL",
    "url": "https://${domain}"
  },
  "agentEndpoints": {
    "catalog": "https://${domain}/OPERATOR-FILL",
    "quote": "https://${domain}/OPERATOR-FILL",
    "checkout": "https://${domain}/OPERATOR-FILL"
  }
}`,
        },
  });

  let endpointScore = 0;
  const declaredEndpoints: string[] = [];
  for (const [name, points] of [
    ['catalog', 1.5],
    ['search', 1],
    ['quote', 1],
  ] as const) {
    if (getString(endpoints, name)) {
      endpointScore += points;
      declaredEndpoints.push(name);
    }
  }
  if (getString(endpoints, 'checkout') || getString(endpoints, 'order')) {
    endpointScore += 1.5;
    declaredEndpoints.push('checkout');
  }
  if (endpointScore === 0 && /api\/checkout|buy-now|stripe\.com/i.test(rawHtml)) {
    endpointScore = 2;
    declaredEndpoints.push('markup-checkout-hint');
  }

  checks.push({
    id: 'pay-002',
    name: 'Declared agent commerce endpoints',
    dimension: 'machinePayments',
    status: endpointScore >= 4 ? 'PASS' : endpointScore > 0 ? 'WARN' : 'FAIL',
    score: endpointScore,
    maxScore: 5,
    message:
      endpointScore >= 4
        ? `Supplied evidence declares a broad endpoint set: ${declaredEndpoints.join(', ')}. Reachability is unverified.`
        : endpointScore > 0
          ? `Supplied evidence contains partial endpoint hints: ${declaredEndpoints.join(', ')}.`
          : 'No catalog, search, quote, order, or checkout endpoint was supplied.',
    details: { declaredEndpoints, endpointScore },
    remediation:
      endpointScore < 4
        ? 'Declare only implemented endpoints, then verify authentication, failure modes, and transaction behavior independently.'
        : undefined,
  });

  const x402HeaderPresent =
    Boolean(headers['x-402-payment-required']) ||
    Boolean(headers['x-payment-server']) ||
    (headers['www-authenticate'] ?? '').toLowerCase().includes('x402');
  const x402ManifestEnabled = getBoolean(paymentCapabilities, 'x402Enabled') === true;
  const x402ProtocolDeclared = protocols.some((protocol) => /x402/i.test(protocol));
  const x402MarkupHint = /x402|x-402-payment|402 payment required/i.test(rawHtml);
  const x402Score =
    x402HeaderPresent || x402ManifestEnabled || x402ProtocolDeclared ? 5 : x402MarkupHint ? 2.5 : 0;

  checks.push({
    id: 'pay-003',
    name: 'HTTP 402 or x402 declarations',
    dimension: 'machinePayments',
    status: x402Score === 5 ? 'PASS' : x402Score > 0 ? 'WARN' : 'INFO',
    score: x402Score,
    maxScore: 5,
    message:
      x402Score === 5
        ? 'Supplied headers or manifest data declare HTTP 402/x402 support; settlement was not exercised.'
        : x402Score > 0
          ? 'Markup contains an x402 hint without a supplied header or manifest declaration.'
          : 'No HTTP 402/x402 declaration was supplied.',
    details: { x402HeaderPresent, x402ManifestEnabled, x402ProtocolDeclared },
    remediation:
      x402Score < 5
        ? 'Declare x402 only after an authenticated challenge and settlement flow passes end-to-end tests.'
        : undefined,
  });

  const supportsAp2OrAcp =
    protocols.some((protocol) => /^(ap2|acp)$/i.test(protocol)) ||
    /agent-payment-protocol|agent-commerce-protocol/i.test(rawHtml);
  const hasStripeHint =
    /buy\.stripe\.com|stripe\.com/i.test(rawHtml) ||
    protocols.some((protocol) => /stripe/i.test(protocol));
  const hasDigitalAssetHint =
    /solana|algorand|ethereum|polygon|usdc|lightning|bitcoin/i.test(rawHtml) ||
    protocols.some((protocol) => /solana|algorand|ethereum|polygon|usdc|crypto/i.test(protocol));
  let railScore = 0;
  const declaredRails: string[] = [];
  if (hasStripeHint) {
    railScore += 2;
    declaredRails.push('Stripe hint');
  }
  if (supportsAp2OrAcp) {
    railScore += 1.5;
    declaredRails.push('AP2/ACP hint');
  }
  if (hasDigitalAssetHint) {
    railScore += 1.5;
    declaredRails.push('digital-asset hint');
  }
  railScore = Math.min(4, railScore);

  checks.push({
    id: 'pay-004',
    name: 'Settlement rail declarations',
    dimension: 'machinePayments',
    status: railScore >= 3 ? 'PASS' : railScore > 0 ? 'WARN' : 'FAIL',
    score: railScore,
    maxScore: 4,
    message:
      railScore >= 3
        ? `Supplied evidence contains multiple settlement hints: ${declaredRails.join(', ')}. No payment was attempted.`
        : railScore > 0
          ? `Supplied evidence contains partial settlement hints: ${declaredRails.join(', ')}.`
          : 'No modeled settlement rail declaration was supplied.',
    details: { declaredRails, protocols },
    remediation:
      railScore < 3
        ? 'Add a rail only after provider configuration, error handling, reconciliation, and a real test transaction are proven.'
        : undefined,
  });

  return checks;
}
