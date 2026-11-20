import type { Metadata } from "next";
import { GraphExplorer } from "@/components/GraphExplorer";

export const metadata: Metadata = {
  title: "Graph explorer · AntarRamayana",
  description: "Browse every person, place and event in the evidence graph and the verses behind each relation.",
};

export default function GraphPage() {
  return (
    <main className="page-shell">
      <section className="page-head">
        <span className="eyebrow">Evidence graph</span>
        <h1 className="serif">Every edge carries its verse.</h1>
        <p className="lede">Hover a name to draw its neighbourhood. Solid lines are textual claims checked against the base edition; dashed lines are named interpretations and are never shown as fact.</p>
      </section>
      <GraphExplorer />
    </main>
  );
}
