# Security policy

## Supported code

Security fixes target the current `main` branch. This repository has not declared a supported release line.

## Report privately

Do not open a public issue for a suspected vulnerability. Send a concise report to `contact@nymrel.com` with:

- affected commit or deployed URL;
- reproduction steps and impact;
- relevant logs or a minimal proof of concept;
- any suggested disclosure constraints.

Do not include credentials, customer data, or unrelated personal information. Nymrel will confirm receipt and coordinate next steps when the report can be reproduced; no response-time guarantee is made in this repository.

## Security model

The application is designed to evaluate bounded, user-supplied evidence in the browser without fetching the labeled domain. A score is not a security assessment or certification. Deployment-specific controls, headers, dependencies, and origin behavior require separate verification.
