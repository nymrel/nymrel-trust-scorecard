import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, '.cloudflare-package');
const dist = join(root, 'dist');
const source = 'https://github.com/nymrel/nymrel-trust-scorecard';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
if (git('status', '--porcelain')) {
  throw new Error('Commit source changes before packaging an exact-source deployment.');
}
const commit = git('rev-parse', 'HEAD');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};
const files = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === '_headers') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (entry.isFile()) files.push(path);
    else throw new Error(`Unexpected build artifact: ${entry.name}`);
  }
}
await collect(dist);
files.sort();
const securityHeaders = {};
for (const line of (await readFile(join(dist, '_headers'), 'utf8')).split('\n')) {
  if (!line.trim() || line.trim() === '/*') continue;
  const match = /^\s+([^:]+):\s*(.+)$/.exec(line);
  if (!match) throw new Error('Only the existing global security-header contract is supported.');
  securityHeaders[match[1]] = match[2];
}
if (!securityHeaders['Content-Security-Policy']?.includes("connect-src 'none'")) {
  throw new Error('The local-only evidence boundary must remain in the deployed CSP.');
}

const modules = [];
const imports = [];
const entries = [];
const artifacts = [];
for (const [index, path] of files.entries()) {
  const contentType = types[extname(path)];
  if (!contentType) throw new Error(`Unsupported public artifact type: ${path}`);
  const bytes = await readFile(path);
  const content = bytes.toString('utf8');
  if (!Buffer.from(content, 'utf8').equals(bytes))
    throw new Error(`Expected UTF-8 artifact: ${path}`);
  const name = `asset-${index}.txt`;
  const urlPath = `/${relative(dist, path).split(sep).join('/')}`;
  const sha256 = hash(bytes);
  modules.push({ name, contentType: 'text/plain', content });
  imports.push(`import asset${index} from './${name}';`);
  entries.push(
    `[${JSON.stringify(urlPath)}, {body: asset${index}, contentType: ${JSON.stringify(contentType)}, sha256: '${sha256}'}]`,
  );
  artifacts.push({ path: urlPath, sha256, bytes: bytes.length });
}
const receipt = { source, commit, tree: git('rev-parse', 'HEAD^{tree}'), artifacts };
const entry = `${imports.join('\n')}\nimport { createHandler } from './handler.mjs';\nexport default { fetch: createHandler(new Map([${entries.join(',\n')}]), ${JSON.stringify(securityHeaders)}, ${JSON.stringify(receipt)}) };\n`;
modules.unshift({
  name: 'index.mjs',
  contentType: 'application/javascript+module',
  content: entry,
});
modules.push({
  name: 'handler.mjs',
  contentType: 'application/javascript+module',
  content: await readFile(join(root, 'cloudflare/handler.mjs'), 'utf8'),
});
const metadata = {
  main_module: 'index.mjs',
  compatibility_date: '2026-11-27',
  bindings: [],
  observability: {
    enabled: true,
    redact_query_string: true,
    logs: { enabled: true, invocation_logs: true, head_sampling_rate: 0.01 },
    traces: { enabled: true, head_sampling_rate: 0.01 },
  },
  tags: ['nymrel-trust-scorecard', `source:${commit}`],
};
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(
  join(output, 'upload.json'),
  JSON.stringify({ worker: 'nymrel-trust-scorecard', metadata, modules }),
);
await writeFile(join(output, 'build-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
process.stdout.write(
  `Cloudflare package: ${resolve(output)}, ${modules.length} modules, source ${commit}.\n`,
);
