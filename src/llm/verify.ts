import type { EvidencePacket } from "@/graph/retrieval";

/**
 * Post-generation check: every sentence must cite tags that exist in the
 * packet. The UI shows uncited and invalid sentences differently so a
 * reader can never mistake an unsupported sentence for a sourced one.
 */

export type SentenceStatus = "cited" | "uncited" | "invalid" | "abstain";

export type VerifiedSentence = { text: string; tags: string[]; status: SentenceStatus };

export type Verification = {
  sentences: VerifiedSentence[];
  unknownTags: string[];
  /** Fraction of factual sentences that carry at least one valid tag. */
  coverage: number;
};

const TAG_RE = /\[([A-Z]\d+(?:\s*,\s*[A-Z]\d+)*)\]/g;
const ABSTAIN_RE = /retrieved evidence does not cover/i;

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?](?:\s*\[[^\]]*\])*)\s+(?=[A-Z"“(\[])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function knownTags(packet: EvidencePacket): Set<string> {
  const tags = new Set<string>();
  for (const s of packet.sources) tags.add(s.tag);
  for (const c of packet.claims) tags.add(c.tag);
  for (const r of packet.readings) tags.add(r.tag);
  for (const p of packet.paths) tags.add(p.derived.tag);
  return tags;
}

export function verifyAnswer(text: string, packet: EvidencePacket): Verification {
  const known = knownTags(packet);
  const unknown = new Set<string>();
  const sentences: VerifiedSentence[] = splitSentences(text).map((sentence) => {
    const tags: string[] = [];
    for (const m of sentence.matchAll(TAG_RE)) {
      for (const t of m[1].split(",").map((x) => x.trim())) tags.push(t);
    }
    if (ABSTAIN_RE.test(sentence)) return { text: sentence, tags, status: "abstain" };
    if (!tags.length) return { text: sentence, tags, status: "uncited" };
    const valid = tags.filter((t) => known.has(t));
    for (const t of tags) if (!known.has(t)) unknown.add(t);
    return { text: sentence, tags, status: valid.length ? "cited" : "invalid" };
  });
  const factual = sentences.filter((s) => s.status !== "abstain");
  const cited = factual.filter((s) => s.status === "cited").length;
  return { sentences, unknownTags: [...unknown], coverage: factual.length ? cited / factual.length : 1 };
}
