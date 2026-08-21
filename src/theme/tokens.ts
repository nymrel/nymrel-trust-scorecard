/**
 * Nymrel Warm Paper Design Tokens
 * Harmonious warm aesthetic prioritizing readability, tactile hierarchy, and machine trust.
 */

export const colors = {
  cream: '#FAF8F2',
  linen: '#F4F0E6',
  linenDark: '#EAE4D6',
  surface: '#FFFFFF',
  surfaceWarm: '#FCFAF5',
  
  cedar: '#2A332E',
  cedarLight: '#3D4942',
  cedarDark: '#1B221E',
  
  terracotta: '#A8541F',
  terracottaHover: '#BD6127',
  terracottaLight: '#FDF1E8',
  terracottaDark: '#8A4116',
  
  stoneBorder: '#E2DDD2',
  stoneBorderDark: '#CBC5B7',
  stoneLight: '#F0EBE0',
  
  textPrimary: '#1C2421',
  textSecondary: '#5B6760',
  textMuted: '#84918A',
  textOnDark: '#FAF8F2',

  status: {
    pass: '#237346',
    passBg: '#EDF7F1',
    passBorder: '#BDE0CD',
    
    warn: '#B46416',
    warnBg: '#FEF6ED',
    warnBorder: '#FAD8B5',
    
    fail: '#C53030',
    failBg: '#FDF0F0',
    failBorder: '#F9C8C8',
    
    info: '#2563EB',
    infoBg: '#EFF6FF',
    infoBorder: '#BFDBFE',
  },

  grades: {
    A: { bg: '#EDF7F1', text: '#1F5A38', border: '#BDE0CD', label: 'Autonomous Agent Ready' },
    B: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', label: 'Agent Friendly' },
    C: { bg: '#FEF6ED', text: '#9A4C10', border: '#FAD8B5', label: 'Partial AI Readiness' },
    D: { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5', label: 'Legacy Web Structure' },
    F: { bg: '#FDF0F0', text: '#9B1C1C', border: '#F9C8C8', label: 'Agent Hostile / Opaque' },
  }
};

export const dimensions = {
  discovery: {
    key: 'discovery',
    name: 'Discovery & AI Orientation',
    shortName: 'Discovery',
    description: '/llms.txt standard, sitemaps, machine index headers & structural orientation',
    weight: 20,
    color: '#A8541F',
  },
  entityGraph: {
    key: 'entityGraph',
    name: 'Entity Graph & Machine Trust',
    shortName: 'Entity Graph',
    description: 'Schema.org JSON-LD, parentOrganization hierarchy, legal entity registration',
    weight: 20,
    color: '#2A332E',
  },
  intentAndOffers: {
    key: 'intentAndOffers',
    name: 'UCP Commerce & Offers',
    shortName: 'Offers & Catalog',
    description: 'Structured Schema.org Product, Offer pricing in ISO 4217, availability & policies',
    weight: 20,
    color: '#D97706',
  },
  machinePayments: {
    key: 'machinePayments',
    name: 'Autonomous Machine Payments',
    shortName: 'Machine Payments',
    description: 'HTTP 402 / x402 headers, AP2/ACP negotiation, Stripe agent links & crypto rails',
    weight: 20,
    color: '#237346',
  },
  aiCrawlerAccess: {
    key: 'aiCrawlerAccess',
    name: 'AI Search Bot Access',
    shortName: 'Crawler Access',
    description: 'Explicit permissions for OAI-SearchBot, PerplexityBot & granular robot policies',
    weight: 20,
    color: '#6366F1',
  },
} as const;

export type DimensionKey = keyof typeof dimensions;
