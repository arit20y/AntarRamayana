/** Text normalisation shared by entity linking and lexical search. */

const STOPWORDS = new Set(
  "a an the of to in on at by for from with and or is are was were be been who whom whose what which when where why how did does do tell me about between related relation relationship give show explain list his her their its it this that these those as than then there here into out up down over under".split(" "),
);

/** Lowercase, strip diacritics and punctuation, collapse whitespace. */
export function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’'`"“”]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(input: string): string[] {
  return normalize(input)
    .split(" ")
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Light stemming so "ancestors" matches "ancestor" and "killed" matches "kill". */
export function stem(token: string): string {
  return token
    .replace(/(ies)$/, "y")
    .replace(/(sses|ches|shes|xes)$/, (m) => m.slice(0, -2))
    .replace(/(ed|ing|ly|s)$/, "");
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
