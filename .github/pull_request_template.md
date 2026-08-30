## Outcome

Describe the user-visible or control-plane result.

## Trust boundary

- What evidence is supplied?
- What remains illustrative, unavailable, or externally gated?
- Does this change add network, deployment, analytics, payment, legal, or publishing behavior?

## Verification

List exact commands and results. Include the Node releases used when runtime behavior changed.

## Review checklist

- [ ] No domain-only input is promoted to a score.
- [ ] Synthetic fixtures remain versioned and use reserved example domains.
- [ ] External inputs are bounded and runtime validated.
- [ ] User-visible claims distinguish local evidence from live production proof.
- [ ] Workflow actions are pinned to full commit SHAs.
- [ ] `npm run check` passes.
