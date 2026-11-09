# Choose a diagnostic workflow

## Understand a report without writing code

1. Choose a fictional example near the top of the page. No account or code is needed.
2. Read its provenance label before its score. An illustrative fixture says
   nothing about that organization's current website.
3. Select a dimension to read the checks behind it. Review failed and warning
   checks with your site maintainer. Missing evidence is not a verified live defect.
4. Return to another example when you want to compare the diagnostic model.
   Your manual evidence draft stays in the current page while you explore.

## Check your own markup as a developer

1. Enter the domain used to label your evidence. A domain alone receives no score.
2. Open **Supply manual JSON-LD evidence** and paste the contents of a public
   Schema.org JSON-LD document. No network request is made.
3. Use **Score this evidence** directly below the editor. Read the **Manual
   evidence** label and the individual findings; omitted evidence scores as absent.
4. Correct the source document and resubmit. Invalid JSON is not automatically
   repaired. Templates under remediation are candidates for review, not deployed fixes.

The draft lives in this page's memory. Closing or reloading the page clears it.
Domain links and fixture links do not include pasted evidence. Do not treat a
shared domain URL as a saved manual diagnostic.

## Call the local engine from an agent or integration

The repository exposes a TypeScript source function, not a published package,
HTTP API, or MCP service. An embedding application can import it from the
source checkout using its existing TypeScript build tooling:

```typescript
import { runAudit } from '../src/engine/auditEngine';

const result = runAudit({
  url: 'https://example.com',
  jsonLdStrings: [JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Example',
  })],
});

if (result.status === 'unavailable') {
  console.error(result.reason, result.provenance.description);
} else {
  console.log(result.totalScore, result.checks, result.provenance);
}
```

The relative import above assumes a file in `docs/`; resolve it against your
embedding application rather than a nonexistent registry package.

Inputs and byte/count/depth limits are defined in
[`inputBoundary.ts`](../src/engine/inputBoundary.ts). The local engine accepts
`url`, `presetId`, `rawHtml`, `jsonLdStrings`, `robotsTxt`, `llmsTxt`,
`llmsFullTxt`, `ucpManifest`, and `headers`. Supply only evidence you are
authorized to read. Do not mix a fixture identifier with manual evidence.

Branch on `status` before accessing scoring fields:

- `scored`: retain `provenance.kind`, `evidenceKinds`, fixture version where
  supplied in the description, and `liveVerified: false` beside the score.
- `unavailable`: retain `reason` and `provenance.description`; correct invalid
  input, use the canonical fixture/domain pair, or supply missing evidence.
  An unavailable result has no score and must never become zero or a success badge.

Every path uses the same deterministic evaluator. No result authorizes a site
change, verifies live website behavior, or proves a deployment. Run
`npm run check` for source acceptance; an actual hosted release needs its own
build receipt and verification.
