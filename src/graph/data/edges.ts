import type { EvidenceEdge, Interpreter, RelationType } from "../types";
import { nodeById } from "./nodes";

const nameOf = (id: string): string => nodeById.get(id)?.name.replace(/\s*\(.*?\)/, "") ?? id;

/**
 * Edges. TEXTUAL edges are APPROVED only when every cited source was checked
 * against the base edition e-text. INTERPRETIVE and REFLECTIVE edges always
 * name their interpreter and are never shown as facts.
 */
let counter = 0;
function edge(
  type: RelationType,
  fromId: string,
  toId: string,
  summary: string,
  sourceIds: string[],
  extra: Partial<Pick<EvidenceEdge, "claimType" | "reviewerStatus" | "interpreter" | "note">> = {},
): EvidenceEdge {
  counter += 1;
  return {
    id: `e${String(counter).padStart(3, "0")}`,
    fromId,
    toId,
    type,
    claimType: extra.claimType ?? "TEXTUAL",
    sourceIds,
    editionId: "vr-ce",
    reviewerStatus: extra.reviewerStatus ?? "APPROVED",
    summary,
    interpreter: extra.interpreter,
    note: extra.note,
  };
}

const child = (c: string, p: string, s: string[], label?: string) =>
  edge("CHILD_OF", c, p, label ?? `${nameOf(c)} is the child of ${nameOf(p)}.`, s);

/** Build a CHILD_OF chain from a list [eldest ancestor, ..., descendant]. */
function chain(ids: string[], sourceFor: (childId: string, parentId: string) => string[]): EvidenceEdge[] {
  const out: EvidenceEdge[] = [];
  for (let i = 1; i < ids.length; i += 1) {
    out.push(child(ids[i], ids[i - 1], sourceFor(ids[i], ids[i - 1])));
  }
  return out;
}

// Verse that carries each CHILD_OF step of the Ikṣvāku recital (VR-CE 1.69).
const ikshvakuVerse: Record<string, string> = {
  marichi: "1.69.17", kashyapa: "1.69.17", vivasvan: "1.69.18", manu: "1.69.18", ikshvaku: "1.69.18",
  vikukshi: "1.69.19", bana: "1.69.20", anaranya: "1.69.20", prithu: "1.69.21", trishanku: "1.69.21",
  dhundhumara: "1.69.21", yuvanashva: "1.69.22", mandhata: "1.69.22", susandhi: "1.69.23",
  dhruvasandhi: "1.69.23", prasenajit: "1.69.23", "bharata-elder": "1.69.24", asita: "1.69.24",
  sagara: "1.69.25", asamanja: "1.69.25", amshuman: "1.69.25", dilipa: "1.69.26", bhagiratha: "1.69.26",
  kakutstha: "1.69.26", raghu: "1.69.26", kalmashapada: "1.69.27", shankhana: "1.69.27",
  sudarshana: "1.69.28", agnivarna: "1.69.28", shighraga: "1.69.28", maru: "1.69.28",
  prashushruka: "1.69.29", ambarisha: "1.69.29", nahusha: "1.69.29", yayati: "1.69.30",
  nabhaga: "1.69.30", aja: "1.69.30", dasharatha: "1.69.30",
};

const ikshvakuLine = [
  "brahma", "marichi", "kashyapa", "vivasvan", "manu", "ikshvaku", "vikukshi", "bana", "anaranya",
  "prithu", "trishanku", "dhundhumara", "yuvanashva", "mandhata", "susandhi", "dhruvasandhi",
  "bharata-elder", "asita", "sagara", "asamanja", "amshuman", "dilipa", "bhagiratha", "kakutstha",
  "raghu", "kalmashapada", "shankhana", "sudarshana", "agnivarna", "shighraga", "maru",
  "prashushruka", "ambarisha", "nahusha", "yayati", "nabhaga", "aja", "dasharatha",
];

const videhaVerse: Record<string, string> = {
  mithi: "1.70.4", "janaka-first": "1.70.4", udavasu: "1.70.4", nandivardhana: "1.70.5", suketu: "1.70.5",
  devarata: "1.70.6", brihadratha: "1.70.6", mahavira: "1.70.7", sudhriti: "1.70.7", dhrishtaketu: "1.70.8",
  haryashva: "1.70.8", "maru-videha": "1.70.9", pratindhaka: "1.70.9", kirtiratha: "1.70.9",
  devamidha: "1.70.10", vibudha: "1.70.10", mahidhraka: "1.70.10", kirtirata: "1.70.11",
  maharoma: "1.70.11", svarnaroma: "1.70.12", hrasvaroma: "1.70.12", janaka: "1.70.13", kushadhvaja: "1.70.13",
};

const videhaLine = [
  "nimi", "mithi", "janaka-first", "udavasu", "nandivardhana", "suketu", "devarata", "brihadratha",
  "mahavira", "sudhriti", "dhrishtaketu", "haryashva", "maru-videha", "pratindhaka", "kirtiratha",
  "devamidha", "vibudha", "mahidhraka", "kirtirata", "maharoma", "svarnaroma", "hrasvaroma", "janaka",
];

const editorial: Interpreter = { name: "AntarRamayana editors", tradition: "Modern reflection prompt (not a textual or traditional claim)" };

export const edges: EvidenceEdge[] = [
  ...chain(ikshvakuLine, (c) => [ikshvakuVerse[c]]),
  ...chain(videhaLine, (c) => [videhaVerse[c]]),
  child("prasenajit", "susandhi", ["1.69.23"]),
  edge("SIBLING_OF", "dhruvasandhi", "prasenajit", "Dhruvasaṁdhi and Prasenajit are both sons of Susaṁdhi.", ["1.69.23"]),
  child("kushadhvaja", "hrasvaroma", ["1.70.13"]),
  edge("SIBLING_OF", "janaka", "kushadhvaja", "Janaka is the elder brother of Kuśadhvaja.", ["1.70.13"]),

  // Daśaratha's household
  child("rama", "kausalya", ["1.17.6"]),
  child("rama", "dasharatha", ["1.69.30", "1.17.6"]),
  child("lakshmana", "dasharatha", ["1.69.30", "1.17.9"]),
  child("lakshmana", "sumitra", ["1.17.9"]),
  child("shatrughna", "sumitra", ["1.17.9"]),
  child("shatrughna", "dasharatha", ["1.17.9"]),
  child("bharata", "kaikeyi", ["1.17.8"]),
  child("bharata", "dasharatha", ["1.17.8"]),
  edge("SPOUSE_OF", "dasharatha", "kausalya", "Kausalyā is Daśaratha's queen and bears Rāma.", ["1.17.6"], { note: "The cited verse states motherhood; the marriage is implied by the household context of sarga 1.17." }),
  edge("SPOUSE_OF", "dasharatha", "kaikeyi", "Kaikeyī is Daśaratha's queen and bears Bharata.", ["1.17.8", "2.9.21"], { note: "Marriage implied by the household context; 2.9.21 records Daśaratha's boons to her." }),
  edge("SPOUSE_OF", "dasharatha", "sumitra", "Sumitrā is Daśaratha's queen and bears Lakṣmaṇa and Śatrughna.", ["1.17.9"], { note: "Marriage implied by the household context of sarga 1.17." }),
  edge("SIBLING_OF", "rama", "lakshmana", "Rāma and Lakṣmaṇa are brothers, both sons of Daśaratha.", ["1.69.30", "1.17.15"]),
  edge("SIBLING_OF", "rama", "bharata", "Rāma and Bharata are brothers by Daśaratha.", ["1.17.6", "1.17.8"]),
  edge("SIBLING_OF", "lakshmana", "shatrughna", "Śatrughna is Lakṣmaṇa's younger brother.", ["1.17.19"]),
  edge("RULER_OF", "dasharatha", "ayodhya", "Daśaratha rules in Ayodhyā.", ["1.5.6", "1.18.15"], { note: "The sources name Ayodhyā and address Daśaratha as king; the pairing is a reading of sargas 1.5–1.18 rather than a single verse." }),
  edge("RULER_OF", "ikshvaku", "ayodhya", "Ikṣvāku was the first king in Ayodhyā.", ["1.69.19"]),
  edge("LOCATED_IN", "ayodhya", "kosala", "Ayodhyā is the city of the country Kosala on the Sarayū.", ["1.5.5", "1.5.6"]),

  // Sītā and the Videha marriages
  child("sita", "janaka", ["1.65.14", "1.65.15"], "Sītā rose from the furrow and grew up as Janaka's daughter."),
  child("urmila", "janaka", ["1.70.21"], "Ūrmilā is Janaka's daughter, given to Lakṣmaṇa."),
  child("mandavi", "kushadhvaja", ["1.71.10", "1.72.19"], "Māṇḍavī is one of Kuśadhvaja's two daughters."),
  child("shrutakirti", "kushadhvaja", ["1.71.10", "1.72.20"], "Śrutakīrti is one of Kuśadhvaja's two daughters."),
  edge("SPOUSE_OF", "rama", "sita", "Janaka gives Sītā to Rāma as his partner in dharma.", ["1.70.21", "1.72.17"]),
  edge("SPOUSE_OF", "lakshmana", "urmila", "Janaka gives Ūrmilā to Lakṣmaṇa.", ["1.70.21", "1.72.18"]),
  edge("SPOUSE_OF", "bharata", "mandavi", "Bharata takes Māṇḍavī's hand.", ["1.72.19"]),
  edge("SPOUSE_OF", "shatrughna", "shrutakirti", "Śatrughna takes Śrutakīrti's hand.", ["1.72.20"]),
  edge("RULER_OF", "janaka", "mithila", "Janaka is king of Mithilā.", ["1.30.6", "1.70.14"]),
  edge("RULER_OF", "kushadhvaja", "sankashya", "Janaka installed Kuśadhvaja as king at Sāṁkāśya.", ["1.70.19"]),
  edge("KILLED", "janaka", "sudhanva", "Janaka killed Sudhanvā of Sāṁkāśya in battle after refusing him the bow and Sītā.", ["1.70.17", "1.70.18"]),
  child("kusha", "rama", ["7.58.7", "7.88.4"], "Kuśa is Rāma's twin son."),
  child("lava", "rama", ["7.58.7", "7.88.4"], "Lava is Rāma's twin son."),
  child("kusha", "sita", ["7.58.7", "7.88.4"], "Kuśa is Sītā's son."),
  child("lava", "sita", ["7.58.7", "7.88.4"], "Lava is Sītā's son."),
  edge("SIBLING_OF", "kusha", "lava", "Kuśa and Lava are twins.", ["7.58.7"]),

  // Vānaras
  child("hanuman", "anjana", ["7.35.20"], "Hanumān is born to Añjanā."),
  child("hanuman", "vayu", ["7.35.20", "4.65.27"], "The Wind begot Hanumān in Añjanā."),
  child("hanuman", "kesari", ["4.65.27"], "Hanumān is Kesarin's kṣetraja son (born to his wife, fathered by the Wind)."),
  edge("SPOUSE_OF", "kesari", "anjana", "Añjanā is the wife of Kesarin.", ["4.65.8", "7.35.20"]),
  edge("SPOUSE_OF", "vali", "tara", "Tārā is Vālin's wife.", ["4.16.9"], { note: "Stated through Tārā's embrace and address; explicit in the surrounding sarga." }),
  child("angada", "vali", ["4.23.21", "4.16.9"], "Aṅgada is the son of Vālin and Tārā."),
  child("angada", "tara", ["4.23.21"], "Tārā addresses Aṅgada as her son."),
  edge("RULER_OF", "vali", "kishkindha", "Vālin rules in Kiṣkindhā.", ["4.11.21"]),
  edge("ALLY_OF", "rama", "sugriva", "Rāma and Sugrīva enter into friendship.", ["4.5.16"]),
  edge("KILLED", "rama", "vali", "Rāma's arrow strikes Vālin's chest and he falls.", ["4.16.25", "4.17.1"]),
  edge("ALLY_OF", "rama", "vibhishana", "Vibhīṣaṇa takes refuge with Rāma, who orders his consecration.", ["6.13.8"]),

  // Rākṣasas
  child("ravana", "kaikasi", ["7.9.25"]),
  child("ravana", "vishravas", ["7.9.8", "7.9.25"]),
  child("kumbhakarna", "kaikasi", ["7.9.26"]),
  child("kumbhakarna", "vishravas", ["7.9.8", "7.9.26"]),
  child("shurpanakha", "kaikasi", ["7.9.27"]),
  child("vibhishana", "kaikasi", ["7.9.27"]),
  child("vibhishana", "vishravas", ["7.9.8", "7.9.27"]),
  edge("SPOUSE_OF", "vishravas", "kaikasi", "Kaikasī chose Viśravas and bore his children.", ["7.9.8", "7.9.25"]),
  edge("SIBLING_OF", "ravana", "shurpanakha", "Śūrpaṇakhā calls Rāvaṇa her brother.", ["3.16.19", "3.16.5"]),
  edge("SIBLING_OF", "ravana", "kumbhakarna", "Kumbhakarṇa was born after Rāvaṇa to Kaikasī.", ["7.9.26"]),
  edge("SIBLING_OF", "ravana", "vibhishana", "Vibhīṣaṇa is Kaikasī's last son.", ["7.9.27"]),
  edge("SPOUSE_OF", "ravana", "mandodari", "Mandodarī laments her husband Rāvaṇa.", ["6.99.2"]),
  child("indrajit", "ravana", ["6.9.2"], "Indrajit is Rāvaṇa's son."),
  edge("SPOUSE_OF", "vidyujjihva", "shurpanakha", "Rāvaṇa gives his sister Śūrpaṇakhā to Vidyujjihva.", ["7.12.2"]),
  edge("RULER_OF", "ravana", "lanka", "Laṅkā is ruled by Rāvaṇa.", ["5.1.36", "5.2.1"]),
  edge("LOCATED_IN", "lanka", "trikuta", "Laṅkā stands on the peak of Trikūṭa.", ["5.2.1"]),
  edge("LOCATED_IN", "ashoka-vana", "lanka", "The Aśoka grove lies in Laṅkā.", ["5.13.15"]),
  edge("ABDUCTED", "ravana", "sita", "Rāvaṇa seizes Sītā and flies off with her.", ["3.47.15", "3.47.21"]),
  edge("KILLED", "rama", "kumbhakarna", "Kumbhakarṇa is slain by Rāma.", ["6.56.1"]),
  edge("KILLED", "lakshmana", "indrajit", "Indrajit is struck by Lakṣmaṇa's arrows and lies slain.", ["6.76.6", "6.78.42"]),
  edge("KILLED", "rama", "ravana", "Rāma's arrow pierces Rāvaṇa's heart.", ["6.97.17", "6.98.1"]),

  // Events: participants and places
  edge("PARTICIPATES_IN", "rama", "ev-birth-princes", "Rāma is born to Kausalyā.", ["1.17.6"]),
  edge("PARTICIPATES_IN", "bharata", "ev-birth-princes", "Bharata is born to Kaikeyī.", ["1.17.8"]),
  edge("PARTICIPATES_IN", "lakshmana", "ev-birth-princes", "Lakṣmaṇa is born to Sumitrā.", ["1.17.9"]),
  edge("PARTICIPATES_IN", "shatrughna", "ev-birth-princes", "Śatrughna is born to Sumitrā.", ["1.17.9"]),
  edge("OCCURS_AT", "ev-birth-princes", "ayodhya", "The princes are born in Daśaratha's Ayodhyā.", ["1.5.6", "1.17.6"]),
  edge("PARTICIPATES_IN", "vishvamitra", "ev-vishvamitra-request", "Viśvāmitra asks for Rāma.", ["1.18.15"]),
  edge("PARTICIPATES_IN", "dasharatha", "ev-vishvamitra-request", "Daśaratha is asked to give Rāma.", ["1.18.15"]),
  edge("PARTICIPATES_IN", "rama", "ev-vishvamitra-request", "Rāma is requested for ten nights of the sacrifice.", ["1.18.17"]),
  edge("PARTICIPATES_IN", "janaka", "ev-sita-furrow", "Janaka finds Sītā while ploughing.", ["1.65.14"]),
  edge("PARTICIPATES_IN", "sita", "ev-sita-furrow", "Sītā rises from the furrow.", ["1.65.14"]),
  edge("PARTICIPATES_IN", "vasishtha", "ev-lineage-recital", "Vasiṣṭha recites the line and asks for Janaka's daughters.", ["1.69.32"]),
  edge("PARTICIPATES_IN", "janaka", "ev-lineage-recital", "Janaka hears the recital.", ["1.69.32"]),
  edge("OCCURS_AT", "ev-lineage-recital", "mithila", "The recital happens at Janaka's court in Mithilā.", ["1.30.6", "1.69.32"]),
  edge("PARTICIPATES_IN", "janaka", "ev-janaka-recital", "Janaka recites the Videha line.", ["1.70.3", "1.70.13"]),
  edge("PARTICIPATES_IN", "rama", "ev-weddings", "Rāma receives Sītā.", ["1.72.17"]),
  edge("PARTICIPATES_IN", "sita", "ev-weddings", "Sītā is given to Rāma.", ["1.72.17"]),
  edge("PARTICIPATES_IN", "lakshmana", "ev-weddings", "Lakṣmaṇa receives Ūrmilā.", ["1.72.18"]),
  edge("PARTICIPATES_IN", "bharata", "ev-weddings", "Bharata takes Māṇḍavī's hand.", ["1.72.19"]),
  edge("PARTICIPATES_IN", "shatrughna", "ev-weddings", "Śatrughna takes Śrutakīrti's hand.", ["1.72.20"]),
  edge("OCCURS_AT", "ev-weddings", "mithila", "The weddings take place at Mithilā.", ["1.30.6", "1.72.17"]),
  edge("PARTICIPATES_IN", "kaikeyi", "ev-kaikeyi-boons", "Kaikeyī asks for Bharata's consecration and Rāma's fourteen-year exile.", ["2.9.15", "2.10.24"]),
  edge("PARTICIPATES_IN", "dasharatha", "ev-kaikeyi-boons", "Daśaratha had granted the two boons earlier.", ["2.9.21"]),
  edge("PARTICIPATES_IN", "rama", "ev-kaikeyi-boons", "Rāma is to be exiled for fourteen years.", ["2.9.15"]),
  edge("PARTICIPATES_IN", "bharata", "ev-kaikeyi-boons", "Bharata's consecration is the first boon.", ["2.9.15"]),
  edge("PARTICIPATES_IN", "rama", "ev-chitrakuta", "Rāma reaches Citrakūṭa.", ["2.50.11"]),
  edge("PARTICIPATES_IN", "lakshmana", "ev-chitrakuta", "Lakṣmaṇa reaches Citrakūṭa with Rāma.", ["2.50.11"]),
  edge("OCCURS_AT", "ev-chitrakuta", "chitrakuta", "The settlement is on the mountain Citrakūṭa.", ["2.48.26", "2.50.11"]),
  edge("PARTICIPATES_IN", "dasharatha", "ev-dasharatha-death", "Daśaratha gives up his life after midnight.", ["2.58.57"]),
  edge("PARTICIPATES_IN", "bharata", "ev-padukas", "Bharata asks Rāma to step onto the sandals and takes them for the kingdom.", ["2.104.21", "2.105.13"]),
  edge("PARTICIPATES_IN", "rama", "ev-padukas", "Rāma gives his sandals.", ["2.105.13"]),
  edge("OCCURS_AT", "ev-padukas", "chitrakuta", "Bharata meets Rāma at Citrakūṭa.", ["2.50.11", "2.104.21"], { note: "Bharata's visit follows the Citrakūṭa settlement in sargas 2.50–2.105; the place link is read from that sequence." }),
  edge("PARTICIPATES_IN", "rama", "ev-panchavati", "Rāma goes to Pañcavaṭī with Sītā.", ["3.12.24"]),
  edge("PARTICIPATES_IN", "sita", "ev-panchavati", "Sītā goes to Pañcavaṭī.", ["3.12.24"]),
  edge("OCCURS_AT", "ev-panchavati", "panchavati", "The hermitage is at Pañcavaṭī.", ["3.12.13", "3.12.24"]),
  edge("PARTICIPATES_IN", "shurpanakha", "ev-shurpanakha", "Śūrpaṇakhā approaches Rāma.", ["3.16.5", "3.16.19"]),
  edge("PARTICIPATES_IN", "rama", "ev-shurpanakha", "Rāma is approached by Śūrpaṇakhā.", ["3.16.5"]),
  edge("OCCURS_AT", "ev-shurpanakha", "panchavati", "The meeting happens at Pañcavaṭī.", ["3.12.24", "3.16.5"]),
  edge("PARTICIPATES_IN", "ravana", "ev-golden-deer", "Rāvaṇa commands Mārīca to become the golden deer.", ["3.38.16"]),
  edge("PARTICIPATES_IN", "maricha", "ev-golden-deer", "Mārīca is to appear as a golden illusory deer.", ["3.38.16"]),
  edge("PARTICIPATES_IN", "ravana", "ev-abduction", "Rāvaṇa seizes Sītā.", ["3.47.15"]),
  edge("PARTICIPATES_IN", "sita", "ev-abduction", "Sītā is carried off.", ["3.47.21"]),
  edge("OCCURS_AT", "ev-abduction", "panchavati", "Sītā is seized from the Pañcavaṭī hermitage.", ["3.12.24", "3.47.15"]),
  edge("PARTICIPATES_IN", "jatayu", "ev-jatayu", "Jaṭāyu withstands Rāvaṇa's weapons.", ["3.49.6"]),
  edge("PARTICIPATES_IN", "ravana", "ev-jatayu", "Rāvaṇa fights Jaṭāyu.", ["3.49.6"]),
  edge("PARTICIPATES_IN", "hanuman", "ev-alliance", "Hanumān speaks for Sugrīva.", ["4.2.13"]),
  edge("PARTICIPATES_IN", "sugriva", "ev-alliance", "Sugrīva becomes Rāma's friend.", ["4.5.16"]),
  edge("PARTICIPATES_IN", "rama", "ev-alliance", "Rāma becomes Sugrīva's friend.", ["4.5.16"]),
  edge("PARTICIPATES_IN", "rama", "ev-vali-killed", "Rāma shoots Vālin.", ["4.16.25"]),
  edge("PARTICIPATES_IN", "vali", "ev-vali-killed", "Vālin is struck and falls.", ["4.16.25", "4.17.1"]),
  edge("PARTICIPATES_IN", "sugriva", "ev-vali-killed", "Vālin falls while fighting Sugrīva.", ["4.16.25"]),
  edge("OCCURS_AT", "ev-vali-killed", "kishkindha", "The fight is at Kiṣkindhā.", ["4.11.21", "4.16.25"]),
  edge("PARTICIPATES_IN", "hanuman", "ev-leap", "Hanumān leaps across the ocean.", ["5.1.36", "5.1.60"]),
  edge("OCCURS_AT", "ev-leap", "lanka", "The leap ends at Laṅkā.", ["5.1.36", "5.2.1"]),
  edge("PARTICIPATES_IN", "hanuman", "ev-sita-found", "Hanumān recognises Sītā and shows the ring.", ["5.13.37", "5.34.2"]),
  edge("PARTICIPATES_IN", "sita", "ev-sita-found", "Sītā is found in the Aśoka grove.", ["5.13.37"]),
  edge("OCCURS_AT", "ev-sita-found", "ashoka-vana", "The meeting is in the Aśoka grove.", ["5.13.15"]),
  edge("PARTICIPATES_IN", "hanuman", "ev-lanka-burning", "Hanumān strikes down rākṣasas with his blazing tail.", ["5.51.9"]),
  edge("OCCURS_AT", "ev-lanka-burning", "lanka", "The burning happens in Laṅkā.", ["5.51.9", "5.2.1"]),
  edge("PARTICIPATES_IN", "vibhishana", "ev-vibhishana-refuge", "Vibhīṣaṇa is consecrated at Rāma's order.", ["6.13.8"]),
  edge("PARTICIPATES_IN", "rama", "ev-vibhishana-refuge", "Rāma orders the consecration.", ["6.13.8"]),
  edge("PARTICIPATES_IN", "nala", "ev-bridge", "Nala builds the bridge.", ["6.15.22"]),
  edge("PARTICIPATES_IN", "rama", "ev-kumbhakarna-slain", "Rāma slays Kumbhakarṇa.", ["6.56.1"]),
  edge("PARTICIPATES_IN", "kumbhakarna", "ev-kumbhakarna-slain", "Kumbhakarṇa is slain.", ["6.56.1"]),
  edge("PARTICIPATES_IN", "lakshmana", "ev-indrajit-slain", "Lakṣmaṇa strikes Indrajit with his arrows.", ["6.76.6", "6.78.42"]),
  edge("PARTICIPATES_IN", "indrajit", "ev-indrajit-slain", "Indrajit is slain.", ["6.78.42"]),
  edge("PARTICIPATES_IN", "rama", "ev-ravana-slain", "Rāma kills Rāvaṇa.", ["6.97.17", "6.98.1"]),
  edge("PARTICIPATES_IN", "ravana", "ev-ravana-slain", "Rāvaṇa dies.", ["6.97.17"]),
  edge("OCCURS_AT", "ev-ravana-slain", "lanka", "The battle is at Laṅkā.", ["5.2.1", "6.98.1"]),
  edge("PARTICIPATES_IN", "sita", "ev-fire-ordeal", "Sītā enters the fire.", ["6.104.21"]),
  edge("PARTICIPATES_IN", "lakshmana", "ev-fire-ordeal", "Lakṣmaṇa builds the pyre.", ["6.104.21"]),
  edge("PARTICIPATES_IN", "rama", "ev-return", "Rāma is told he will go to Ayodhyā.", ["6.112.15"]),
  edge("OCCURS_AT", "ev-return", "ayodhya", "The return is to Ayodhyā.", ["6.112.15"]),
  edge("PARTICIPATES_IN", "kaikasi", "ev-ravana-birth", "Kaikasī bears the four children.", ["7.9.25", "7.9.27"]),
  edge("PARTICIPATES_IN", "ravana", "ev-ravana-birth", "The ten-headed child is born.", ["7.9.25"]),
  edge("PARTICIPATES_IN", "anjana", "ev-hanuman-birth", "Añjanā bears Hanumān.", ["7.35.20"]),
  edge("PARTICIPATES_IN", "hanuman", "ev-hanuman-birth", "Hanumān is born.", ["7.35.20"]),
  edge("PARTICIPATES_IN", "rama", "ev-kusha-lava", "Rāma recognises his twin sons.", ["7.88.4"]),
  edge("PARTICIPATES_IN", "kusha", "ev-kusha-lava", "Kuśa is one of the twins.", ["7.58.7"]),
  edge("PARTICIPATES_IN", "lava", "ev-kusha-lava", "Lava is one of the twins.", ["7.58.7"]),

  // Interpretive readings: always named, never shown as fact.
  edge("INTERPRETED_AS", "ev-kaikeyi-boons", "c-dharma-of-promise", "Daśaratha's dilemma is read as the binding force of a promise once given.", ["2.9.21", "2.10.24"], {
    claimType: "INTERPRETIVE",
    reviewerStatus: "CANDIDATE",
    interpreter: { name: "Commentarial tradition (summary)", tradition: "Traditional readings of Ayodhyā Kāṇḍa as a satya-dharma episode" },
    note: "Attribution is a summary of a widely shared reading; wording has not been checked against a named commentary. Shown as candidate.",
  }),
  edge("INTERPRETED_AS", "ev-padukas", "c-stewardship", "Bharata ruling on Rāma's sandals is read as authority held in trust.", ["2.105.13"], {
    claimType: "INTERPRETIVE",
    reviewerStatus: "CANDIDATE",
    interpreter: { name: "Commentarial tradition (summary)", tradition: "Traditional readings of the pāduka episode" },
    note: "Summary attribution; pending check against a named source.",
  }),
  edge("INTERPRETED_AS", "hanuman", "c-devotion", "Hanumān is read as the model of devoted service.", ["5.1.36", "5.34.2"], {
    claimType: "INTERPRETIVE",
    reviewerStatus: "CANDIDATE",
    interpreter: { name: "Tulsīdās", tradition: "Rāmcaritmānas and later bhakti tradition" },
    note: "The bhakti reading belongs to later tradition, not to Vālmīki's text. Wording pending check.",
  }),
  edge("INTERPRETED_AS", "rama", "c-brahman-maya", "Rāma is read as Brahman and Sītā as Māyā or Prakr̥ti.", ["1.72.17"], {
    claimType: "INTERPRETIVE",
    reviewerStatus: "CANDIDATE",
    interpreter: { name: "Adhyātma Rāmāyaṇa", tradition: "Advaita Vedānta retelling" },
    note: "Vedāntic reading from a different text; not a claim of the Vālmīki Rāmāyaṇa.",
  }),

  // Reflection prompts: the app's own, labelled as such.
  edge("REFLECTED_AS", "ev-kaikeyi-boons", "c-dharma-of-promise", "Reflection: when has keeping your word cost you something you wanted more?", ["2.9.15"], {
    claimType: "REFLECTIVE",
    reviewerStatus: "APPROVED",
    interpreter: editorial,
  }),
  edge("REFLECTED_AS", "ev-padukas", "c-stewardship", "Reflection: what do you hold on someone else's behalf, and how do you mark that it is not yours?", ["2.105.13"], {
    claimType: "REFLECTIVE",
    reviewerStatus: "APPROVED",
    interpreter: editorial,
  }),
  edge("REFLECTED_AS", "ev-leap", "c-devotion", "Reflection: what task would you cross an ocean for, and for whom?", ["5.1.36"], {
    claimType: "REFLECTIVE",
    reviewerStatus: "APPROVED",
    interpreter: editorial,
  }),
];
