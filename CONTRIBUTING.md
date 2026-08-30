# Contributing

Keep changes small, evidence-backed, and truthful.

1. Create a focused branch from the current `main`.
2. Install with `npm ci --ignore-scripts` using a supported Node release and npm 11.
3. Add behavioral tests for any contract change.
4. Run `npm run check`.
5. Describe the trust boundary, user-visible behavior, and exact verification in the pull request.

Do not add live-network fetching, analytics, publishing, deployment, payment, legal-entity, certification, ranking, or discoverability claims without an explicit reviewed contract and supporting evidence. Never replace `OPERATOR-FILL` values by inference.

Pull requests must preserve the discriminated scored/unavailable result states, versioned fixture provenance, bounded external input validation, local-only manual evidence, and pinned workflow actions.
