import { CheckItem } from '../../types';

export interface DiscoveryInput {
  llmsTxt?: string | null;
  llmsFullTxt?: string | null;
  robotsTxt?: string | null;
  domain: string;
}

export function evaluateDiscovery(input: DiscoveryInput): CheckItem[] {
  const checks: CheckItem[] = [];
  const { llmsTxt, llmsFullTxt, robotsTxt, domain } = input;

  // 1. llms.txt Standard Presence (6 pts)
  if (llmsTxt && llmsTxt.trim().length > 0) {
    const sizeBytes = new Blob([llmsTxt]).size;
    const titleMatch = llmsTxt.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : 'AI Orientation Guide';

    checks.push({
      id: 'dsc-001',
      name: 'llms.txt Standard Presence',
      dimension: 'discovery',
      status: 'PASS',
      score: 6,
      maxScore: 6,
      message: `Standard /llms.txt active (${sizeBytes} bytes). Title: "${title}".`,
      details: { sizeBytes, title },
    });

    // 2. llms.txt Structural Quality (4 pts)
    let structureScore = 0;
    const hasH1 = /^#\s+/m.test(llmsTxt);
    const hasSummary = /^>\s+/m.test(llmsTxt);
    const sectionMatches = llmsTxt.match(/^##\s+/gm) || [];
    const sectionCount = sectionMatches.length;

    if (hasH1) structureScore += 1.5;
    if (hasSummary) structureScore += 1.5;
    if (sectionCount >= 2) structureScore += 1;

    checks.push({
      id: 'dsc-002',
      name: 'llms.txt Structural Quality',
      dimension: 'discovery',
      status: structureScore >= 3.5 ? 'PASS' : structureScore > 0 ? 'WARN' : 'FAIL',
      score: structureScore,
      maxScore: 4,
      message:
        structureScore >= 3.5
          ? `Strict compliance with /llms.txt spec: H1 title, blockquote summary, and ${sectionCount} resource section(s).`
          : 'llms.txt is present but missing standard blockquote summary or section headers.',
      details: { hasH1, hasSummary, sectionCount },
      remediation:
        structureScore < 3.5
          ? 'Add `# Title`, `> Blockquote summary`, and `## Sections` with markdown links to your llms.txt.'
          : undefined,
      codeSnippet: structureScore < 3.5 ? {
        language: 'markdown',
        filename: 'public/llms.txt',
        description: 'Standard /llms.txt specification template',
        code: `# ${domain}

> ${domain} provides modern services and machine-executable APIs for autonomous purchasing agents.

## Core Capabilities
- Products & Catalog: https://${domain}/products
- API Reference: https://${domain}/docs/api
- Machine Payments: https://${domain}/.well-known/ucp
`,
      } : undefined,
    });

    // 3. Extended full documentation llms-full.txt (3 pts)
    const hasFull = !!llmsFullTxt || /llms-full\.txt/i.test(llmsTxt);
    checks.push({
      id: 'dsc-003',
      name: 'Extended Agent Orientation (llms-full.txt)',
      dimension: 'discovery',
      status: hasFull ? 'PASS' : 'INFO',
      score: hasFull ? 3 : 1,
      maxScore: 3,
      message: hasFull
        ? 'Extended orientation file (/llms-full.txt) provided for deep context agent reasoning.'
        : 'Single-page llms.txt provided. For deep catalogs or SDKs, exposing /llms-full.txt is recommended.',
      details: { hasFull },
    });

    // 4. Machine Commerce & API Orientation (3 pts)
    const commerceKeywords = /product|pricing|offer|catalog|api|endpoint|checkout|payment|order|service|inventory/i;
    const hasCommerceKeywords = commerceKeywords.test(llmsTxt);
    checks.push({
      id: 'dsc-004',
      name: 'Actionable Machine Commerce Guidance',
      dimension: 'discovery',
      status: hasCommerceKeywords ? 'PASS' : 'WARN',
      score: hasCommerceKeywords ? 3 : 1,
      maxScore: 3,
      message: hasCommerceKeywords
        ? 'llms.txt contains machine-actionable product, pricing, or checkout orientation paths.'
        : 'llms.txt contains high-level copy without explicit links to products, APIs, or checkout capabilities.',
      details: { hasCommerceKeywords },
      remediation: !hasCommerceKeywords
        ? 'Add links to your product catalog, API endpoints, and UCP manifest in llms.txt.'
        : undefined,
    });
  } else {
    // Missing llms.txt
    checks.push({
      id: 'dsc-001',
      name: 'llms.txt Standard Presence',
      dimension: 'discovery',
      status: 'WARN',
      score: 0,
      maxScore: 6,
      message: 'No /llms.txt file detected. Autonomous AI agents lack structured orientation for this site.',
      remediation: 'Deploy an `/llms.txt` file in your web root with summary, capabilities, and machine endpoints.',
      codeSnippet: {
        language: 'markdown',
        filename: 'public/llms.txt',
        description: 'Standard /llms.txt template for AI agent orientation',
        code: `# ${domain}

> ${domain} is an online platform ready for human and autonomous AI agent discovery.

## Key Resources
- Homepage: https://${domain}/
- Catalog: https://${domain}/catalog
- Machine Trust: https://${domain}/.well-known/ucp
`,
      },
    });

    checks.push({
      id: 'dsc-002',
      name: 'llms.txt Structural Quality',
      dimension: 'discovery',
      status: 'WARN',
      score: 0,
      maxScore: 4,
      message: 'Cannot evaluate structural quality (llms.txt missing).',
    });

    checks.push({
      id: 'dsc-003',
      name: 'Extended Agent Orientation (llms-full.txt)',
      dimension: 'discovery',
      status: 'WARN',
      score: 0,
      maxScore: 3,
      message: 'No extended llms-full.txt detected.',
    });

    checks.push({
      id: 'dsc-004',
      name: 'Actionable Machine Commerce Guidance',
      dimension: 'discovery',
      status: 'WARN',
      score: 0,
      maxScore: 3,
      message: 'No structured machine discovery guidance present.',
    });
  }

  // 5. Sitemap Discovery Directive (4 pts)
  const hasSitemap = robotsTxt ? /sitemap:\s*https?:\/\//i.test(robotsTxt) : false;
  checks.push({
    id: 'dsc-005',
    name: 'Sitemap Discovery Directive',
    dimension: 'discovery',
    status: hasSitemap ? 'PASS' : 'WARN',
    score: hasSitemap ? 4 : 0,
    maxScore: 4,
    message: hasSitemap
      ? 'Sitemap index explicitly declared in robots.txt for autonomous discovery.'
      : 'No Sitemap directive declared in robots.txt.',
    details: { hasSitemap },
    remediation: !hasSitemap ? `Add \`Sitemap: https://${domain}/sitemap.xml\` to robots.txt.` : undefined,
    codeSnippet: !hasSitemap ? {
      language: 'markdown',
      filename: 'public/robots.txt',
      description: 'Sitemap entry for robots.txt',
      code: `Sitemap: https://${domain}/sitemap.xml\n`,
    } : undefined,
  });

  return checks;
}
