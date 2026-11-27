# Standalone hosting

The canonical public website is `https://score.nymrel.com/`. It runs the static React application on a Cloudflare Worker named `nymrel-trust-scorecard`. Visitors do not need a ChatGPT or Claude session. Platform-specific presentations are optional companions to this public website.

## Build the exact source

Use a supported Node version and the npm version declared in `package.json`:

```sh
npm ci --ignore-scripts
npm run check
```

Commit reviewed source changes, then run:

```sh
npm run package:cloudflare
```

This rebuilds the application, checks the production-artifact contract, and writes the ignored `.cloudflare-package/upload.json` and `.cloudflare-package/build-receipt.json`. Packaging rejects an uncommitted working tree. The receipt identifies the repository, source commit, Git tree, and each public artifact's SHA-256 digest and byte count.

The upload file contains Cloudflare multipart metadata and modules. Upload `metadata` as an `application/json` part, then each module using its declared name and content type, to `PUT /accounts/{account_id}/workers/scripts/nymrel-trust-scorecard` through an authorized Cloudflare API client. The browser bundle is a text module served to the browser; the Worker does not execute browser application code. No credentials belong in this package.

Attach the owned `score.nymrel.com` hostname through Cloudflare Worker Custom Domains. Confirm the hostname has no conflicting record or route before attaching it. Cloudflare manages the Custom Domain's DNS and TLS certificate. This does not require a new domain purchase.

## Serving contract

- Only build artifacts explicitly packaged into the allowlist are served. The internal Vite manifest and `_headers` configuration are not public routes.
- Existing security headers are carried into every response. The Content Security Policy blocks application network connections, preserving local evidence processing.
- Only `GET` and `HEAD` are supported. Unknown paths return `404`; write methods return `405`.
- Content-hashed assets receive immutable caching. HTML and discovery files revalidate, and the source receipt is not cached.
- Every response includes `X-Nymrel-Source-Commit`. `/.well-known/build-receipt.json` exposes the public source and artifact hashes without request data or environment values.
- Worker observability uses 1% sampling and query-string redaction. No application evidence is logged or sent by the serving code.

## Verify a deployment

Use an independent request to the canonical HTTPS origin after deployment:

1. Confirm the root page and its exact JavaScript and CSS assets return successful responses with the intended content types and security headers.
2. Confirm `/.well-known/build-receipt.json` matches the deployed Git commit and locally packaged artifact hashes.
3. Confirm unknown paths and build-only files return `404`, `HEAD` returns no body, and unsupported write methods return `405`.
4. Open the page in a browser and verify the illustrative fixture, domain-only no-score state, and local manual-evidence workflow. Check that no external application requests carry evidence.

The source receipt proves which artifact bytes are served; it does not certify the diagnostic model or production readiness of any domain entered into the application. Keep independent hosted verification with the release record.

For rollback, rebuild and upload a previously reviewed commit using the same process. Preserve the owned custom-domain attachment and verify the receipt after rollback.
