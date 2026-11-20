# AntarRamayana

An evidence-led Ramayana explorer. Lineages, places and events of the Vālmīki Rāmāyaṇa are stored as a graph in which every edge carries its verse; questions are answered by **graph retrieval first**, and a model, if used at all, may only explain the evidence that was retrieved.

## What it does

- **Ask with evidence** (`/ask`): entity linking → deterministic graph traversal → an evidence packet of approved claims and quoted verses → an explanation whose every sentence is checked for citations. Three explainers: evidence-only template, browser-local model (WebLLM on WebGPU, nothing leaves the device), or a hosted Claude adapter (optional, server-side key).
- **Graph explorer** (`/graph`, `/graph/[id]`): every person, place, event and concept, their relations with claim-type badges, the verses behind each relation, and derived ancestry.
- **Sources** (`/sources`): base edition, policy, and every pāda the graph quotes.

Claim types are kept apart everywhere: textual, derived, interpretive, reflective. See `docs/EVIDENCE_MODEL.md`, `docs/SOURCE_POLICY.md` and `docs/ARCHITECTURE.md`.

## Base edition

Critical Edition of the Vālmīki Rāmāyaṇa (Baroda, 1960–75), verified against the Tokunaga/Smith e-text. The seed lineage Rāma → Ambarīṣa is at VR-CE 1.69.29–30 (vulgate 1.70.41–43).

## Run it locally

Requirements: [Node.js](https://nodejs.org) 20.9 or newer (22 LTS recommended) and Git.

```bash
git clone https://github.com/arit20y/antarramayana.git
cd antarramayana
npm install
npm run dev
```

Open `http://localhost:3000`.

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (what Vercel runs) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Dataset validation, retrieval and verifier tests (Vitest) |

### Models (all optional)

| Explainer | Model | Cost | Needs |
|---|---|---|---|
| Evidence only | none (template) | free | nothing |
| Browser-local | Qwen 2.5 1.5B / 0.5B, Llama 3.2 1B, Phi 3.5 mini (open weights via WebLLM) | free | WebGPU browser (recent Chrome/Edge); first use downloads the model into the browser cache |
| Hosted, Groq | `llama-3.3-70b-versatile` (override with `GROQ_MODEL`) | Groq free tier | `GROQ_API_KEY` on the server |
| Hosted, Anthropic | `claude-opus-5-5` | paid | `ANTHROPIC_API_KEY` on the server |

Set keys in the server environment (for local runs, a git-ignored `.env.local`). When both hosted keys exist, `HOSTED_PROVIDER=groq` or `anthropic` picks one; Anthropic is the default. Without any key the hosted option is disabled and the app works fully with the free explainers.

## Deploy (free)

Import the GitHub repo at [vercel.com/new](https://vercel.com/new) on the Hobby plan. No settings are needed; add `ANTHROPIC_API_KEY` only if you want the hosted explainer. Every push to `main` redeploys.

## Adding to the graph

Add a `Source` (verbatim pādas from the e-text) in `src/graph/data/sources.ts`, a node in `nodes.ts` if needed, and an edge in `edges.ts` that cites the source. `npm test` validates the dataset.

## Licence

Application code: MIT (see `LICENSE`). Source texts and datasets keep their own licences; see `docs/SOURCE_POLICY.md`.
