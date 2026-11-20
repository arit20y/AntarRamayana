import { citationLabel, incidentEdges, isFactual, isReading, otherEnd, type Graph } from "./index";
import { escapeRegExp, normalize, stem, tokenize } from "./text";
import type { ClaimType, EvidenceEdge, GraphNode, RelationType, Source } from "./types";
import { RELATION_LABELS } from "./types";

/**
 * Deterministic graph retrieval. No model is involved here: the evidence
 * packet is assembled purely from approved graph edges and their sources, so
 * the same question always yields the same packet.
 */

export type Intent = "lineage" | "relation" | "event" | "place" | "interpretive";

export type LinkedEntity = { node: GraphNode; matched: string; start: number; end: number };

export type PacketClaim = {
  tag: string;
  edge: EvidenceEdge;
  claimType: ClaimType;
  statement: string;
  sourceTags: string[];
  onPath: boolean;
};

export type PacketSource = { tag: string; source: Source; citation: string };

export type PacketPath = {
  fromId: string;
  toId: string;
  nodeIds: string[];
  edgeIds: string[];
  /** Plain-English route, e.g. "Rāma → child of → Daśaratha → …". */
  route: string;
  /** DERIVED claim produced from the path, with its own tag. */
  derived: { tag: string; statement: string; sourceTags: string[] };
};

export type EvidencePacket = {
  question: string;
  intents: Intent[];
  entities: LinkedEntity[];
  claims: PacketClaim[];
  readings: PacketClaim[];
  sources: PacketSource[];
  paths: PacketPath[];
  subgraph: { nodes: GraphNode[]; edges: EvidenceEdge[] };
  notes: string[];
};

export type RetrievalOptions = {
  maxClaims?: number;
  includeReadings?: boolean;
  /** Expand around entities this many hops (1 or 2). */
  hops?: 1 | 2;
};

const KINSHIP: RelationType[] = ["CHILD_OF", "SPOUSE_OF", "SIBLING_OF"];

const INTENT_WORDS: Record<Intent, string[]> = {
  lineage: ["ancestor", "ancestry", "descend", "descendant", "lineage", "genealogy", "dynasty", "family", "father", "mother", "son", "daughter", "parent", "grandfather", "grandson", "forefather", "line", "born", "birth", "related", "relative", "relation"],
  relation: ["wife", "husband", "brother", "sister", "sibling", "spouse", "marry", "married", "wed", "ally", "friend", "kill", "killed", "slay", "slain", "abduct", "abducted", "kidnap", "rule", "ruler", "king"],
  event: ["happen", "happened", "event", "story", "episode", "fight", "battle", "war", "exile", "exiled", "leap", "cross", "burn", "bridge", "ordeal", "fire", "boon", "abduct", "abducted"],
  place: ["where", "place", "city", "mountain", "forest", "grove", "kingdom", "located"],
  interpretive: ["mean", "meaning", "interpret", "interpretation", "lesson", "teach", "symbol", "symbolic", "philosoph", "reflect", "reflection", "significance", "dharma", "moral", "spiritual", "vedanta", "bhakti", "reading"],
};

export function detectIntents(question: string): Intent[] {
  const toks = tokenize(question).map(stem);
  const text = normalize(question);
  const found: Intent[] = [];
  for (const [intent, words] of Object.entries(INTENT_WORDS) as [Intent, string[]][]) {
    if (words.some((w) => toks.includes(stem(w)) || text.includes(w))) found.push(intent);
  }
  return found;
}

/** Longest-match-first entity linking over names, aliases and Devanagari. */
export function linkEntities(g: Graph, question: string): LinkedEntity[] {
  const text = normalize(question);
  const raw = question;
  const taken: boolean[] = new Array(text.length).fill(false);
  const out: LinkedEntity[] = [];
  const seen = new Set<string>();
  for (const entry of g.nameIndex) {
    const isDevanagari = /[ऀ-ॿ]/.test(entry.key);
    const haystack = isDevanagari ? raw : text;
    const re = isDevanagari
      ? new RegExp(escapeRegExp(entry.key), "g")
      : new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(entry.key)}(?![\\p{L}\\p{N}])`, "gu");
    let m: RegExpExecArray | null;
    while ((m = re.exec(haystack)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      if (!isDevanagari) {
        let overlaps = false;
        for (let i = start; i < end; i += 1) if (taken[i]) overlaps = true;
        if (overlaps) continue;
        for (let i = start; i < end; i += 1) taken[i] = true;
      }
      if (seen.has(entry.nodeId)) continue;
      seen.add(entry.nodeId);
      const node = g.nodeById.get(entry.nodeId);
      if (node) out.push({ node, matched: m[0], start, end });
    }
  }
  out.sort((a, b) => a.start - b.start);
  return out;
}

/** Breadth-first shortest path over factual edges, optionally kinship-only. */
export function findPath(g: Graph, fromId: string, toId: string, types?: RelationType[]): { nodeIds: string[]; edgeIds: string[] } | null {
  if (fromId === toId) return { nodeIds: [fromId], edgeIds: [] };
  const allowed = types ? new Set(types) : null;
  const prev = new Map<string, { node: string; edge: string }>();
  const queue: string[] = [fromId];
  const visited = new Set<string>([fromId]);
  while (queue.length) {
    const cur = queue.shift() as string;
    for (const e of incidentEdges(g, cur)) {
      if (!isFactual(e)) continue;
      if (allowed && !allowed.has(e.type)) continue;
      const next = otherEnd(e, cur);
      if (visited.has(next)) continue;
      visited.add(next);
      prev.set(next, { node: cur, edge: e.id });
      if (next === toId) {
        const nodeIds = [toId];
        const edgeIds: string[] = [];
        let at = toId;
        while (at !== fromId) {
          const p = prev.get(at) as { node: string; edge: string };
          edgeIds.unshift(p.edge);
          nodeIds.unshift(p.node);
          at = p.node;
        }
        return { nodeIds, edgeIds };
      }
      queue.push(next);
    }
  }
  return null;
}

/**
 * Walk CHILD_OF edges upwards from a node. Where a node has several recorded
 * parents, follow the parent with the longest recorded line, so the recital
 * line (father's side in the epic) wins over a parent with no ancestry.
 */
export function ancestors(g: Graph, id: string, maxDepth = 60): { nodeIds: string[]; edgeIds: string[] } {
  const memo = new Map<string, { nodeIds: string[]; edgeIds: string[] }>();
  const walk = (cur: string, depth: number, trail: Set<string>): { nodeIds: string[]; edgeIds: string[] } => {
    const cached = memo.get(cur);
    if (cached) return cached;
    let best: { nodeIds: string[]; edgeIds: string[] } = { nodeIds: [cur], edgeIds: [] };
    if (depth < maxDepth) {
      const ups = incidentEdges(g, cur).filter((e) => e.type === "CHILD_OF" && e.fromId === cur && isFactual(e) && !trail.has(e.toId));
      for (const up of ups) {
        const next = new Set(trail);
        next.add(cur);
        const rest = walk(up.toId, depth + 1, next);
        if (rest.edgeIds.length + 1 > best.edgeIds.length) {
          best = { nodeIds: [cur, ...rest.nodeIds], edgeIds: [up.id, ...rest.edgeIds] };
        }
      }
    }
    memo.set(cur, best);
    return best;
  };
  return walk(id, 0, new Set());
}

function relationPhrase(g: Graph, e: EvidenceEdge, fromPerspective: string): string {
  const a = g.nodeById.get(e.fromId)?.name ?? e.fromId;
  const b = g.nodeById.get(e.toId)?.name ?? e.toId;
  if (fromPerspective === e.fromId) return `${a} → ${RELATION_LABELS[e.type]} → ${b}`;
  const inverse: Partial<Record<RelationType, string>> = {
    CHILD_OF: "parent of",
    SPOUSE_OF: "spouse of",
    SIBLING_OF: "sibling of",
    ALLY_OF: "ally of",
    KILLED: "killed by",
    ABDUCTED: "abducted by",
    RULER_OF: "ruled by",
    LOCATED_IN: "contains",
    PARTICIPATES_IN: "involves",
    OCCURS_AT: "is the site of",
  };
  return `${b} → ${inverse[e.type] ?? RELATION_LABELS[e.type]} → ${a}`;
}

function describeKinshipPath(g: Graph, nodeIds: string[], edgeIds: string[]): string | null {
  const edges = edgeIds.map((id) => g.edgeById.get(id) as EvidenceEdge);
  if (!edges.length || !edges.every((e) => e.type === "CHILD_OF")) return null;
  const a = g.nodeById.get(nodeIds[0])?.name;
  const b = g.nodeById.get(nodeIds[nodeIds.length - 1])?.name;
  const up = edges.every((e, i) => e.fromId === nodeIds[i]);
  const down = edges.every((e, i) => e.toId === nodeIds[i]);
  const gens = edges.length;
  if (up) return gens === 1 ? `${a} is the child of ${b}.` : `${b} is an ancestor of ${a}, ${gens} generations earlier.`;
  if (down) return gens === 1 ? `${a} is the parent of ${b}.` : `${b} is a descendant of ${a}, ${gens} generations later.`;
  return null;
}

/** Score an edge against question tokens for lexical fallback. */
function lexicalScore(g: Graph, e: EvidenceEdge, qtoks: string[]): number {
  if (!qtoks.length) return 0;
  const text = [
    e.summary,
    g.nodeById.get(e.fromId)?.name ?? "",
    g.nodeById.get(e.toId)?.name ?? "",
    g.nodeById.get(e.toId)?.summary ?? "",
    ...e.sourceIds.map((s) => g.sourceById.get(s)?.gist ?? ""),
  ].join(" ");
  const toks = new Set(tokenize(text).map(stem));
  let score = 0;
  for (const q of qtoks) if (toks.has(q)) score += 1;
  return score;
}

export function retrieve(g: Graph, question: string, options: RetrievalOptions = {}): EvidencePacket {
  const maxClaims = options.maxClaims ?? 28;
  const includeReadings = options.includeReadings ?? true;
  const intents = detectIntents(question);
  const entities = linkEntities(g, question);
  const qtoks = tokenize(question).map(stem);
  const notes: string[] = [];

  const picked = new Map<string, { edge: EvidenceEdge; onPath: boolean; score: number }>();
  const add = (e: EvidenceEdge, score: number, onPath = false) => {
    const cur = picked.get(e.id);
    if (cur) {
      cur.score = Math.max(cur.score, score);
      cur.onPath = cur.onPath || onPath;
    } else picked.set(e.id, { edge: e, onPath, score });
  };

  // 1. Paths between the first two person entities.
  const paths: PacketPath[] = [];
  const persons = entities.filter((x) => x.node.kind === "person");
  const lineageOnly = intents.includes("lineage") && !intents.includes("relation") && !intents.includes("event");
  if (persons.length >= 2) {
    const a = persons[0].node.id;
    const b = persons[1].node.id;
    const path = (lineageOnly ? findPath(g, a, b, KINSHIP) : null) ?? findPath(g, a, b, lineageOnly ? undefined : ["CHILD_OF", "SPOUSE_OF", "SIBLING_OF", "ALLY_OF", "KILLED", "ABDUCTED", "RULER_OF", "LOCATED_IN", "PARTICIPATES_IN", "OCCURS_AT"]);
    if (path) {
      path.edgeIds.forEach((id) => add(g.edgeById.get(id) as EvidenceEdge, 10, true));
      const route = path.nodeIds
        .map((id, i) => (i === 0 ? g.nodeById.get(id)?.name : relationPhrase(g, g.edgeById.get(path.edgeIds[i - 1]) as EvidenceEdge, path.nodeIds[i - 1]).split(" → ").slice(1).join(" → ")))
        .join(" → ");
      const kin = describeKinshipPath(g, path.nodeIds, path.edgeIds);
      paths.push({
        fromId: a,
        toId: b,
        nodeIds: path.nodeIds,
        edgeIds: path.edgeIds,
        route,
        derived: { tag: "", statement: kin ?? `${g.nodeById.get(a)?.name} and ${g.nodeById.get(b)?.name} are connected through ${path.edgeIds.length} recorded relation${path.edgeIds.length === 1 ? "" : "s"}.`, sourceTags: [] },
      });
    } else {
      notes.push(`No recorded path between ${persons[0].node.name} and ${persons[1].node.name} in the approved graph.`);
    }
  }

  // 2. Lineage intent with one person: full ancestor chain.
  if (persons.length === 1 && intents.includes("lineage")) {
    const anc = ancestors(g, persons[0].node.id, 60);
    anc.edgeIds.forEach((id, i) => add(g.edgeById.get(id) as EvidenceEdge, 8 - Math.min(i, 6), i < 12));
  }

  // 3. Neighbourhood of every entity; events expand to their participants.
  const hops = options.hops ?? 1;
  for (const ent of entities) {
    const first = incidentEdges(g, ent.node.id);
    for (const e of first) {
      if (!isFactual(e)) continue;
      // A pure lineage question stays within kinship edges.
      if (lineageOnly && !KINSHIP.includes(e.type)) continue;
      const otherId = otherEnd(e, ent.node.id);
      const other = g.nodeById.get(otherId);
      const bothEntities = entities.some((x) => x.node.id === otherId);
      let score = bothEntities ? 6 : 3;
      if (intents.includes("event") && (e.type === "PARTICIPATES_IN" || e.type === "OCCURS_AT")) score += 2;
      if (intents.includes("lineage") && KINSHIP.includes(e.type)) score += 2;
      if (intents.includes("place") && (e.type === "OCCURS_AT" || e.type === "LOCATED_IN" || e.type === "RULER_OF")) score += 2;
      score += lexicalScore(g, e, qtoks);
      add(e, score);
      if ((hops === 2 || other?.kind === "event") && other) {
        for (const e2 of incidentEdges(g, otherId)) {
          if (!isFactual(e2) || e2.id === e.id) continue;
          add(e2, Math.max(1, score - 3) + lexicalScore(g, e2, qtoks));
        }
      }
    }
  }

  // 4. Lexical fallback across all factual edges.
  const lexical = g.edges
    .filter(isFactual)
    .map((e) => ({ e, s: lexicalScore(g, e, qtoks) }))
    .filter((x) => x.s >= (entities.length ? 2 : 1))
    .sort((x, y) => y.s - x.s)
    .slice(0, entities.length ? 6 : 12);
  for (const { e, s } of lexical) add(e, s);
  if (!entities.length && !lexical.length) notes.push("No entity in the question matched the graph, and no claim matched its words.");

  // 5. Rank, cap, tag.
  const ranked = [...picked.values()].sort((x, y) => Number(y.onPath) - Number(x.onPath) || y.score - x.score || x.edge.id.localeCompare(y.edge.id)).slice(0, maxClaims);
  const sourceOrder: string[] = [];
  const sourceTagOf = (id: string): string => {
    let i = sourceOrder.indexOf(id);
    if (i === -1) {
      sourceOrder.push(id);
      i = sourceOrder.length - 1;
    }
    return `S${i + 1}`;
  };
  const claims: PacketClaim[] = ranked.map((r, i) => ({
    tag: `C${i + 1}`,
    edge: r.edge,
    claimType: r.edge.claimType,
    statement: r.edge.summary,
    sourceTags: r.edge.sourceIds.map(sourceTagOf),
    onPath: r.onPath,
  }));
  for (const p of paths) {
    p.derived.tag = `D${paths.indexOf(p) + 1}`;
    p.derived.sourceTags = [...new Set(p.edgeIds.flatMap((id) => (g.edgeById.get(id) as EvidenceEdge).sourceIds))].map(sourceTagOf);
  }

  // 6. Readings, kept apart. A reading is attached when its subject is one of
  //    the linked entities; with an interpretive intent, anything in the
  //    packet (including the concept side) qualifies.
  const readings: PacketClaim[] = [];
  if (includeReadings) {
    const entityIds = new Set(entities.map((x) => x.node.id));
    const inPacket = new Set<string>(entityIds);
    for (const c of claims) {
      inPacket.add(c.edge.fromId);
      inPacket.add(c.edge.toId);
    }
    const wantAll = intents.includes("interpretive");
    for (const e of g.edges) {
      if (!isReading(e) || e.reviewerStatus === "REJECTED") continue;
      const attached = entityIds.has(e.fromId) || (wantAll && (inPacket.has(e.fromId) || inPacket.has(e.toId)));
      if (!attached) continue;
      readings.push({ tag: `R${readings.length + 1}`, edge: e, claimType: e.claimType, statement: e.summary, sourceTags: e.sourceIds.map(sourceTagOf), onPath: false });
    }
  }

  const sources: PacketSource[] = sourceOrder.map((id, i) => {
    const source = g.sourceById.get(id) as Source;
    return { tag: `S${i + 1}`, source, citation: citationLabel(source) };
  });

  const nodeSet = new Map<string, GraphNode>();
  for (const ent of entities) nodeSet.set(ent.node.id, ent.node);
  const edgeList = [...claims.map((c) => c.edge), ...readings.map((r) => r.edge)];
  for (const e of edgeList) {
    for (const id of [e.fromId, e.toId]) {
      const node = g.nodeById.get(id);
      if (node) nodeSet.set(id, node);
    }
  }

  return { question, intents, entities, claims, readings, sources, paths, subgraph: { nodes: [...nodeSet.values()], edges: edgeList }, notes };
}

/** Simple ranked search over node names and summaries for the explorer. */
export function searchNodes(g: Graph, query: string, limit = 20): GraphNode[] {
  const q = normalize(query);
  if (!q) return [];
  const qt = tokenize(query).map(stem);
  return g.nodes
    .map((n) => {
      const name = normalize(n.name);
      const aliases = (n.aliases ?? []).map(normalize);
      let score = 0;
      if (name === q || aliases.includes(q)) score += 10;
      else if (name.startsWith(q) || aliases.some((a) => a.startsWith(q))) score += 6;
      else if (name.includes(q) || aliases.some((a) => a.includes(q))) score += 4;
      const st = new Set(tokenize(n.summary).map(stem));
      for (const t of qt) if (st.has(t)) score += 1;
      return { n, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.n.name.localeCompare(b.n.name))
    .slice(0, limit)
    .map((x) => x.n);
}
