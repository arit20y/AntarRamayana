import { citationLabel } from "@/graph/index";
import type { Source } from "@/graph/types";
import { KANDA_NAMES } from "@/graph/types";

export function SourceQuote({ source, tag }: { source: Source; tag?: string }) {
  return (
    <div className="source-quote" id={`src-${source.id}`}>
      <div className="source-head">
        {tag ? <span className="tag">{tag}</span> : null}
        <span className="citation">{citationLabel(source)}</span>
        <span className="muted small">{KANDA_NAMES[source.ref.kanda]}{source.vulgateRef ? ` · vulgate ${source.vulgateRef}` : ""}</span>
      </div>
      <blockquote className="sanskrit">{source.text.map((line, i) => <span key={i}>{line}</span>)}</blockquote>
      <p className="gist">{source.gist}</p>
    </div>
  );
}
