"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { graph } from "@/graph/index";
import { retrieve, type EvidencePacket } from "@/graph/retrieval";
import { deterministicExplainer } from "@/llm/deterministic";
import { hostedExplainer, hostedStatus } from "@/llm/hosted";
import type { Explainer, ExplainResult } from "@/llm/types";
import { verifyAnswer, type Verification } from "@/llm/verify";
import { createWebLlmExplainer, isWebGpuAvailable, listLocalModels, type LoadProgress } from "@/llm/webllm";
import { AnswerPanel } from "./AnswerPanel";
import { EvidencePanel } from "./EvidencePanel";
import { GraphMap } from "./GraphMap";

type Provider = "deterministic" | "webllm" | "hosted";

export const SAMPLE_QUESTIONS = [
  "How is Rama related to Ambarisha?",
  "Who were the parents of Hanuman?",
  "What happened at Panchavati?",
  "Trace the lineage of Sita",
  "Who did Lakshmana marry?",
  "Why was Rama exiled for fourteen years?",
  "What does Bharata's rule on the sandals mean?",
];

export function AskClient() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [question, setQuestion] = useState(initial);
  const [packet, setPacket] = useState<EvidencePacket | null>(null);
  const [provider, setProvider] = useState<Provider>("deterministic");
  const [localModels, setLocalModels] = useState<string[]>([]);
  const [localModel, setLocalModel] = useState<string>("");
  const [hosted, setHosted] = useState<{ available: boolean; model?: string; provider?: string }>({ available: false });
  const [progress, setProgress] = useState<LoadProgress | null>(null);
  const [streaming, setStreaming] = useState("");
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [webgpu, setWebgpu] = useState(false);

  useEffect(() => {
    // Browser-only capability checks run after hydration so server and client HTML match.
    const gpu = isWebGpuAvailable();
    const timer = setTimeout(() => setWebgpu(gpu), 0);
    hostedStatus().then(setHosted).catch(() => setHosted({ available: false }));
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (provider !== "webllm" || localModels.length) return;
    listLocalModels()
      .then((ids) => {
        setLocalModels(ids);
        if (ids.length && !localModel) setLocalModel(ids[0]);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [provider, localModels.length, localModel]);

  const run = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setError(null);
      setResult(null);
      setVerification(null);
      setStreaming("");
      const p = retrieve(graph, trimmed);
      setPacket(p);
      let explainer: Explainer = deterministicExplainer;
      if (provider === "webllm" && localModel) explainer = createWebLlmExplainer(localModel, setProgress);
      if (provider === "hosted" && hosted.available) explainer = hostedExplainer;
      setBusy(true);
      try {
        const r = await explainer.explain(p, { onPartial: setStreaming, signal: controller.signal });
        if (controller.signal.aborted) return;
        setResult(r);
        setVerification(verifyAnswer(r.text, p));
      } catch (e: unknown) {
        if (!controller.signal.aborted) {
          setError(e instanceof Error ? e.message : String(e));
          const fallback = await deterministicExplainer.explain(p);
          setResult(fallback);
          setVerification(verifyAnswer(fallback.text, p));
        }
      } finally {
        if (!controller.signal.aborted) {
          setBusy(false);
          setProgress(null);
        }
      }
    },
    [provider, localModel, hosted.available],
  );

  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  }, [run]);

  // Answer the question carried in the URL once, after mount.
  useEffect(() => {
    if (!initial) return;
    const timer = setTimeout(() => {
      void runRef.current(initial);
    }, 0);
    return () => clearTimeout(timer);
  }, [initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(`/ask?q=${encodeURIComponent(question.trim())}`);
    void run(question);
  };

  const highlightEdgeIds = packet?.paths.flatMap((p) => p.edgeIds) ?? [];
  const focusIds = packet?.entities.map((e) => e.node.id) ?? [];

  return (
    <div className="ask">
      <form onSubmit={submit} className="ask-form">
        <label htmlFor="q" className="eyebrow">Ask with evidence</label>
        <div className="ask-row">
          <input id="q" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. How is Rama related to Ambarisha?" autoComplete="off" />
          <button type="submit" className="btn" disabled={busy}>{busy ? "Working…" : "Ask"}</button>
        </div>
        <div className="samples">
          {SAMPLE_QUESTIONS.map((s) => (
            <button key={s} type="button" className="sample" onClick={() => { setQuestion(s); router.replace(`/ask?q=${encodeURIComponent(s)}`); void run(s); }}>{s}</button>
          ))}
        </div>
        <fieldset className="providers">
          <legend className="eyebrow">Explainer</legend>
          <label><input type="radio" name="provider" checked={provider === "deterministic"} onChange={() => setProvider("deterministic")} /> Evidence only (no model)</label>
          <label title={webgpu ? "Runs on your device over WebGPU; first use downloads the model." : "Your browser does not expose WebGPU."}>
            <input type="radio" name="provider" checked={provider === "webllm"} onChange={() => setProvider("webllm")} disabled={!webgpu} /> Browser-local model {webgpu ? "" : "(needs WebGPU)"}
          </label>
          <label title={hosted.available ? `Calls ${hosted.model} through this site's server.` : "Not configured on this deployment."}>
            <input type="radio" name="provider" checked={provider === "hosted"} onChange={() => setProvider("hosted")} disabled={!hosted.available} /> Hosted model {hosted.available ? `(${hosted.model}${hosted.provider === "groq" ? " on Groq" : ""})` : "(not configured)"}
          </label>
          {provider === "webllm" && localModels.length ? (
            <select value={localModel} onChange={(e) => setLocalModel(e.target.value)} aria-label="Local model">
              {localModels.map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
          ) : null}
        </fieldset>
        {progress ? (
          <div className="progress" role="status">
            <div className="progress-bar" style={{ width: `${Math.round(progress.progress * 100)}%` }} />
            <span className="small">{progress.text}</span>
          </div>
        ) : null}
        {error ? <p className="error">{error} Showing the evidence-only answer instead.</p> : null}
      </form>

      {packet ? (
        <div className="ask-grid">
          <div className="ask-main">
            <section className="card">
              <span className="eyebrow">Answer</span>
              <AnswerPanel result={result} verification={verification} streaming={streaming} />
              {!result && !streaming && busy ? <p className="muted">Retrieval is done; the explainer is writing…</p> : null}
            </section>
            <section className="card">
              <span className="eyebrow">Evidence map</span>
              <GraphMap nodes={packet.subgraph.nodes} edges={packet.subgraph.edges} focusIds={focusIds} highlightEdgeIds={highlightEdgeIds} />
            </section>
          </div>
          <aside className="ask-side card">
            <details className="packet" open>
              <summary>
                <span className="eyebrow">Evidence packet</span>
                <span className="muted small">{packet.claims.length} claims · {packet.sources.length} sources{packet.readings.length ? ` · ${packet.readings.length} readings` : ""}</span>
              </summary>
              <p className="muted small">This is the whole input the explainer received. Nothing outside it may appear in the answer.</p>
              <EvidencePanel packet={packet} />
            </details>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
