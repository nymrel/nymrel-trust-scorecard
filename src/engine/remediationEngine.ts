import { CheckItem } from '../types';

export interface RemediationPackage {
  title: string;
  description: string;
  installCommand: string;
  files: Array<{
    filename: string;
    language: string;
    code: string;
    explanation: string;
  }>;
}

export function generateRemediationBundle(domain: string, checks: CheckItem[]): RemediationPackage[] {
  const bundles: RemediationPackage[] = [];
  const failingChecks = checks.filter((c) => c.status === 'FAIL' || c.status === 'WARN');

  const hasEntityIssue = failingChecks.some((c) => c.dimension === 'entityGraph');
  const hasDiscoveryIssue = failingChecks.some((c) => c.dimension === 'discovery');
  const hasPaymentsIssue = failingChecks.some((c) => c.dimension === 'machinePayments');
  const hasCrawlerIssue = failingChecks.some((c) => c.dimension === 'aiCrawlerAccess');

  // 1. Machine Trust & Schema.org Provenance Bundle
  if (hasEntityIssue || hasDiscoveryIssue) {
    bundles.push({
      title: 'Machine Trust & Dual-Audience Entity Graph',
      description: 'Deploy verifiable parentOrganization provenance, ISO 4217 product offers, and /llms.txt orientation using @nymrel/machine-trust.',
      installCommand: 'npm install @nymrel/machine-trust',
      files: [
        {
          filename: 'src/config/machine-trust.ts',
          language: 'typescript',
          explanation: 'Configures dual-audience JSON-LD entity graph with parent entity verification and /llms.txt',
          code: `import { createMachineTrustEngine } from '@nymrel/machine-trust';

export const machineTrust = createMachineTrustEngine({
  entity: {
    name: '${domain}',
    legalName: '${domain} Operating Co., LLC',
    url: 'https://${domain}',
    description: 'Autonomous commerce and enterprise software platform.',
    contactPoint: {
      email: 'contact@${domain}',
      contactType: 'customer service'
    },
    parentOrganization: {
      name: 'Nymrel',
      legalName: 'JalenBuilds LLC',
      url: 'https://jalenbuilds.com'
    }
  },
  llmsTxt: {
    title: '${domain} AI Agent Orientation',
    summary: '${domain} exposes machine-executable APIs and verifiable machine trust for autonomous agents.',
    sections: [
      {
        title: 'Core Capabilities',
        links: [
          { title: 'Product Catalog', url: 'https://${domain}/catalog', description: 'Real-time inventory and pricing' },
          { title: 'Machine Checkout', url: 'https://${domain}/.well-known/ucp', description: 'Universal Commerce Protocol endpoints' }
        ]
      }
    ]
  }
});`,
        },
        {
          filename: 'public/llms.txt',
          language: 'markdown',
          explanation: 'Standard /llms.txt file placed in your web root for AI agent orientation',
          code: `# ${domain}

> ${domain} provides machine-readable services, verified entity provenance, and autonomous checkout endpoints for AI purchasing agents.

## Core Capabilities
- Products & Catalog: https://${domain}/products
- API Reference: https://${domain}/docs/api
- Universal Commerce Protocol: https://${domain}/.well-known/ucp
- Machine Trust Verification: https://score.nymrel.com/?url=${domain}
`,
        },
      ],
    });
  }

  // 2. Open UCP & Machine Payments Bundle
  if (hasPaymentsIssue) {
    bundles.push({
      title: 'Universal Commerce Protocol (UCP) & x402 Micropayments',
      description: 'Enable autonomous agent purchasing, instant price quoting, and HTTP 402 / x402 settlement rails with @nymrel/open-ucp.',
      installCommand: 'npm install @nymrel/open-ucp',
      files: [
        {
          filename: 'src/api/ucp.ts',
          language: 'typescript',
          explanation: 'Zero-dependency UCP handler for Next.js / Express / Fastify exposing /.well-known/ucp',
          code: `import { createUcpHandler } from '@nymrel/open-ucp';

export const ucpHandler = createUcpHandler({
  merchant: {
    name: '${domain}',
    legalName: '${domain} Operating Co., LLC',
    contactEmail: 'contact@${domain}'
  },
  agentEndpoints: {
    catalog: '/api/ucp/catalog',
    search: '/api/ucp/search',
    quote: '/api/ucp/quote',
    checkout: '/api/ucp/checkout'
  },
  paymentCapabilities: {
    protocols: ['x402', 'ap2', 'stripe_agent_link'],
    x402Enabled: true,
    supportedTokens: ['USDC', 'USD']
  }
});`,
        },
        {
          filename: 'public/.well-known/ucp.json',
          language: 'json',
          explanation: 'Static fallback UCP manifest for static sites and Jamstack architectures',
          code: `{
  "ucpVersion": "1.0",
  "merchant": {
    "name": "${domain}",
    "legalName": "${domain} Operating Co., LLC",
    "parentEntity": "Nymrel -> JalenBuilds LLC",
    "contactEmail": "contact@${domain}"
  },
  "agentEndpoints": {
    "catalog": "https://${domain}/api/catalog",
    "quote": "https://${domain}/api/quote",
    "checkout": "https://${domain}/api/checkout"
  },
  "paymentCapabilities": {
    "protocols": ["x402", "ap2", "stripe_agent_link"],
    "x402Enabled": true,
    "supportedTokens": ["USD", "USDC"]
  }
}`,
        },
      ],
    });
  }

  // 3. AI Search Bot & Crawler Access Bundle
  if (hasCrawlerIssue) {
    bundles.push({
      title: 'AI Search Discoverability & Granular Crawler Posture',
      description: 'Configure robots.txt to explicitly welcome AI search agents (OAI-SearchBot, PerplexityBot, ClaudeBot) while maintaining scraper governance.',
      installCommand: '# No dependencies required (Static file)',
      files: [
        {
          filename: 'public/robots.txt',
          language: 'markdown',
          explanation: 'High-discoverability robots.txt for AI agent search inclusion',
          code: `# Allow AI Search Bots to index catalogs & documentation
User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Applebot-Extended
Allow: /

# General crawlers
User-agent: *
Allow: /

Sitemap: https://${domain}/sitemap.xml
`,
        },
      ],
    });
  }

  return bundles;
}
