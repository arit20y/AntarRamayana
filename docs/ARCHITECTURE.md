# Architecture

## Principle

Retrieval is deterministic and happens over an approved evidence graph. A language model is optional and, when used, sees only the evidence packet that retrieval produced. It may explain that packet; it can never add a fact, write to the graph, or be the source of a claim.

## Build plane (today: in-repo data)

```text
Critical Edition e-text → verse lookup → Source record (quoted pādas + gist)
→ EvidenceEdge (type, claim type, sources, reviewer status)
→ validator (tests) → graph bundled into the app
```

The dataset lives in `src/graph/data/` as typed TypeScript. `src/graph/validate.ts` enforces the invariants in `docs/EVIDENCE_MODEL.md` and runs in CI. The Neo4j build plane described in the first foundation remains the plan for the full corpus; the typed in-repo dataset is its versioned export format.

## Public application plane

```text
question
  → entity linking (names, aliases, Devanagari; longest match first)
  → intent cues (lineage / relation / event / place / interpretive)
  → graph traversal: shortest path, ancestor walk, 1–2 hop neighbourhood, lexical fallback
  → ranking and capping
  → EvidencePacket { entities, derived claims, textual claims, readings, sources, subgraph }
  → explainer (one of three)
  → citation verifier → answer with per-sentence status + the packet + the map
```

All of this runs in the browser; the graph is small enough to ship with the page. `src/graph/retrieval.ts` is the engine, `src/llm/prompt.ts` the only rendering of the packet a model ever sees.

### Explainers

| Explainer | Where it runs | Needs | Notes |
|---|---|---|---|
| Evidence only | browser, template | nothing | Always available; restates claims with their tags. Baseline for the others. |
| Browser-local | browser, WebLLM on WebGPU | model download on first use | Nothing leaves the device. Model list in `src/llm/webllm.ts`. |
| Hosted | `app/api/explain` → Claude | `ANTHROPIC_API_KEY` on the server | Receives the packet and nothing else. Disabled when the key is absent. |

Every answer is passed through `src/llm/verify.ts`, which splits it into sentences and marks each as cited, uncited, carrying an unknown tag, or an explicit abstention. The reader always sees the packet next to the answer.

## Pages

- `/` overview, ask box, Rāma's recorded ancestry, readings.
- `/ask` graph RAG: packet, map, answer, explainer choice.
- `/graph` explorer with neighbourhood map; `/graph/[id]` static page per node with relations, sources, ancestry.
- `/sources` editions, policy summary, every quoted verse.

## Model strategy

- Retrieval is deterministic and testable (`tests/retrieval.test.ts`).
- The browser-local model is the default LLM path for a free-to-host deployment.
- The hosted adapter keeps provider credentials server-side and is opt-in per deployment.
