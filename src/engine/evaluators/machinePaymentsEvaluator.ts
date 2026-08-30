import { CheckItem } from '../../types';

export interface MachinePaymentsInput {
  ucpManifest?: Record<string, unknown> | null;
  headers?: Record<string, string>;
  rawHtml?: string;
  domain: string;
}

export function evaluateMachinePayments(input: MachinePaymentsInput): CheckItem[] {
  const checks: CheckItem[] = [];
  const { ucpManifest, headers = {}, rawHtml = '', domain } = input;

  // 1. Universal Commerce Protocol (UCP) Manifest Presence (6 pts)
  const hasUcp = !!ucpManifest && typeof ucpManifest === 'object' && Object.keys(ucpManifest).length > 0;
  checks.push({
    id: 'pay-001',
    name: 'Universal Commerce Protocol (UCP) Manifest',
    dimension: 'machinePayments',
    status: hasUcp ? 'PASS' : 'WARN',
    score: hasUcp ? 6 : 0,
    maxScore: 6,
    message: hasUcp
      ? `Universal Commerce Protocol manifest supplied as evidence. Version: ${(ucpManifest as any).ucpVersion || '1.0'}`
      : 'No UCP manifest found at `/.well-known/ucp` or `/ucp.json`. Autonomous agents cannot negotiate purchases.',
    details: { hasUcp, version: (ucpManifest as any)?.ucpVersion },
    remediation: !hasUcp
      ? 'Publish a UCP manifest at `/.well-known/ucp` using `@nymrel/open-ucp` to enable autonomous agent purchasing.'
      : undefined,
    codeSnippet: !hasUcp ? {
      language: 'typescript',
      filename: 'src/ucp.config.ts',
      description: 'Zero-config UCP manifest setup with @nymrel/open-ucp',
      code: `import { createUcpHandler } from '@nymrel/open-ucp';

export const ucpHandler = createUcpHandler({
  merchant: {
    name: '${domain}',
    legalName: '${domain} Operating Co., LLC',
    contactEmail: 'contact@${domain}'
  },
  agentEndpoints: {
    catalog: '/api/ucp/catalog',
    quote: '/api/ucp/quote',
    checkout: '/api/ucp/checkout'
  },
  paymentCapabilities: {
    protocols: ['x402', 'ap2', 'stripe_agent_link'],
    x402Enabled: true
  }
});`,
    } : undefined,
  });

  // 2. Autonomous Agent Endpoints (Catalog, Quote, Checkout) (5 pts)
  let endpointScore = 0;
  const endpoints = (ucpManifest as any)?.agentEndpoints || {};
  const activeEndpoints: string[] = [];

  if (endpoints.catalog) { endpointScore += 1.5; activeEndpoints.push('catalog'); }
  if (endpoints.search) { endpointScore += 1; activeEndpoints.push('search'); }
  if (endpoints.quote) { endpointScore += 1; activeEndpoints.push('quote'); }
  if (endpoints.checkout || endpoints.order) { endpointScore += 1.5; activeEndpoints.push('checkout'); }

  // Check fallback endpoints in HTML
  if (endpointScore === 0) {
    if (/api\/checkout|buy-now|stripe\.com/i.test(rawHtml)) {
      endpointScore = 2;
      activeEndpoints.push('web-checkout');
    }
  }

  checks.push({
    id: 'pay-002',
    name: 'Autonomous Agent Commerce Endpoints',
    dimension: 'machinePayments',
    status: endpointScore >= 4 ? 'PASS' : endpointScore > 0 ? 'WARN' : 'FAIL',
    score: endpointScore,
    maxScore: 5,
    message:
      endpointScore >= 4
        ? `Full agent commerce lifecycle endpoints exposed (${activeEndpoints.join(', ')}) for zero-human purchasing.`
        : endpointScore > 0
        ? `Partial machine endpoints exposed (${activeEndpoints.join(', ')}). Missing dedicated quote/checkout API.`
        : 'No programmatic endpoints declared for autonomous quoting or checkout.',
    details: { activeEndpoints, endpointScore },
    remediation:
      endpointScore < 4
        ? 'Expose `catalog`, `quote`, and `checkout` routes in your UCP manifest for autonomous AI purchasing agents.'
        : undefined,
  });

  // 3. HTTP 402 / x402 Micropayment Protocol Support (5 pts)
  const x402HeaderPresent =
    !!headers['x-402-payment-required'] ||
    !!headers['x-payment-server'] ||
    (headers['www-authenticate'] || '').toLowerCase().includes('x402');

  const x402ManifestEnabled = !!(ucpManifest as any)?.paymentCapabilities?.x402Enabled;
  const x402ProtocolInManifest = ((ucpManifest as any)?.paymentCapabilities?.protocols || []).some((p: string) => /x402/i.test(p));
  const x402Html = /x402|x-402-payment|402 payment required/i.test(rawHtml);

  let x402Score = 0;
  if (x402HeaderPresent || x402ManifestEnabled || x402ProtocolInManifest) {
    x402Score = 5;
  } else if (x402Html) {
    x402Score = 2.5;
  }

  checks.push({
    id: 'pay-003',
    name: 'HTTP 402 / x402 Protocol Support',
    dimension: 'machinePayments',
    status: x402Score === 5 ? 'PASS' : x402Score > 0 ? 'WARN' : 'INFO',
    score: x402Score,
    maxScore: 5,
    message:
      x402Score === 5
        ? 'Native HTTP 402 / x402 protocol declared and active for machine settlement.'
        : x402Score > 0
        ? 'x402 micropayment hints detected in markup, but formal headers or UCP capability not configured.'
        : 'HTTP 402 / x402 micropayment standard not declared.',
    details: { x402HeaderPresent, x402ManifestEnabled, x402ProtocolInManifest },
    remediation:
      x402Score < 5
        ? 'Enable `x402Enabled: true` in your `@nymrel/open-ucp` configuration or return `402 Payment Required` headers on paid machine APIs.'
        : undefined,
  });

  // 4. Machine Payment Rails (Stripe Agent Links, AP2, ACP, Stablecoins) (4 pts)
  const protocols = (ucpManifest as any)?.paymentCapabilities?.protocols || [];
  const ap2Supported = protocols.some((p: string) => /ap2/i.test(p)) || /agent-payment-protocol|ap2/i.test(rawHtml);
  const acpSupported = protocols.some((p: string) => /acp/i.test(p)) || /agent-commerce-protocol|acp/i.test(rawHtml);
  const hasStripeLinks = /buy\.stripe\.com|stripe\.com/i.test(rawHtml) || protocols.some((p: string) => /stripe/i.test(p));
  const hasCrypto = /solana|algorand|ethereum|polygon|usdc|lightning|bitcoin/i.test(rawHtml) || protocols.some((p: string) => /solana|algorand|usdc|crypto/i.test(p));

  let railsScore = 0;
  const rails: string[] = [];
  if (hasStripeLinks) { railsScore += 2; rails.push('Stripe Links'); }
  if (ap2Supported || acpSupported) { railsScore += 1.5; rails.push('AP2/ACP Negotiation'); }
  if (hasCrypto) { railsScore += 1.5; rails.push('USDC/Crypto'); }
  railsScore = Math.min(4, railsScore);

  checks.push({
    id: 'pay-004',
    name: 'Autonomous Settlement & Payment Rails',
    dimension: 'machinePayments',
    status: railsScore >= 3 ? 'PASS' : railsScore > 0 ? 'WARN' : 'FAIL',
    score: railsScore,
    maxScore: 4,
    message:
      railsScore >= 3
        ? `Autonomous settlement rails active (${rails.join(', ')}) for instant machine checkout.`
        : railsScore > 0
        ? `Partial settlement rails detected (${rails.join(', ')}).`
        : 'No autonomous payment rails (headless Stripe links, AP2, ACP, or stablecoins) discovered.',
    details: { rails, protocols },
    remediation:
      railsScore < 3
        ? 'Add headless Stripe agent links or declare supported protocols in `@nymrel/open-ucp`.'
        : undefined,
  });

  return checks;
}
