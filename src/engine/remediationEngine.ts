import type { CheckItem } from '../types';

export interface RemediationPackage {
  title: string;
  description: string;
  reviewCommand: string;
  files: Array<{
    filename: string;
    language: string;
    code: string;
    explanation: string;
  }>;
}

export function generateRemediationBundle(
  domain: string,
  checks: CheckItem[],
): RemediationPackage[] {
  const failingChecks = checks.filter(
    (check) => check.status === 'FAIL' || check.status === 'WARN',
  );
  const hasEntityIssue = failingChecks.some((check) => check.dimension === 'entityGraph');
  const hasDiscoveryIssue = failingChecks.some((check) => check.dimension === 'discovery');
  const hasPaymentsIssue = failingChecks.some((check) => check.dimension === 'machinePayments');
  const hasCrawlerIssue = failingChecks.some((check) => check.dimension === 'aiCrawlerAccess');
  const bundles: RemediationPackage[] = [];

  if (hasEntityIssue || hasDiscoveryIssue) {
    bundles.push({
      title: 'Entity and orientation evidence template',
      description:
        'Review these operator-fill templates with the legal, product, and content owners. Their presence does not verify the facts they contain or guarantee discovery.',
      reviewCommand: 'Review every OPERATOR-FILL field before publishing',
      files: [
        {
          filename: 'public/organization.schema.json',
          language: 'json',
          explanation:
            'A minimal Organization draft. Publish only values supported by current first-party evidence.',
          code: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OPERATOR-FILL",
  "url": "https://${domain}",
  "description": "OPERATOR-FILL",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "OPERATOR-FILL",
    "contactType": "OPERATOR-FILL"
  }
}`,
        },
        {
          filename: 'public/llms.txt',
          language: 'markdown',
          explanation:
            'A small orientation draft. Keep only routes and capabilities that exist and are safe to disclose.',
          code: `# OPERATOR-FILL

> OPERATOR-FILL: concise, evidence-backed description of this site.

## Verified resources
- Homepage: https://${domain}/
- OPERATOR-FILL: https://${domain}/OPERATOR-FILL

## Boundaries
- This file describes published resources; it does not certify live behavior or search inclusion.
`,
        },
      ],
    });
  }

  if (hasPaymentsIssue) {
    bundles.push({
      title: 'Machine-commerce capability draft',
      description:
        'Use this manifest only after the commerce, payment, security, privacy, and legal owners verify each advertised capability and endpoint.',
      reviewCommand: 'Validate endpoints and payment claims before publishing',
      files: [
        {
          filename: 'public/.well-known/ucp',
          language: 'json',
          explanation:
            'A protocol-neutral operator-fill draft. Replace or remove every placeholder, then validate against the exact protocol version you implement.',
          code: `{
  "version": "OPERATOR-FILL",
  "merchant": {
    "name": "OPERATOR-FILL",
    "legalName": "OPERATOR-FILL",
    "contactEmail": "OPERATOR-FILL"
  },
  "capabilities": {
    "catalog": "https://${domain}/OPERATOR-FILL",
    "quote": "https://${domain}/OPERATOR-FILL",
    "checkout": "https://${domain}/OPERATOR-FILL"
  },
  "paymentMethods": ["OPERATOR-FILL"]
}`,
        },
      ],
    });
  }

  if (hasCrawlerIssue) {
    bundles.push({
      title: 'Crawler policy review draft',
      description:
        'Choose an explicit access policy with the content and security owners. A permissive robots.txt rule grants crawl permission; it does not guarantee crawling, indexing, citation, or ranking.',
      reviewCommand: 'Review crawl policy and sitemap URL before publishing',
      files: [
        {
          filename: 'public/robots.txt',
          language: 'markdown',
          explanation:
            'A permissive draft for public content. Add targeted exclusions for any routes that should not be crawled.',
          code: `User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

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
