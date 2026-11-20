import { edges as seedEdges } from "./data/edges";
import { nodes as seedNodes } from "./data/nodes";
import { sources as seedSources } from "./data/sources";
import { getEdition } from "./editions";
import { normalize } from "./text";
import type { EvidenceEdge, GraphNode, Source } from "./types";
import { formatRef } from "./types";

export type NameEntry = { key: string; nodeId: string; isPrimary: boolean };

export type Graph = {
  nodes: GraphNode[];
  edges: EvidenceEdge[];
  sources: Source[];
  nodeById: Map<string, GraphNode>;
  edgeById: Map<string, EvidenceEdge>;
  sourceById: Map<string, Source>;
  /** Incident edges per node, in both directions. */
  incident: Map<string, EvidenceEdge[]>;
  /** Normalised names and aliases, longest first, for entity linking. */
  nameIndex: NameEntry[];
};

export function buildGraph(
  nodes: GraphNode[] = seedNodes,
  edges: EvidenceEdge[] = seedEdges,
  sources: Source[] = seedSources,
): Graph {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const edgeById = new Map(edges.map((e) => [e.id, e]));
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const incident = new Map<string, EvidenceEdge[]>();
  for (const e of edges) {
    for (const id of [e.fromId, e.toId]) {
      const list = incident.get(id);
      if (list) list.push(e);
      else incident.set(id, [e]);
    }
  }
  const nameIndex: NameEntry[] = [];
  for (const n of nodes) {
    const keys = new Set<string>();
    keys.add(normalize(n.name.replace(/\(.*?\)/g, "")));
    for (const a of n.aliases ?? []) keys.add(normalize(a));
    if (n.devanagari) keys.add(n.devanagari);
    for (const key of keys) {
      if (key) nameIndex.push({ key, nodeId: n.id, isPrimary: key === normalize(n.name.replace(/\(.*?\)/g, "")) });
    }
  }
  nameIndex.sort((a, b) => b.key.length - a.key.length || a.key.localeCompare(b.key));
  return { nodes, edges, sources, nodeById, edgeById, sourceById, incident, nameIndex };
}

/** The app-wide graph built from the seed dataset. */
export const graph: Graph = buildGraph();

export function citationLabel(source: Source): string {
  const edition = getEdition(source.editionId);
  return `${edition?.citationPrefix ?? source.editionId} ${formatRef(source.ref)}`;
}

export function incidentEdges(g: Graph, nodeId: string): EvidenceEdge[] {
  return g.incident.get(nodeId) ?? [];
}

export function otherEnd(e: EvidenceEdge, nodeId: string): string {
  return e.fromId === nodeId ? e.toId : e.fromId;
}

/** Only edges that may be shown as graph facts. */
export function isFactual(e: EvidenceEdge): boolean {
  return e.reviewerStatus === "APPROVED" && (e.claimType === "TEXTUAL" || e.claimType === "DERIVED");
}

export function isReading(e: EvidenceEdge): boolean {
  return e.claimType === "INTERPRETIVE" || e.claimType === "REFLECTIVE";
}
