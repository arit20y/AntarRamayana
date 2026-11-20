import type { EvidencePacket } from "@/graph/retrieval";
import { renderPacket, SYSTEM_PROMPT } from "./prompt";
import type { Explainer, ExplainOptions, ExplainResult } from "./types";

/**
 * Browser-local explainer on WebLLM (WebGPU). The model is downloaded once
 * to the browser cache and runs entirely on the reader's device: no text
 * leaves the page. Loaded lazily so the rest of the app never pays for it.
 */

export const PREFERRED_MODELS = [
  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
  "Phi-3.5-mini-instruct-q4f16_1-MLC",
];

export type LoadProgress = { text: string; progress: number };

type WebLlmModule = typeof import("@mlc-ai/web-llm");
type Engine = Awaited<ReturnType<WebLlmModule["CreateMLCEngine"]>>;

let modulePromise: Promise<WebLlmModule> | null = null;
let engine: { modelId: string; instance: Engine } | null = null;

export function isWebGpuAvailable(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

async function loadModule(): Promise<WebLlmModule> {
  if (!modulePromise) modulePromise = import("@mlc-ai/web-llm");
  return modulePromise;
}

/** Models from the WebLLM prebuilt list that we are willing to run, in preference order. */
export async function listLocalModels(): Promise<string[]> {
  const mod = await loadModule();
  const ids = new Set(mod.prebuiltAppConfig.model_list.map((m) => m.model_id));
  return PREFERRED_MODELS.filter((id) => ids.has(id));
}

export async function loadLocalModel(modelId: string, onProgress?: (p: LoadProgress) => void): Promise<void> {
  if (engine && engine.modelId === modelId) return;
  const mod = await loadModule();
  if (engine) {
    await engine.instance.unload();
    engine = null;
  }
  const instance = await mod.CreateMLCEngine(modelId, {
    initProgressCallback: (report) => onProgress?.({ text: report.text, progress: report.progress }),
  });
  engine = { modelId, instance };
}

export function loadedLocalModel(): string | null {
  return engine?.modelId ?? null;
}

export function createWebLlmExplainer(modelId: string, onProgress?: (p: LoadProgress) => void): Explainer {
  return {
    id: "webllm",
    label: `Browser-local model (${modelId})`,
    async explain(packet: EvidencePacket, options?: ExplainOptions): Promise<ExplainResult> {
      await loadLocalModel(modelId, onProgress);
      const instance = (engine as { instance: Engine }).instance;
      const stream = await instance.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: renderPacket(packet) },
        ],
        stream: true,
        temperature: 0.2,
        max_tokens: 450,
      });
      let text = "";
      for await (const chunk of stream) {
        if (options?.signal?.aborted) break;
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (delta) {
          text += delta;
          options?.onPartial?.(text);
        }
      }
      return { text: text.trim(), provider: "webllm", model: modelId };
    },
  };
}
