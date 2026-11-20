import type { EvidencePacket } from "@/graph/retrieval";

export type ExplainResult = {
  text: string;
  provider: "deterministic" | "webllm" | "hosted";
  model: string;
};

export type ExplainOptions = {
  /** Called with the full text so far as tokens stream in. */
  onPartial?: (text: string) => void;
  signal?: AbortSignal;
};

export interface Explainer {
  id: ExplainResult["provider"];
  label: string;
  explain(packet: EvidencePacket, options?: ExplainOptions): Promise<ExplainResult>;
}
