import type { Metadata } from "next";
import Link from "next/link";
import { SourceQuote } from "@/components/SourceQuote";
import { editions } from "@/graph/editions";
import { graph } from "@/graph/index";
import type { Source } from "@/graph/types";
import { KANDA_NAMES } from "@/graph/types";

export const metadata: Metadata = {
  title: "Sources · AntarRamayana",
  description: "Base edition, source policy, and every verse the graph cites.",
};

export default function SourcesPage() {
  const byKanda = new Map<number, Source[]>();
  for (const s of [...graph.sources].sort((a, b) => a.ref.kanda - b.ref.kanda || a.ref.sarga - b.ref.sarga || a.ref.verse - b.ref.verse)) {
    const arr = byKanda.get(s.ref.kanda) ?? [];
    arr.push(s);
    byKanda.set(s.ref.kanda, arr);
  }
  const citedBy = new Map<string, number>();
  for (const e of graph.edges) for (const id of e.sourceIds) citedBy.set(id, (citedBy.get(id) ?? 0) + 1);
  const counts = {
    textual: graph.edges.filter((e) => e.claimType === "TEXTUAL").length,
    interpretive: graph.edges.filter((e) => e.claimType === "INTERPRETIVE").length,
    reflective: graph.edges.filter((e) => e.claimType === "REFLECTIVE").length,
    candidate: graph.edges.filter((e) => e.reviewerStatus === "CANDIDATE").length,
  };

  return (
    <main className="page-shell">
      <section className="page-head">
        <span className="eyebrow">Sources</span>
        <h1 className="serif">One base edition, every verse quoted.</h1>
        <p className="lede">The graph cites the Critical Edition by kāṇḍa, sarga and verse, and quotes the exact pādas it relies on. Vulgate numbering is given where it has been checked. The full policy is in the repository&apos;s <code>docs/SOURCE_POLICY.md</code>.</p>
      </section>

      <div className="grid overview">
        <section className="card">
          <span className="eyebrow">Editions</span>
          {editions.map((ed) => (
            <div key={ed.id} className="edition">
              <h2 className="serif">{ed.title} <span className="citation">{ed.citationPrefix}</span></h2>
              <p className="muted">{ed.publisher}, {ed.years} · role: {ed.role}</p>
              {ed.etext ? (
                <p className="small">
                  E-text: <a href={ed.etext.url} rel="noreferrer" target="_blank">{ed.etext.title}</a>, prepared by {ed.etext.preparedBy}. {ed.etext.note}
                </p>
              ) : null}
            </div>
          ))}
        </section>
        <aside className="card">
          <span className="eyebrow">Graph status</span>
          <ul className="progress-list">
            <li><span className="dot" />{graph.nodes.length} nodes, {graph.edges.length} edges, {graph.sources.length} sources</li>
            <li><span className="dot" />{counts.textual} textual edges, all checked against the base e-text</li>
            <li><span className="dot" />{counts.interpretive} interpretive and {counts.reflective} reflective edges, each with a named interpreter</li>
            <li><span className="dot" />{counts.candidate} edges still marked candidate (attribution pending review)</li>
          </ul>
          <p className="small"><Link href="/graph">Browse the graph</Link> or <Link href="/ask">ask a question</Link>.</p>
        </aside>
      </div>

      {[...byKanda.entries()].map(([kanda, list]) => (
        <section key={kanda}>
          <div className="section-head">
            <h2 className="serif">{KANDA_NAMES[kanda as keyof typeof KANDA_NAMES]}</h2>
            <p>{list.length} verses cited</p>
          </div>
          <div className="card">
            {list.map((s) => (
              <div key={s.id}>
                <SourceQuote source={s} />
                <p className="muted small" style={{ marginTop: -6 }}>Cited by {citedBy.get(s.id) ?? 0} edge{(citedBy.get(s.id) ?? 0) === 1 ? "" : "s"}.</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
