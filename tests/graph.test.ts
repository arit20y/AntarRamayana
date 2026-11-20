import { describe, expect, it } from "vitest";
import { graph, isFactual } from "@/graph/index";
import { validateGraph } from "@/graph/validate";

describe("seed graph", () => {
  it("satisfies the evidence-model invariants", () => {
    expect(validateGraph(graph)).toEqual([]);
  });

  it("has every textual edge backed by a base-edition source", () => {
    for (const e of graph.edges.filter((x) => x.claimType === "TEXTUAL")) {
      expect(e.sourceIds.length, e.id).toBeGreaterThan(0);
      for (const s of e.sourceIds) expect(graph.sourceById.get(s)?.editionId, `${e.id} → ${s}`).toBe("vr-ce");
    }
  });

  it("never lets a reading count as a fact", () => {
    for (const e of graph.edges) {
      if (e.claimType === "INTERPRETIVE" || e.claimType === "REFLECTIVE") {
        expect(isFactual(e), e.id).toBe(false);
        expect(e.interpreter?.name, e.id).toBeTruthy();
      }
    }
  });

  it("records the Rāma → Ambarīṣa seed route at VR-CE 1.69.29–30", () => {
    const steps: [string, string][] = [
      ["rama", "dasharatha"],
      ["dasharatha", "aja"],
      ["aja", "nabhaga"],
      ["nabhaga", "yayati"],
      ["yayati", "nahusha"],
      ["nahusha", "ambarisha"],
    ];
    for (const [child, parent] of steps) {
      const e = graph.edges.find((x) => x.type === "CHILD_OF" && x.fromId === child && x.toId === parent);
      expect(e, `${child} → ${parent}`).toBeDefined();
      expect(e?.sourceIds.some((s) => s === "1.69.29" || s === "1.69.30"), `${child} → ${parent} cites 1.69.29–30`).toBe(true);
    }
  });
});
