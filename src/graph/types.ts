/**
 * Core graph types. See docs/EVIDENCE_MODEL.md for the rules behind them.
 *
 * Every public statement in the app is exactly one of four claim types, and
 * the interface must never present an INTERPRETIVE or REFLECTIVE claim with
 * the visual authority of a TEXTUAL one.
 */

export type ClaimType = "TEXTUAL" | "DERIVED" | "INTERPRETIVE" | "REFLECTIVE";
export type ReviewerStatus = "CANDIDATE" | "APPROVED" | "REJECTED";

export type NodeKind = "person" | "place" | "event" | "concept";

export type NodeGroup =
  | "ikshvaku"
  | "videha"
  | "rakshasa"
  | "vanara"
  | "rishi"
  | "deva"
  | "other";

export type GraphNode = {
  id: string;
  kind: NodeKind;
  name: string;
  devanagari?: string;
  /** Alternative spellings and epithets used for entity linking. */
  aliases?: string[];
  group?: NodeGroup;
  /** One neutral sentence. Must not contain interpretation. */
  summary: string;
};

export type RelationType =
  | "CHILD_OF"
  | "SPOUSE_OF"
  | "SIBLING_OF"
  | "ALLY_OF"
  | "KILLED"
  | "ABDUCTED"
  | "RULER_OF"
  | "LOCATED_IN"
  | "PARTICIPATES_IN"
  | "OCCURS_AT"
  | "INTERPRETED_AS"
  | "REFLECTED_AS";

export type Edition = {
  id: string;
  title: string;
  shortLabel: string;
  publisher: string;
  years: string;
  /** How a verse is cited for this edition, e.g. "VR-CE 1.69.29". */
  citationPrefix: string;
  etext?: { title: string; url: string; preparedBy: string; note: string };
  role: "base" | "concordance";
};

export type VerseRef = {
  kanda: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  sarga: number;
  verse: number;
  /** Pāda letters when only part of the verse is cited, e.g. "ac". */
  pada?: string;
};

export type Source = {
  id: string;
  editionId: string;
  ref: VerseRef;
  /** Romanised pādas from the e-text, one entry per half-verse line. */
  text: string[];
  /** Plain-English gist of what the quoted lines state. */
  gist: string;
  /** Vulgate (Southern recension) concordance when known. */
  vulgateRef?: string;
};

export type Interpreter = {
  name: string;
  /** Text, commentary, tradition or author that the reading belongs to. */
  tradition: string;
};

export type EvidenceEdge = {
  id: string;
  fromId: string;
  toId: string;
  type: RelationType;
  claimType: ClaimType;
  sourceIds: string[];
  editionId?: string;
  reviewerStatus: ReviewerStatus;
  /** One sentence stating the relation in plain English. */
  summary: string;
  /** Required for INTERPRETIVE and REFLECTIVE edges. */
  interpreter?: Interpreter;
  note?: string;
};

export const KANDA_NAMES: Record<VerseRef["kanda"], string> = {
  1: "Bāla Kāṇḍa",
  2: "Ayodhyā Kāṇḍa",
  3: "Araṇya Kāṇḍa",
  4: "Kiṣkindhā Kāṇḍa",
  5: "Sundara Kāṇḍa",
  6: "Yuddha Kāṇḍa",
  7: "Uttara Kāṇḍa",
};

export const RELATION_LABELS: Record<RelationType, string> = {
  CHILD_OF: "child of",
  SPOUSE_OF: "spouse of",
  SIBLING_OF: "sibling of",
  ALLY_OF: "ally of",
  KILLED: "killed",
  ABDUCTED: "abducted",
  RULER_OF: "ruler of",
  LOCATED_IN: "located in",
  PARTICIPATES_IN: "takes part in",
  OCCURS_AT: "occurs at",
  INTERPRETED_AS: "read as",
  REFLECTED_AS: "reflection prompt",
};

export function formatRef(ref: VerseRef): string {
  const base = `${ref.kanda}.${ref.sarga}.${ref.verse}`;
  return ref.pada ? `${base}${ref.pada}` : base;
}
