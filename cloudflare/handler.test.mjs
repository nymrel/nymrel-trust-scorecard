import assert from 'node:assert/strict';
import test from 'node:test';

import { createHandler } from './handler.mjs';

const commit = 'a'.repeat(40);
const html = {
  body: '<main>Diagnostic</main>',
  contentType: 'text/html; charset=utf-8',
  sha256: 'b'.repeat(64),
};
const script = {
  body: 'export {};',
  contentType: 'text/javascript; charset=utf-8',
  sha256: 'c'.repeat(64),
};
const handler = createHandler(
  new Map([
    ['/index.html', html],
    ['/assets/app-abcd.js', script],
  ]),
  {
    'Content-Security-Policy': "default-src 'self'; connect-src 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
  },
  { commit, source: 'https://github.com/nymrel/nymrel-trust-scorecard' },
);

test('serves the document and assets with the original security boundary and distinct cache rules', async () => {
  const response = handler(new Request('https://score.nymrel.com/?example=nymrel'));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), html.body);
  assert.equal(response.headers.get('Cache-Control'), 'no-cache');
  assert.match(response.headers.get('Content-Security-Policy'), /connect-src 'none'/);
  assert.equal(response.headers.get('X-Nymrel-Source-Commit'), commit);
  const asset = handler(new Request('https://score.nymrel.com/assets/app-abcd.js'));
  assert.match(asset.headers.get('Content-Type'), /javascript/);
  assert.match(asset.headers.get('Cache-Control'), /immutable/);
});

test('HEAD and conditional requests do not return bodies', async () => {
  const head = handler(new Request('https://score.nymrel.com/', { method: 'HEAD' }));
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  const conditional = handler(
    new Request('https://score.nymrel.com/', {
      headers: { 'If-None-Match': `W/"${html.sha256}"` },
    }),
  );
  assert.equal(conditional.status, 304);
  assert.equal(await conditional.text(), '');
  assert.equal(conditional.headers.get('X-Content-Type-Options'), 'nosniff');
});

test('unknown paths and build-only artifacts are actual 404s instead of false-positive app screens', async () => {
  for (const path of [
    '/missing',
    '/_headers',
    '/.vite/manifest.json',
    '/src/App.tsx',
    '/assets/missing.js',
  ]) {
    const response = handler(new Request(`https://score.nymrel.com${path}`));
    assert.equal(response.status, 404, path);
    assert.equal(await response.text(), 'Not found\n');
  }
});

test('the static app rejects write methods without accepting submitted evidence', async () => {
  const response = handler(
    new Request('https://score.nymrel.com/', { method: 'POST', body: 'private evidence' }),
  );
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'GET, HEAD');
  assert.equal(await response.text(), 'Method not allowed\n');
});

test('public build receipt identifies source without including request data', async () => {
  const response = handler(
    new Request('https://score.nymrel.com/.well-known/build-receipt.json?private=do-not-log'),
  );
  const receipt = await response.json();
  assert.equal(receipt.commit, commit);
  assert.equal(JSON.stringify(receipt).includes('do-not-log'), false);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
