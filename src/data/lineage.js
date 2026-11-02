/**
 * Seed route only. Every edge in the production graph will carry a source ID,
 * an edition ID, a claim type, and a review state.
 */
export const ramaToYayati = [
  { id: "rama", name: "Rama", devanagari: "राम", relationToNext: "son of", source: "Bāla Kāṇḍa 1.70.43" },
  { id: "dasharatha", name: "Dasharatha", devanagari: "दशरथ", relationToNext: "son of", source: "Bāla Kāṇḍa 1.70.43" },
  { id: "aja", name: "Aja", devanagari: "अज", relationToNext: "son of", source: "Bāla Kāṇḍa 1.70.43" },
  { id: "nabhaga", name: "Nabhaga", devanagari: "नाभाग", relationToNext: "son of", source: "Bāla Kāṇḍa 1.70.42–43" },
  { id: "yayati", name: "Yayati", devanagari: "ययाति", relationToNext: "son of", source: "Bāla Kāṇḍa 1.70.42" },
  { id: "nahusha", name: "Nahusha", devanagari: "नहुष", relationToNext: "son of", source: "Bāla Kāṇḍa 1.70.42" },
  { id: "ambarisha", name: "Ambarisha", devanagari: "अम्बरीष", source: "Bāla Kāṇḍa 1.70.41–42" },
];

export const featureCards = [
  { title: "Read the corpus", description: "A full verse reader with Sanskrit, transliteration, translations, and sources kept separate by edition." },
  { title: "Trace lineages", description: "Expand a source-backed family route from any figure, then inspect the verse behind every relation." },
  { title: "Ask with evidence", description: "Graph retrieval selects sources first; an LLM explains only what the retrieved evidence supports." },
  { title: "Explore the story", description: "Connect characters, places, events, kingdoms, journeys, and the passages in which they appear." },
  { title: "Use interpretive lenses", description: "Move between textual, philosophical, commentarial, and modern readings without mixing their claim types." },
  { title: "Study your own way", description: "Save routes, notes, reading paths, and reflection prompts locally before we add optional accounts." },
];
