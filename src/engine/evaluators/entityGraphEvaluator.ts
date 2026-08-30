import { CheckItem } from '../../types';

export interface EntityGraphInput {
  jsonLdStrings: string[];
  ucpManifest?: Record<string, unknown> | null;
  domain: string;
}

export function evaluateEntityGraph(input: EntityGraphInput): CheckItem[] {
  const checks: CheckItem[] = [];
  const { jsonLdStrings, ucpManifest, domain } = input;

  const validNodes: any[] = [];
  let invalidCount = 0;
  const parseErrors: string[] = [];

  for (const raw of jsonLdStrings) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item === 'object') {
            if (Array.isArray(item['@graph'])) {
              validNodes.push(...item['@graph']);
            } else {
              validNodes.push(item);
            }
          }
        }
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed['@graph'])) {
          validNodes.push(...parsed['@graph']);
        } else {
          validNodes.push(parsed);
        }
      }
    } catch (err: any) {
      invalidCount++;
      parseErrors.push(err.message || 'JSON parse error');
    }
  }

  // 1. JSON-LD Structured Data Validity (6 pts)
  const hasJsonLd = validNodes.length > 0;
  let syntaxScore = 0;
  if (hasJsonLd) {
    syntaxScore = invalidCount === 0 ? 6 : 4;
  }

  checks.push({
    id: 'ent-001',
    name: 'JSON-LD Structured Data Validity',
    dimension: 'entityGraph',
    status: syntaxScore === 6 ? 'PASS' : syntaxScore > 0 ? 'WARN' : 'FAIL',
    score: syntaxScore,
    maxScore: 6,
    message: hasJsonLd
      ? `Discovered ${validNodes.length} valid JSON-LD node(s). ${invalidCount > 0 ? `(${invalidCount} script errors)` : 'Clean syntax.'}`
      : 'No valid JSON-LD structured data graph found in markup.',
    details: { validNodesCount: validNodes.length, invalidCount },
    remediation: !hasJsonLd
      ? 'Add `<script type="application/ld+json">` with Schema.org Organization schema to your HTML `<head>`.'
      : undefined,
    codeSnippet: !hasJsonLd ? {
      language: 'html',
      filename: 'index.html',
      description: 'Schema.org JSON-LD graph definition',
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://${domain}/#organization",
      "name": "${domain}",
      "url": "https://${domain}"
    }
  ]
}
</script>`,
    } : undefined,
  });

  // 2. Entity Provenance & Parent Organization Hierarchy (7 pts)
  const orgs = validNodes.filter((n) => {
    const t = String(n['@type'] || '').toLowerCase();
    return t.includes('organization') || t.includes('corporation') || t.includes('localbusiness') || t.includes('store');
  });

  let provenanceScore = 0;
  let hasParentOrg = false;
  let hasLegalName = false;
  const parentChain: string[] = [];

  for (const org of orgs) {
    if (org.name) provenanceScore = Math.max(provenanceScore, 2);
    if (org.legalName || org.taxID || org.leiCode || org.identifier) {
      provenanceScore = Math.max(provenanceScore, 4);
      hasLegalName = true;
    }
    if (org.parentOrganization) {
      hasParentOrg = true;
      let pName = 'Parent Entity';
      if (typeof org.parentOrganization === 'string') {
        pName = org.parentOrganization;
      } else if (typeof org.parentOrganization === 'object') {
        pName = org.parentOrganization.name || org.parentOrganization.legalName || 'Parent Entity';
      }
      parentChain.push(`${org.name || domain} -> ${pName}`);
      provenanceScore = 7;
    }
    if (org.sameAs && Array.isArray(org.sameAs) && org.sameAs.length > 0) {
      provenanceScore = Math.min(7, provenanceScore + 1);
    }
  }

  // Also check UCP merchant entity if available
  if (ucpManifest && typeof ucpManifest === 'object') {
    const merchant = (ucpManifest as any).merchant;
    if (merchant && merchant.parentEntity) {
      hasParentOrg = true;
      provenanceScore = Math.max(provenanceScore, 6);
      parentChain.push(`${merchant.name || domain} -> ${merchant.parentEntity}`);
    }
  }

  checks.push({
    id: 'ent-002',
    name: 'Entity Provenance & Parent Hierarchy',
    dimension: 'entityGraph',
    status: provenanceScore >= 6 ? 'PASS' : provenanceScore > 0 ? 'WARN' : 'FAIL',
    score: provenanceScore,
    maxScore: 7,
    message:
      provenanceScore >= 6
        ? `Dual-audience entity hierarchy declared in supplied evidence: [${parentChain.join('; ') || orgs.map((o) => o.name).join(', ')}]`
        : orgs.length > 0
        ? `Basic Organization schema present (${orgs.map((o) => o.name).join(', ')}), but missing explicit parentOrganization or legal ownership registration.`
        : 'Missing Organization / Corporation Schema.org node for entity verification.',
    details: { hasParentOrg, hasLegalName, parentChain, orgsCount: orgs.length },
    remediation:
      provenanceScore < 6
        ? 'Add `parentOrganization: { "@type": "Organization", "name": "Parent Legal Entity" }` and `legalName` to your JSON-LD Organization.'
        : undefined,
    codeSnippet: provenanceScore < 6 ? {
      language: 'typescript',
      filename: 'src/config/machineTrust.ts',
      description: 'Using @nymrel/machine-trust to declare entity hierarchy',
      code: `import { createMachineTrustEngine } from '@nymrel/machine-trust';

export const machineTrust = createMachineTrustEngine({
  entity: {
    name: '${domain}',
    legalName: '${domain} Operating Co., LLC',
    url: 'https://${domain}',
    parentOrganization: {
      name: 'Nymrel',
      legalName: 'JalenBuilds LLC',
      url: 'https://jalenbuilds.com'
    }
  }
});`,
    } : undefined,
  });

  // 3. Machine Contact & Trust Signals (7 pts)
  let contactScore = 0;
  for (const org of orgs) {
    if (org.email || org.contactPoint || org.telephone) contactScore += 3.5;
    if (org.logo || org.image) contactScore += 2;
    if (org.sameAs && org.sameAs.length >= 2) contactScore += 1.5;
  }
  contactScore = Math.min(7, contactScore);

  checks.push({
    id: 'ent-003',
    name: 'Machine Contact Points & Authority Anchors',
    dimension: 'entityGraph',
    status: contactScore >= 5 ? 'PASS' : contactScore > 0 ? 'WARN' : 'INFO',
    score: contactScore,
    maxScore: 7,
    message:
      contactScore >= 5
        ? 'Supplied evidence includes contact points, logos, and sameAs authority links for machine trust.'
        : contactScore > 0
        ? 'Partial contact or authority anchors found.'
        : 'No machine contact points (email, contactPoint) or social sameAs anchors declared.',
    details: { contactScore },
    remediation: contactScore < 5 ? 'Add `contactPoint` with email and `sameAs` social profiles in your JSON-LD.' : undefined,
  });

  return checks;
}
