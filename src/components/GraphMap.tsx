"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EvidenceEdge, GraphNode } from "@/graph/types";
import { RELATION_LABELS } from "@/graph/types";

/**
 * Evidence globe. Nodes sit on a sphere ordered by graph distance from the
 * focus: the focus faces the viewer, each further hop sits deeper around the
 * globe. On every data change the sphere grows from the centre and the hops
 * appear one after another, so a reader watches the evidence expand outward.
 * The globe turns slowly on its own and can be dragged.
 *
 * Animation values live in state that only the frame loop writes, so render
 * is a pure function of props and state; the globe is drawn after mount so
 * server and client HTML always agree.
 */

type Props = {
  nodes: GraphNode[];
  edges: EvidenceEdge[];
  focusIds?: string[];
  highlightEdgeIds?: string[];
  height?: number;
  linkNodes?: boolean;
};

type V3 = { x: number; y: number; z: number };
type Anim = { ready: boolean; yaw: number; pitch: number; t: number; reduce: boolean };

const WIDTH = 800;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const GROW_MS = 1600;
const HOP_MS = 420;
const FADE_MS = 520;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function bfsDepths(nodes: GraphNode[], edges: EvidenceEdge[], roots: string[]): Map<string, number> {
  const ids = new Set(nodes.map((n) => n.id));
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!ids.has(e.fromId) || !ids.has(e.toId)) continue;
    adj.set(e.fromId, [...(adj.get(e.fromId) ?? []), e.toId]);
    adj.set(e.toId, [...(adj.get(e.toId) ?? []), e.fromId]);
  }
  const depth = new Map<string, number>();
  let queue = roots.filter((r) => ids.has(r));
  if (!queue.length && nodes.length) {
    const best = [...nodes].sort((a, b) => (adj.get(b.id)?.length ?? 0) - (adj.get(a.id)?.length ?? 0))[0];
    queue = [best.id];
  }
  for (const r of queue) depth.set(r, 0);
  while (queue.length) {
    const cur = queue.shift() as string;
    const d = depth.get(cur) as number;
    for (const next of adj.get(cur) ?? []) {
      if (depth.has(next)) continue;
      depth.set(next, d + 1);
      queue.push(next);
    }
  }
  let max = 0;
  for (const d of depth.values()) max = Math.max(max, d);
  for (const n of nodes) if (!depth.has(n.id)) depth.set(n.id, max + 1);
  return depth;
}

/** Fibonacci sphere, front pole first, ordered by hop depth then name. */
function placeOnSphere(nodes: GraphNode[], depth: Map<string, number>): Map<string, V3> {
  const ordered = [...nodes].sort((a, b) => (depth.get(a.id) ?? 0) - (depth.get(b.id) ?? 0) || a.name.localeCompare(b.name));
  const n = ordered.length;
  const out = new Map<string, V3>();
  ordered.forEach((node, i) => {
    if (n === 1) {
      out.set(node.id, { x: 0, y: 0, z: 1 });
      return;
    }
    const z = 1 - 1.85 * ((i + 0.5) / n);
    const r = Math.sqrt(Math.max(0, 1 - z * z));
    const theta = i * GOLDEN;
    out.set(node.id, { x: r * Math.cos(theta), y: r * Math.sin(theta), z });
  });
  return out;
}

function rotate(p: V3, yaw: number, pitch: number): V3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = p.x * cy + p.z * sy;
  const z1 = -p.x * sy + p.z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const y2 = p.y * cp - z1 * sp;
  const z2 = p.y * sp + z1 * cp;
  return { x: x1, y: y2, z: z2 };
}

const fmt = (v: number) => Math.round(v * 10) / 10;

export function GraphMap({ nodes, edges, focusIds = [], highlightEdgeIds = [], height = 480, linkNodes = true }: Props) {
  const cx = WIDTH / 2;
  const cy = height / 2;
  const R = Math.min(WIDTH, height) * 0.42;
  const focal = R * 3.2;

  const depth = useMemo(() => bfsDepths(nodes, edges, focusIds), [nodes, edges, focusIds]);
  const base = useMemo(() => placeOnSphere(nodes, depth), [nodes, depth]);
  const maxDepth = useMemo(() => Math.max(0, ...[...depth.values()]), [depth]);

  const [hover, setHover] = useState<string | null>(null);
  const [anim, setAnim] = useState<Anim>({ ready: false, yaw: 0, pitch: 0.28, t: 0, reduce: false });

  // Mutable animation inputs, written by the loop and pointer handlers only.
  const startRef = useRef<number>(0);
  const autoYawRef = useRef(0);
  const userYawRef = useRef(0);
  const pitchRef = useRef(0.28);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const idleRef = useRef(0);

  // Restart the expansion whenever the data changes.
  useEffect(() => {
    startRef.current = performance.now();
    autoYawRef.current = 0;
  }, [nodes, edges]);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let raf = 0;
    let last = 0;
    const loop = () => {
      const now = performance.now();
      raf = requestAnimationFrame(loop);
      // ~30 fps is plenty for a slow turn and halves the React work.
      if (now - last < 32) return;
      last = now;
      if (!dragRef.current && now > idleRef.current && !reduce) autoYawRef.current += 0.0064;
      setAnim({ ready: true, yaw: autoYawRef.current + userYawRef.current, pitch: pitchRef.current, t: now - startRef.current, reduce });
    };
    // First frame from a timer so a hidden tab still paints a static globe.
    const timer = setTimeout(loop, 0);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!nodes.length) return <div className="map-empty">No graph nodes to draw yet.</div>;

  const grow = anim.reduce ? 1 : easeOutCubic(Math.min(1, anim.t / GROW_MS));
  const focus = new Set(focusIds);
  const highlight = new Set(highlightEdgeIds);

  type Projected = { node: GraphNode; x: number; y: number; z: number; s: number; alpha: number; reveal: number };
  const projected = new Map<string, Projected>();
  if (anim.ready) {
    for (const n of nodes) {
      const p = rotate(base.get(n.id) as V3, anim.yaw, anim.pitch);
      const d = depth.get(n.id) ?? 0;
      const reveal = anim.reduce ? 1 : Math.max(0, Math.min(1, (anim.t - d * HOP_MS) / FADE_MS));
      const radius = R * grow;
      const z = p.z * radius;
      const s = focal / (focal - z);
      const depthCue = 0.3 + 0.7 * ((p.z + 1) / 2);
      projected.set(n.id, { node: n, x: fmt(cx + p.x * radius * s), y: fmt(cy + p.y * radius * s), z, s, alpha: reveal * depthCue, reveal });
    }
  }

  const neighbours = new Set<string>();
  if (hover) for (const e of edges) if (e.fromId === hover || e.toId === hover) neighbours.add(e.fromId === hover ? e.toId : e.fromId);

  const drawnNodes = [...projected.values()].sort((a, b) => a.z - b.z);
  const drawnEdges = edges
    .map((e) => ({ e, a: projected.get(e.fromId), b: projected.get(e.toId) }))
    .filter((x): x is { e: EvidenceEdge; a: Projected; b: Projected } => Boolean(x.a && x.b))
    .sort((x, y) => Math.min(x.a.z, x.b.z) - Math.min(y.a.z, y.b.z));

  // Faint graticule so the sphere reads as a globe.
  const graticule: string[] = [];
  if (anim.ready) {
    const sample = (fn: (k: number) => V3) => {
      let d = "";
      let pen = false;
      for (let k = 0; k <= 64; k += 1) {
        const p = rotate(fn(k / 64), anim.yaw, anim.pitch);
        if (p.z < -0.05) {
          pen = false;
          continue;
        }
        const z = p.z * R * grow;
        const s = focal / (focal - z);
        d += `${pen ? "L" : "M"}${fmt(cx + p.x * R * grow * s)},${fmt(cy + p.y * R * grow * s)}`;
        pen = true;
      }
      if (d) graticule.push(d);
    };
    for (let m = 0; m < 6; m += 1) {
      const lon = (m / 6) * Math.PI;
      sample((u) => {
        const a = u * Math.PI * 2;
        return { x: Math.cos(a) * Math.cos(lon), y: Math.sin(a), z: Math.cos(a) * Math.sin(lon) };
      });
    }
    for (const lat of [-0.6, -0.3, 0, 0.3, 0.6]) {
      const r = Math.cos(lat * Math.PI * 0.7);
      const y = Math.sin(lat * Math.PI * 0.7);
      sample((u) => {
        const a = u * Math.PI * 2;
        return { x: Math.cos(a) * r, y, z: Math.sin(a) * r };
      });
    }
  }

  const onPointerDown = (ev: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current = { x: ev.clientX, y: ev.clientY };
    ev.currentTarget.setPointerCapture?.(ev.pointerId);
  };
  const onPointerMove = (ev: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const dx = ev.clientX - dragRef.current.x;
    const dy = ev.clientY - dragRef.current.y;
    dragRef.current = { x: ev.clientX, y: ev.clientY };
    userYawRef.current += dx * 0.007;
    pitchRef.current = Math.max(-1.2, Math.min(1.2, pitchRef.current - dy * 0.007));
  };
  const onPointerUp = () => {
    dragRef.current = null;
    idleRef.current = performance.now() + 2500;
  };

  const labelFor = (n: GraphNode) => n.name.replace(/\s*\(.*?\)/, "");
  const shown = drawnNodes.filter((p) => p.reveal > 0).length;
  const labelBudget = nodes.length <= 30 ? 2 : nodes.length <= 50 ? 1 : 0;

  return (
    <figure className="map">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={`Evidence globe: ${nodes.length} nodes within ${maxDepth} hops`}
        className="map-svg globe"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <defs>
          <radialGradient id="globe-shade" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="var(--globe-hi)" />
            <stop offset="70%" stopColor="var(--globe-mid)" />
            <stop offset="100%" stopColor="var(--globe-lo)" />
          </radialGradient>
        </defs>
        {anim.ready ? <circle cx={cx} cy={cy} r={fmt(R * grow)} fill="url(#globe-shade)" className="globe-body" /> : null}
        {graticule.map((d, i) => <path key={i} d={d} className="globe-grid" />)}
        {drawnEdges.map(({ e, a, b }) => {
          const alpha = Math.min(a.alpha, b.alpha) * (hover && !(e.fromId === hover || e.toId === hover) ? 0.15 : 1);
          if (alpha <= 0.01) return null;
          const hi = highlight.has(e.id);
          return (
            <g key={e.id} className={`map-edge map-edge-${e.claimType.toLowerCase()} ${hi ? "map-edge-hi" : ""}`} style={{ opacity: alpha }}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
              <title>{`${e.summary} (${e.claimType})`}</title>
              {(hi || hover === e.fromId || hover === e.toId) && (
                <text x={fmt((a.x + b.x) / 2)} y={fmt((a.y + b.y) / 2 - 4)} className="map-edge-label">{RELATION_LABELS[e.type]}</text>
              )}
            </g>
          );
        })}
        {drawnNodes.map((p) => {
          if (p.reveal <= 0) return null;
          const n = p.node;
          const isFocus = focus.has(n.id);
          const d = depth.get(n.id) ?? 0;
          const dim = hover ? !(hover === n.id || neighbours.has(n.id)) : false;
          const r = fmt((isFocus ? 11 : n.kind === "person" ? 7.5 : 6.5) * p.s);
          const front = p.z > -R * 0.15;
          const showLabel = isFocus || hover === n.id || neighbours.has(n.id) || (front && d <= labelBudget);
          const body = (
            <g
              className={`map-node map-node-${n.kind} ${isFocus ? "map-focus" : ""}`}
              transform={`translate(${p.x},${p.y})`}
              style={{ opacity: dim ? 0.18 : fmt(p.alpha) }}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${n.name}: ${n.summary}`}</title>
              {n.kind === "event" ? <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={3} /> : n.kind === "concept" ? <polygon points={`0,${-r - 2} ${r + 2},0 0,${r + 2} ${-r - 2},0`} /> : <circle r={r} />}
              {showLabel ? <text y={fmt(r + 12 * p.s)} textAnchor="middle" className="map-label" style={{ fontSize: fmt(11 * p.s) }}>{labelFor(n)}</text> : null}
            </g>
          );
          return linkNodes ? <Link key={n.id} href={`/graph/${n.id}`}>{body}</Link> : <g key={n.id}>{body}</g>;
        })}
      </svg>
      <figcaption className="map-legend">
        <span><i className="sw sw-person" /> person</span>
        <span><i className="sw sw-place" /> place</span>
        <span><i className="sw sq sw-event" /> event</span>
        <span><i className="sw sw-concept" /> concept</span>
        <span><i className="ln ln-textual" /> textual</span>
        <span><i className="ln ln-interpretive" /> interpretive</span>
        <span><i className="ln ln-reflective" /> reflection</span>
        <span className="map-count">{shown}/{nodes.length} nodes · {maxDepth} hop{maxDepth === 1 ? "" : "s"}</span>
      </figcaption>
    </figure>
  );
}
