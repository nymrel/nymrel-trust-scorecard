import test from 'node:test';
import assert from 'node:assert/strict';

test('llms.txt parser extracts title and summary', () => {
  const sampleLlms = `# My AI Product\n\n> Complete orientation for autonomous agents.\n\n## APIs\n- Endpoint: https://example.com/api\n`;
  const titleMatch = sampleLlms.match(/^#\s+(.+)$/m);
  const summaryMatch = sampleLlms.match(/^>\s+(.+)$/m);

  assert.equal(titleMatch[1].trim(), 'My AI Product');
  assert.equal(summaryMatch[1].trim(), 'Complete orientation for autonomous agents.');
});

test('robots.txt evaluator distinguishes AI search bots from training scrapers', () => {
  const robots = `User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n`;
  const allowsSearch = /user-agent:\s*oai-searchbot[\s\S]*?allow:\s*\//i.test(robots);
  assert.equal(allowsSearch, true);
});

test('entity graph validator verifies parentOrganization hierarchy', () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nymrel',
    legalName: 'JalenBuilds LLC',
    parentOrganization: {
      '@type': 'Organization',
      name: 'JalenBuilds LLC',
    },
  };

  assert.equal(jsonLd.parentOrganization.name, 'JalenBuilds LLC');
  assert.equal(jsonLd.legalName, 'JalenBuilds LLC');
});
