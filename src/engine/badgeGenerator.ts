import type { BadgeOptions, Grade } from '../types';

export interface BadgeArtifact {
  dataUri: string;
  fileName: string;
  svg: string;
}

const VALID_GRADES = new Set<Grade>(['A+', 'A', 'B', 'C', 'D', 'F']);

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function replaceControlCharacters(value: string): string {
  return Array.from(value, (character) => {
    const codePoint = character.codePointAt(0);
    return codePoint !== undefined && (codePoint <= 31 || codePoint === 127) ? ' ' : character;
  }).join('');
}

function normalizeLabel(value: unknown): string {
  if (typeof value !== 'string') return 'Machine Trust';
  const normalized = replaceControlCharacters(value).trim();
  return Array.from(normalized || 'Machine Trust')
    .slice(0, 40)
    .join('');
}

function normalizeScore(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function normalizeGrade(value: unknown): Grade {
  return typeof value === 'string' && VALID_GRADES.has(value as Grade) ? (value as Grade) : 'F';
}

function gradeColor(grade: Grade): string {
  if (grade === 'A+' || grade === 'A') return '#237346';
  if (grade === 'B') return '#1E40AF';
  if (grade === 'C') return '#9A4C10';
  if (grade === 'D') return '#C2410C';
  return '#9B1C1C';
}

export function generateBadgeSvg(
  rawScore: number,
  rawGrade: Grade,
  options: Partial<BadgeOptions> = {},
): string {
  const score = normalizeScore(rawScore);
  const grade = normalizeGrade(rawGrade);
  const theme = options.theme ?? 'warm-paper';
  const format = options.format ?? 'pill';
  const label = normalizeLabel(options.label);
  const escapedLabel = escapeXml(label);
  const accessibleLabel = escapeXml(
    `${label}: illustrative diagnostic ${score}/100, grade ${grade}`,
  );

  let backgroundLeft = '#2A332E';
  let backgroundRight = '#A8541F';
  let textColor = '#FAF8F2';
  let borderColor = '#E2DDD2';

  if (theme === 'warm-paper') {
    backgroundRight = '#FAF8F2';
    textColor = '#2A332E';
  } else if (theme === 'cedar') {
    backgroundLeft = '#1B221E';
    backgroundRight = '#2A332E';
    borderColor = '#3D4942';
  } else if (theme === 'minimal-stone') {
    backgroundLeft = '#F4F0E6';
    backgroundRight = '#FFFFFF';
    textColor = '#1C2421';
  }

  const scoreBackground = gradeColor(grade);
  if (format === 'shield') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180" width="160" height="180" role="img" aria-label="${accessibleLabel}">
  <title>${accessibleLabel}</title>
  <defs><linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${backgroundLeft}"/><stop offset="100%" stop-color="#1B221E"/></linearGradient></defs>
  <path d="M 80 12 L 144 32 L 144 95 C 144 135 80 168 80 168 C 80 168 16 135 16 95 L 16 32 Z" fill="url(#shield-gradient)" stroke="${borderColor}" stroke-width="3"/>
  <path d="M 80 26 L 132 42 L 132 94 C 132 126 80 152 80 152 C 80 152 28 126 28 94 L 28 42 Z" fill="none" stroke="#FAF8F2" stroke-opacity="0.2" stroke-width="1.5"/>
  <text x="80" y="65" fill="#FAF8F2" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">ILLUSTRATIVE</text>
  <text x="80" y="105" fill="#FAF8F2" font-family="system-ui, sans-serif" font-size="34" font-weight="900" text-anchor="middle">${score}</text>
  <rect x="52" y="118" width="56" height="20" rx="10" fill="${scoreBackground}"/>
  <text x="80" y="132" fill="#FAF8F2" font-family="system-ui, sans-serif" font-size="11" font-weight="800" text-anchor="middle">GRADE ${grade}</text>
</svg>`;
  }

  if (format === 'compact') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="20" viewBox="0 0 150 20" role="img" aria-label="${accessibleLabel}">
  <title>${accessibleLabel}</title>
  <clipPath id="compact-radius"><rect width="150" height="20" rx="3"/></clipPath>
  <g clip-path="url(#compact-radius)"><rect width="102" height="20" fill="${backgroundLeft}"/><rect x="102" width="48" height="20" fill="${scoreBackground}"/></g>
  <g fill="#FAF8F2" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11"><text x="51" y="14">Illustrative score</text><text x="126" y="14" font-weight="700">${score}/100</text></g>
</svg>`;
  }

  const rightTextColor =
    theme === 'warm-paper' || theme === 'minimal-stone' ? '#1C2421' : textColor;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="32" viewBox="0 0 250 32" role="img" aria-label="${accessibleLabel}">
  <title>${accessibleLabel}</title>
  <rect width="250" height="32" rx="6" fill="${backgroundRight}" stroke="${borderColor}"/>
  <rect x="1" y="1" width="156" height="30" rx="5" fill="${backgroundLeft}"/>
  <text x="12" y="20" fill="#FAF8F2" font-family="system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="0.3">${escapedLabel.toUpperCase()}</text>
  <rect x="164" y="5" width="48" height="22" rx="4" fill="${scoreBackground}"/>
  <text x="188" y="20" fill="#FAF8F2" font-family="system-ui, sans-serif" font-size="12" font-weight="800" text-anchor="middle">${score}</text>
  <text x="230" y="20" fill="${rightTextColor}" font-family="system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle">${grade}</text>
</svg>`;
}

export function generateBadgeArtifact(
  domain: string,
  score: number,
  grade: Grade,
  options: Partial<BadgeOptions> = {},
): BadgeArtifact {
  const svg = generateBadgeSvg(score, grade, options);
  const safeDomain = domain.replace(/[^a-z\d.-]/gi, '-').slice(0, 80) || 'diagnostic';
  return {
    dataUri: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    fileName: `nymrel-illustrative-score-${safeDomain}.svg`,
    svg,
  };
}
