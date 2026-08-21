import { CheckItem } from '../../types';

export interface IntentOffersInput {
  jsonLdStrings: string[];
  rawHtml?: string;
  domain: string;
}

export function evaluateIntentOffers(input: IntentOffersInput): CheckItem[] {
  const checks: CheckItem[] = [];
  const { jsonLdStrings, domain } = input;

  const validNodes: any[] = [];
  for (const raw of jsonLdStrings) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item === 'object') {
            if (Array.isArray(item['@graph'])) validNodes.push(...item['@graph']);
            else validNodes.push(item);
          }
        }
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed['@graph'])) validNodes.push(...parsed['@graph']);
        else validNodes.push(parsed);
      }
    } catch {
      // Ignored here (handled in entityGraph)
    }
  }

  const products: any[] = [];
  const offers: any[] = [];
  const webApps: any[] = [];

  for (const node of validNodes) {
    const t = String(node['@type'] || '').toLowerCase();
    if (t.includes('product') || t.includes('service') || t.includes('softwareapplication') || t.includes('webapplication')) {
      products.push(node);
    }
    if (t.includes('offer')) {
      offers.push(node);
    }
    if (t.includes('website') || t.includes('webapplication')) {
      webApps.push(node);
    }

    if (node.offers) {
      if (Array.isArray(node.offers)) {
        offers.push(...node.offers);
      } else if (typeof node.offers === 'object') {
        offers.push(node.offers);
      }
    }
  }

  // 1. Schema.org Product & Service Declarations (7 pts)
  const hasProducts = products.length > 0;
  checks.push({
    id: 'off-001',
    name: 'Structured Product & Service Declarations',
    dimension: 'intentAndOffers',
    status: hasProducts ? 'PASS' : 'WARN',
    score: hasProducts ? 7 : 0,
    maxScore: 7,
    message: hasProducts
      ? `Found ${products.length} machine-readable Product/SoftwareApplication node(s).`
      : 'No Schema.org Product, SoftwareApplication, or Service entity found.',
    details: { productsCount: products.length },
    remediation: !hasProducts
      ? 'Add Schema.org `Product` or `SoftwareApplication` definitions for AI purchasing agents.'
      : undefined,
  });

  // 2. Offer Transparency, ISO 4217 Currencies & Availability (8 pts)
  let offerScore = 0;
  const hasOffers = offers.length > 0;
  let hasPrice = false;
  let hasCurrency = false;
  let hasAvailability = false;

  if (hasOffers) {
    offerScore += 3;
    hasPrice = offers.some((o) => o.price !== undefined);
    hasCurrency = offers.some((o) => !!o.priceCurrency);
    hasAvailability = offers.some((o) => !!o.availability);

    if (hasPrice) offerScore += 2;
    if (hasCurrency) offerScore += 1.5;
    if (hasAvailability) offerScore += 1.5;
  }

  checks.push({
    id: 'off-002',
    name: 'Offer Transparency & ISO 4217 Pricing',
    dimension: 'intentAndOffers',
    status: offerScore >= 7 ? 'PASS' : offerScore > 0 ? 'WARN' : 'FAIL',
    score: offerScore,
    maxScore: 8,
    message:
      offerScore >= 7
        ? `Machine-executable offers (${offers.length} total) with explicit pricing, currency (ISO 4217), and availability state.`
        : hasOffers
        ? `Partial offer schema (${offers.length} offer(s)). Missing strict ISO 4217 currency or availability URL.`
        : 'No Schema.org Offer nodes found. Autonomous agents cannot verify pricing or availability.',
    details: { offersCount: offers.length, hasPrice, hasCurrency, hasAvailability },
    remediation:
      offerScore < 7
        ? 'Include `price`, `priceCurrency: "USD"`, and `availability: "https://schema.org/InStock"` in your Offer schemas.'
        : undefined,
    codeSnippet: offerScore < 7 ? {
      language: 'json',
      filename: 'schema-offer.json',
      description: 'Schema.org Product & Offer with ISO currency',
      code: `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Standard Access",
  "offers": {
    "@type": "Offer",
    "price": "29.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://${domain}/checkout"
  }
}`,
    } : undefined,
  });

  // 3. Machine Actions & Merchant Return Policies (5 pts)
  let actionScore = 0;
  const hasPotentialAction = webApps.some((w) => !!w.potentialAction) || validNodes.some((n) => !!n.potentialAction);
  const hasPolicy = offers.some((o) => !!o.hasMerchantReturnPolicy || !!o.shippingDetails);

  if (hasPotentialAction) actionScore += 2.5;
  if (hasPolicy) actionScore += 2.5;
  if (actionScore === 0 && (hasProducts || hasOffers)) actionScore = 1.5;

  checks.push({
    id: 'off-003',
    name: 'Autonomous SearchAction & Merchant Policies',
    dimension: 'intentAndOffers',
    status: actionScore >= 4 ? 'PASS' : actionScore > 0 ? 'WARN' : 'INFO',
    score: actionScore,
    maxScore: 5,
    message:
      actionScore >= 4
        ? 'Potential machine actions (SearchAction / OrderAction) and merchant policy terms declared.'
        : actionScore > 0
        ? 'Basic commerce items detected; formal SearchAction or refund policies not explicitly structured.'
        : 'No potential actions (SearchAction) or merchant policies declared in schema graph.',
    details: { hasPotentialAction, hasPolicy },
    remediation:
      actionScore < 4
        ? 'Add `potentialAction: { "@type": "SearchAction", "target": "https://' + domain + '/search?q={search_term_string}" }` to your WebSite node.'
        : undefined,
  });

  return checks;
}
