import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClaimBadge } from "@/components/ClaimBadge";
import { GraphMap } from "@/components/GraphMap";
import { SourceQuote } from "@/components/SourceQuote";
import { graph, incidentEdges, isFactual, isReading, otherEnd } from "@/graph/index";
import { ancestors } from "@/graph/retrieval";
import type { EvidenceEdge, GraphNode, Source } from "@/graph/types";
import { RELATION_LABELS } from "@/graph/types";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return graph.nodes.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const node = graph.nodeById.get(id);
  return { title: node ? `${node.name} · AntarRamayana` : "Not found", description: node?.summary };
}

const INVERSE: Record<string, string> = {
  CHILD_OF: "parent of",
  SPOUSE_OF: "spouse of",
  SIBLING_OF: "sibling of",
  ALLY_OF: "ally of",
  KILLED: "killed by",
  ABDUCTED: "abducted by",
  RULER_OF: "ruled by",
  LOCATED_IN: "contains",
  PARTICIPATES_IN: "involves",
  OCCURS_AT: "site of",
  INTERPRETED_AS: "reading of",
  REFLECTED_AS: "reflection on",
};

function Relation({ e, self }: { e: EvidenceEdge; self: string }) {
  const outgoing = e.fromId === self;
  const other = graph.nodeById.get(otherEnd(e, self)) as GraphNode;
  return (
    <li className={`relation claim-${e.claimType.toLowerCase()}`}>
      <div className="relation-row">
        <span className="relation-label">{outgoing ? RELATION_LABELS[e.type] : INVERSE[e.type]}</span>
        <Link href={`/graph/${other.id}`} className="relation-target">{other.name}</Link>
        <ClaimBadge claimType={e.claimType} status={e.reviewerStatus} />
      </div>
      <p className="muted">{e.summary}</p>
      {e.interpreter ? <p className="small">Reading by <strong>{e.interpreter.name}</strong> · {e.interpreter.tradition}</p> : null}
      {e.note ? <p className="note">{e.note}</p> : null}
      <p className="small">
        {e.sourceIds.map((id) => (
          <a key={id} href={`#src-${id}`} className="citation" style={{ marginRight: 6 }}>{`VR-CE ${id}`}</a>
        ))}
      </p>
    </li>
  );
}

export default async function NodePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const node = graph.nodeById.get(id);
  if (!node) notFound();
  const edges = incidentEdges(graph, id);
  const facts = edges.filter(isFactual);
  const readings = edges.filter(isReading);
  const sourceIds = [...new Set(edges.flatMap((e) => e.sourceIds))];
  const sources = sourceIds.map((s) => graph.sourceById.get(s) as Source).sort((a, b) => a.ref.kanda - b.ref.kanda || a.ref.sarga - b.ref.sarga || a.ref.verse - b.ref.verse);
  const mapIds = new Set<string>([id]);
  for (const e of edges) mapIds.add(otherEnd(e, id));
  const mapNodes = [...mapIds].map((x) => graph.nodeById.get(x) as GraphNode);
  const anc = node.kind === "person" ? ancestors(graph, id) : { nodeIds: [id], edgeIds: [] };
  const plainName = node.name.replace(/\s*\(.*?\)/, "");

  return (
    <main className="page-shell">
      <section className="page-head">
        <span className="eyebrow">{node.kind}{node.group ? ` · ${node.group}` : ""}</span>
        <h1 className="serif">{node.name} {node.devanagari ? <span lang="sa" className="deva">{node.devanagari}</span> : null}</h1>
        <p className="lede">{node.summary}</p>
        {node.aliases?.length ? <p className="muted small">Also: {node.aliases.join(", ")}</p> : null}
        <div className="chips">
          <Link className="chip" href={`/ask?q=${encodeURIComponent(`Tell me about ${plainName}`)}`}>Ask with evidence</Link>
          {node.kind === "person" ? <Link className="chip" href={`/ask?q=${encodeURIComponent(`Trace the lineage of ${plainName}`)}`}>Trace lineage</Link> : null}
          <Link className="chip" href="/graph">Back to explorer</Link>
        </div>
      </section>

      <div className="node-grid">
        <section className="card">
          <span className="eyebrow">Relations</span>
          {facts.length ? <ul className="relations">{facts.map((e) => <Relation key={e.id} e={e} self={id} />)}</ul> : <p className="muted">No approved relations yet.</p>}
          {readings.length ? (
            <>
              <span className="eyebrow" style={{ marginTop: 18, display: "block" }}>Readings (not textual facts)</span>
              <ul className="relations">{readings.map((e) => <Relation key={e.id} e={e} self={id} />)}</ul>
            </>
          ) : null}
        </section>
        <aside>
          <section className="card">
            <span className="eyebrow">Neighbourhood</span>
            <GraphMap nodes={mapNodes} edges={edges} focusIds={[id]} height={340} />
          </section>
          {anc.nodeIds.length > 1 ? (
            <section className="card" style={{ marginTop: 20 }}>
              <span className="eyebrow">Ancestry (derived from CHILD_OF edges)</span>
              <div className="route">
                {anc.nodeIds.map((nid, i) => (
                  <span key={nid} style={{ display: "contents" }}>
                    <Link href={`/graph/${nid}`} className="route-node">{graph.nodeById.get(nid)?.name.replace(/\s*\(.*?\)/, "")}</Link>
                    {i < anc.nodeIds.length - 1 ? <span className="route-arrow" aria-hidden="true">←</span> : null}
                  </span>
                ))}
              </div>
              <p className="muted small">{anc.edgeIds.length} generations recorded; each arrow is one approved textual edge.</p>
            </section>
          ) : null}
        </aside>
      </div>

      <section className="card" style={{ marginTop: 20 }}>
        <span className="eyebrow">Sources cited on this page</span>
        {sources.map((s) => <SourceQuote key={s.id} source={s} />)}
      </section>
    </main>
  );
}
