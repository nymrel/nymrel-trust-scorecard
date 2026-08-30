import type { CheckItem } from '../../types';

export interface CrawlerAccessInput {
  robotsTxt?: string | null | undefined;
  domain: string;
}

const AI_SEARCH_BOTS = [
  'OAI-SearchBot',
  'PerplexityBot',
  'ClaudeBot',
  'Applebot-Extended',
  'Bingbot',
];

export function evaluateCrawlerAccess(input: CrawlerAccessInput): CheckItem[] {
  const checks: CheckItem[] = [];
  const { robotsTxt, domain } = input;

  if (!robotsTxt || robotsTxt.trim().length === 0) {
    checks.push({
      id: 'crw-001',
      name: 'robots.txt Presence & Structure',
      dimension: 'aiCrawlerAccess',
      status: 'INFO',
      score: 0,
      maxScore: 4,
      message: 'No robots.txt evidence was supplied, so crawler access cannot be evaluated.',
      remediation:
        'Define and review a `robots.txt` policy for the public routes and crawlers you intend to permit.',
      codeSnippet: {
        language: 'markdown',
        filename: 'public/robots.txt',
        description: 'Permissive robots.txt draft requiring content and security review',
        code: `User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: https://${domain}/sitemap.xml\n`,
      },
    });

    checks.push({
      id: 'crw-002',
      name: 'AI Search Bot Discoverability',
      dimension: 'aiCrawlerAccess',
      status: 'INFO',
      score: 0,
      maxScore: 8,
      message: 'AI search bot access is unknown without supplied robots.txt evidence.',
    });

    checks.push({
      id: 'crw-003',
      name: 'Granular AI Crawler Policy',
      dimension: 'aiCrawlerAccess',
      status: 'INFO',
      score: 0,
      maxScore: 8,
      message: 'Crawler policy cannot be evaluated without supplied robots.txt evidence.',
    });

    return checks;
  }

  // Parse robots.txt
  const lines = robotsTxt.split(/\r?\n/);
  const rules: Record<string, { allow: string[]; disallow: string[] }> = {};
  let currentAgents: string[] = [];

  for (let line of lines) {
    line = line.replace(/#.*$/, '').trim();
    if (!line) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const val = line.slice(colonIdx + 1).trim();

    if (key === 'user-agent') {
      currentAgents = [val];
      for (const ag of currentAgents) {
        if (!rules[ag]) rules[ag] = { allow: [], disallow: [] };
      }
    } else if (key === 'disallow' || key === 'allow') {
      if (currentAgents.length === 0) {
        currentAgents = ['*'];
        if (!rules['*']) rules['*'] = { allow: [], disallow: [] };
      }
      for (const ag of currentAgents) {
        const rule = rules[ag];
        if (!rule) continue;
        if (key === 'disallow') rule.disallow.push(val);
        else rule.allow.push(val);
      }
    }
  }

  // 1. Presence (4 pts)
  checks.push({
    id: 'crw-001',
    name: 'robots.txt Presence & Structure',
    dimension: 'aiCrawlerAccess',
    status: 'PASS',
    score: 4,
    maxScore: 4,
    message: `Supplied robots.txt evidence contains ${Object.keys(rules).length} parsed user-agent block(s).`,
    details: { userAgentsCount: Object.keys(rules).length },
  });

  // Evaluate AI Search Bots
  const starRule = rules['*'];
  const hasBlanketDisallow = !!starRule && starRule.disallow.some((p) => p === '/' || p === '/*');

  const botResults = AI_SEARCH_BOTS.map((bot) => {
    const key = Object.keys(rules).find((k) => k.toLowerCase() === bot.toLowerCase());
    const rule = key ? rules[key] : starRule;
    if (!rule) return { bot, allowed: true };

    const disallowsRoot = rule.disallow.some((p) => p === '/' || p === '/*');
    const allowsRoot = rule.allow.some((p) => p === '/' || p === '/*');
    return {
      bot,
      allowed: !(disallowsRoot && !allowsRoot),
    };
  });

  const allowedSearchBots = botResults.filter((b) => b.allowed);
  const searchBotScore =
    allowedSearchBots.length === AI_SEARCH_BOTS.length
      ? 8
      : (allowedSearchBots.length / AI_SEARCH_BOTS.length) * 8;

  checks.push({
    id: 'crw-002',
    name: 'AI Search Bot Discoverability',
    dimension: 'aiCrawlerAccess',
    status: searchBotScore >= 7 ? 'PASS' : searchBotScore > 0 ? 'WARN' : 'FAIL',
    score: Math.round(searchBotScore * 10) / 10,
    maxScore: 8,
    message:
      searchBotScore >= 7
        ? `The supplied rules appear to permit ${allowedSearchBots.map((b) => b.bot).join(', ')}. Permission does not guarantee crawling or indexing.`
        : 'The supplied rules appear to block some or all evaluated AI search crawlers.',
    details: { allowedBots: allowedSearchBots.map((b) => b.bot) },
    remediation:
      searchBotScore < 7
        ? 'After content and security review, add explicit allow rules for the search crawlers you intend to permit. This cannot guarantee indexing.'
        : undefined,
    codeSnippet:
      searchBotScore < 7
        ? {
            language: 'markdown',
            filename: 'public/robots.txt',
            description: 'Allow OAI-SearchBot and PerplexityBot',
            code: `User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n`,
          }
        : undefined,
  });

  // 3. Granular Crawler Policy (8 pts)
  let policyScore = 0;
  const hasSpecificAiRules = Object.keys(rules).some((k) =>
    /oai-searchbot|claudebot|perplexitybot|gptbot|anthropic|google-extended/i.test(k),
  );

  if (hasSpecificAiRules && !hasBlanketDisallow) {
    policyScore = 8;
  } else if (!hasBlanketDisallow) {
    policyScore = 6;
  } else if (hasSpecificAiRules && hasBlanketDisallow) {
    policyScore = 5; // Blanket disallow with exceptions
  } else {
    policyScore = 0; // Blanket disallow with zero AI exceptions
  }

  checks.push({
    id: 'crw-003',
    name: 'Granular AI Crawler Policy',
    dimension: 'aiCrawlerAccess',
    status: policyScore >= 6 ? 'PASS' : policyScore > 0 ? 'WARN' : 'FAIL',
    score: policyScore,
    maxScore: 8,
    message:
      policyScore === 8
        ? 'Supplied evidence contains crawler-specific rules without a blanket root block.'
        : policyScore >= 5
          ? 'Supplied evidence permits general crawling or includes crawler-specific exceptions.'
          : 'Supplied evidence contains a blanket root block without evaluated AI crawler exceptions.',
    details: { hasSpecificAiRules, hasBlanketDisallow },
    remediation:
      policyScore < 6
        ? 'Review blanket blocks and add narrowly scoped crawler exceptions only where they match the intended public-content policy.'
        : undefined,
  });

  return checks;
}
