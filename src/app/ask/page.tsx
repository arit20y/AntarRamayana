import type { Metadata } from "next";
import { Suspense } from "react";
import { AskClient } from "@/components/AskClient";

export const metadata: Metadata = {
  title: "Ask with evidence · AntarRamayana",
  description: "Graph retrieval selects approved claims and sources first; a model may explain only what was retrieved.",
};

export default function AskPage() {
  return (
    <main className="page-shell">
      <section className="page-head">
        <span className="eyebrow">Graph RAG</span>
        <h1 className="serif">Ask the graph, not the model.</h1>
        <p className="lede">Your question is linked to people, places and events in the evidence graph. Deterministic retrieval assembles an evidence packet of approved claims with their verses. Only then may a model write an explanation, and every sentence it writes is checked for citations.</p>
      </section>
      <Suspense fallback={<p className="muted">Loading…</p>}>
        <AskClient />
      </Suspense>
    </main>
  );
}
