import { describe, expect, it } from "vitest";
import { graph } from "@/graph/index";
import { retrieve } from "@/graph/retrieval";
import { explainDeterministically } from "@/llm/deterministic";
import { renderPacket } from "@/llm/prompt";
import { splitSentences, verifyAnswer } from "@/llm/verify";

describe("deterministic explainer", () => {
  it("writes only cited sentences", () => {
    const packet = retrieve(graph, "How is Rama related to Ambarisha?");
    const text = explainDeterministically(packet);
    const v = verifyAnswer(text, packet);
    expect(v.sentences.length).toBeGreaterThan(3);
    expect(v.sentences.every((s) => s.status === "cited")).toBe(true);
    expect(v.coverage).toBe(1);
    expect(v.unknownTags).toEqual([]);
    expect(text).not.toMatch(/reads this|offers a reflection/);
  });

  it("recites readings only for interpretive questions, attributed by name", () => {
    const packet = retrieve(graph, "What does Bharata's rule on the sandals mean?");
    const text = explainDeterministically(packet);
    expect(text).toMatch(/reads this|offers a reflection/);
    expect(text).toMatch(/\[R\d+\]/);
  });

  it("abstains when the packet is empty", () => {
    const packet = retrieve(graph, "zzzz qqqq");
    expect(explainDeterministically(packet)).toMatch(/does not cover/);
  });
});

describe("verifier", () => {
  it("splits sentences after trailing citations", () => {
    expect(splitSentences("Rāma is the son of Daśaratha [S1]. Aja is his grandfather [S2, C3]. Done.")).toHaveLength(3);
  });

  it("flags uncited, invalid and abstaining sentences", () => {
    const packet = retrieve(graph, "Who did Lakshmana marry?");
    const v = verifyAnswer("Lakṣmaṇa married Ūrmilā [S1]. He also married someone else. That is in [S99]. The retrieved evidence does not cover this.", packet);
    expect(v.sentences.map((s) => s.status)).toEqual(["cited", "uncited", "invalid", "abstain"]);
    expect(v.unknownTags).toEqual(["S99"]);
    expect(v.coverage).toBeCloseTo(1 / 3);
  });
});

describe("prompt rendering", () => {
  it("includes claims, sources and readings with their tags", () => {
    const packet = retrieve(graph, "What does Bharata's rule on the sandals mean?");
    const text = renderPacket(packet);
    expect(text).toContain("TEXTUAL CLAIMS");
    expect(text).toContain("READINGS");
    for (const s of packet.sources) expect(text).toContain(`${s.tag} = ${s.citation}`);
    for (const r of packet.readings) expect(text).toContain(r.tag);
  });
});
