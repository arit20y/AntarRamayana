# Architecture

## Build plane

```text
licensed source snapshot → normalization → extraction candidates → source review
→ Neo4j master graph → validation → versioned graph export
```

Neo4j Community is used locally for corpus construction, QA, and deep graph traversal. It is not required in the public Vercel runtime.

## Public application plane

```text
Next.js on Vercel → search index + graph shards → evidence packet
→ browser-local LLM → cited explanation and interactive map
```

The deployed application reads versioned graph exports and never lets an LLM write to the master graph.

## Model strategy

- Retrieval is deterministic, based on approved graph relationships and indexes.
- The browser-local model writes answers from the retrieved evidence packet.
- A future hosted model adapter is optional and must keep provider credentials server-side.
