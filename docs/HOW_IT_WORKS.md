# How AntarRamayana works

A plain-language explainer. For the engineering view see `ARCHITECTURE.md`; for the rules on claims see `EVIDENCE_MODEL.md`; for sources see `SOURCE_POLICY.md`.

## In one paragraph

AntarRamayana answers questions about the Vālmīki Rāmāyaṇa from a small, hand-checked knowledge graph in which every relationship points at the verse that states it. When you ask a question, the app finds the people, places and events you named, walks the graph to collect the relevant relationships and their verses, and shows you that evidence packet. Only then may a language model, if you choose one, turn the packet into prose, and every sentence it writes is checked for a citation before you see it. The model can explain the evidence; it can never add to it.

## Straight answers to common questions

**Is a large language model (LLM) used?** Only if you choose one. The `/ask` page offers three explainers:

| Explainer | What it is | Where it runs | Default? |
|---|---|---|---|
| Evidence only | A template that restates the retrieved claims with their citation tags | In your browser, no model | Yes |
| Browser-local model | Free open-weight models (Qwen 2.5, Llama 3.2 1B, Phi 3.5 mini) via WebLLM | On your own GPU through WebGPU; nothing leaves your device; first use downloads the model | No, opt-in |
| Hosted model | Llama 3.3 70B on Groq's free tier, or Claude | On this site's server, only when the operator sets `GROQ_API_KEY` or `ANTHROPIC_API_KEY` | No, and disabled until a key is set |

Retrieval itself never uses a model. The same question always produces the same evidence packet.

**Is Neo4j used?** No. The graph is a typed dataset in `src/graph/data/` (nodes, edges, sources) that is validated by tests and bundled into the page. At the current size (about 150 nodes) that is faster and simpler than a database, and it keeps the deployment free. Neo4j remains the plan for building the full-corpus graph offline; its export would feed the same in-app format.

**Where do the facts come from?** From the Critical Edition of the Vālmīki Rāmāyaṇa, checked line by line in the Tokunaga/Smith e-text. Each source record quotes the exact Sanskrit pādas and gives a one-sentence gist. Every relationship cites at least one such source.

**Is anything in the app an interpretation?** Yes, and it is labelled. Four claim types exist and are drawn differently everywhere: textual (what the verse states), derived (computed from textual claims, for example "Ambarīṣa is an ancestor of Rāma, six generations earlier"), interpretive (a named commentator or tradition reads it this way), and reflective (the app's own reflection prompt). Interpretive and reflective claims never appear as facts, never join a path, and always name their source.

## The pipeline, step by step

1. **Link.** The question is normalised (diacritics and case removed) and scanned for names, aliases and Devanagari forms from the graph, longest match first. "Vaidehi", "Janaki" and "सीता" all resolve to Sītā. Nothing is guessed: a name is either in the graph or it is not.
2. **Read the intent.** Cue words mark the question as lineage, relation, event, place or interpretive. A lineage question stays within kinship edges; an interpretive question admits readings.
3. **Traverse.** With two people named, breadth-first search finds the shortest path over approved edges. With one person and a lineage cue, the ancestor chain is walked. Every named entity contributes its neighbourhood, and events expand to their participants and places. If nothing was named, the words of the question are matched against claim statements.
4. **Rank and cap.** On-path claims come first, then claims touching more named entities, then lexical matches. The packet is capped so an explainer never receives more than it can cite.
5. **Assemble the packet.** Claims get tags C1, C2…, sources S1, S2…, derived claims D1…, readings R1…. The packet also carries the subgraph that the globe draws.
6. **Explain.** The chosen explainer receives one rendering of the packet and a system prompt that forbids anything outside it and requires a tag at the end of every factual sentence.
7. **Verify.** The answer is split into sentences; each is marked cited, uncited, carrying an unknown tag, or an explicit abstention. The packet is always shown beside the answer so you can check for yourself.

## Pages

- `/` overview, question box, Rāma's recorded ancestry, readings.
- `/ask` the pipeline above, with the evidence globe and the full packet.
- `/graph` explorer: search, filter by kind, and a globe of a node's neighbourhood at 1, 2 or 3 hops; `/graph/<id>` a page per node with every relation, its verses and derived ancestry.
- `/sources` the editions, the policy, and every verse the graph quotes.

## What it is not, yet

- Not the full corpus. The graph is a verified seed, not 18,632 verses. The Critical Edition e-text has no formal licence, so the app quotes pādas and does not bundle the text. Griffith's public-domain translation is the candidate for a verse reader and verse-level search.
- Not a chatbot. There is no conversation memory; each question is answered from scratch so that every answer stays traceable to its packet.
- Not a generated graph. No model extracted these relationships; they were read from the text and recorded with their verses. Automated extraction can be added later as `CANDIDATE` edges that a reviewer promotes.

## Adding knowledge

Add a `Source` with the verbatim pādas in `src/graph/data/sources.ts`, a node in `nodes.ts` if the figure, place or event is new, and an edge in `edges.ts` that cites the source. Run `npm test`: the validator rejects edges without sources, readings without a named interpreter, interpretive edges typed as facts, and cycles in parentage.
