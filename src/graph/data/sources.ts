import type { Source, VerseRef } from "../types";

/**
 * Source records. Every entry was checked against the Critical Edition
 * e-text (Tokunaga/Smith) on 2026-11-20; the quoted lines are verbatim
 * pādas from that text. Vulgate concordance is given only where checked.
 */
function s(
  id: string,
  kanda: VerseRef["kanda"],
  sarga: number,
  verse: number,
  text: string[],
  gist: string,
  extra: { pada?: string; vulgateRef?: string } = {},
): Source {
  return {
    id,
    editionId: "vr-ce",
    ref: { kanda, sarga, verse, pada: extra.pada },
    text,
    gist,
    vulgateRef: extra.vulgateRef,
  };
}

export const sources: Source[] = [
  // ---- Bāla Kāṇḍa: Ayodhyā and the royal house -------------------------
  s("1.5.5", 1, 5, 5, ["kosalo nāma muditaḥ sphīto janapado mahān", "niviṣṭaḥ sarayūtīre prabhūtadhanadhānyavān"], "Kosala is a prosperous country on the bank of the Sarayū."),
  s("1.5.6", 1, 5, 6, ["ayodhyā nāma nagarī tatrāsīl lokaviśrutā"], "In Kosala lies the famous city of Ayodhyā.", { pada: "a" }),
  s("1.17.6", 1, 17, 6, ["kausalyājanayad rāmaṁ divyalakṣaṇasaṁyutam"], "Kausalyā gave birth to Rāma.", { pada: "a" }),
  s("1.17.8", 1, 17, 8, ["bharato nāma kaikeyyāṁ jajñe satyaparākramaḥ"], "Bharata was born to Kaikeyī.", { pada: "a" }),
  s("1.17.9", 1, 17, 9, ["atha lakṣmaṇaśatrughnau sumitrājanayat sutau"], "Sumitrā bore the sons Lakṣmaṇa and Śatrughna.", { pada: "a" }),
  s("1.17.15", 1, 17, 15, ["teṣām api mahātejā rāmaḥ satyaparākramaḥ", "bālyāt prabhr̥ti susnigdho lakṣmaṇo lakṣmivardhanaḥ"], "From childhood Lakṣmaṇa was devoted to Rāma."),
  s("1.17.19", 1, 17, 19, ["bharatasyāpi śatrughno lakṣmaṇāvarajo hi saḥ"], "Śatrughna, Lakṣmaṇa's younger brother, was likewise devoted to Bharata.", { pada: "a" }),
  s("1.18.15", 1, 18, 15, ["sthiram icchasi rājendra rāmaṁ me dātum arhasi"], "Viśvāmitra asks Daśaratha to give him Rāma.", { pada: "c" }),
  s("1.18.17", 1, 18, 17, ["daśarātraṁ hi yajñasya rāmaṁ rājīvalocanam"], "Rāma is asked for ten nights of Viśvāmitra's sacrifice.", { pada: "c" }),
  s("1.30.6", 1, 30, 6, ["maithilasya naraśreṣṭha janakasya bhaviṣyati"], "Janaka of Mithilā is announced to be holding a sacrifice.", { pada: "a" }),

  // ---- Bāla Kāṇḍa: Sītā and the Videha line -----------------------------
  s("1.65.14", 1, 65, 14, ["atha me kr̥ṣataḥ kṣetraṁ lāṅgalād utthitā mama", "kṣetraṁ śodhayatā labdhvā nāmnā sīteti viśrutā"], "Janaka says Sītā rose from the furrow as he ploughed the field, and was named Sītā."),
  s("1.65.15", 1, 65, 15, ["bhūtalād utthitā sā tu vyavardhata mamātmajā"], "She who rose from the earth grew up as Janaka's daughter.", { pada: "a" }),
  s("1.65.27", 1, 65, 27, ["sutām ayonijāṁ sītāṁ dadyāṁ dāśarather aham"], "Janaka says he will give Sītā, not born of a womb, to Daśaratha's son.", { pada: "c" }),
  s("1.70.3", 1, 70, 3, ["rājābhūt triṣu lokeṣu viśrutaḥ svena karmaṇā", "nimiḥ paramadharmātmā sarvasattvavatāṁ varaḥ"], "Janaka begins his lineage with King Nimi."),
  s("1.70.4", 1, 70, 4, ["tasya putro mithir nāma janako mithiputrakaḥ", "prathamo janako nāma janakād apy udāvasuḥ"], "Nimi's son was Mithi; Mithi's son was the first Janaka; Janaka's son was Udāvasu."),
  s("1.70.5", 1, 70, 5, ["udāvasos tu dharmātmā jāto vai nandivardhanaḥ", "nandivardhanaputras tu suketur nāma nāmataḥ"], "Udāvasu → Nandivardhana → Suketu."),
  s("1.70.6", 1, 70, 6, ["suketor api dharmātmā devarāto mahābalaḥ", "devarātasya rājarṣer br̥hadratha iti śrutaḥ"], "Suketu → Devarāta → Br̥hadratha."),
  s("1.70.7", 1, 70, 7, ["br̥hadrathasya śūro ’bhūn mahāvīraḥ pratāpavān", "mahāvīrasya dhr̥timān sudhr̥tiḥ satyavikramaḥ"], "Br̥hadratha → Mahāvīra → Sudhr̥ti."),
  s("1.70.8", 1, 70, 8, ["sudhr̥ter api dharmātmā dhr̥ṣṭaketuḥ sudhārmikaḥ", "dhr̥ṣṭaketos tu rājarṣer haryaśva iti viśrutaḥ"], "Sudhr̥ti → Dhr̥ṣṭaketu → Haryaśva."),
  s("1.70.9", 1, 70, 9, ["haryaśvasya maruḥ putro maroḥ putraḥ pratīndhakaḥ", "pratīndhakasya dharmātmā rājā kīrtirathaḥ sutaḥ"], "Haryaśva → Maru → Pratīndhaka → Kīrtiratha."),
  s("1.70.10", 1, 70, 10, ["putraḥ kīrtirathasyāpi devamīḍha iti smr̥taḥ", "devamīḍhasya vibudho vibudhasya mahīdhrakaḥ"], "Kīrtiratha → Devamīḍha → Vibudha → Mahīdhraka."),
  s("1.70.11", 1, 70, 11, ["mahīdhrakasuto rājā kīrtirāto mahābalaḥ", "kīrtirātasya rājarṣer mahāromā vyajāyata"], "Mahīdhraka → Kīrtirāta → Mahāromā."),
  s("1.70.12", 1, 70, 12, ["mahāroṁṇas tu dharmātmā svarṇaromā vyajāyata", "svarṇaroṁṇas tu rājarṣer hrasvaromā vyajāyata"], "Mahāromā → Svarṇaromā → Hrasvaromā."),
  s("1.70.13", 1, 70, 13, ["tasya putradvayaṁ jajñe dharmajñasya mahātmanaḥ", "jyeṣṭho ’ham anujo bhrātā mama vīraḥ kuśadhvajaḥ"], "Hrasvaromā had two sons: Janaka (the speaker, elder) and Kuśadhvaja."),
  s("1.70.14", 1, 70, 14, ["māṁ tu jyeṣṭhaṁ pitā rājye so ’bhiṣicya narādhipaḥ", "kuśadhvajaṁ samāveśya bhāraṁ mayi vanaṁ gataḥ"], "Their father consecrated Janaka as king and went to the forest."),
  s("1.70.17", 1, 70, 17, ["sa ca me preṣayām āsa śaivaṁ dhanur anuttamam", "sītā kanyā ca padmākṣī mahyaṁ vai dīyatām iti"], "Sudhanvā demanded the bow of Śiva and Sītā."),
  s("1.70.18", 1, 70, 18, ["tasyāpradānād brahmarṣe yuddham āsīn mayā saha", "sa hato ’bhimukho rājā sudhanvā tu mayā raṇe"], "Janaka refused; Sudhanvā was killed by Janaka in battle."),
  s("1.70.19", 1, 70, 19, ["nihatya taṁ muniśreṣṭha sudhanvānaṁ narādhipam", "sāṁkāśye bhrātaraṁ śūram abhyaṣiñcaṁ kuśadhvajam"], "Janaka installed Kuśadhvaja as king at Sāṁkāśya."),
  s("1.70.21", 1, 70, 21, ["sītāṁ rāmāya bhadraṁ te ūrmilāṁ lakṣmaṇāya ca", "vīryaśulkāṁ mama sutāṁ sītāṁ surasutopamām"], "Janaka gives Sītā to Rāma and Ūrmilā to Lakṣmaṇa."),
  s("1.71.10", 1, 71, 10, ["evaṁ bhavatu bhadraṁ vaḥ kuśadhvajasute ime"], "Kuśadhvaja's two daughters are agreed for Bharata and Śatrughna.", { pada: "c" }),
  s("1.72.17", 1, 72, 17, ["iyaṁ sītā mama sutā sahadharmacarī tava"], "Janaka to Rāma: this Sītā, my daughter, is your partner in dharma.", { pada: "c" }),
  s("1.72.18", 1, 72, 18, ["lakṣmaṇāgaccha bhadraṁ te ūrmilām udyatāṁ mayā"], "Janaka offers Ūrmilā to Lakṣmaṇa.", { pada: "a" }),
  s("1.72.19", 1, 72, 19, ["gr̥hāṇa pāṇiṁ māṇḍavyāḥ pāṇinā raghunandana"], "Bharata takes Māṇḍavī's hand.", { pada: "c" }),
  s("1.72.20", 1, 72, 20, ["śrutakīrtyā mahābāho pāṇiṁ gr̥hṇīṣva pāṇinā"], "Śatrughna takes Śrutakīrti's hand.", { pada: "c" }),

  // ---- Bāla Kāṇḍa 1.69: Vasiṣṭha recites the Ikṣvāku line ----------------
  s("1.69.17", 1, 69, 17, ["avyaktaprabhavo brahmā śāśvato nitya avyayaḥ", "tasmān marīciḥ saṁjajñe marīceḥ kaśyapaḥ sutaḥ"], "Brahmā → Marīci → Kaśyapa.", { vulgateRef: "1.70.19–20" }),
  s("1.69.18", 1, 69, 18, ["vivasvān kaśyapāj jajñe manur vaivaisvataḥ smr̥taḥ", "manuḥ prajāpatiḥ pūrvam ikṣvākus tu manoḥ sutaḥ"], "Kaśyapa → Vivasvān → Manu → Ikṣvāku.", { vulgateRef: "1.70.20–21" }),
  s("1.69.19", 1, 69, 19, ["tam ikṣvākum ayodhyāyāṁ rājānaṁ viddhi pūrvakam", "ikṣvākos tu sutaḥ śrīmān vikukṣir udapadyata"], "Ikṣvāku was the first king in Ayodhyā; his son was Vikukṣi."),
  s("1.69.20", 1, 69, 20, ["vikukṣes tu mahātejā bāṇaḥ putraḥ pratāpavān", "bāṇasya tu mahātejā anaraṇyaḥ pratāpavān"], "Vikukṣi → Bāṇa → Anaraṇya."),
  s("1.69.21", 1, 69, 21, ["anaraṇyāt pr̥thur jajñe triśaṅkus tu pr̥thoḥ sutaḥ", "triśaṅkor abhavat putro dhundhumāro mahāyaśāḥ"], "Anaraṇya → Pr̥thu → Triśaṅku → Dhundhumāra."),
  s("1.69.22", 1, 69, 22, ["dhundhumārān mahātejā yuvanāśvo mahārathaḥ", "yuvanāśvasutaḥ śrīmān māndhātā pr̥thivīpatiḥ"], "Dhundhumāra → Yuvanāśva → Māndhātā."),
  s("1.69.23", 1, 69, 23, ["māndhātus tu sutaḥ śrīmān susaṁdhir udapadyata", "susaṁdher api putrau dvau dhruvasaṁdhiḥ prasenajit"], "Māndhātā → Susaṁdhi → Dhruvasaṁdhi and Prasenajit."),
  s("1.69.24", 1, 69, 24, ["yaśasvī dhruvasaṁdhes tu bharato nāma nāmataḥ", "bharatāt tu mahātejā asito nāma jāyata"], "Dhruvasaṁdhi → Bharata (the elder) → Asita."),
  s("1.69.25", 1, 69, 25, ["saha tena gareṇaiva jātaḥ sa sagaro ’bhavat", "sagarasyāsamañjas tu asamañjād athāṁśumān"], "Asita's son Sagara; Sagara → Asamañja → Aṁśumān."),
  s("1.69.26", 1, 69, 26, ["dilīpo ’ṁśumataḥ putro dilīpasya bhagīrathaḥ", "bhagīrathāt kakutsthaś ca kakutsthasya raghus tathā"], "Aṁśumān → Dilīpa → Bhagīratha → Kakutstha → Raghu."),
  s("1.69.27", 1, 69, 27, ["raghos tu putras tejasvī pravr̥ddhaḥ puruṣādakaḥ", "kalmāṣapādo hy abhavat tasmāj jātas tu śaṅkhaṇaḥ"], "Raghu → Pravr̥ddha (Kalmāṣapāda) → Śaṅkhaṇa."),
  s("1.69.28", 1, 69, 28, ["sudarśanaḥ śaṅkhaṇasya agnivarṇaḥ sudarśanāt", "śīghragas tv agnivarṇasya śīghragasya maruḥ sutaḥ"], "Śaṅkhaṇa → Sudarśana → Agnivarṇa → Śīghraga → Maru."),
  s("1.69.29", 1, 69, 29, ["maroḥ praśuśrukas tv āsīd ambarīṣaḥ praśuśrukāt", "ambarīṣasya putro ’bhūn nahuṣaḥ pr̥thivīpatiḥ"], "Maru → Praśuśruka → Ambarīṣa → Nahuṣa.", { vulgateRef: "1.70.41–42" }),
  s("1.69.30", 1, 69, 30, ["nahuṣasya yayātis tu nābhāgas tu yayātijaḥ", "nābhāgasya babhūvāja ajād daśaratho ’bhavat", "tasmād daśarathāj jātau bhrātarau rāmalakṣmaṇau"], "Nahuṣa → Yayāti → Nābhāga → Aja → Daśaratha → Rāma and Lakṣmaṇa.", { vulgateRef: "1.70.42–43" }),
  s("1.69.32", 1, 69, 32, ["rāmalakṣmaṇayor arthe tvatsute varaye nr̥pa"], "Vasiṣṭha asks Janaka for his daughters for Rāma and Lakṣmaṇa.", { pada: "a" }),

  // ---- Ayodhyā Kāṇḍa ------------------------------------------------------
  s("2.9.15", 2, 9, 15, ["tau varau yāca bhartāraṁ bharatasyābhiṣecanam", "pravrājanaṁ ca rāmasya tvaṁ varṣāṇi caturdaśa"], "Mantharā tells Kaikeyī to ask the two boons: Bharata's consecration and Rāma's exile for fourteen years."),
  s("2.9.21", 2, 9, 21, ["yau tau devāsure yuddhe varau daśaratho ’dadāt"], "Daśaratha had granted Kaikeyī two boons during the war of gods and demons.", { pada: "a" }),
  s("2.10.24", 2, 10, 24, ["varaṁ mama dadāty eṣa tan me śr̥ṇvantu devatāḥ"], "Kaikeyī calls the gods to witness Daśaratha's promise of a boon.", { pada: "c" }),
  s("2.48.26", 2, 48, 26, ["citrakūṭa iti khyāto gandhamādanasaṁnibhaḥ"], "Bharadvāja describes the mountain called Citrakūṭa.", { pada: "c" }),
  s("2.50.11", 2, 50, 11, ["ramyam āsedatuḥ śailaṁ citrakūṭaṁ manoramam"], "Rāma and Lakṣmaṇa reach the lovely mountain Citrakūṭa.", { pada: "c" }),
  s("2.58.57", 2, 58, 57, ["gate ’rdharātre bhr̥śaduḥkhapīḍitas; tadā jahau prāṇam udāradarśanaḥ"], "After midnight, crushed by grief, Daśaratha gave up his life."),
  s("2.104.21", 2, 104, 21, ["adhirohārya pādābhyāṁ pāduke hemabhūṣite"], "Bharata asks Rāma to step onto the gold-adorned sandals.", { pada: "a" }),
  s("2.105.13", 2, 105, 13, ["pāduke hemavikr̥te mama rājyāya te dadau"], "Bharata says Rāma gave the sandals for the kingdom's rule.", { pada: "c" }),

  // ---- Araṇya Kāṇḍa -------------------------------------------------------
  s("3.12.13", 3, 12, 13, ["deśo bahumr̥gaḥ śrīmān pañcavaṭy abhiviśrutaḥ"], "Agastya names the region famed as Pañcavaṭī.", { pada: "c" }),
  s("3.12.24", 3, 12, 24, ["tadāśramāt pañcavaṭīṁ jagmatuḥ saha sītayā"], "Rāma and Lakṣmaṇa went with Sītā to Pañcavaṭī.", { pada: "c" }),
  s("3.16.5", 3, 16, 5, ["sā tu śūrpaṇakhā nāma daśagrīvasya rakṣasaḥ"], "Śūrpaṇakhā is the sister of the ten-necked rākṣasa.", { pada: "a" }),
  s("3.16.19", 3, 16, 19, ["rāvaṇo nāma me bhrātā rākṣaso rākṣaseśvaraḥ"], "Śūrpaṇakhā: my brother is Rāvaṇa, lord of rākṣasas.", { pada: "a" }),
  s("3.38.16", 3, 38, 16, ["tvāṁ tu māyāmr̥gaṁ dr̥ṣṭvā kāñcanaṁ jātavismayā"], "Rāvaṇa tells Mārīca to become an illusory golden deer.", { pada: "a" }),
  s("3.47.15", 3, 47, 15, ["jagrāha rāvaṇaḥ sītāṁ budhaḥ khe rohiṇīm iva"], "Rāvaṇa seized Sītā.", { pada: "c" }),
  s("3.47.21", 3, 47, 21, ["viveṣṭamānām ādāya utpapāthātha rāvaṇaḥ"], "Rāvaṇa flew up carrying the struggling Sītā.", { pada: "c" }),
  s("3.49.6", 3, 49, 6, ["jaṭāyuḥ pratijagrāha rāvaṇāstrāṇi saṁyuge"], "Jaṭāyu withstood Rāvaṇa's weapons in combat.", { pada: "c" }),

  // ---- Kiṣkindhā Kāṇḍa ----------------------------------------------------
  s("4.2.13", 4, 2, 13, ["uvāca hanumān vākyaṁ sugrīvaṁ vākyakovidaḥ"], "Hanumān, skilled in speech, addresses Sugrīva.", { pada: "c" }),
  s("4.5.16", 4, 5, 16, ["sugrīvo rāghavaś caiva vayasyatvam upāgatau"], "Sugrīva and Rāma entered into friendship.", { pada: "c" }),
  s("4.11.21", 4, 11, 21, ["adhyāste vānaraḥ śrīmān kiṣkindhām atulaprabhām"], "The vānara (Vālin) rules in Kiṣkindhā.", { pada: "c" }),
  s("4.16.9", 4, 16, 9, ["taṁ tu tārā pariṣvajya vālinaṁ priyavādinī"], "Tārā embraces Vālin.", { pada: "a" }),
  s("4.16.25", 4, 16, 25, ["tato dhanuṣi saṁdhāya śaram āśīviṣopamam", "rāghaveṇa mahābāṇo vālivakṣasi pātitaḥ"], "Rāma's arrow strikes Vālin's chest."),
  s("4.17.1", 4, 17, 1, ["tataḥ śareṇābhihato rāmeṇa raṇakarkaśaḥ"], "Struck by Rāma's arrow, Vālin falls.", { pada: "a" }),
  s("4.23.21", 4, 23, 21, ["uvāca tārā piṅgākṣaṁ putram aṅgadam aṅganā"], "Tārā speaks to her son Aṅgada.", { pada: "c" }),
  s("4.65.8", 4, 65, 8, ["ajñaneti parikhyātā patnī kesariṇo hareḥ"], "Añjanā, wife of the monkey Kesarin.", { pada: "c" }),
  s("4.65.27", 4, 65, 27, ["sa tvaṁ kesariṇaḥ putraḥ kṣetrajo bhīmavikramaḥ"], "Hanumān is Kesarin's son (kṣetraja), fathered by the Wind.", { pada: "c" }),

  // ---- Sundara Kāṇḍa ------------------------------------------------------
  s("5.1.36", 5, 1, 36, ["gacchet tadvad gamiṣyāmi laṅkāṁ rāvaṇapālitām"], "Hanumān resolves to go to Laṅkā ruled by Rāvaṇa.", { pada: "c" }),
  s("5.1.60", 5, 1, 60, ["tasya vānarasiṁhasya plavamānasya sāgaram"], "The lion among vānaras leaps across the ocean.", { pada: "a" }),
  s("5.2.1", 5, 2, 1, ["trikūṭaśikhare laṅkāṁ sthitāṁ svastho dadarśa ha"], "Hanumān sees Laṅkā standing on the peak of Trikūṭa.", { pada: "c" }),
  s("5.13.15", 5, 13, 15, ["aśokavanikāyāṁ tu tasyāṁ vānarapuṁgavaḥ"], "Hanumān in the Aśoka grove.", { pada: "a" }),
  s("5.13.37", 5, 13, 37, ["duḥkhena bubudhe sītāṁ hanumān analaṁkr̥tām"], "Hanumān recognises the unadorned, grieving Sītā.", { pada: "a" }),
  s("5.34.2", 5, 34, 2, ["rāmanāmāṅkitaṁ cedaṁ paśya devy aṅgulīyakam"], "Hanumān shows Sītā the ring marked with Rāma's name.", { pada: "c" }),
  s("5.51.9", 5, 51, 9, ["lāṅgūlena pradīptena rākṣasāṁs tān apātayat"], "With his blazing tail Hanumān strikes down rākṣasas.", { pada: "a" }),

  // ---- Yuddha Kāṇḍa -------------------------------------------------------
  s("6.9.2", 6, 9, 2, ["indrajic ca mahātejā balavān rāvaṇātmajaḥ"], "Indrajit, the mighty son of Rāvaṇa.", { pada: "c" }),
  s("6.76.6", 6, 76, 6, ["śakrāśanisamasparśair lakṣmaṇenāhataḥ śaraiḥ"], "Indrajit is struck by Lakṣmaṇa's thunderbolt-like arrows.", { pada: "a" }),
  s("6.13.8", 6, 13, 8, ["tena cemaṁ mahāprājñam abhiṣiñca vibhīṣaṇam"], "Rāma orders Vibhīṣaṇa to be consecrated (as king of Laṅkā).", { pada: "a" }),
  s("6.15.22", 6, 15, 22, ["sa nalena kr̥taḥ setuḥ sāgare makarālaye"], "The bridge built by Nala across the ocean.", { pada: "a" }),
  s("6.56.1", 6, 56, 1, ["kumbhakarṇaṁ hataṁ dr̥ṣṭvā rāghaveṇa mahātmanā"], "Kumbhakarṇa slain by Rāma.", { pada: "a" }),
  s("6.78.42", 6, 78, 42, ["hatam indrajitaṁ dr̥ṣṭvā śayānaṁ samarakṣitau"], "Indrajit lies slain (by Lakṣmaṇa).", { pada: "a" }),
  s("6.97.17", 6, 97, 17, ["bibheda hr̥dayaṁ tasya rāvaṇasya durātmanaḥ"], "Rāma's arrow pierces Rāvaṇa's heart.", { pada: "c" }),
  s("6.98.1", 6, 98, 1, ["rāvaṇaṁ nihataṁ śrutvā rāghaveṇa mahātmanā"], "Rāvaṇa slain by Rāma.", { pada: "a" }),
  s("6.99.2", 6, 99, 2, ["patiṁ mandodarī tatra kr̥paṇā paryadevayat"], "Mandodarī laments her husband (Rāvaṇa).", { pada: "c" }),
  s("6.104.21", 6, 104, 21, ["citāṁ cakāra saumitrir mate rāmasya vīryavān"], "Lakṣmaṇa builds the pyre for Sītā's fire ordeal.", { pada: "c" }),
  s("6.112.15", 6, 112, 15, ["arghyaṁ pratigr̥hāṇedam ayodhyāṁ śvo gamiṣyasi"], "Rāma is told he will go to Ayodhyā tomorrow.", { pada: "c" }),

  // ---- Uttara Kāṇḍa -------------------------------------------------------
  s("7.9.8", 7, 9, 8, ["gaccha viśravasaṁ putri paulastyaṁ varaya svayam"], "Kaikasī is told to choose Viśravas, son of Pulastya.", { pada: "c" }),
  s("7.9.25", 7, 9, 25, ["daśaśīrṣaḥ prasūto ’yaṁ daśagrīvo bhaviṣyati"], "The ten-headed child (Rāvaṇa) is born to Kaikasī.", { pada: "c" }),
  s("7.9.26", 7, 9, 26, ["tasya tv anantaraṁ jātaḥ kumbhakarṇo mahābalaḥ"], "Then Kumbhakarṇa was born.", { pada: "a" }),
  s("7.9.27", 7, 9, 27, ["tataḥ śūrpaṇakhā nāma saṁjajñe vikr̥tānanā", "vibhīṣaṇaś ca dharmātmā kaikasyāḥ paścimaḥ sutaḥ"], "Then Śūrpaṇakhā, and Vibhīṣaṇa as Kaikasī's last son."),
  s("7.12.2", 7, 12, 2, ["svasāṁ śūrpaṇakhāṁ nāma vidyujjihvāya nāmataḥ"], "Rāvaṇa gives his sister Śūrpaṇakhā to Vidyujjihva.", { pada: "c" }),
  s("7.35.20", 7, 35, 20, ["tasya bhāryā babhūveṣṭā hy añjaneti pariśrutā", "janayām āsa tasyāṁ vai vāyur ātmajam uttamam"], "Kesarin's wife Añjanā; in her the Wind begot a son (Hanumān)."),
  s("7.58.7", 7, 58, 7, ["evaṁ kuśalavau nāmnā tāv ubhau yamajātakau"], "The twins named Kuśa and Lava.", { pada: "a" }),
  s("7.88.4", 7, 88, 4, ["jānāmi cemau putrau me yamajātau kuśīlavau"], "Rāma recognises Kuśa and Lava as his twin sons.", { pada: "a" }),
];

export const sourceById: ReadonlyMap<string, Source> = new Map(sources.map((x) => [x.id, x]));
