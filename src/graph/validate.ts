import type { Graph } from "./index";
import { isReading } from "./index";

/**
 * Dataset invariants from docs/EVIDENCE_MODEL.md. Run in tests and at build
 * time so a bad edge can never reach the public app.
 */
export function validateGraph(g: Graph): string[] {
  const problems: string[] = [];
  const seenEdgeIds = new Set<string>();
  for (const e of g.edges) {
    if (seenEdgeIds.has(e.id)) problems.push(`duplicate edge id ${e.id}`);
    seenEdgeIds.add(e.id);
    if (!g.nodeById.has(e.fromId)) problems.push(`${e.id}: unknown fromId ${e.fromId}`);
    if (!g.nodeById.has(e.toId)) problems.push(`${e.id}: unknown toId ${e.toId}`);
    if (e.sourceIds.length === 0) problems.push(`${e.id}: no sources`);
    for (const s of e.sourceIds) if (!g.sourceById.has(s)) problems.push(`${e.id}: unknown source ${s}`);
    if (isReading(e) && !e.interpreter) problems.push(`${e.id}: ${e.claimType} edge must name an interpreter`);
    if (!isReading(e) && e.interpreter) problems.push(`${e.id}: ${e.claimType} edge must not carry an interpreter`);
    if (e.type === "INTERPRETED_AS" && e.claimType !== "INTERPRETIVE") problems.push(`${e.id}: INTERPRETED_AS must be INTERPRETIVE`);
    if (e.type === "REFLECTED_AS" && e.claimType !== "REFLECTIVE") problems.push(`${e.id}: REFLECTED_AS must be REFLECTIVE`);
    if (e.claimType === "TEXTUAL" && e.reviewerStatus === "APPROVED") {
      for (const s of e.sourceIds) {
        const src = g.sourceById.get(s);
        if (src && src.editionId !== e.editionId) problems.push(`${e.id}: source ${s} is from ${src.editionId}, edge says ${e.editionId}`);
      }
    }
    if (e.type === "CHILD_OF") {
      const child = g.nodeById.get(e.fromId);
      const parent = g.nodeById.get(e.toId);
      if (child && child.kind !== "person") problems.push(`${e.id}: CHILD_OF from a non-person`);
      if (parent && parent.kind !== "person") problems.push(`${e.id}: CHILD_OF to a non-person`);
    }
    if (e.type === "OCCURS_AT") {
      const ev = g.nodeById.get(e.fromId);
      const place = g.nodeById.get(e.toId);
      if (ev && ev.kind !== "event") problems.push(`${e.id}: OCCURS_AT must start at an event`);
      if (place && place.kind !== "place") problems.push(`${e.id}: OCCURS_AT must end at a place`);
    }
  }
  const seenNodeIds = new Set<string>();
  for (const n of g.nodes) {
    if (seenNodeIds.has(n.id)) problems.push(`duplicate node id ${n.id}`);
    seenNodeIds.add(n.id);
    if (!n.summary) problems.push(`${n.id}: missing summary`);
  }
  for (const s of g.sources) {
    if (s.text.length === 0) problems.push(`source ${s.id}: no quoted text`);
  }
  // CHILD_OF must be acyclic.
  const parents = new Map<string, string[]>();
  for (const e of g.edges) {
    if (e.type !== "CHILD_OF") continue;
    const list = parents.get(e.fromId) ?? [];
    list.push(e.toId);
    parents.set(e.fromId, list);
  }
  const state = new Map<string, 1 | 2>();
  const visit = (id: string, trail: string[]): void => {
    const st = state.get(id);
    if (st === 2) return;
    if (st === 1) {
      problems.push(`CHILD_OF cycle: ${[...trail, id].join(" -> ")}`);
      return;
    }
    state.set(id, 1);
    for (const p of parents.get(id) ?? []) visit(p, [...trail, id]);
    state.set(id, 2);
  };
  for (const id of parents.keys()) visit(id, []);
  return problems;
}
