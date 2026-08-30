# Nymrel Trust Scorecard

[![Machine Trust](https://img.shields.io/badge/Machine%20Trust-100%2F100%20A%2B-237346?style=flat-square&logo=shield)](https://score.nymrel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-A8541F.svg?style=flat-square)](LICENSE)
[![React 18](https://img.shields.io/badge/React-18.3.1-2A332E?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

> **Deterministic AI Readiness & Machine Trust Web Application** built in the **Nymrel Warm Paper design aesthetic** (`#FAF8F2`, `#F4F0E6`, `#2A332E`, `#A8541F`). Score labeled example fixtures or evidence supplied manually in the browser; this release does not fetch websites or live-verify domains.

---

## 🌟 Key Features

- 🎯 **5-Dimension Machine Trust Benchmark (0–100 Gauge)**:
  1. **Discovery & Orientation (20 pts)**: `/llms.txt` standard, sitemaps, machine index headers.
  2. **Entity Graph & Provenance (20 pts)**: Schema.org JSON-LD, `parentOrganization` hierarchy (e.g. `Nymrel -> JalenBuilds LLC`), legal entity registration.
  3. **UCP Commerce & Offers (20 pts)**: Structured `Product`, `Offer`, ISO 4217 currencies, real-time availability, and merchant return policies.
  4. **Autonomous Machine Payments (20 pts)**: Native HTTP 402 / `x402` micropayments, AP2/ACP negotiation, headless Stripe agent links, and stablecoin rails.
  5. **AI Search Bot Access (20 pts)**: Explicit permissions for `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, and granular crawler policies.
- ⚡ **Interactive SVG Radar Visualizer**: High-precision 5-axis polygon radar chart with deterministic percentage nodes and radial score gauge.
- 🛠️ **1-Click Code Remediation**: Immediate, copyable TypeScript / JSON / Markdown fixes using [`@nymrel/machine-trust`](https://github.com/nymrel/nymrel-machine-trust) and [`@nymrel/open-ucp`](https://github.com/nymrel/open-ucp).
- 🏷️ **Local SVG Badge Preview Generator**: Create a labeled local preview in Warm Paper, Cedar Forest, Terracotta, and Minimal Stone styles.
- 🚀 **Viral Growth Systems**:
  - 1-Click X (Twitter) share intent: *"My site scored 96/100 on @nymrel Machine Trust Scorecard! Check your AI agent readiness..."*
  - Shareable URL hashes & query strings (`?url=stripe.com`) for instant reproducibility.
  - Formatted multi-channel summaries for LinkedIn, Discord, and Slack.
- 🛡️ **Dual-Audience Machine Trust**: Breathtaking warm paper typography for humans with machine-verifiable JSON-LD entity graph for autonomous AI agents.

---

## 🎨 Design Tokens (Warm Paper Aesthetic)

Nymrel avoids cold tech dark modes in favor of warm, tactile, high-readability palettes:

| Token | Hex | Role |
| --- | --- | --- |
| **Warm Cream** | `#FAF8F2` | Base background & canvas |
| **Soft Linen** | `#F4F0E6` | Secondary panels & headers |
| **Cedar Green** | `#2A332E` | Primary typography & dark accents |
| **Terracotta** | `#A8541F` | Action buttons, highlights & accents |
| **Stone Border** | `#E2DDD2` | Subtle dividers & container boundaries |

---

## 📦 Quick Start

### Installation

```bash
git clone https://github.com/nymrel/nymrel-trust-scorecard.git
cd nymrel-trust-scorecard
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

### Unit Tests

```bash
npm test
```

---

## 🏗️ Project Architecture

```
nymrel-trust-scorecard/
├── index.html                   # Warm paper metadata, OG cards, Schema.org LD+JSON
├── package.json                 # Project scripts, dependencies, engines
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite build & bundler settings
├── public/
│   ├── favicon.svg              # Nymrel shield brand mark
│   ├── robots.txt               # AI search permissive crawler rules
│   ├── llms.txt                 # AI agent orientation specification
│   └── sitemap.xml              # Search & agent sitemap
├── src/
│   ├── main.tsx                 # React DOM mount point
│   ├── App.tsx                  # App orchestrator & URL hash state
│   ├── types/                   # TypeScript interfaces (Score, Checks, Presets)
│   ├── theme/
│   │   ├── tokens.ts            # Warm paper design constants & grade scales
│   │   └── theme.css            # Base typography, utility classes, animations
│   ├── engine/
│   │   ├── auditEngine.ts       # Master evaluator runner
│   │   ├── scoring.ts           # Deterministic 0-100 scoring & grades
│   │   ├── badgeGenerator.ts    # Dynamic SVG badge engine (Pill / Shield / Compact)
│   │   ├── remediationEngine.ts # 1-click code patches for @nymrel packages
│   │   ├── fixtures.ts          # Realistic presets (Nymrel, Stripe, Shopify, OpenAI)
│   │   └── evaluators/          # Dimension-specific evaluation modules
│   └── components/
│       ├── Header.tsx           # Brand mark, example-mode notice, GitHub link
│       ├── AuditHero.tsx        # Search bar, 1-click presets & scanning feedback
│       ├── ScorecardRadar.tsx   # 5-axis SVG radar visualizer & dimension breakdown
│       ├── RemediationAccordion.tsx # 1-click copyable code patches
│       ├── BadgeEmbedDrawer.tsx # Local SVG badge preview with labeled example code
│       ├── ShareOnXButton.tsx   # Viral tweet & social copy bar
│       └── Footer.tsx           # Nymrel -> JalenBuilds LLC entity provenance
└── test/                        # Node.js test runner unit test suite
```

---

## 🧩 Nymrel Ecosystem Integration

- **[`@nymrel/machine-trust`](https://github.com/nymrel/nymrel-machine-trust)**: Automated Schema.org entity graph generator, `/llms.txt` builder, and robots.txt manager.
- **[`@nymrel/open-ucp`](https://github.com/nymrel/open-ucp)**: Zero-dependency Universal Commerce Protocol & AI agent purchasing handler with HTTP 402 / `x402` support.
- **[`@nymrel/agentic-ucp-scanner`](https://github.com/nymrel/agentic-ucp-scanner)**: CLI scanner for continuous integration and terminal auditing.

---

## 🏛️ Entity Provenance & Legal Trust

- **Operating Umbrella**: Nymrel ([https://nymrel.com](https://nymrel.com))
- **Parent Legal Entity**: JalenBuilds LLC ([https://jalenbuilds.com](https://jalenbuilds.com))
- **Contact**: `contact@jalenbuilds.com` / `contact@nymrel.com`
- **License**: MIT License © 2026 Nymrel / JalenBuilds LLC
