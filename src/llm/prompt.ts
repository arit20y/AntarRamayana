import type { EvidencePacket } from "@/graph/retrieval";

/**
 * The only thing any model ever sees is this rendering of the evidence
 * packet. It is shared by the browser-local and hosted explainers so both
 * are held to the same grounding contract.
 */

export const SYSTEM_PROMPT = `You are the explainer for AntarRamayana, an evidence-led Ramayana explorer.

Rules:
1. Use only the evidence packet. Do not add names, verses, events, dates or relations that are not in it, even if you know them.
2. Every sentence that states something about the text must end with the source tags it rests on, written like [S1] or [S2, S4]. You may also cite claim tags like [C3] or [D1] next to the source tags.
3. If the packet does not cover part of the question, write exactly: "The retrieved evidence does not cover this." and stop there for that part.
4. Items under READINGS are interpretations or reflection prompts by a named source. Report them only as that source's reading ("Tulsīdās reads…"), never as what the Vālmīki text says, and cite them with their [R#] tag.
5. Write 3 to 8 short plain-English sentences. No headings, no bullet lists, no preamble.`;

export function renderPacket(packet: EvidencePacket): string {
  const lines: string[] = [];
  lines.push(`QUESTION: ${packet.question}`);
  lines.push("");
  lines.push("ENTITIES RECOGNISED:");
  if (!packet.entities.length) lines.push("  (none)");
  for (const e of packet.entities) lines.push(`  ${e.node.name} (${e.node.kind}): ${e.node.summary}`);
  if (packet.paths.length) {
    lines.push("");
    lines.push("DERIVED CLAIMS (computed from the textual claims below):");
    for (const p of packet.paths) {
      lines.push(`  ${p.derived.tag} (DERIVED): ${p.derived.statement} [${p.derived.sourceTags.join(", ")}]`);
      lines.push(`     route: ${p.route}`);
    }
  }
  lines.push("");
  lines.push("TEXTUAL CLAIMS (approved graph edges):");
  if (!packet.claims.length) lines.push("  (none)");
  for (const c of packet.claims) lines.push(`  ${c.tag} (${c.claimType}): ${c.statement} [${c.sourceTags.join(", ")}]`);
  if (packet.readings.length) {
    lines.push("");
    lines.push("READINGS (NOT textual facts; always attribute to the named source):");
    for (const r of packet.readings) lines.push(`  ${r.tag} (${r.claimType}, by ${r.edge.interpreter?.name ?? "unknown"} — ${r.edge.interpreter?.tradition ?? ""}): ${r.statement} [${r.sourceTags.join(", ")}]`);
  }
  lines.push("");
  lines.push("SOURCES:");
  for (const s of packet.sources) {
    lines.push(`  ${s.tag} = ${s.citation}: "${s.source.text.join(" / ")}" — ${s.source.gist}`);
  }
  if (packet.notes.length) {
    lines.push("");
    lines.push("NOTES:");
    for (const n of packet.notes) lines.push(`  ${n}`);
  }
  return lines.join("\n");
}
