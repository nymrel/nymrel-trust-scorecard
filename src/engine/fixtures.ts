import type { PresetSite } from '../types';

const FIXTURE_VERSION = 'illustrative-2026-08-30';

const ILLUSTRATIVE_FIXTURES: Omit<PresetSite, 'fixtureVersion'>[] = [
  {
    id: 'nymrel',
    name: 'Nymrel reference',
    url: 'https://nymrel.example',
    category: 'Synthetic reference',
    description:
      'A synthetic, high-coverage reference used to demonstrate the diagnostic model. It is not evidence about nymrel.com.',
    icon: 'Shield',
    mockData: {
      rawHtml:
        '<!doctype html><html><head><title>Nymrel reference fixture</title></head><body><h1>Nymrel reference fixture</h1></body></html>',
      jsonLdStrings: [
        JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': 'https://nymrel.example/#organization',
              name: 'Nymrel Reference Fixture',
              legalName: 'Example Operating Company',
              url: 'https://nymrel.example',
              logo: 'https://nymrel.example/logo.svg',
              sameAs: ['https://example.com/reference'],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contact@example.com',
                contactType: 'customer support',
              },
              parentOrganization: {
                '@type': 'Organization',
                name: 'Example Holding Company',
                url: 'https://example.com',
              },
            },
            {
              '@type': 'Product',
              name: 'Reference Product',
              description: 'Synthetic product evidence for deterministic evaluation.',
              offers: {
                '@type': 'Offer',
                price: '25.00',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: 'https://nymrel.example/products/reference',
              },
            },
            {
              '@type': 'WebSite',
              url: 'https://nymrel.example',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://nymrel.example/search?q={query}',
              },
            },
          ],
        }),
      ],
      robotsTxt:
        'User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://nymrel.example/sitemap.xml\n',
      llmsTxt: `# Nymrel reference fixture

> Synthetic orientation evidence for the local Trust Scorecard demonstration.

## Product resources
- Catalog: https://nymrel.example/products
- Documentation: https://nymrel.example/docs

## Machine-commerce resources
- Capability manifest: https://nymrel.example/.well-known/ucp
- Checkout documentation: https://nymrel.example/docs/checkout
`,
      llmsFullTxt:
        '# Nymrel reference fixture: extended orientation\n\nSynthetic documentation used only by the local diagnostic.',
      ucpManifest: {
        version: 'example-1',
        merchant: {
          name: 'Nymrel Reference Fixture',
          legalName: 'Example Operating Company',
          contactEmail: 'contact@example.com',
        },
        agentEndpoints: {
          catalog: 'https://nymrel.example/api/catalog',
          quote: 'https://nymrel.example/api/quote',
          checkout: 'https://nymrel.example/api/checkout',
        },
        paymentCapabilities: {
          protocols: ['example-payment-protocol'],
          supportedTokens: ['USD'],
        },
      },
      headers: {
        'x-example-payment-capability': 'documented',
      },
    },
  },
  {
    id: 'commerce',
    name: 'Commerce example',
    url: 'https://commerce.example',
    category: 'Synthetic commerce',
    description:
      'A synthetic storefront with structured offers and public discovery evidence but no supplied machine-payment manifest.',
    icon: 'ShoppingBag',
    mockData: {
      rawHtml:
        '<!doctype html><html><head><title>Commerce example</title></head><body><h1>Commerce example</h1></body></html>',
      jsonLdStrings: [
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Commerce Example',
          url: 'https://commerce.example',
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'support@example.com',
          },
        }),
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Example Product',
          offers: {
            '@type': 'Offer',
            price: '39.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        }),
      ],
      robotsTxt:
        'User-agent: *\nDisallow: /account\nDisallow: /checkout\nAllow: /\n\nSitemap: https://commerce.example/sitemap.xml\n',
      llmsTxt: `# Commerce example

> Synthetic commerce fixture for deterministic diagnostic tests.

## Public resources
- Catalog: https://commerce.example/products
- Policies: https://commerce.example/policies
`,
    },
  },
  {
    id: 'documentation',
    name: 'Documentation example',
    url: 'https://docs.example',
    category: 'Synthetic documentation',
    description:
      'A synthetic documentation site with strong orientation and crawler evidence but no commerce claims.',
    icon: 'Layers',
    mockData: {
      rawHtml:
        '<!doctype html><html><head><title>Documentation example</title></head><body><h1>Documentation example</h1></body></html>',
      jsonLdStrings: [
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Documentation Example',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'All',
          publisher: {
            '@type': 'Organization',
            name: 'Example Publisher',
            url: 'https://example.com',
          },
        }),
      ],
      robotsTxt:
        'User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://docs.example/sitemap.xml\n',
      llmsTxt: `# Documentation example

> Synthetic developer-documentation fixture.

## Documentation
- Guides: https://docs.example/guides
- API reference: https://docs.example/api
`,
    },
  },
  {
    id: 'legacy',
    name: 'Legacy example',
    url: 'https://legacy.example',
    category: 'Synthetic baseline',
    description:
      'A synthetic human-only baseline with a blanket crawler block and no supplied structured evidence.',
    icon: 'AlertTriangle',
    mockData: {
      rawHtml:
        '<!doctype html><html><head><title>Legacy example</title></head><body><h1>Legacy example</h1><p>Call to place an order.</p></body></html>',
      jsonLdStrings: [],
      robotsTxt: 'User-agent: *\nDisallow: /\n',
    },
  },
];

export const PRESET_SITES: PresetSite[] = ILLUSTRATIVE_FIXTURES.map((fixture) => ({
  ...fixture,
  fixtureVersion: FIXTURE_VERSION,
}));
