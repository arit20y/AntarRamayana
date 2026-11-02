# AntarRamayana

An evidence-led Ramayana explorer for the full Valmiki Ramayana corpus, lineage graphs, narrative exploration, and clearly-labelled philosophical readings.

## Current foundation

- Next.js 16 + React 19 + TypeScript, plain CSS (no Tailwind yet)
- first seed lineage route: Rama → Yayati → Ambarisha (verse numbers pending edition check)
- interactive Inner Ramayana lens prototype
- evidence and deployment architecture documents
- CI: lint, type-check and build on every push to `main`

## Run it locally

Requirements: [Node.js](https://nodejs.org) 20.9 or newer (22 LTS recommended) and Git.

```bash
git clone https://github.com/arit20y/antarramayana.git
cd antarramayana
npm install
npm run dev
```

Open `http://localhost:3000`. Edits to files in `src/` reload automatically.

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (what Vercel runs) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Deploy (free)

Import the GitHub repo at [vercel.com/new](https://vercel.com/new) on the Hobby plan. Vercel detects Next.js; no settings or environment variables are needed. Every push to `main` redeploys.

## Product rule

The app separates textual claims, deterministic derivations, interpretations, and modern reflection. An LLM may explain retrieved evidence but never create factual graph claims.

## Licence

Application code: MIT (see `LICENSE`). Source texts and datasets keep their own licences.
