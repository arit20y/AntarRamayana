import type { Verification } from "@/llm/verify";
import type { ExplainResult } from "@/llm/types";

const STATUS_LABEL: Record<Verification["sentences"][number]["status"], string> = {
  cited: "cited",
  uncited: "no citation",
  invalid: "unknown citation",
  abstain: "abstained",
};

export function AnswerPanel({ result, verification, streaming }: { result: Pick<ExplainResult, "provider" | "model"> | null; verification: Verification | null; streaming: string }) {
  if (!verification && !streaming) return null;
  return (
    <div className="answer">
      {verification ? (
        <p className="answer-text">
          {verification.sentences.map((s, i) => (
            <span key={i} className={`sent sent-${s.status}`} title={STATUS_LABEL[s.status]}>
              {s.text}{" "}
            </span>
          ))}
        </p>
      ) : (
        <p className="answer-text streaming">{streaming}</p>
      )}
      {verification && result ? (
        <div className="answer-meta">
          <span>{result.provider === "deterministic" ? "Evidence-only template" : result.provider === "webllm" ? "Browser-local model" : "Hosted model"} · {result.model}</span>
          <span className={verification.coverage === 1 ? "ok" : "warn"}>
            {Math.round(verification.coverage * 100)}% of factual sentences cite a source
          </span>
          {verification.unknownTags.length ? <span className="warn">Unknown tags: {verification.unknownTags.join(", ")}</span> : null}
        </div>
      ) : null}
      <p className="muted small">
        Highlighting: <span className="sent sent-cited">cited</span> <span className="sent sent-uncited">no citation</span> <span className="sent sent-invalid">unknown citation</span> <span className="sent sent-abstain">abstained</span>
      </p>
    </div>
  );
}
