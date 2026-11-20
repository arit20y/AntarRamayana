# Source policy

## Base edition

The graph cites one base edition: the **Critical Edition of the Vālmīki Rāmāyaṇa** (Oriental Institute, Baroda, 1960–1975). Citations are written `VR-CE kāṇḍa.sarga.verse`, with pāda letters when only part of a verse is quoted (for example `VR-CE 1.69.29c`).

Verification uses the electronic text of the Critical Edition typed by Muneo Tokunaga and revised in Unicode by John D. Smith (Cambridge), published at <http://indology.info/bombay/ramayana/>. Its line IDs (`1069029a` = book 1, sarga 69, verse 29, pāda a) map one-to-one onto the app's verse references.

The seed route Rāma → Daśaratha → Aja → Nābhāga → Yayāti → Nahuṣa → Ambarīṣa is at VR-CE 1.69.29–30 (vulgate 1.70.41–43); this was confirmed against the e-text on 2026-11-20, which closed the "verse numbers pending edition check" item from the first build.

## Concordance

The Southern-recension vulgate (Gita Press numbering, also used by valmikiramayan.net) numbers sargas differently in places (the lineage sarga is 1.70 there and 1.69 in the Critical Edition). A `vulgateRef` is recorded on a source only where it has been checked. Vulgate references are never used as the primary citation.

## What may be quoted

- Each `Source` record quotes only the pādas needed to support the claim, verbatim from the e-text, in romanised form.
- The e-text carries no formal licence and its author asks that it be used with care. The app therefore does **not** redistribute the corpus, bundle whole sargas, or serve a verse reader from it. Ingesting the full text for a reader or lexical index is deferred until the licence position is confirmed with the text's maintainers.
- Translations are not quoted; every `gist` is the editors' own plain-English summary of the quoted pādas.

## Review states

- `APPROVED` textual edges: every cited verse was read in the base e-text and supports the stated relation. A `note` is recorded when the relation is read from a sarga's context rather than a single verse (for example a marriage implied by a birth verse).
- `CANDIDATE` edges are shown only in the Readings sections and in the graph with a "candidate" marker, never as facts.
- `REJECTED` edges are kept in the dataset for audit but are never rendered.

## Interpretations and reflections

`INTERPRETIVE` edges name the text, commentary, tradition or author they belong to. Where the attribution is a summary of a widely held reading rather than a checked quotation, the edge stays `CANDIDATE` and says so in its note. `REFLECTIVE` edges are the app's own prompts and are labelled as such.

## Adding a source

1. Find the line in the e-text and copy its pādas verbatim.
2. Add a `Source` in `src/graph/data/sources.ts` with id `k.s.v`, the lines, and a one-sentence gist.
3. Cite it from an edge in `src/graph/data/edges.ts`.
4. Run `npm test`; the validator rejects edges without sources, readings without interpreters, and CHILD_OF cycles.
