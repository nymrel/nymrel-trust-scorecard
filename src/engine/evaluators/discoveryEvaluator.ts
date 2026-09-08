import type { CheckItem } from '../../types';

export interface DiscoveryInput {
  llmsTxt?: string | null | undefined;
  llmsFullTxt?: string | null | undefined;
  robotsTxt?: string | null | undefined;
  domain: string;
}

export function evaluateDiscovery(input: DiscoveryInput): CheckItem[] {
  const checks: CheckItem[] = [];
  const { llmsTxt, llmsFullTxt, robotsTxt, domain } = input;

  // 1. Supplied llms.txt presence (6 pts)
  if (llmsTxt && llmsTxt.trim().length > 0) {
    const sizeBytes = new Blob([llmsTxt]).size;
    const titleMatch = llmsTxt.match(/^#\s+(.+)$/m);
    const title = titleMatch?.[1]?.trim() ?? 'AI Orientation Guide';

    checks.push({
      id: 'dsc-001',
      name: 'llms.txt Evidence Presence',
      dimension: 'discovery',
      status: 'PASS',
      score: 6,
      maxScore: 6,
      message: `Supplied llms.txt evidence contains ${sizeBytes} bytes and the title "${title}".`,
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
      name: 'llms.txt Orientation Structure',
      dimension: 'discovery',
      status: structureScore >= 3.5 ? 'PASS' : structureScore > 0 ? 'WARN' : 'FAIL',
      score: structureScore,
      maxScore: 4,
      message:
        structureScore >= 3.5
          ? `Supplied evidence includes an H1 title, blockquote summary, and ${sectionCount} resource section(s).`
          : 'Supplied llms.txt evidence is missing an H1 title, blockquote summary, or multiple resource sections.',
      details: { hasH1, hasSummary, sectionCount },
      remediation:
        structureScore < 3.5
          ? 'Add `# Title`, `> Blockquote summary`, and `## Sections` with markdown links to your llms.txt.'
          : undefined,
      codeSnippet:
        structureScore < 3.5
          ? {
              language: 'markdown',
              filename: 'public/llms.txt',
              description: 'Reviewable llms.txt orientation draft',
              code: `# ${domain}

> OPERATOR-FILL: concise, evidence-backed description of this site.

## Verified resources
- Homepage: https://${domain}/
- OPERATOR-FILL: https://${domain}/OPERATOR-FILL
`,
            }
          : undefined,
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
        ? 'Supplied evidence includes or references an extended llms-full.txt orientation file.'
        : 'Supplied evidence contains only llms.txt. A reviewed extended file may help document a large catalog or SDK.',
      details: { hasFull },
    });

    // 4. Machine Commerce & API Orientation (3 pts)
    const commerceKeywords =
      /product|pricing|offer|catalog|api|endpoint|checkout|payment|order|service|inventory/i;
    const hasCommerceKeywords = commerceKeywords.test(llmsTxt);
    checks.push({
      id: 'dsc-004',
      name: 'Actionable Machine Commerce Guidance',
      dimension: 'discovery',
      status: hasCommerceKeywords ? 'PASS' : 'WARN',
      score: hasCommerceKeywords ? 3 : 1,
      maxScore: 3,
      message: hasCommerceKeywords
        ? 'Supplied llms.txt evidence references product, pricing, API, or commerce resources.'
        : 'Supplied llms.txt evidence contains high-level copy without explicit resource links.',
      details: { hasCommerceKeywords },
      remediation: !hasCommerceKeywords
        ? 'Add links to your product catalog, API endpoints, and UCP manifest in llms.txt.'
        : undefined,
    });
  } else {
    // Missing llms.txt
    checks.push({
      id: 'dsc-001',
      name: 'llms.txt Evidence Presence',
      dimension: 'discovery',
      status: 'WARN',
      score: 0,
      maxScore: 6,
      message: 'No llms.txt evidence was supplied, so site orientation cannot be evaluated.',
      remediation:
        'Consider a reviewed `/llms.txt` file describing only published, safe-to-disclose resources.',
      codeSnippet: {
        language: 'markdown',
        filename: 'public/llms.txt',
        description: 'Reviewable llms.txt orientation draft',
        code: `# ${domain}

> OPERATOR-FILL: concise, evidence-backed description of this site.

## Verified resources
- Homepage: https://${domain}/
- OPERATOR-FILL: https://${domain}/OPERATOR-FILL
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
      message: 'Structure cannot be evaluated without supplied llms.txt evidence.',
    });

    checks.push({
      id: 'dsc-003',
      name: 'Extended Agent Orientation (llms-full.txt)',
      dimension: 'discovery',
      status: 'WARN',
      score: 0,
      maxScore: 3,
      message: 'No llms-full.txt evidence was supplied.',
    });

    checks.push({
      id: 'dsc-004',
      name: 'Actionable Machine Commerce Guidance',
      dimension: 'discovery',
      status: 'WARN',
      score: 0,
      maxScore: 3,
      message: 'Actionable orientation cannot be evaluated without supplied llms.txt evidence.',
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
      ? 'Supplied robots.txt evidence declares an absolute Sitemap URL.'
      : 'Supplied robots.txt evidence does not declare an absolute Sitemap URL.',
    details: { hasSitemap },
    remediation: !hasSitemap
      ? `Add \`Sitemap: https://${domain}/sitemap.xml\` to robots.txt.`
      : undefined,
    codeSnippet: !hasSitemap
      ? {
          language: 'markdown',
          filename: 'public/robots.txt',
          description: 'Sitemap entry for robots.txt',
          code: `Sitemap: https://${domain}/sitemap.xml\n`,
        }
      : undefined,
  });

  return checks;
}
