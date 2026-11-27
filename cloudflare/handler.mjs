/** Serve only the exact build's allowlisted public artifacts. */
export function createHandler(assets, securityHeaders, receipt) {
  return function fetch(request) {
    const headers = new Headers(securityHeaders);
    headers.set('X-Nymrel-Source-Commit', receipt.commit);
    headers.set('Cache-Control', 'no-store');

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      headers.set('Allow', 'GET, HEAD');
      headers.set('Content-Type', 'text/plain; charset=utf-8');
      return new Response('Method not allowed\n', { status: 405, headers });
    }

    const pathname = new URL(request.url).pathname;
    if (pathname === '/.well-known/build-receipt.json') {
      headers.set('Content-Type', 'application/json; charset=utf-8');
      return new Response(request.method === 'HEAD' ? null : JSON.stringify(receipt), { headers });
    }

    const asset = assets.get(pathname === '/' ? '/index.html' : pathname);
    if (!asset) {
      headers.set('Content-Type', 'text/plain; charset=utf-8');
      return new Response(request.method === 'HEAD' ? null : 'Not found\n', {
        status: 404,
        headers,
      });
    }

    headers.set('Content-Type', asset.contentType);
    headers.set('ETag', `"${asset.sha256}"`);
    headers.set(
      'Cache-Control',
      pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    );
    const validators = request.headers
      .get('If-None-Match')
      ?.split(',')
      .map((value) => value.trim());
    if (
      validators?.some(
        (value) => value === '*' || value.replace(/^W\//, '') === `"${asset.sha256}"`,
      )
    ) {
      return new Response(null, { status: 304, headers });
    }
    return new Response(request.method === 'HEAD' ? null : asset.body, { headers });
  };
}
