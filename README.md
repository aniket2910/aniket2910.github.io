# Aniket Solanki · Portfolio

Personal portfolio: engineering case studies with architecture diagrams, and
interactive system-design simulators you can break on purpose (poison-record
isolation, rate limiting, idempotency keys, LRU caching).

**Stack:** Next.js 16 (App Router, static export) · React 19 · TypeScript ·
Tailwind CSS v4 · Framer Motion · Lenis

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Project layout

| Path | What lives there |
| --- | --- |
| `packages/content` | Single source of truth for all site content (profile, experience, case studies, projects), shared as a workspace package |
| `src/app` | Routes: home, `/case-studies/[slug]`, `/work/[slug]` |
| `src/components/case-study` | Case study page parts: header, flow diagram, points, trade-offs |
| `src/components/labs` | Interactive simulators and their shared kit |
| `backend` | Local-only NestJS service for an experimental AI assistant (not deployed) |

## Deploy

The site builds to plain static files (`out/`) and deploys to GitHub Pages via
`.github/workflows/deploy.yml` on every push to `main`.
