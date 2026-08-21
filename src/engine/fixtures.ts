import { PresetSite } from '../types';

export const PRESET_SITES: PresetSite[] = [
  {
    id: 'nymrel',
    name: 'Nymrel',
    url: 'https://nymrel.com',
    category: 'Autonomous Commerce',
    description: 'Gold-standard machine trust reference with dual-audience graph & full UCP.',
    icon: 'Shield',
    mockData: {
      rawHtml: `<!DOCTYPE html><html><head><title>Nymrel — Autonomous Commerce</title></head><body><h1>Nymrel</h1><p>Universal Commerce Protocol & Machine Trust</p></body></html>`,
      jsonLdStrings: [
        JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': 'https://nymrel.com/#organization',
              name: 'Nymrel',
              legalName: 'JalenBuilds LLC',
              url: 'https://nymrel.com',
              logo: 'https://nymrel.com/logo.png',
              sameAs: ['https://github.com/nymrel', 'https://x.com/nymrel'],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contact@jalenbuilds.com',
                contactType: 'customer support',
              },
              parentOrganization: {
                '@type': 'Organization',
                '@id': 'https://jalenbuilds.com/#organization',
                name: 'JalenBuilds LLC',
                legalName: 'JalenBuilds LLC',
                url: 'https://jalenbuilds.com',
              },
            },
            {
              '@type': 'Product',
              '@id': 'https://nymrel.com/#open-ucp',
              name: 'Open UCP & Machine Trust Suite',
              description: 'Universal Commerce Protocol & AI Agent Purchasing Engine',
              offers: {
                '@type': 'Offer',
                price: '0.00',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: 'https://nymrel.com/open-ucp',
              },
            },
            {
              '@type': 'WebSite',
              url: 'https://nymrel.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://nymrel.com/search?q={query}',
              },
            },
          ],
        }),
      ],
      robotsTxt: `User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://nymrel.com/sitemap.xml\n`,
      llmsTxt: `# Nymrel

> Nymrel is the primary operating umbrella for autonomous agentic commerce, machine trust infrastructure, and next-generation web protocols.

## Core Capabilities
- Open UCP: https://nymrel.com/open-ucp
- Machine Trust: https://nymrel.com/machine-trust
- Scorecard: https://score.nymrel.com
- Agent Endpoints: https://nymrel.com/.well-known/ucp
`,
      llmsFullTxt: `# Nymrel Extended Architecture Documentation\n\nDetailed specifications for autonomous AI purchasing agents...`,
      ucpManifest: {
        ucpVersion: '1.0',
        merchant: {
          name: 'Nymrel',
          legalName: 'JalenBuilds LLC',
          parentEntity: 'JalenBuilds LLC',
          contactEmail: 'contact@jalenbuilds.com',
        },
        agentEndpoints: {
          catalog: 'https://nymrel.com/api/ucp/catalog',
          search: 'https://nymrel.com/api/ucp/search',
          quote: 'https://nymrel.com/api/ucp/quote',
          checkout: 'https://nymrel.com/api/ucp/checkout',
        },
        paymentCapabilities: {
          protocols: ['x402', 'ap2', 'stripe_agent_link', 'usdc'],
          x402Enabled: true,
          supportedTokens: ['USD', 'USDC'],
        },
      },
      headers: {
        'x-402-payment-required': 'https://nymrel.com/api/ucp/quote',
      },
    },
  },
  {
    id: 'stripe',
    name: 'Stripe',
    url: 'https://stripe.com',
    category: 'Fintech / Payments',
    description: 'World-class machine payments leader with robust API documentation & entity graph.',
    icon: 'CreditCard',
    mockData: {
      rawHtml: `<!DOCTYPE html><html><head><title>Stripe | Financial Infrastructure for the Internet</title></head><body><a href="https://buy.stripe.com/test_123">Checkout Link</a></body></html>`,
      jsonLdStrings: [
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Corporation',
          name: 'Stripe',
          legalName: 'Stripe, Inc.',
          url: 'https://stripe.com',
          logo: 'https://stripe.com/logo.png',
          sameAs: ['https://twitter.com/stripe', 'https://github.com/stripe', 'https://en.wikipedia.org/wiki/Stripe_(company)'],
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'info@stripe.com',
          },
        }),
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Stripe Payments',
          offers: {
            '@type': 'Offer',
            price: '2.9',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        }),
      ],
      robotsTxt: `User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://stripe.com/sitemap.xml\n`,
      llmsTxt: `# Stripe

> Stripe builds financial infrastructure for the internet, powering millions of businesses worldwide.

## APIs & Tools
- Documentation: https://docs.stripe.com
- API Reference: https://docs.stripe.com/api
- Agent Toolkit: https://docs.stripe.com/agents
`,
      headers: {
        'stripe-version': '2026-08-01',
      },
    },
  },
  {
    id: 'shopify',
    name: 'Shopify',
    url: 'https://shopify.com',
    category: 'E-Commerce Platform',
    description: 'Commerce giant with structured product data, storefront APIs, and merchant schema.',
    icon: 'ShoppingBag',
    mockData: {
      rawHtml: `<!DOCTYPE html><html><head><title>Shopify — Start an Online Business</title></head><body><h1>Shopify</h1></body></html>`,
      jsonLdStrings: [
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Shopify',
          legalName: 'Shopify Inc.',
          url: 'https://shopify.com',
          sameAs: ['https://twitter.com/shopify'],
        }),
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Shopify Basic Plan',
          offers: {
            '@type': 'Offer',
            price: '39.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        }),
      ],
      robotsTxt: `User-agent: *\nDisallow: /admin\nDisallow: /cart\nDisallow: /checkout\nAllow: /\n\nSitemap: https://shopify.com/sitemap.xml\n`,
      llmsTxt: `# Shopify

> Shopify provides complete commerce platform tools for merchant storefronts and AI shopping assistants.

## Commerce Endpoints
- Storefront API: https://shopify.dev/docs/api/storefront
- Product Feeds: https://shopify.com/products
`,
    },
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    url: 'https://nextjs.org',
    category: 'Web Framework',
    description: 'Modern React framework with first-class SEO metadata and fast discovery.',
    icon: 'Layers',
    mockData: {
      rawHtml: `<!DOCTYPE html><html><head><title>Next.js by Vercel — The React Framework</title></head><body><h1>Next.js</h1></body></html>`,
      jsonLdStrings: [
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Next.js',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'All',
          publisher: {
            '@type': 'Organization',
            name: 'Vercel',
            legalName: 'Vercel Inc.',
            url: 'https://vercel.com',
          },
          offers: {
            '@type': 'Offer',
            price: '0.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        }),
      ],
      robotsTxt: `User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://nextjs.org/sitemap.xml\n`,
      llmsTxt: `# Next.js

> Next.js is a flexible React framework that gives you building blocks to create fast, full-stack web applications.

## Docs
- Docs: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app
`,
    },
  },
  {
    id: 'openai',
    name: 'OpenAI',
    url: 'https://openai.com',
    category: 'AI Research & Platform',
    description: 'AI pioneer with high authority entity graph, API endpoints, and model docs.',
    icon: 'Sparkles',
    mockData: {
      rawHtml: `<!DOCTYPE html><html><head><title>OpenAI — Creating safe AGI</title></head><body><h1>OpenAI</h1></body></html>`,
      jsonLdStrings: [
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'OpenAI',
          legalName: 'OpenAI, Inc.',
          url: 'https://openai.com',
          sameAs: ['https://x.com/openai', 'https://github.com/openai'],
        }),
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'ChatGPT Plus',
          offers: {
            '@type': 'Offer',
            price: '20.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        }),
      ],
      robotsTxt: `User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://openai.com/sitemap.xml\n`,
      llmsTxt: `# OpenAI

> OpenAI is an AI research and deployment company dedicated to ensuring artificial general intelligence benefits all of humanity.

## Resources
- API Reference: https://platform.openai.com/docs
- Models: https://platform.openai.com/docs/models
`,
    },
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    url: 'https://anthropic.com',
    category: 'AI Safety & Research',
    description: 'Creator of Claude with high AI search accessibility, clear research provenance, and API guides.',
    icon: 'Cpu',
    mockData: {
      rawHtml: `<!DOCTYPE html><html><head><title>Anthropic — AI Research and Products</title></head><body><h1>Anthropic</h1></body></html>`,
      jsonLdStrings: [
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Anthropic',
          legalName: 'Anthropic PBC',
          url: 'https://anthropic.com',
          sameAs: ['https://twitter.com/anthropicai', 'https://github.com/anthropics'],
        }),
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Claude Pro',
          offers: {
            '@type': 'Offer',
            price: '20.00',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        }),
      ],
      robotsTxt: `User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://anthropic.com/sitemap.xml\n`,
      llmsTxt: `# Anthropic

> Anthropic is an AI safety and research company that builds reliable, interpretable, and steerable AI systems.

## Documentation
- Claude API: https://docs.anthropic.com
- Prompt Engineering: https://docs.anthropic.com/claude/docs
`,
    },
  },
  {
    id: 'legacy',
    name: 'Legacy Store Example',
    url: 'https://legacy-shop-example.com',
    category: 'Legacy Web (Baseline)',
    description: 'Human-only legacy architecture with blocked AI crawlers, zero schema, and no agent endpoints.',
    icon: 'AlertTriangle',
    mockData: {
      rawHtml: `<!DOCTYPE html><html><head><title>My Old Web Store</title></head><body><h1>Welcome to My Store</h1><p>Call 555-0199 to place an order</p></body></html>`,
      jsonLdStrings: [],
      robotsTxt: `User-agent: *\nDisallow: /\n`,
    },
  },
];
