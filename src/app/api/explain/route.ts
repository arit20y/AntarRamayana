import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { EvidencePacket } from "@/graph/retrieval";
import { renderPacket, SYSTEM_PROMPT } from "@/llm/prompt";

/**
 * Optional hosted explainer. Two providers, chosen by which server-side key
 * exists (HOSTED_PROVIDER=anthropic|groq picks one when both are set):
 *
 *   ANTHROPIC_API_KEY → Claude via the official SDK
 *   GROQ_API_KEY      → an open-weight model (Llama 3.3 70B by default) on
 *                       Groq's free tier, via its OpenAI-compatible endpoint
 *
 * Either way the model receives the rendered evidence packet and nothing
 * else; it can explain the evidence but can never write to the graph.
 */

export const runtime = "nodejs";

const ANTHROPIC_MODEL = "claude-opus-5-5";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

type Provider = "anthropic" | "groq";

function provider(): Provider | null {
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const pick = process.env.HOSTED_PROVIDER as Provider | undefined;
  if (pick === "groq" && hasGroq) return "groq";
  if (pick === "anthropic" && hasAnthropic) return "anthropic";
  if (hasAnthropic) return "anthropic";
  if (hasGroq) return "groq";
  return null;
}

export async function GET() {
  const p = provider();
  if (!p) return NextResponse.json({ available: false });
  return NextResponse.json({ available: true, provider: p, model: p === "groq" ? GROQ_MODEL : ANTHROPIC_MODEL });
}

function isPacket(x: unknown): x is EvidencePacket {
  if (!x || typeof x !== "object") return false;
  const p = x as Record<string, unknown>;
  return typeof p.question === "string" && Array.isArray(p.claims) && Array.isArray(p.sources) && Array.isArray(p.entities);
}

async function explainWithAnthropic(packet: EvidencePacket): Promise<{ text: string; model: string }> {
  const client = new Anthropic();
  const response = await client.beta.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 2000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: renderPacket(packet) }],
  });
  if (response.stop_reason === "refusal") throw new RefusalError();
  const text = response.content
    .filter((b): b is Extract<(typeof response.content)[number], { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return { text, model: response.model };
}

async function explainWithGroq(packet: EvidencePacket): Promise<{ text: string; model: string }> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: renderPacket(packet) },
      ],
    }),
  });
  if (!res.ok) throw new UpstreamError(res.status);
  const data = (await res.json()) as { model?: string; choices?: { message?: { content?: string } }[] };
  return { text: (data.choices?.[0]?.message?.content ?? "").trim(), model: data.model ?? GROQ_MODEL };
}

class RefusalError extends Error {}
class UpstreamError extends Error {
  constructor(public status: number) {
    super(`upstream ${status}`);
  }
}

export async function POST(req: Request) {
  const p = provider();
  if (!p) return NextResponse.json({ error: "Hosted explainer is not configured." }, { status: 503 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const packet = (body as { packet?: unknown })?.packet;
  if (!isPacket(packet)) return NextResponse.json({ error: "Missing evidence packet." }, { status: 400 });
  if (packet.question.length > 600) return NextResponse.json({ error: "Question too long." }, { status: 400 });

  try {
    const result = p === "groq" ? await explainWithGroq(packet) : await explainWithAnthropic(packet);
    return NextResponse.json({ ...result, provider: p });
  } catch (error) {
    if (error instanceof RefusalError) return NextResponse.json({ error: "The model declined to answer this request." }, { status: 422 });
    if (error instanceof UpstreamError) {
      if (error.status === 401 || error.status === 403) return NextResponse.json({ error: "Server credentials were rejected." }, { status: 503 });
      if (error.status === 429) return NextResponse.json({ error: "Hosted model is rate limited; try again shortly." }, { status: 429 });
      return NextResponse.json({ error: `Model API error (${error.status}).` }, { status: 502 });
    }
    if (error instanceof Anthropic.AuthenticationError) return NextResponse.json({ error: "Server credentials were rejected." }, { status: 503 });
    if (error instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "Hosted model is rate limited; try again shortly." }, { status: 429 });
    if (error instanceof Anthropic.APIError) return NextResponse.json({ error: `Model API error (${error.status}).` }, { status: 502 });
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
