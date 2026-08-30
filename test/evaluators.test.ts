import { describe, expect, it } from 'vitest';

import { evaluateCrawlerAccess } from '../src/engine/evaluators/crawlerAccessEvaluator';
import { evaluateDiscovery } from '../src/engine/evaluators/discoveryEvaluator';
import { evaluateEntityGraph } from '../src/engine/evaluators/entityGraphEvaluator';
import { evaluateIntentOffers } from '../src/engine/evaluators/intentOffersEvaluator';
import { evaluateMachinePayments } from '../src/engine/evaluators/machinePaymentsEvaluator';

describe('discovery evaluator', () => {
  it('reports structure from supplied evidence', () => {
    const checks = evaluateDiscovery({
      domain: 'example.com',
      llmsTxt:
        '# Example\n\n> Summary\n\n## Products\n- Catalog: https://example.com/products\n\n## API\n- Docs: https://example.com/api',
      llmsFullTxt: '# Extended',
      robotsTxt: 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml',
    });
    expect(checks).toHaveLength(5);
    expect(checks.every((check) => check.status === 'PASS')).toBe(true);
    expect(checks.map((check) => check.message).join(' ')).toContain('Supplied');
  });

  it('returns review candidates when evidence is absent', () => {
    const checks = evaluateDiscovery({ domain: 'example.com' });
    expect(checks[0]).toMatchObject({ status: 'WARN', score: 0 });
    expect(checks.some((check) => check.codeSnippet?.code.includes('OPERATOR-FILL'))).toBe(true);
  });
});

describe('entity and offer evaluators', () => {
  const graph = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Example',
        legalName: 'Example Company',
        logo: 'https://example.com/logo.svg',
        sameAs: ['https://example.com/a', 'https://example.com/b'],
        contactPoint: { email: 'contact@example.com' },
        parentOrganization: { name: 'Example Parent' },
      },
      {
        '@type': 'Product',
        name: 'Example Product',
        potentialAction: { '@type': 'BuyAction' },
        offers: {
          '@type': 'Offer',
          price: '10.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy' },
        },
      },
    ],
  });

  it('parses graph nodes and preserves declared provenance', () => {
    const checks = evaluateEntityGraph({
      domain: 'example.com',
      jsonLdStrings: [graph, '{invalid'],
      ucpManifest: { merchant: { parentEntity: 'Example Parent' } },
    });
    expect(checks[0]).toMatchObject({ status: 'WARN', score: 4 });
    expect(checks[1]?.details).toMatchObject({ hasParentOrganization: true });
    expect(checks[2]).toMatchObject({ status: 'PASS' });
  });

  it('evaluates structured offers instead of duplicating test logic', () => {
    const checks = evaluateIntentOffers({
      domain: 'example.com',
      jsonLdStrings: [graph],
      rawHtml: '',
    });
    expect(checks[0]).toMatchObject({ status: 'PASS', score: 7 });
    expect(checks[1]).toMatchObject({ status: 'PASS', score: 8 });
    expect(checks[2]).toMatchObject({ status: 'PASS', score: 5 });
  });

  it('returns honest gaps for invalid or absent structured data', () => {
    const entity = evaluateEntityGraph({
      domain: 'example.com',
      jsonLdStrings: ['not json'],
    });
    const offers = evaluateIntentOffers({
      domain: 'example.com',
      jsonLdStrings: [],
    });
    expect(entity[0]).toMatchObject({ status: 'FAIL', score: 0 });
    expect(offers[1]).toMatchObject({ status: 'FAIL', score: 0 });
  });
});

describe('machine payment evaluator', () => {
  it('scores declared evidence while saying execution is unverified', () => {
    const checks = evaluateMachinePayments({
      domain: 'example.com',
      ucpManifest: {
        ucpVersion: 'example-1',
        agentEndpoints: {
          catalog: 'https://example.com/catalog',
          search: 'https://example.com/search',
          quote: 'https://example.com/quote',
          checkout: 'https://example.com/checkout',
        },
        paymentCapabilities: {
          protocols: ['x402', 'ap2', 'stripe_agent_link', 'usdc'],
          x402Enabled: true,
        },
      },
      headers: { 'X-402-Payment-Required': 'example' },
    });
    expect(checks.map((check) => check.status)).toEqual(['PASS', 'PASS', 'PASS', 'PASS']);
    expect(checks.map((check) => check.message).join(' ')).toMatch(
      /not verified|unverified|not exercised|No payment was attempted/i,
    );
  });

  it('does not promote markup hints to verified declarations', () => {
    const checks = evaluateMachinePayments({
      domain: 'example.com',
      rawHtml: '<a href="/api/checkout">Buy</a><p>x402</p>',
    });
    expect(checks[0]).toMatchObject({ status: 'WARN', score: 0 });
    expect(checks[1]).toMatchObject({ status: 'WARN', score: 2 });
    expect(checks[2]).toMatchObject({ status: 'WARN', score: 2.5 });
  });
});

describe('crawler evaluator', () => {
  it('distinguishes missing evidence, blanket blocks, and explicit permissions', () => {
    const missing = evaluateCrawlerAccess({ domain: 'example.com' });
    const blocked = evaluateCrawlerAccess({
      domain: 'example.com',
      robotsTxt: 'User-agent: *\nDisallow: /',
    });
    const allowed = evaluateCrawlerAccess({
      domain: 'example.com',
      robotsTxt:
        'User-agent: OAI-SearchBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: Applebot-Extended\nAllow: /\nUser-agent: Bingbot\nAllow: /\nUser-agent: *\nAllow: /',
    });

    expect(missing.every((check) => check.status === 'INFO')).toBe(true);
    expect(blocked[1]).toMatchObject({ status: 'FAIL', score: 0 });
    expect(allowed[1]).toMatchObject({ status: 'PASS', score: 8 });
    expect(allowed[1]?.message).toContain('does not guarantee');
  });
});
