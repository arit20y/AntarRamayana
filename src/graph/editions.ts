import type { Edition } from "./types";

/**
 * Base edition and concordance editions. See docs/SOURCE_POLICY.md.
 */
export const editions: Edition[] = [
  {
    id: "vr-ce",
    title: "Vālmīki Rāmāyaṇa, Critical Edition",
    shortLabel: "VR-CE",
    publisher: "Oriental Institute, Baroda",
    years: "1960–1975",
    citationPrefix: "VR-CE",
    role: "base",
    etext: {
      title: "Electronic text of the Rāmāyaṇa (Critical Edition)",
      url: "http://indology.info/bombay/ramayana/",
      preparedBy: "Muneo Tokunaga; Unicode revision and corrections by John D. Smith (Cambridge)",
      note:
        "Verse IDs follow the e-text's kāṇḍa.sarga.verse numbering with pāda letters. The e-text carries no formal licence; the app quotes individual pādas as citations only and does not redistribute the corpus.",
    },
  },
  {
    id: "vr-vulgate",
    title: "Vālmīki Rāmāyaṇa, Southern recension (vulgate numbering)",
    shortLabel: "Vulgate",
    publisher: "Gita Press / valmikiramayan.net numbering",
    years: "various",
    citationPrefix: "VR-Vulg",
    role: "concordance",
  },
];

export const BASE_EDITION_ID = "vr-ce";

export function getEdition(id: string): Edition | undefined {
  return editions.find((e) => e.id === id);
}
