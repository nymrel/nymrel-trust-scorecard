import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDirectory = fileURLToPath(new URL('../dist/', import.meta.url));
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

if (packageJson.private !== true) {
  throw new Error(
    'The browser application must remain private to prevent accidental npm publication.',
  );
}

for (const requiredPath of [
  'index.html',
  '.vite/manifest.json',
  '_headers',
  'llms.txt',
  'robots.txt',
  'sitemap.xml',
]) {
  if (!existsSync(join(distDirectory, requiredPath))) {
    throw new Error(`Required production artifact is missing: dist/${requiredPath}`);
  }
}

const files = [];
function collectFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(absolutePath);
    else if (entry.isFile()) files.push(absolutePath);
  }
}
collectFiles(distDirectory);

if (files.some((file) => extname(file) === '.map')) {
  throw new Error('Production source maps must not be emitted publicly.');
}

const javascriptBytes = files
  .filter((file) => extname(file) === '.js')
  .reduce((total, file) => total + statSync(file).size, 0);
if (javascriptBytes > 300 * 1024) {
  throw new Error(`JavaScript budget exceeded: ${javascriptBytes} bytes (limit 307200).`);
}

const searchableOutput = files
  .filter((file) => ['.html', '.js', '.txt'].includes(extname(file)))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
for (const forbiddenClaim of [
  'Nymrel Machine Trust Certified',
  'Agentic UCP v1.0 Active',
  '/api/badge?domain=',
]) {
  if (searchableOutput.includes(forbiddenClaim)) {
    throw new Error(`Production output contains a forbidden or unproven claim: ${forbiddenClaim}`);
  }
}

process.stdout.write(
  `Production contract verified: ${files.length} files, ${javascriptBytes} JavaScript bytes.\n`,
);
