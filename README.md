# Nymrel Trust Scorecard

A local-first browser diagnostic for machine-readable website evidence. It scores versioned synthetic fixtures or bounded evidence that a user supplies directly; it does not fetch a domain, observe production behavior, certify readiness, or predict search inclusion.

## Trust boundary

- A typed domain is a label only and receives no score.
- Synthetic fixtures use reserved `.example` domains and carry a versioned provenance label.
- Manual evidence is validated at a bounded runtime boundary and remains in the browser.
- Scores describe this repository's deterministic diagnostic model, not compliance or production truth.
- Remediation output is an operator-fill review candidate, not an automatic fix.
- Badge and sharing tools create explicitly illustrative local artifacts.

## Stack

- React 19.2
- Vite 8 with Rolldown
- TypeScript 7 in strict mode
- Vitest 4 with V8 coverage
- Biome 2 for formatting and compiler-independent linting
- Node 22, 24, and 26; npm 11 with an exact lockfile

## Develop

Prerequisites: a supported Node release and npm 11.

```powershell
npm ci --ignore-scripts
npm run dev
```

The development server binds only to `127.0.0.1`.

## Verify

```powershell
npm run check
```

The gate checks formatting, lint, strict types, behavioral coverage, production build, dependency vulnerabilities, package signatures, required artifacts, source-map absence, JavaScript budget, and forbidden public claims.

Individual commands:

```powershell
npm run typecheck
npm run test:coverage
npm run build
npm run package:check
npm run security:audit
npm run security:signatures
```

## Architecture

```text
src/
  components/       Accessible browser surfaces and explicit result states
  engine/           Input validation, deterministic evaluators, scoring, artifacts
  lib/              Browser capability adapters and minimized diagnostics
  theme/            Nymrel visual tokens and responsive component styling
  types/            Discriminated diagnostic and provenance contracts
test/               Behavioral, UI, accessibility, and workflow-contract tests
scripts/            Clean-build and production-artifact checks
.github/workflows/  Pinned CI, CodeQL, and exact-commit evidence packaging
```

## Deployment posture

The intended canonical origin is `https://score.nymrel.com/`. A repository build, workflow run, route response, or sitemap does not by itself prove that a deployment is current. Promotion requires an exact-commit build receipt plus independent hosted verification.

Static-host security headers are provided in `public/_headers`. Confirm the selected provider supports that contract before deployment.

## Security and privacy

The browser app has no application network client. Manual evidence is processed locally and bounded by size, depth, count, URL, and header validation. See [SECURITY.md](SECURITY.md) for private reporting.

## License

MIT. See [LICENSE](LICENSE).
