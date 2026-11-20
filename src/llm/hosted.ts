import type { EvidencePacket } from "@/graph/retrieval";
import type { Explainer, ExplainOptions, ExplainResult } from "./types";

/**
 * Hosted explainer: posts the evidence packet to this app's own API route,
 * which calls Claude with server-side credentials. Only the packet and the
 * question are sent, never the reader's identity or anything else.
 */

export type HostedStatus = { available: boolean; model?: string; provider?: "anthropic" | "groq" };

export async function hostedStatus(): Promise<HostedStatus> {
  try {
    const res = await fetch("/api/explain", { method: "GET" });
    if (!res.ok) return { available: false };
    return (await res.json()) as HostedStatus;
  } catch {
    return { available: false };
  }
}

export const hostedExplainer: Explainer = {
  id: "hosted",
  label: "Hosted model (via this site's server)",
  async explain(packet: EvidencePacket, options?: ExplainOptions): Promise<ExplainResult> {
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ packet }),
      signal: options?.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Hosted explainer failed (${res.status}): ${detail || res.statusText}`);
    }
    const data = (await res.json()) as { text: string; model: string };
    options?.onPartial?.(data.text);
    return { text: data.text, provider: "hosted", model: data.model };
  },
};
