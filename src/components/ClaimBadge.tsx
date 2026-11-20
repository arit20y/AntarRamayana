import type { ClaimType, ReviewerStatus } from "@/graph/types";

const LABELS: Record<ClaimType, string> = {
  TEXTUAL: "Textual",
  DERIVED: "Derived",
  INTERPRETIVE: "Interpretive",
  REFLECTIVE: "Reflection",
};

export function ClaimBadge({ claimType, status }: { claimType: ClaimType; status?: ReviewerStatus }) {
  return (
    <span className={`badge badge-${claimType.toLowerCase()}`} title={`${LABELS[claimType]} claim${status ? ` · ${status.toLowerCase()}` : ""}`}>
      {LABELS[claimType]}
      {status && status !== "APPROVED" ? <span className="badge-status">{status.toLowerCase()}</span> : null}
    </span>
  );
}
