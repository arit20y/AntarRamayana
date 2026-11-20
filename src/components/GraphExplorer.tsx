"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { graph, incidentEdges, isFactual, isReading, otherEnd } from "@/graph/index";
import { searchNodes } from "@/graph/retrieval";
import type { EvidenceEdge, GraphNode, NodeKind } from "@/graph/types";
import { GraphMap } from "./GraphMap";

const KINDS: { kind: NodeKind | "all"; label: string }[] = [
  { kind: "all", label: "All" },
  { kind: "person", label: "People" },
  { kind: "place", label: "Places" },
  { kind: "event", label: "Events" },
  { kind: "concept", label: "Concepts" },
];

const GROUP_LABEL: Record<string, string> = {
  ikshvaku: "Ikṣvāku line",
  videha: "Videha line",
  rakshasa: "Rākṣasas",
  vanara: "Vānaras",
  rishi: "Sages",
  deva: "Devas",
  other: "Others",
};

/** Breadth-first expansion from a focus node, capped so the globe stays legible. */
function expandFrom(focus: string, maxDepth: number, maxNodes = 80): { nodes: GraphNode[]; edges: EvidenceEdge[] } {
  const depth = new Map<string, number>([[focus, 0]]);
  const queue = [focus];
  while (queue.length && depth.size < maxNodes) {
    const cur = queue.shift() as string;
    const d = depth.get(cur) as number;
    if (d >= maxDepth) continue;
    for (const e of incidentEdges(graph, cur)) {
      if (!isFactual(e)) continue;
      const next = otherEnd(e, cur);
      if (depth.has(next)) continue;
      if (depth.size >= maxNodes) break;
      depth.set(next, d + 1);
      queue.push(next);
    }
  }
  const edges: EvidenceEdge[] = [];
  const seen = new Set<string>();
  for (const id of depth.keys()) {
    for (const e of incidentEdges(graph, id)) {
      if (seen.has(e.id)) continue;
      if (isFactual(e) && depth.has(e.fromId) && depth.has(e.toId)) {
        seen.add(e.id);
        edges.push(e);
      } else if (isReading(e) && depth.get(e.fromId) === 0) {
        // Readings about the focus node itself, drawn apart from facts.
        seen.add(e.id);
        edges.push(e);
        if (!depth.has(e.toId)) depth.set(e.toId, maxDepth + 1);
      }
    }
  }
  return { nodes: [...depth.keys()].map((id) => graph.nodeById.get(id) as GraphNode), edges };
}

export function GraphExplorer() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<NodeKind | "all">("all");
  const [focus, setFocus] = useState<string>("rama");
  const [hops, setHops] = useState<1 | 2 | 3>(2);
  const inputRef = useRef<HTMLInputElement>(null);

  // Text typed before hydration lives only in the DOM; adopt it once mounted.
  useEffect(() => {
    const typed = inputRef.current?.value ?? "";
    if (!typed) return;
    const timer = setTimeout(() => setQuery(typed), 0);
    return () => clearTimeout(timer);
  }, []);

  const list = useMemo(() => {
    const base = query.trim() ? searchNodes(graph, query, 200) : graph.nodes;
    return base.filter((n) => kind === "all" || n.kind === kind);
  }, [query, kind]);

  const grouped = useMemo(() => {
    const map = new Map<string, GraphNode[]>();
    for (const n of list) {
      const key = n.kind === "person" ? GROUP_LABEL[n.group ?? "other"] : n.kind;
      const arr = map.get(key) ?? [];
      arr.push(n);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [list]);

  const neighbourhood = useMemo(() => expandFrom(focus, hops), [focus, hops]);
  const focusNode = graph.nodeById.get(focus);
  const plainName = focusNode?.name.replace(/\s*\(.*?\)/, "") ?? "";

  return (
    <div className="explorer">
      <aside className="explorer-list card">
        <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search names, aliases, Devanagari…" aria-label="Search the graph" />
        <div className="tabs">
          {KINDS.map((k) => (
            <button key={k.kind} type="button" className={`tab ${kind === k.kind ? "active" : ""}`} onClick={() => setKind(k.kind)}>{k.label}</button>
          ))}
        </div>
        <p className="muted small">{list.length} of {graph.nodes.length} nodes · {graph.edges.length} edges · {graph.sources.length} sources</p>
        {list.length === 0 ? (
          <div className="empty">
            <p><strong>No node matches “{query.trim()}”.</strong></p>
            <p className="muted small">The graph holds only figures, places and events with a checked verse behind them. Try another spelling, or ask the question and retrieval will fall back to matching the words of claims.</p>
            <Link className="chip" href={`/ask?q=${encodeURIComponent(query.trim())}`}>Ask “{query.trim()}”</Link>
          </div>
        ) : null}
        {grouped.map(([label, items]) => (
          <div key={label} className="group">
            <h3 className="eyebrow">{label}</h3>
            <ul className="node-list">
              {items.map((n) => (
                <li key={n.id}>
                  <button type="button" className={`node-btn ${focus === n.id ? "active" : ""}`} onClick={() => setFocus(n.id)} onMouseEnter={() => setFocus(n.id)}>
                    <span className={`dot dot-${n.kind}`} />
                    <span>{n.name}</span>
                    {n.devanagari ? <span lang="sa" className="muted deva-inline">{n.devanagari}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>
      <section className="explorer-map card">
        {focusNode ? (
          <>
            <div className="explorer-head">
              <div>
                <span className="eyebrow">{focusNode.kind}</span>
                <h2 className="serif">{focusNode.name}</h2>
                <p className="muted">{focusNode.summary}</p>
              </div>
              <div className="hops" role="group" aria-label="Expansion depth">
                {[1, 2, 3].map((h) => (
                  <button key={h} type="button" className={`tab ${hops === h ? "active" : ""}`} onClick={() => setHops(h as 1 | 2 | 3)}>{h} hop{h > 1 ? "s" : ""}</button>
                ))}
              </div>
            </div>
            <div className="chips">
              <Link className="chip" href={`/graph/${focusNode.id}`}>Open page</Link>
              <Link className="chip" href={`/ask?q=${encodeURIComponent(`Tell me about ${plainName}`)}`}>Ask with evidence</Link>
              {focusNode.kind === "person" ? <Link className="chip" href={`/ask?q=${encodeURIComponent(`Trace the lineage of ${plainName}`)}`}>Trace lineage</Link> : null}
            </div>
          </>
        ) : null}
        <GraphMap nodes={neighbourhood.nodes} edges={neighbourhood.edges} focusIds={[focus]} height={520} />
        <p className="muted small">{neighbourhood.nodes.length} nodes within {hops} hop{hops > 1 ? "s" : ""} of {plainName}. Drag to turn the globe; hover a node to isolate its links.</p>
      </section>
    </div>
  );
}
