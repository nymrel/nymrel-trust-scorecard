import type { CheckItem } from '../../types';
import {
  getString,
  hasProperty,
  isJsonObject,
  nodeHasType,
  parseJsonLdDocuments,
  type JsonObject,
} from '../jsonData';

export interface IntentOffersInput {
  jsonLdStrings: string[];
  rawHtml?: string | undefined;
  domain: string;
}

function collectOffers(node: JsonObject): JsonObject[] {
  const { offers: rawOffers } = node;
  if (Array.isArray(rawOffers)) return rawOffers.filter(isJsonObject);
  return isJsonObject(rawOffers) ? [rawOffers] : [];
}

export function evaluateIntentOffers(input: IntentOffersInput): CheckItem[] {
  const { domain, jsonLdStrings } = input;
  const { nodes } = parseJsonLdDocuments(jsonLdStrings);
  const products = nodes.filter((node) =>
    nodeHasType(node, ['product', 'service', 'softwareapplication', 'webapplication']),
  );
  const webApplications = nodes.filter((node) => nodeHasType(node, ['website', 'webapplication']));
  const offers = [
    ...nodes.filter((node) => nodeHasType(node, ['offer'])),
    ...nodes.flatMap(collectOffers),
  ];
  const checks: CheckItem[] = [];

  const hasProducts = products.length > 0;
  checks.push({
    id: 'off-001',
    name: 'Structured product or service declarations',
    dimension: 'intentAndOffers',
    status: hasProducts ? 'PASS' : 'WARN',
    score: hasProducts ? 7 : 0,
    maxScore: 7,
    message: hasProducts
      ? `Supplied evidence contains ${products.length} Product, Service, or application node(s).`
      : 'No Product, Service, SoftwareApplication, or WebApplication node was supplied.',
    details: { productsCount: products.length },
    remediation: hasProducts
      ? undefined
      : 'Add a truthful Product, Service, or application declaration for each real offer.',
  });

  const hasOffers = offers.length > 0;
  const hasPrice = offers.some((offer) => hasProperty(offer, 'price'));
  const hasCurrency = offers.some((offer) => Boolean(getString(offer, 'priceCurrency')));
  const hasAvailability = offers.some((offer) => Boolean(getString(offer, 'availability')));
  let offerScore = hasOffers ? 3 : 0;
  if (hasPrice) offerScore += 2;
  if (hasCurrency) offerScore += 1.5;
  if (hasAvailability) offerScore += 1.5;

  checks.push({
    id: 'off-002',
    name: 'Offer price, currency, and availability fields',
    dimension: 'intentAndOffers',
    status: offerScore >= 7 ? 'PASS' : offerScore > 0 ? 'WARN' : 'FAIL',
    score: offerScore,
    maxScore: 8,
    message:
      offerScore >= 7
        ? `Supplied evidence contains ${offers.length} offer(s) with price, currency, and availability fields.`
        : hasOffers
          ? `Supplied evidence contains ${offers.length} offer(s), but one or more modeled fields are missing.`
          : 'No Schema.org Offer object was supplied.',
    details: { hasAvailability, hasCurrency, hasPrice, offersCount: offers.length },
    remediation:
      offerScore < 7
        ? 'Add verified price, ISO 4217 priceCurrency, and availability values. Keep unapproved prices operator-filled.'
        : undefined,
    codeSnippet:
      offerScore < 7
        ? {
            language: 'json',
            filename: 'offer.schema.json',
            description: 'Offer template with operator-controlled commercial values',
            code: `{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "OPERATOR-FILL",
  "offers": {
    "@type": "Offer",
    "price": "OPERATOR-FILL",
    "priceCurrency": "OPERATOR-FILL",
    "availability": "https://schema.org/OPERATOR-FILL",
    "url": "https://${domain}/OPERATOR-FILL"
  }
}`,
          }
        : undefined,
  });

  const hasPotentialAction =
    webApplications.some((node) => hasProperty(node, 'potentialAction')) ||
    nodes.some((node) => hasProperty(node, 'potentialAction'));
  const hasPolicy = offers.some(
    (offer) =>
      hasProperty(offer, 'hasMerchantReturnPolicy') || hasProperty(offer, 'shippingDetails'),
  );
  let actionScore = (hasPotentialAction ? 2.5 : 0) + (hasPolicy ? 2.5 : 0);
  if (actionScore === 0 && (hasProducts || hasOffers)) actionScore = 1.5;

  checks.push({
    id: 'off-003',
    name: 'Machine actions and merchant policy declarations',
    dimension: 'intentAndOffers',
    status: actionScore >= 4 ? 'PASS' : actionScore > 0 ? 'WARN' : 'INFO',
    score: actionScore,
    maxScore: 5,
    message:
      actionScore >= 4
        ? 'Supplied evidence declares a potential action and merchant policy fields.'
        : actionScore > 0
          ? 'Basic commerce evidence is present, but actions or merchant policies are incomplete.'
          : 'No potentialAction or merchant policy declaration was supplied.',
    details: { hasPolicy, hasPotentialAction },
    remediation:
      actionScore < 4
        ? `Add only real actions and policies; for search, a candidate target is https://${domain}/search?q={search_term_string}.`
        : undefined,
  });

  return checks;
}
