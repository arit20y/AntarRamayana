import { describe, expect, it } from "vitest";
import { graph } from "@/graph/index";
import { ancestors, detectIntents, findPath, linkEntities, retrieve, searchNodes } from "@/graph/retrieval";
import { normalize } from "@/graph/text";

describe("normalisation", () => {
  it("strips diacritics and case", () => {
    expect(normalize("Rāma's Daśaratha")).toBe("ramas dasaratha");
    expect(normalize("Śūrpaṇakhā")).toBe("surpanakha");
  });
});

describe("entity linking", () => {
  it("links plain spellings, diacritics, aliases and Devanagari", () => {
    const ids = (q: string) => linkEntities(graph, q).map((e) => e.node.id);
    expect(ids("How is Rama related to Ambarisha?")).toEqual(["rama", "ambarisha"]);
    expect(ids("Who is Daśaratha?")).toEqual(["dasharatha"]);
    expect(ids("What did Vaidehi do?")).toEqual(["sita"]);
    expect(ids("राम और सीता")).toEqual(expect.arrayContaining(["rama", "sita"]));
  });

  it("prefers the longest match and does not match inside words", () => {
    const ids = (q: string) => linkEntities(graph, q).map((e) => e.node.id);
    expect(ids("the golden deer")).toEqual(["ev-golden-deer"]);
    expect(ids("Maricha and the golden deer")).toEqual(["maricha", "ev-golden-deer"]);
    expect(ids("Ramayana")).toEqual([]);
    expect(ids("Lava and Kusha")).toEqual(["lava", "kusha"]);
  });
});

describe("intent detection", () => {
  it("reads lineage and interpretive cues", () => {
    expect(detectIntents("Trace the lineage of Sita")).toContain("lineage");
    expect(detectIntents("What does Bharata's rule on the sandals mean?")).toContain("interpretive");
    expect(detectIntents("What happened at Panchavati?")).toContain("event");
  });
});

describe("paths and ancestry", () => {
  it("finds the kinship path from Rāma to Ambarīṣa in six steps", () => {
    const p = findPath(graph, "rama", "ambarisha", ["CHILD_OF", "SPOUSE_OF", "SIBLING_OF"]);
    expect(p?.nodeIds).toEqual(["rama", "dasharatha", "aja", "nabhaga", "yayati", "nahusha", "ambarisha"]);
  });

  it("walks Rāma's ancestry back to Brahmā", () => {
    const a = ancestors(graph, "rama");
    expect(a.nodeIds[0]).toBe("rama");
    expect(a.nodeIds[a.nodeIds.length - 1]).toBe("brahma");
    expect(a.edgeIds.length).toBe(38);
  });

  it("never traverses interpretive edges", () => {
    expect(findPath(graph, "hanuman", "c-devotion")).toBeNull();
  });
});

describe("retrieve", () => {
  it("builds a derived ancestor claim with its sources on path", () => {
    const packet = retrieve(graph, "How is Rama related to Ambarisha?");
    expect(packet.paths).toHaveLength(1);
    expect(packet.paths[0].derived.statement).toMatch(/Ambarīṣa is an ancestor of Rāma, 6 generations earlier/);
    expect(packet.paths[0].derived.sourceTags.length).toBeGreaterThan(0);
    const onPath = packet.claims.filter((c) => c.onPath);
    expect(onPath).toHaveLength(6);
    expect(packet.sources.map((s) => s.source.id)).toEqual(expect.arrayContaining(["1.69.29", "1.69.30"]));
    // A lineage question stays within kinship and does not drag in events or unrelated readings.
    expect(packet.intents).toEqual(["lineage"]);
    expect(packet.claims.every((c) => ["CHILD_OF", "SPOUSE_OF", "SIBLING_OF"].includes(c.edge.type))).toBe(true);
    expect(packet.readings.every((r) => r.edge.fromId === "rama" || r.edge.fromId === "ambarisha")).toBe(true);
    expect(packet.claims[0].statement).toMatch(/^Nahuṣa is the child of Ambarīṣa\.$/);
  });

  it("is deterministic", () => {
    const a = retrieve(graph, "Who were the parents of Hanuman?");
    const b = retrieve(graph, "Who were the parents of Hanuman?");
    expect(a.claims.map((c) => c.edge.id)).toEqual(b.claims.map((c) => c.edge.id));
    expect(a.claims.some((c) => c.edge.toId === "anjana")).toBe(true);
    expect(a.claims.some((c) => c.edge.toId === "vayu")).toBe(true);
  });

  it("expands a place to its events and their participants", () => {
    const packet = retrieve(graph, "What happened at Panchavati?");
    const nodeIds = packet.subgraph.nodes.map((n) => n.id);
    expect(nodeIds).toEqual(expect.arrayContaining(["panchavati", "ev-abduction", "ravana", "sita"]));
  });

  it("keeps readings apart from claims and tags sources consistently", () => {
    const packet = retrieve(graph, "What does Bharata's rule on the sandals mean?");
    expect(packet.readings.length).toBeGreaterThan(0);
    for (const r of packet.readings) expect(["INTERPRETIVE", "REFLECTIVE"]).toContain(r.claimType);
    for (const c of packet.claims) expect(["TEXTUAL", "DERIVED"]).toContain(c.claimType);
    const tags = new Set(packet.sources.map((s) => s.tag));
    for (const c of [...packet.claims, ...packet.readings]) for (const t of c.sourceTags) expect(tags.has(t), t).toBe(true);
  });

  it("falls back to lexical matching when no entity is recognised", () => {
    const packet = retrieve(graph, "who built the bridge across the ocean");
    expect(packet.claims.some((c) => c.edge.fromId === "nala")).toBe(true);
  });

  it("reports when nothing matches", () => {
    const packet = retrieve(graph, "zzzz qqqq");
    expect(packet.claims).toHaveLength(0);
    expect(packet.notes.length).toBeGreaterThan(0);
  });
});

describe("searchNodes", () => {
  it("ranks exact alias matches first", () => {
    expect(searchNodes(graph, "Vaidehi")[0].id).toBe("sita");
    expect(searchNodes(graph, "jan").map((n) => n.id)).toContain("janaka");
  });
});
