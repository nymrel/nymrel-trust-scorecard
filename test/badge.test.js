import test from 'node:test';
import assert from 'node:assert/strict';

function generateBadgeSvg(score, grade, options = {}) {
  const theme = options.theme || 'warm-paper';
  const format = options.format || 'pill';
  const label = options.label || 'Machine Trust';

  if (format === 'shield') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180"><text>${score}</text><text>${grade}</text></svg>`;
  }
  if (format === 'compact') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="118" height="20"><text>${score}/100</text></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="32"><text>${label}</text><text>${score}</text><text>${grade}</text></svg>`;
}

test('badge generator outputs valid SVG for all formats', () => {
  const pillSvg = generateBadgeSvg(96, 'A+', { format: 'pill', theme: 'warm-paper' });
  assert.match(pillSvg, /<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(pillSvg, /96/);
  assert.match(pillSvg, /A\+/);

  const shieldSvg = generateBadgeSvg(100, 'A+', { format: 'shield', theme: 'cedar' });
  assert.match(shieldSvg, /viewBox="0 0 160 180"/);
  assert.match(shieldSvg, /100/);

  const compactSvg = generateBadgeSvg(85, 'B', { format: 'compact' });
  assert.match(compactSvg, /85\/100/);
});
