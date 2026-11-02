# Evidence model

AntarRamayana treats every public statement as one of four different things:

1. **Textual claim** — explicitly stated in a selected textual edition and linked to one or more verse IDs.
2. **Derived claim** — reproducibly derived from approved textual claims, for example an ancestor route built from `CHILD_OF` edges.
3. **Interpretive claim** — a named commentator, tradition, or author reads a narrative/person/concept in a particular way.
4. **Modern reflection** — a clearly labelled contemporary exercise or analogy. It does not assert an ancient source or scientific finding.

The interface must never present categories 3 or 4 with the visual authority of category 1.

## Required graph edge fields

```ts
type EvidenceEdge = {
  id: string;
  fromId: string;
  toId: string;
  type: "CHILD_OF" | "SPOUSE_OF" | "APPEARS_IN" | "INTERPRETED_AS";
  claimType: "TEXTUAL" | "DERIVED" | "INTERPRETIVE" | "REFLECTIVE";
  sourceIds: string[];
  editionId?: string;
  reviewerStatus: "CANDIDATE" | "APPROVED" | "REJECTED";
};
```

Only `APPROVED` edges are shown as factual graph relations. `INTERPRETED_AS` edges must name the interpreter and remain visibly distinct.
