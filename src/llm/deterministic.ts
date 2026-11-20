import type { EvidencePacket, PacketClaim } from "@/graph/retrieval";
import type { Explainer } from "./types";

/**
 * Template explainer. Always available, needs no model, and by construction
 * can only restate claims that are in the packet. It is also the baseline
 * that the model-written answers are compared against.
 */

function cite(tags: string[]): string {
  return tags.length ? ` [${tags.join(", ")}]` : "";
}

function sentenceFor(c: PacketClaim): string {
  const s = c.statement.trim().replace(/\.$/, "");
  return `${s}${cite([...c.sourceTags, c.tag])}.`;
}

export function explainDeterministically(packet: EvidencePacket): string {
  const out: string[] = [];
  for (const p of packet.paths) {
    out.push(`${p.derived.statement.replace(/\.$/, "")}${cite([...p.derived.sourceTags, p.derived.tag])}.`);
  }
  const onPath = packet.claims.filter((c) => c.onPath);
  const rest = packet.claims.filter((c) => !c.onPath);
  const budget = Math.max(3, 9 - out.length);
  for (const c of onPath.slice(0, budget)) out.push(sentenceFor(c));
  for (const c of rest.slice(0, Math.max(0, budget - onPath.length))) out.push(sentenceFor(c));
  // Readings are recited only when the question asks for meaning; the packet
  // still lists them beside the answer either way.
  if (packet.readings.length && packet.intents.includes("interpretive")) {
    for (const r of packet.readings.slice(0, 2)) {
      const who = r.edge.interpreter?.name ?? "A named source";
      const verb = r.claimType === "REFLECTIVE" ? "offers a reflection" : "reads this";
      out.push(`${who} ${verb}: ${r.statement.replace(/^Reflection:\s*/, "").replace(/\.$/, "")}${cite([r.tag])}.`);
    }
  }
  if (!out.length) out.push("The retrieved evidence does not cover this.");
  return out.join(" ");
}

export const deterministicExplainer: Explainer = {
  id: "deterministic",
  label: "Evidence only (no model)",
  async explain(packet, options) {
    const text = explainDeterministically(packet);
    options?.onPartial?.(text);
    return { text, provider: "deterministic", model: "template-v1" };
  },
};
