import { BadgeOptions, Grade } from '../types';

export function generateBadgeSvg(score: number, grade: Grade, options: Partial<BadgeOptions> = {}): string {
  const theme = options.theme || 'warm-paper';
  const format = options.format || 'pill';
  const label = options.label || 'Machine Trust';

  // Palette based on theme
  let bgLeft = '#2A332E';
  let bgRight = '#A8541F';
  let textColor = '#FAF8F2';
  let borderColor = '#E2DDD2';

  if (theme === 'warm-paper') {
    bgLeft = '#2A332E';
    bgRight = '#FAF8F2';
    textColor = '#2A332E';
    borderColor = '#E2DDD2';
  } else if (theme === 'cedar') {
    bgLeft = '#1B221E';
    bgRight = '#2A332E';
    textColor = '#FAF8F2';
    borderColor = '#3D4942';
  } else if (theme === 'terracotta') {
    bgLeft = '#2A332E';
    bgRight = '#A8541F';
    textColor = '#FAF8F2';
    borderColor = '#C4682B';
  } else if (theme === 'minimal-stone') {
    bgLeft = '#F4F0E6';
    bgRight = '#FFFFFF';
    textColor = '#1C2421';
    borderColor = '#E2DDD2';
  }

  // Grade color
  let scoreBg = '#237346';
  if (grade === 'A+' || grade === 'A') scoreBg = '#237346';
  else if (grade === 'B') scoreBg = '#1E40AF';
  else if (grade === 'C') scoreBg = '#B46416';
  else if (grade === 'D') scoreBg = '#C2410C';
  else scoreBg = '#C53030';

  if (format === 'shield') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180" width="160" height="180">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgLeft}"/>
      <stop offset="100%" stop-color="#1B221E"/>
    </linearGradient>
  </defs>
  <path d="M 80 12 L 144 32 L 144 95 C 144 135 80 168 80 168 C 80 168 16 135 16 95 L 16 32 Z" fill="url(#shieldGrad)" stroke="${borderColor}" stroke-width="3"/>
  <path d="M 80 26 L 132 42 L 132 94 C 132 126 80 152 80 152 C 80 152 28 126 28 94 L 28 42 Z" fill="none" stroke="#FAF8F2" stroke-opacity="0.2" stroke-width="1.5"/>
  <text x="80" y="65" fill="#FAF8F2" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">NYMREL VERIFIED</text>
  <text x="80" y="105" fill="#FAF8F2" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" text-anchor="middle">${score}</text>
  <rect x="52" y="118" width="56" height="20" rx="10" fill="${scoreBg}"/>
  <text x="80" y="132" fill="#FAF8F2" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" text-anchor="middle">GRADE ${grade}</text>
</svg>`;
  }

  if (format === 'compact') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="118" height="20" viewBox="0 0 118 20" role="img" aria-label="${label}: ${score}/100">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="118" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="70" height="20" fill="${bgLeft}"/>
    <rect x="70" width="48" height="20" fill="${scoreBg}"/>
    <rect width="118" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text x="360" y="140" transform="scale(.1)" fill="#FAF8F2" font-weight="600">AI Trust</text>
    <text x="930" y="140" transform="scale(.1)" fill="#FAF8F2" font-weight="bold">${score}/100</text>
  </g>
</svg>`;
  }

  // Default Pill Format
  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="32" viewBox="0 0 220 32" fill="none" role="img" aria-label="${label}: ${score}/100 Grade ${grade}">
  <rect width="220" height="32" rx="6" fill="${theme === 'warm-paper' ? '#FAF8F2' : bgRight}" stroke="${borderColor}" stroke-width="1"/>
  <rect x="1" y="1" width="130" height="30" rx="5" fill="${bgLeft}"/>
  <!-- Nymrel Icon -->
  <g transform="translate(10, 8)">
    <path d="M 8 2 L 14 5 L 14 10 C 14 13.5 8 15.5 8 15.5 C 8 15.5 2 13.5 2 10 L 2 5 Z" fill="#FAF8F2"/>
    <path d="M 8 4 L 12 6 L 12 9.5 C 12 12 8 13.5 8 13.5 C 8 13.5 4 12 4 9.5 L 4 6 Z" fill="#A8541F"/>
  </g>
  <text x="32" y="20" fill="#FAF8F2" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" letter-spacing="0.5">${label.toUpperCase()}</text>
  <!-- Score & Grade -->
  <rect x="136" y="5" width="40" height="22" rx="4" fill="${scoreBg}"/>
  <text x="156" y="20" fill="#FAF8F2" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" text-anchor="middle">${score}</text>
  <text x="195" y="20" fill="${theme === 'warm-paper' || theme === 'minimal-stone' ? '#1C2421' : textColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" text-anchor="middle">${grade}</text>
</svg>`;
}

export function generateBadgeEmbedCode(domain: string, score: number, grade: Grade, _options: Partial<BadgeOptions> = {}): {
  markdown: string;
  html: string;
  react: string;
} {
  const badgeUrl = `https://score.nymrel.com/api/badge?domain=${encodeURIComponent(domain)}&score=${score}&grade=${grade}`;
  const targetUrl = `https://score.nymrel.com/?url=${encodeURIComponent(domain)}`;
  const altText = `Nymrel Machine Trust Score: ${score}/100 (Grade ${grade})`;

  return {
    markdown: `[![${altText}](${badgeUrl})](${targetUrl})`,
    html: `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeUrl}" alt="${altText}" height="32" />\n</a>`,
    react: `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeUrl}" alt="${altText}" height={32} />\n</a>`,
  };
}
