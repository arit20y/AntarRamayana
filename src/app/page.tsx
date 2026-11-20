import Link from "next/link";
import { ClaimBadge } from "@/components/ClaimBadge";
import { graph, isReading } from "@/graph/index";
import { ancestors } from "@/graph/retrieval";

const SAMPLE_QUESTIONS = [
  "How is Rama related to Ambarisha?",
  "Who were the parents of Hanuman?",
  "What happened at Panchavati?",
  "Why was Rama exiled for fourteen years?",
];

const STEPS = [
  { title: "Link", body: "Names, aliases and Devanagari in your question are matched to graph nodes. No guessing: a name either exists in the graph or it does not." },
  { title: "Retrieve", body: "Deterministic traversal finds paths, ancestors and neighbourhoods over approved edges only, then ranks them. The same question always yields the same evidence packet." },
  { title: "Explain", body: "A model, local to your browser or hosted, may write prose from the packet alone. Every sentence is checked for citations before you see it, and the packet is always shown beside the answer." },
];

export default function Home() {
  const rama = ancestors(graph, "rama");
  const readings = graph.edges.filter(isReading).slice(0, 3);
  const textual = graph.edges.filter((e) => e.claimType === "TEXTUAL").length;

  return (
    <main className="page-shell">
      <section className="hero">
        <span className="eyebrow">A living Ramayana knowledge graph</span>
        <h1 className="serif">Read the story.<br />Trace the world within it.</h1>
        <p>AntarRamayana is an evidence-led explorer of the Vālmīki Rāmāyaṇa. Lineages, places and events are stored as a graph in which every edge carries its verse, and questions are answered by retrieval first, with a model allowed only to explain what was retrieved.</p>
        <form action="/ask" method="get" className="ask-row hero-ask">
          <input name="q" placeholder="How is Rama related to Ambarisha?" aria-label="Ask a question" autoComplete="off" />
          <button type="submit" className="btn">Ask with evidence</button>
        </form>
        <div className="samples">
          {SAMPLE_QUESTIONS.map((q) => <Link key={q} href={`/ask?q=${encodeURIComponent(q)}`} className="sample">{q}</Link>)}
        </div>
      </section>

      <section className="grid overview" aria-label="How it works">
        <article className="card">
          <span className="eyebrow">Graph RAG, in three steps</span>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title}><span className="feature-number">0{i + 1}</span><h3 className="serif">{s.title}</h3><p>{s.body}</p></li>
            ))}
          </ol>
        </article>
        <aside className="card">
          <span className="eyebrow">Graph today</span>
          <h2 className="serif">Evidence before eloquence.</h2>
          <ul className="progress-list">
            <li><span className="dot" />{graph.nodes.length} nodes and {textual} textual edges, each checked against the Critical Edition e-text.</li>
            <li><span className="dot" />{graph.sources.length} verses quoted pāda by pāda, with vulgate concordance where verified.</li>
            <li><span className="dot" />{rama.edgeIds.length} recorded generations from Rāma back to Brahmā in Vasiṣṭha&apos;s recital.</li>
            <li><span className="dot" />Interpretations always name their source and are drawn differently from text.</li>
          </ul>
          <p className="small"><Link href="/sources">Sources and policy</Link> · <Link href="/graph">Explore the graph</Link></p>
        </aside>
      </section>

      <section>
        <div className="section-head">
          <h2 className="serif">Rāma&apos;s line, as Vasiṣṭha recites it</h2>
          <p>Each arrow is one approved CHILD_OF edge with its verse. Click a name to see its page and sources.</p>
        </div>
        <div className="card">
          <div className="route" aria-label="Ancestry of Rama">
            {rama.nodeIds.map((id, i) => {
              const n = graph.nodeById.get(id);
              return (
                <span key={id} style={{ display: "contents" }}>
                  <Link href={`/graph/${id}`} className="route-node" title={n?.summary}>{n?.name.replace(/\s*\(.*?\)/, "")}</Link>
                  {i < rama.nodeIds.length - 1 ? <span className="route-arrow" aria-hidden="true">←</span> : null}
                </span>
              );
            })}
          </div>
          <p><span className="citation">VR-CE 1.69.17–30</span> <span className="muted small">(vulgate 1.70.19–43)</span></p>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2 className="serif">Inner Ramayana</h2>
          <p>Readings and reflection prompts live in the same graph as the text, but as a different claim type, by a named source, never as what Vālmīki says.</p>
        </div>
        <div className="grid feature-grid">
          {readings.map((r) => (
            <article className="card feature" key={r.id}>
              <ClaimBadge claimType={r.claimType} status={r.reviewerStatus} />
              <h3 className="serif">{graph.nodeById.get(r.toId)?.name}</h3>
              <p>{r.summary}</p>
              <p className="small muted">{r.interpreter?.name} · {r.interpreter?.tradition}</p>
              <p className="small"><Link href={`/graph/${r.fromId}`}>{graph.nodeById.get(r.fromId)?.name}</Link></p>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer"><span>AntarRamayana · evidence graph v0.2</span><span>Base edition: Critical Edition (Baroda) via the Tokunaga/Smith e-text</span></footer>
    </main>
  );
}
