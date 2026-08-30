import type { CheckItem } from '../../types';
import {
  getArray,
  getObject,
  getString,
  hasProperty,
  nodeHasType,
  parseJsonLdDocuments,
} from '../jsonData';

export interface EntityGraphInput {
  jsonLdStrings: string[];
  ucpManifest?: Record<string, unknown> | null | undefined;
  domain: string;
}

export function evaluateEntityGraph(input: EntityGraphInput): CheckItem[] {
  const { domain, jsonLdStrings, ucpManifest } = input;
  const { invalidCount, nodes } = parseJsonLdDocuments(jsonLdStrings);
  const checks: CheckItem[] = [];

  const syntaxScore = nodes.length > 0 ? (invalidCount === 0 ? 6 : 4) : 0;
  checks.push({
    id: 'ent-001',
    name: 'JSON-LD structured data validity',
    dimension: 'entityGraph',
    status: syntaxScore === 6 ? 'PASS' : syntaxScore > 0 ? 'WARN' : 'FAIL',
    score: syntaxScore,
    maxScore: 6,
    message:
      nodes.length > 0
        ? `Supplied evidence contains ${nodes.length} JSON-LD node(s); ${invalidCount} document(s) failed to parse.`
        : 'No valid JSON-LD object was supplied.',
    details: { invalidCount, validNodesCount: nodes.length },
    remediation:
      nodes.length === 0
        ? 'Add a valid Schema.org Organization object to the evidence snapshot.'
        : undefined,
    codeSnippet:
      nodes.length === 0
        ? {
            language: 'html',
            filename: 'index.html',
            description: 'Minimal Schema.org organization declaration',
            code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://${domain}/#organization",
  "name": "Organization name",
  "url": "https://${domain}"
}
</script>`,
          }
        : undefined,
  });

  const organizations = nodes.filter((node) =>
    nodeHasType(node, ['organization', 'corporation', 'localbusiness', 'store']),
  );
  let provenanceScore = 0;
  let hasParentOrganization = false;
  let hasLegalIdentifier = false;
  const parentChains: string[] = [];

  for (const organization of organizations) {
    const name = getString(organization, 'name') ?? domain;
    if (getString(organization, 'name')) provenanceScore = Math.max(provenanceScore, 2);
    if (
      ['legalName', 'taxID', 'leiCode', 'identifier'].some((key) => hasProperty(organization, key))
    ) {
      hasLegalIdentifier = true;
      provenanceScore = Math.max(provenanceScore, 4);
    }

    const { parentOrganization: rawParent } = organization;
    const parent =
      typeof rawParent === 'string'
        ? rawParent
        : (getString(getObject(organization, 'parentOrganization'), 'name') ??
          getString(getObject(organization, 'parentOrganization'), 'legalName'));
    if (parent) {
      hasParentOrganization = true;
      parentChains.push(`${name} → ${parent}`);
      provenanceScore = 7;
    }
    if (getArray(organization, 'sameAs').length > 0) {
      provenanceScore = Math.min(7, provenanceScore + 1);
    }
  }

  const merchant = getObject(ucpManifest ?? undefined, 'merchant');
  const manifestParent =
    getString(merchant, 'parentEntity') ?? getString(getObject(merchant, 'parentEntity'), 'name');
  if (manifestParent) {
    hasParentOrganization = true;
    provenanceScore = Math.max(provenanceScore, 6);
    parentChains.push(`${getString(merchant, 'name') ?? domain} → ${manifestParent}`);
  }

  checks.push({
    id: 'ent-002',
    name: 'Entity provenance and ownership declaration',
    dimension: 'entityGraph',
    status: provenanceScore >= 6 ? 'PASS' : provenanceScore > 0 ? 'WARN' : 'FAIL',
    score: provenanceScore,
    maxScore: 7,
    message:
      provenanceScore >= 6
        ? `Supplied evidence declares an entity chain: ${parentChains.join('; ') || 'legal entity identifiers present'}.`
        : organizations.length > 0
          ? 'Organization evidence is present but legal identity or parent ownership is incomplete.'
          : 'No Organization, Corporation, LocalBusiness, or Store node was supplied.',
    details: {
      hasLegalIdentifier,
      hasParentOrganization,
      organizationsCount: organizations.length,
      parentChains,
    },
    remediation:
      provenanceScore < 6
        ? 'Declare the real legalName and parentOrganization only after confirming those facts.'
        : undefined,
    codeSnippet:
      provenanceScore < 6
        ? {
            language: 'json',
            filename: 'organization.schema.json',
            description: 'Entity relationship template with operator-fill values',
            code: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OPERATOR-FILL",
  "legalName": "OPERATOR-FILL",
  "url": "https://${domain}",
  "parentOrganization": {
    "@type": "Organization",
    "name": "OPERATOR-FILL"
  }
}`,
          }
        : undefined,
  });

  let contactScore = 0;
  for (const organization of organizations) {
    if (
      getString(organization, 'email') ||
      getString(organization, 'telephone') ||
      hasProperty(organization, 'contactPoint')
    ) {
      contactScore += 3.5;
    }
    if (hasProperty(organization, 'logo') || hasProperty(organization, 'image')) contactScore += 2;
    if (getArray(organization, 'sameAs').length >= 2) contactScore += 1.5;
  }
  contactScore = Math.min(7, contactScore);

  checks.push({
    id: 'ent-003',
    name: 'Machine-readable contact and authority anchors',
    dimension: 'entityGraph',
    status: contactScore >= 5 ? 'PASS' : contactScore > 0 ? 'WARN' : 'INFO',
    score: contactScore,
    maxScore: 7,
    message:
      contactScore >= 5
        ? 'Supplied evidence includes contact, visual identity, and authority-link fields.'
        : contactScore > 0
          ? 'Supplied evidence includes only part of the modeled contact and authority fields.'
          : 'No contactPoint, contact detail, logo, image, or sameAs authority set was supplied.',
    details: { contactScore },
    remediation:
      contactScore < 5
        ? 'Add verified contactPoint and sameAs values; do not invent authority links.'
        : undefined,
  });

  return checks;
}
