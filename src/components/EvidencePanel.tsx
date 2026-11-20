import Link from "next/link";
import type { EvidencePacket } from "@/graph/retrieval";
import { ClaimBadge } from "./ClaimBadge";
import { SourceQuote } from "./SourceQuote";

/** The evidence packet as the reader sees it: exactly what the model saw. */
export function EvidencePanel({ packet }: { packet: EvidencePacket }) {
  return (
    <div className="evidence">
      <section className="evidence-block">
        <h3 className="serif">Entities recognised</h3>
        {packet.entities.length ? (
          <div className="chips">
            {packet.entities.map((e) => (
              <Link key={e.node.id} href={`/graph/${e.node.id}`} className="chip">
                <span className={`dot dot-${e.node.kind}`} />
                {e.node.name}
                <span className="muted small"> · {e.node.kind}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">None. Retrieval fell back to matching the words of the question against claim statements.</p>
        )}
        {packet.intents.length ? <p className="muted small">Question read as: {packet.intents.join(", ")}.</p> : null}
      </section>

      {packet.paths.length ? (
        <section className="evidence-block">
          <h3 className="serif">Derived</h3>
          {packet.paths.map((p) => (
            <div key={p.derived.tag} className="claim claim-derived">
              <div className="claim-head">
                <span className="tag">{p.derived.tag}</span>
                <ClaimBadge claimType="DERIVED" />
              </div>
              <p>{p.derived.statement} <span className="cites">[{p.derived.sourceTags.join(", ")}]</span></p>
              <p className="route-text">{p.route}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="evidence-block">
        <h3 className="serif">Textual claims</h3>
        {packet.claims.length ? (
          <ol className="claims">
            {packet.claims.map((c) => (
              <li key={c.tag} className={`claim claim-${c.claimType.toLowerCase()} ${c.onPath ? "claim-onpath" : ""}`}>
                <div className="claim-head">
                  <span className="tag">{c.tag}</span>
                  <ClaimBadge claimType={c.claimType} status={c.edge.reviewerStatus} />
                  {c.onPath ? <span className="muted small">on path</span> : null}
                </div>
                <p>{c.statement} <span className="cites">[{c.sourceTags.join(", ")}]</span></p>
                {c.edge.note ? <p className="note">{c.edge.note}</p> : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted">No approved claim matched.</p>
        )}
      </section>

      {packet.readings.length ? (
        <section className="evidence-block readings">
          <h3 className="serif">Readings</h3>
          <p className="muted small">Interpretations and reflection prompts. Each names its source and is never a claim about what the Vālmīki text says.</p>
          <ol className="claims">
            {packet.readings.map((r) => (
              <li key={r.tag} className={`claim claim-${r.claimType.toLowerCase()}`}>
                <div className="claim-head">
                  <span className="tag">{r.tag}</span>
                  <ClaimBadge claimType={r.claimType} status={r.edge.reviewerStatus} />
                  <span className="muted small">{r.edge.interpreter?.name} · {r.edge.interpreter?.tradition}</span>
                </div>
                <p>{r.statement} <span className="cites">[{r.sourceTags.join(", ")}]</span></p>
                {r.edge.note ? <p className="note">{r.edge.note}</p> : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="evidence-block">
        <h3 className="serif">Sources</h3>
        {packet.sources.map((s) => (
          <SourceQuote key={s.tag} source={s.source} tag={s.tag} />
        ))}
      </section>

      {packet.notes.length ? (
        <section className="evidence-block">
          {packet.notes.map((n) => (
            <p key={n} className="note">{n}</p>
          ))}
        </section>
      ) : null}
    </div>
  );
}
