"use client";

import { useState } from "react";
import { featureCards, ramaToAmbarisha as route, sourceVerified } from "@/data/lineage";

type Lens = { title: string; body: string; citation: string; guardrail: string };
type LensName = "Textual" | "Philosophical" | "Modern reflection";

const lenses: Record<LensName, Lens> = {
  Textual: {
    title: "The textual lens",
    body: "Start with what the selected edition explicitly says. A lineage edge is shown only with its exact source passage and edition label.",
    citation: "Valmiki Ramayana · Bāla Kāṇḍa 1.70.42–43",
    guardrail: "This establishes the stated lineage in this textual context. It does not, by itself, resolve all same-name or cross-tradition questions.",
  },
  Philosophical: {
    title: "The philosophical lens",
    body: "An episode can be read alongside named philosophical sources—such as the Upanishads or Bhagavad Gita—to explore questions of dharma, mind, discernment, and witness-consciousness.",
    citation: "Named source required for every interpretation",
    guardrail: "An interpretation is not a literal claim made by the Valmiki text. The app will always label it as a reading and name its source or author.",
  },
  "Modern reflection": {
    title: "The modern reflection lens",
    body: "A user can connect an episode to contemporary life—distraction, grief, leadership, fear, or responsibility—without confusing reflection with scripture or science.",
    citation: "Reflection prompt · no factual claim implied",
    guardrail: "Modern psychological or scientific language will be used carefully. The app will distinguish metaphor, interpretation, and independently supported evidence.",
  },
};

export default function Home() {
  const [activeLens, setActiveLens] = useState<LensName>("Textual");
  const lens = lenses[activeLens];

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">अ</div>
          <div><p className="brand-title serif">AntarRamayana</p><p className="brand-subtitle">Text · lineage · interpretation · evidence</p></div>
        </div>
        <span className="status">Foundation build</span>
      </header>

      <section className="hero">
        <span className="eyebrow">A living Ramayana knowledge graph</span>
        <h1 className="serif">Read the story.<br />Trace the world within it.</h1>
        <p>AntarRamayana will bring the complete Valmiki Ramayana together with source-aware lineages, events, places, and philosophical readings—without making interpretation look like textual fact.</p>
        <div className="pill-row"><span className="pill">Full corpus, shard by shard</span><span className="pill">Evidence-backed graph</span><span className="pill">Browser-side LLM</span><span className="pill">Free-to-host architecture</span></div>
      </section>

      <section className="grid overview" aria-label="Project foundation">
        <article className="card"><span className="eyebrow">First graph route</span><h2 className="serif">Rama → Ambarisha, via Yayati</h2><p>This seed route demonstrates the standard every future graph edge must meet: a typed relationship and a visible source.</p><div className="route" aria-label="Lineage route from Rama to Ambarisha">{route.map((person, index) => <div key={person.id} style={{ display: "contents" }}><span className="route-node" title={person.relationToNext ? `${person.name} — ${person.relationToNext} ${route[index + 1].name} · ${person.source}` : `${person.name} · ${person.source}`}>{person.name} <span lang="sa">{person.devanagari}</span></span>{index < route.length - 1 && <span className="route-arrow" aria-hidden="true">←</span>}</div>)}</div><p><span className="citation">Valmiki Ramayana · Bāla Kāṇḍa 1.70.41–43</span>{!sourceVerified && <span className="citation" style={{ marginLeft: 8 }}>Verse numbers pending edition check</span>}</p></article>
        <aside className="card"><span className="eyebrow">Build principle</span><h2 className="serif">Evidence before eloquence.</h2><ul className="progress-list"><li><span className="dot" />The graph retrieves claims and sources first.</li><li><span className="dot" />The LLM explains only the retrieved evidence.</li><li><span className="dot" />Interpretive readings are visibly distinct from source text.</li></ul></aside>
      </section>

      <section><div className="section-head"><h2 className="serif">The complete experience</h2><p>The launch is designed around the whole corpus; this foundation makes each public feature source-aware and scalable.</p></div><div className="grid feature-grid">{featureCards.map((feature, index) => <article className="card feature" key={feature.title}><span className="feature-number">0{index + 1}</span><h3 className="serif">{feature.title}</h3><p>{feature.description}</p></article>)}</div></section>

      <section><div className="section-head"><h2 className="serif">Inner Ramayana</h2><p>A guided space for philosophical and personal readings, always with the boundary between source, interpretation, and reflection intact.</p></div><div className="card lab"><aside className="lab-aside"><span className="eyebrow" style={{ color: "#f2cb75" }}>Choose a lens</span><h2 className="serif">One story, many careful ways of reading.</h2>{(Object.keys(lenses) as LensName[]).map((name) => <button className={`lens ${activeLens === name ? "active" : ""}`} key={name} onClick={() => setActiveLens(name)}>{name}</button>)}</aside><article className="lab-main"><span className="eyebrow">{activeLens}</span><h3 className="serif">{lens.title}</h3><p className="claim">{lens.body}</p><span className="citation">{lens.citation}</span><p className="guardrail"><strong>Boundary:</strong> {lens.guardrail}</p></article></div></section>

      <footer className="footer"><span>AntarRamayana · early foundation</span><span>Corpus and source review in progress</span></footer>
    </main>
  );
}
