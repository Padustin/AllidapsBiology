export type PadillaQuestion = {
  id: string;
  unit?: string;
  difficulty?: string;
  topic?: string;
  text: string;
  choices: string[];
  correct: number;
  explain: string;
  choiceExplanations?: string[];
};

export const PADILLA_QUESTIONS: PadillaQuestion[] = [
  {
    "id": "PADILLA-001",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Origin of Life",
    "text": "A student claims that the Miller-Urey experiment proved that life first evolved in the atmosphere of early Earth. Which statement is the best correction?",
    "choices": [
      "The experiment showed that self-replicating cells can form spontaneously in a reducing atmosphere.",
      "The experiment showed that inorganic precursors can be abiotically converted into small organic molecules under simulated early-Earth conditions.",
      "The experiment proved that protobionts were the first organisms and that they immediately used DNA as hereditary material.",
      "The experiment demonstrated that oxygen-rich conditions favor the synthesis of amino acids from methane and ammonia."
    ],
    "correct": 1,
    "explain": "The Miller-Urey setup did not create living cells. It provided evidence for the first stage of chemical evolution by showing that inorganic molecules could be used to generate small organic molecules under simulated early-Earth conditions. That supports abiotic synthesis of monomers, not the full origin of living cells.",
    "choiceExplanations": [
      "Incorrect. The experiment did not generate self-replicating cells or prove spontaneous generation of life.",
      "Correct. This matches the evidence used to support abiotic synthesis of small organic molecules in the origin-of-life model.",
      "Incorrect. The experiment did not produce protobionts, cells, or DNA-based heredity.",
      "Incorrect. The classic model involved a reducing atmosphere with little or no oxygen; oxygen would generally interfere with that synthesis model."
    ]
  },
  {
    "id": "PADILLA-002",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Origin of Life",
    "text": "Which sequence best matches the four-stage hypothesis for the origin of life emphasized in the notes?",
    "choices": [
      "Protobionts form first, then RNA evolves, then monomers form, then polymers assemble.",
      "Abiotic formation of monomers, joining of monomers into polymers, emergence of self-replicating molecules, packaging into protobionts.",
      "DNA replication begins, then photosynthesis evolves, then prokaryotes appear, then eukaryotes arise.",
      "Organic molecules form only after the first membranes appear and isolate metabolism."
    ],
    "correct": 1,
    "explain": "The notes present chemical evolution as a progression: abiotic synthesis of small organic molecules, polymer formation, emergence of self-replicating molecules, and packaging into protobionts. A common trap is to place membranes first, but compartmentalization comes after key organic chemistry steps.",
    "choiceExplanations": [
      "Incorrect. This reverses the order; protobionts are not the first step.",
      "Correct. This is the sequence described in the notes for the origin of the first cells.",
      "Incorrect. This mixes later biological events with prebiotic chemistry.",
      "Incorrect. Membrane-like packaging is later than monomer and polymer formation."
    ]
  },
  {
    "id": "PADILLA-003",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "RNA World",
    "text": "Why is RNA considered a stronger candidate than DNA for the earliest hereditary molecule?",
    "choices": [
      "RNA can store information and some RNA molecules can catalyze reactions, including steps in RNA processing and synthesis.",
      "RNA is chemically more stable than DNA in all environments.",
      "RNA replicates with perfect fidelity, so mutation would not have affected early evolution.",
      "RNA contains thymine, which makes it easier to copy than DNA."
    ],
    "correct": 0,
    "explain": "The RNA world idea is supported because RNA can act both as genetic material and as a catalyst. Ribozymes show that RNA can participate directly in chemical reactions, making it plausible before the modern DNA-protein system evolved.",
    "choiceExplanations": [
      "Correct. RNA combines information storage with catalytic ability, which is why it is such a strong early-life candidate.",
      "Incorrect. RNA is generally less stable than DNA, not more stable in all conditions.",
      "Incorrect. Early replication would not have been error-free; mutation is actually important for selection.",
      "Incorrect. RNA uses uracil, not thymine."
    ]
  },
  {
    "id": "PADILLA-004",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Protobionts",
    "text": "Which property would most strongly justify calling an aggregate of abiotically produced molecules a protobiont rather than just a random droplet?",
    "choices": [
      "It contains modern ribosomes and a double-membrane nucleus.",
      "It maintains an internal chemical environment distinct from its surroundings and shows some life-like properties.",
      "It can only persist in the presence of free atmospheric oxygen.",
      "It is made entirely of proteins synthesized by preexisting cells."
    ],
    "correct": 1,
    "explain": "Protobionts are not true cells, but they are more than random droplets. The key idea is compartmentalization: a boundary that allows a distinct internal environment and some life-like properties such as simple metabolism-like chemistry or responsiveness.",
    "choiceExplanations": [
      "Incorrect. Ribosomes and nuclei are features of much later, fully cellular life.",
      "Correct. This matches the definition from the notes.",
      "Incorrect. Early Earth lacked abundant free oxygen, and oxygen is not what defines a protobiont.",
      "Incorrect. That would make it a product of existing life, not prebiotic chemistry."
    ]
  },
  {
    "id": "PADILLA-005",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Early Earth",
    "text": "Which observation would best support the claim that photosynthetic prokaryotes dramatically altered Earth's atmosphere?",
    "choices": [
      "A rise in sedimentary layers containing oxidized iron after oxygen-producing organisms became common.",
      "The sudden appearance of flowering plants before any prokaryotic fossils.",
      "The disappearance of all volcanic activity at the same time prokaryotes evolved.",
      "The immediate formation of eukaryotes as soon as methane appeared in the atmosphere."
    ],
    "correct": 0,
    "explain": "The notes connect cyanobacteria, oxygen release, and the Great Oxygenation Event with the formation of red iron oxide bands. Oxidized iron in rocks is a strong clue that oxygen was accumulating and reacting with reduced materials on Earth.",
    "choiceExplanations": [
      "Correct. Oxidized iron deposits are exactly the kind of evidence expected if oxygen levels rose due to photosynthesis.",
      "Incorrect. Flowering plants evolved far later and do not explain the first atmospheric oxygen increase.",
      "Incorrect. Volcanic activity did not simply stop because prokaryotes evolved.",
      "Incorrect. Eukaryotes did not appear immediately, and methane alone does not cause their sudden origin."
    ]
  },
  {
    "id": "PADILLA-006",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Great Oxygenation Event",
    "text": "A student says the Great Oxygenation Event happened because organisms began using oxygen in cellular respiration. Which response is most accurate?",
    "choices": [
      "That is correct because oxygen is produced as a byproduct of aerobic respiration.",
      "That is incorrect because cyanobacteria increased atmospheric oxygen through photosynthesis, which then allowed aerobic respiration to become more important.",
      "That is correct because archaeans released oxygen when they split water during chemosynthesis.",
      "That is incorrect because the event was caused by land plants growing across Earth's continents."
    ],
    "correct": 1,
    "explain": "The causal order matters. Oxygen-producing photosynthesis, especially by cyanobacteria, raised oxygen levels. Aerobic respiration depends on oxygen already being available; it did not create the Great Oxygenation Event.",
    "choiceExplanations": [
      "Incorrect. Aerobic respiration consumes oxygen rather than producing it.",
      "Correct. Photosynthetic cyanobacteria are the key cause in the notes.",
      "Incorrect. Chemosynthesis does not explain the oxygen rise described here.",
      "Incorrect. Land plants evolved much later than the Great Oxygenation Event."
    ]
  },
  {
    "id": "PADILLA-007",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Fossils and Early Life",
    "text": "Why are stromatolites especially important in studying early life?",
    "choices": [
      "They are fossilized bacterial mats that preserve evidence of ancient prokaryotic communities.",
      "They are the earliest known fossils of multicellular animals.",
      "They prove that eukaryotes evolved before prokaryotes.",
      "They are direct fossils of the first land plants."
    ],
    "correct": 0,
    "explain": "Stromatolites are layered structures associated with bacterial mats, so they provide evidence of ancient prokaryotic life. They are important because early life was dominated by prokaryotes, not complex multicellular organisms.",
    "choiceExplanations": [
      "Correct. Stromatolites record ancient microbial communities, especially prokaryotes.",
      "Incorrect. They are not early multicellular animal fossils.",
      "Incorrect. They support the early dominance of prokaryotes, not eukaryotes.",
      "Incorrect. Land plants arose far later."
    ]
  },
  {
    "id": "PADILLA-008",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Early Earth Timeline",
    "text": "Which event occurred earliest according to the Unit 6 materials?",
    "choices": [
      "The origin of multicellular eukaryotes.",
      "The oldest prokaryotic fossils.",
      "The first humans.",
      "The colonization of land by plants and symbiotic fungi."
    ],
    "correct": 1,
    "explain": "The timeline in Lesson 1 places the oldest prokaryotic fossils deep in Earth's history, long before multicellular eukaryotes, land colonization by plants, or humans. A common mistake is to underestimate how long prokaryotes dominated Earth.",
    "choiceExplanations": [
      "Incorrect. Multicellular eukaryotes arose much later.",
      "Correct. The oldest prokaryotic fossils are among the earliest major life events listed.",
      "Incorrect. Humans are extremely recent on the evolutionary timeline.",
      "Incorrect. Land colonization happened long after early prokaryotes."
    ]
  },
  {
    "id": "PADILLA-009",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Darwin and Geology",
    "text": "Darwin's thinking was influenced by both Cuvier and Lyell, but in different ways. Which pairing is correct?",
    "choices": [
      "Cuvier supported slow cumulative geologic change, whereas Lyell emphasized sudden catastrophic extinctions.",
      "Cuvier helped highlight the significance of fossils and extinction, whereas Lyell argued that slow continuous processes shape Earth over long periods.",
      "Cuvier argued for inheritance of acquired characteristics, whereas Lyell proposed natural selection.",
      "Both Cuvier and Lyell rejected the idea that Earth changes over time."
    ],
    "correct": 1,
    "explain": "Cuvier's work in paleontology and catastrophism drew attention to extinction and the fossil record. Lyell promoted gradualism: slow, ongoing processes acting over long timescales. Darwin drew on both the fossil evidence and the concept of an ancient, changing Earth.",
    "choiceExplanations": [
      "Incorrect. This reverses their positions.",
      "Correct. This accurately distinguishes Cuvier's and Lyell's contributions.",
      "Incorrect. Inheritance of acquired characteristics is associated with Lamarck, and natural selection with Darwin and Wallace.",
      "Incorrect. Both contributed to the idea that Earth and life have a history."
    ]
  },
  {
    "id": "PADILLA-010",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Relative Dating",
    "text": "In undisturbed sedimentary rock, a clam fossil is found below a fish fossil. Which conclusion is best supported?",
    "choices": [
      "The fish fossil is older because vertebrates evolved before clams.",
      "The clam fossil is older because deeper strata are generally older than shallower strata.",
      "The two fossils are the same age because both are in sedimentary rock.",
      "Relative dating cannot compare fossils unless their absolute ages are known first."
    ],
    "correct": 1,
    "explain": "Relative dating relies on the position of strata. In undisturbed sedimentary rock, deeper layers are older than layers above them. This does not require absolute dating first.",
    "choiceExplanations": [
      "Incorrect. Stratigraphic position matters here, not the general complexity of the organism.",
      "Correct. This applies the principle of superposition.",
      "Incorrect. Being in the same rock type does not mean the same age.",
      "Incorrect. Relative dating can be done without absolute age estimates."
    ]
  },
  {
    "id": "PADILLA-011",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Natural Selection",
    "text": "Which statement best captures Darwin's logic rather than a common misconception about evolution?",
    "choices": [
      "Individuals evolve useful traits during their lifetimes because they need them.",
      "Natural selection acts directly on populations, but only individuals reproduce.",
      "Natural selection acts on individuals with heritable variation, and populations evolve as allele frequencies change over generations.",
      "Evolution occurs only when every member of a species changes in the same direction at the same time."
    ],
    "correct": 2,
    "explain": "Darwinian evolution depends on heritable variation among individuals and differential survival or reproduction. Selection acts on individuals, but the evolutionary change is measured in populations across generations.",
    "choiceExplanations": [
      "Incorrect. This reflects Lamarckian-style thinking, not Darwinian natural selection.",
      "Incorrect. Selection acts on individuals; populations evolve.",
      "Correct. This is the most accurate statement of Darwinian evolution.",
      "Incorrect. Evolution can occur gradually through changes in allele frequencies without all individuals changing simultaneously."
    ]
  },
  {
    "id": "PADILLA-012",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Darwinian Observations",
    "text": "Which combination of observations most directly leads to the inference of a struggle for existence?",
    "choices": [
      "Resources are limited, and if all individuals reproduced successfully populations would grow exponentially.",
      "Individuals vary, and some variation is heritable.",
      "Fossils occur in strata, and Earth is ancient.",
      "Species on islands resemble species on nearby continents."
    ],
    "correct": 0,
    "explain": "The struggle for existence follows from the mismatch between the potential for rapid population growth and the reality of limited resources. Variation and heritability are crucial for natural selection, but they support the inference of differential reproductive success rather than the struggle itself.",
    "choiceExplanations": [
      "Correct. These observations create competition because not all offspring can survive and reproduce.",
      "Incorrect. This pair supports natural selection once competition already exists.",
      "Incorrect. These observations support deep time and change over time, not specifically the struggle for existence.",
      "Incorrect. That pattern supports biogeography and common descent."
    ]
  },
  {
    "id": "PADILLA-013",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Antibiotic Resistance",
    "text": "Why can stopping an antibiotic treatment early increase the frequency of resistant bacteria in a population?",
    "choices": [
      "The antibiotic causes bacteria to intentionally mutate in response to danger.",
      "Resistant bacteria are more complex and therefore reproduce faster in every environment.",
      "Susceptible bacteria are killed first, leaving resistant survivors to reproduce and contribute more of the next generation.",
      "Antibiotics gradually lose their chemical power each day they are taken."
    ],
    "correct": 2,
    "explain": "The key point is selection, not need-based mutation. If treatment stops early, surviving resistant bacteria face less competition and can leave proportionally more descendants, increasing resistance in the population.",
    "choiceExplanations": [
      "Incorrect. The classic explanation is selection on existing variation, not purposeful mutation.",
      "Incorrect. Resistance does not mean bacteria always reproduce faster; often it helps specifically under drug exposure.",
      "Correct. This is the standard natural-selection explanation for antibiotic resistance.",
      "Incorrect. The problem is not that the drug 'wears out' inside one patient."
    ]
  },
  {
    "id": "PADILLA-014",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Biogeography and Adaptation",
    "text": "Galapagos finches are useful evidence for evolution primarily because they show that",
    "choices": [
      "closely related species can diverge as populations adapt to different environments and food sources.",
      "organisms on islands are always unrelated to organisms on nearby continents.",
      "adaptations appear simultaneously in every species occupying the same island.",
      "species differences are caused only by use and disuse of structures."
    ],
    "correct": 0,
    "explain": "The finches support descent with modification and adaptive radiation. Related populations can diverge under different ecological conditions, producing new species with different beak forms and feeding strategies.",
    "choiceExplanations": [
      "Correct. This is the core evolutionary lesson from the finches.",
      "Incorrect. Island species are often closely related to mainland ancestors.",
      "Incorrect. Adaptation is lineage-specific, not automatically shared by all island species.",
      "Incorrect. Use and disuse is not Darwin's mechanism."
    ]
  },
  {
    "id": "PADILLA-015",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Theory in Science",
    "text": "A classmate says evolution is 'just a theory.' Which scientific response is strongest?",
    "choices": [
      "A theory in science is a weak guess that has not yet been tested.",
      "Evolution is not theoretical because it has been directly seen in every species.",
      "A scientific theory is a broad explanatory framework that accounts for many observations and integrates a large body of evidence.",
      "A theory becomes a law once enough fossils are found."
    ],
    "correct": 2,
    "explain": "In science, a theory is not a casual guess. It is a well-supported explanatory framework that unifies many observations and generates testable predictions. Darwin's theory of evolution by natural selection is treated that way in biology.",
    "choiceExplanations": [
      "Incorrect. That is a common misuse of the word theory.",
      "Incorrect. Direct observation in every species is not required for a scientific theory to be strong.",
      "Correct. This is the scientific meaning of theory.",
      "Incorrect. Theories and laws serve different roles in science; one does not simply turn into the other."
    ]
  },
  {
    "id": "PADILLA-016",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Convergent Evolution",
    "text": "A sugar glider and a flying squirrel both glide and have similar body forms, but one is a marsupial and the other is a placental mammal. This most directly illustrates",
    "choices": [
      "homologous structures produced by a recent common ancestor with gliding membranes.",
      "convergent evolution producing analogous similarities under similar selective pressures.",
      "that marsupials and placentals are members of the same species.",
      "that structures with similar functions always indicate close evolutionary relatedness."
    ],
    "correct": 1,
    "explain": "Similar function does not always mean recent common ancestry. In this case, similar selective pressures favored similar gliding adaptations independently in distantly related mammals, producing analogous traits.",
    "choiceExplanations": [
      "Incorrect. The similarity is not best explained by a recent shared gliding ancestor.",
      "Correct. This is a classic example of convergent evolution and analogy.",
      "Incorrect. They are not the same species.",
      "Incorrect. Similar function can arise independently."
    ]
  },
  {
    "id": "PADILLA-017",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Cladograms",
    "text": "In a cladogram, two taxa are considered most closely related when they",
    "choices": [
      "appear next to each other at the tips of the diagram.",
      "share the greatest number of analogous traits.",
      "share the most recent common ancestor.",
      "are both equally distant from the root in terms of branch length on the page."
    ],
    "correct": 2,
    "explain": "Cladograms are interpreted by branching pattern, not by how close names appear visually. The most closely related taxa are the ones sharing the most recent common ancestor.",
    "choiceExplanations": [
      "Incorrect. Tip order can often be rotated without changing relationships.",
      "Incorrect. Analogous traits can mislead because they may result from convergence.",
      "Correct. This is the defining criterion for relatedness in cladistics.",
      "Incorrect. Visual distance on the page is not the key unless the tree is explicitly scaled for time."
    ]
  },
  {
    "id": "PADILLA-018",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Shared Derived Characters",
    "text": "A cladogram shows feature 1 at the base of a clade containing A, B, and C; feature 2 on the branch leading to the common ancestor of B and C; and feature 3 only on the branch to C. Which statement is correct?",
    "choices": [
      "A and C are more closely related than B and C because both share feature 1.",
      "B and C are more closely related to each other than either is to A.",
      "Feature 3 proves that C is the ancestor of B.",
      "Feature 2 must also be present in A because A is in the same cladogram."
    ],
    "correct": 1,
    "explain": "Feature 2 is a shared derived character uniting B and C. Because B and C share a more recent common ancestor than either does with A, they are more closely related.",
    "choiceExplanations": [
      "Incorrect. Feature 1 unites all three, but feature 2 shows B and C are closer to each other.",
      "Correct. This follows directly from the placement of feature 2.",
      "Incorrect. A derived feature in C does not make C the ancestor of B.",
      "Incorrect. A lacks feature 2 if the feature arose after A branched off."
    ]
  },
  {
    "id": "PADILLA-019",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Outgroups",
    "text": "Why is an outgroup useful in cladistic analysis?",
    "choices": [
      "It identifies which characters in the ingroup are ancestral versus derived.",
      "It guarantees that the resulting tree is absolutely correct and cannot be revised.",
      "It provides a species inside the ingroup that has the most mutations.",
      "It removes the need to compare DNA or morphology among ingroup taxa."
    ],
    "correct": 0,
    "explain": "Outgroups help polarize character states. If a trait is shared by the outgroup and ingroup, it is inferred to be ancestral relative to the ingroup, making it easier to identify derived changes within the clade being studied.",
    "choiceExplanations": [
      "Correct. This is the main purpose of an outgroup.",
      "Incorrect. Cladograms remain hypotheses and can be revised with new evidence.",
      "Incorrect. The outgroup is outside the ingroup, not a highly mutated ingroup member.",
      "Incorrect. Outgroups help interpretation but do not replace actual comparison."
    ]
  },
  {
    "id": "PADILLA-020",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Taxonomy",
    "text": "Which statement about binomial nomenclature is correct?",
    "choices": [
      "The specific epithet alone is the full species name.",
      "Both the genus and specific epithet together name the species.",
      "The genus is always lowercase and the specific epithet is capitalized.",
      "Binomial nomenclature applies only to animals, not plants or microbes."
    ],
    "correct": 1,
    "explain": "In binomial nomenclature, the species name consists of two parts together: genus plus specific epithet. A common trap is to treat the specific epithet alone as the species name, but it is not complete by itself.",
    "choiceExplanations": [
      "Incorrect. The specific epithet alone is incomplete.",
      "Correct. Both parts together identify the species.",
      "Incorrect. The genus is capitalized; the specific epithet is lowercase.",
      "Incorrect. The binomial system is broadly used across life."
    ]
  },
  {
    "id": "PADILLA-021",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Molecular Homology",
    "text": "Why are homologous genes useful for inferring evolutionary relationships?",
    "choices": [
      "They are similar only because organisms live in similar environments.",
      "They are inherited from a common ancestor, so comparing them can reveal patterns of descent.",
      "They arise only through horizontal gene transfer and therefore show no ancestry.",
      "They are identical in all species and therefore cannot be compared."
    ],
    "correct": 1,
    "explain": "Homologous genes are useful precisely because they reflect inheritance from common ancestors. Similarities and differences accumulated over time can be compared to infer relatedness.",
    "choiceExplanations": [
      "Incorrect. Similar environments can produce analogy, but homology specifically refers to shared ancestry.",
      "Correct. This is why DNA comparison is so powerful in phylogeny.",
      "Incorrect. Horizontal transfer can complicate analysis, but homologous genes are not defined that way.",
      "Incorrect. Homologous genes are comparable because they are similar but not necessarily identical."
    ]
  },
  {
    "id": "PADILLA-022",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Orthologs and Paralogs",
    "text": "Two species each possess gene X. A phylogeny indicates that the genes diverged when the species split from a common ancestor. These genes are best classified as",
    "choices": [
      "paralogous, because they diverged after gene duplication within one lineage.",
      "orthologous, because they diverged after a speciation event and often retain similar functions.",
      "analogous, because they perform similar functions in different organisms.",
      "homoplastic, because they arose independently in each species."
    ],
    "correct": 1,
    "explain": "Orthologs are homologous genes separated by speciation. Paralogs are homologs produced by duplication within a lineage. Students often confuse the two because both involve homologous genes.",
    "choiceExplanations": [
      "Incorrect. That definition fits paralogs only if the divergence followed duplication within a lineage.",
      "Correct. Divergence after speciation indicates orthology.",
      "Incorrect. Analogous usually describes similar function without common ancestry, not this situation.",
      "Incorrect. Independent origin is not what the scenario describes."
    ]
  },
  {
    "id": "PADILLA-023",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "LUCA",
    "text": "LUCA is best described as",
    "choices": [
      "the first eukaryotic cell from which plants, fungi, and animals evolved.",
      "the most recent organism from which bacteria descended but archaea and eukaryotes did not.",
      "the hypothesized common ancestral cell from which the three domains of life ultimately originated.",
      "a fossil species that has been directly recovered intact from Precambrian rock."
    ],
    "correct": 2,
    "explain": "LUCA stands for Last Universal Common Ancestor. It is a hypothesized ancestral cell placed before the divergence of Bacteria, Archaea, and Eukarya.",
    "choiceExplanations": [
      "Incorrect. LUCA predates eukaryotes and is not limited to them.",
      "Incorrect. LUCA refers to ancestry of all three domains.",
      "Correct. This is the definition given in the notes.",
      "Incorrect. LUCA is hypothesized, not a directly recovered intact fossil organism."
    ]
  },
  {
    "id": "PADILLA-024",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Molecular Clocks",
    "text": "What assumption underlies the use of a molecular clock?",
    "choices": [
      "All mutations are advantageous and therefore spread at the same rate.",
      "Some genes or genomic regions accumulate changes at approximately regular rates over time.",
      "Every lineage experiences the same generation time and population size.",
      "The fossil record is complete enough that DNA is no longer needed."
    ],
    "correct": 1,
    "explain": "Molecular clocks are based on the idea that some sequences change in a roughly regular way over time. This can help estimate divergence times, though uncertainty increases for very old splits and when selection disturbs the rate.",
    "choiceExplanations": [
      "Incorrect. Molecular clocks do not assume all mutations are beneficial.",
      "Correct. That is the core assumption behind the approach.",
      "Incorrect. Those factors can affect rates and complicate the clock rather than define it.",
      "Incorrect. Molecular clocks are especially useful beyond the limits of the fossil record."
    ]
  },
  {
    "id": "PADILLA-025",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Species Concepts",
    "text": "Which scenario is the clearest limitation of the biological species concept?",
    "choices": [
      "Two populations are morphologically different and occupy different niches.",
      "A researcher is trying to classify fossils or organisms that reproduce asexually.",
      "Two populations have different courtship behaviors and do not mate.",
      "Hybrid offspring are sterile."
    ],
    "correct": 1,
    "explain": "The biological species concept depends on reproductive isolation, which is difficult or impossible to evaluate in fossils and many asexual organisms. That is a classic limitation of the concept.",
    "choiceExplanations": [
      "Incorrect. This may be informative, but it is not the key limitation of the biological species concept.",
      "Correct. Reproductive compatibility cannot be directly tested in fossils and many asexual lineages.",
      "Incorrect. Different courtship behavior is a prezygotic barrier, which the biological species concept can use.",
      "Incorrect. Sterile hybrids are a postzygotic barrier, also compatible with the concept."
    ]
  },
  {
    "id": "PADILLA-026",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Prezygotic Isolation",
    "text": "Two closely related frog species breed in the same pond, but one breeds in early spring and the other in midsummer. Which barrier is most directly involved?",
    "choices": [
      "Habitat isolation",
      "Temporal isolation",
      "Mechanical isolation",
      "Gametic isolation"
    ],
    "correct": 1,
    "explain": "Because the species use the same location but reproduce at different times, the barrier is temporal isolation. Students often confuse it with habitat isolation because both reduce mating, but the habitats here overlap.",
    "choiceExplanations": [
      "Incorrect. They share the same pond, so habitat is not the main barrier.",
      "Correct. Different breeding times create temporal isolation.",
      "Incorrect. Mechanical isolation involves incompatible reproductive structures.",
      "Incorrect. Gametic isolation occurs after mating is attempted but fertilization fails."
    ]
  },
  {
    "id": "PADILLA-027",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Postzygotic Isolation",
    "text": "A mule is produced from a horse and a donkey and is healthy but usually sterile. This is an example of",
    "choices": [
      "reduced hybrid viability",
      "reduced hybrid fertility",
      "hybrid breakdown",
      "behavioral isolation"
    ],
    "correct": 1,
    "explain": "The hybrid survives well but is typically infertile, so the barrier is reduced hybrid fertility. Reduced viability would mean the hybrid is weak or fails to develop normally; hybrid breakdown usually appears in later generations.",
    "choiceExplanations": [
      "Incorrect. The key issue is not survival but fertility.",
      "Correct. Sterility is reduced hybrid fertility.",
      "Incorrect. Hybrid breakdown usually affects descendants of hybrids.",
      "Incorrect. Behavioral isolation is prezygotic, before a hybrid even forms."
    ]
  },
  {
    "id": "PADILLA-028",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Speciation",
    "text": "Which event would most directly initiate allopatric speciation?",
    "choices": [
      "A chromosome duplication event in a plant population living together in one field.",
      "A river changes course and physically separates one population into two isolated groups.",
      "Females within a population start preferring brighter-colored males.",
      "Two populations begin using different pollinators while still exchanging genes freely."
    ],
    "correct": 1,
    "explain": "Allopatric speciation begins when geographic isolation interrupts gene flow. The river creates a physical barrier, which is the defining feature here.",
    "choiceExplanations": [
      "Incorrect. That is more consistent with sympatric speciation through chromosomal change.",
      "Correct. Geographic isolation is the hallmark of allopatric speciation.",
      "Incorrect. Mate choice can contribute to sympatric processes but is not geographic isolation.",
      "Incorrect. If genes are still exchanged freely, speciation has not been initiated effectively."
    ]
  },
  {
    "id": "PADILLA-029",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Sympatric Speciation",
    "text": "Which situation best fits sympatric speciation?",
    "choices": [
      "A mountain range divides a population of squirrels into eastern and western populations.",
      "A flood carries a few birds to an island where they become isolated from the mainland.",
      "Within one population, a chromosomal change produces a group that becomes reproductively isolated without geographic separation.",
      "Two populations of fish are separated by a newly formed canyon."
    ],
    "correct": 2,
    "explain": "Sympatric speciation occurs without geographic separation. Chromosomal changes or nonrandom mating can create reproductive isolation inside the original population.",
    "choiceExplanations": [
      "Incorrect. This is geographic isolation and therefore allopatric.",
      "Incorrect. Island isolation is also allopatric.",
      "Correct. Reproductive isolation arises within the same geographic area.",
      "Incorrect. A canyon is a geographic barrier, again allopatric."
    ]
  },
  {
    "id": "PADILLA-030",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Gradualism vs Punctuated Equilibrium",
    "text": "Which pattern would most strongly support punctuated equilibrium rather than gradualism?",
    "choices": [
      "Slow, continuous anatomical change across many successive fossil layers.",
      "Long periods of little morphological change interrupted by relatively brief episodes of rapid divergence.",
      "Repeated hybridization between neighboring species with constant gene flow.",
      "A perfectly complete fossil record with no extinctions."
    ],
    "correct": 1,
    "explain": "Punctuated equilibrium proposes that species often remain relatively unchanged for long intervals, with major morphological change concentrated in shorter bursts associated with speciation.",
    "choiceExplanations": [
      "Incorrect. That pattern better matches gradualism.",
      "Correct. This is the classic punctuated-equilibrium pattern.",
      "Incorrect. Gene flow tends to reduce divergence rather than support punctuated change.",
      "Incorrect. That is not the defining distinction between the two models."
    ]
  },
  {
    "id": "PADILLA-031",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Sexual Selection",
    "text": "Large antlers in male deer are most directly explained by which form of sexual selection?",
    "choices": [
      "Intersexual selection, because females physically fight one another for males.",
      "Intrasexual selection, because members of one sex compete directly for access to mates.",
      "Stabilizing selection, because intermediate antler size is always favored.",
      "Disruptive selection, because both tiny and giant antlers are always favored simultaneously."
    ],
    "correct": 1,
    "explain": "Antlers are classic examples of intrasexual selection, in which males compete with other males for access to mates. Intersexual selection usually refers to mate choice, often by females.",
    "choiceExplanations": [
      "Incorrect. That does not describe the usual deer example.",
      "Correct. Male-male competition is intrasexual selection.",
      "Incorrect. Stabilizing selection is not the key explanation here.",
      "Incorrect. Disruptive selection is not the standard sexual-selection explanation for antlers."
    ]
  },
  {
    "id": "PADILLA-032",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Sexual Selection",
    "text": "A peahen consistently mates with males that have the most elaborate tails. This is best described as",
    "choices": [
      "intrasexual selection, because males are competing physically with one another.",
      "intersexual selection, because one sex is choosing mates based on traits in the other sex.",
      "genetic drift, because tail size changes randomly.",
      "bottlenecking, because only a few peacocks survive each year."
    ],
    "correct": 1,
    "explain": "This is intersexual selection: mate choice. One sex, often females, chooses mates based on traits such as showiness, song, or display quality.",
    "choiceExplanations": [
      "Incorrect. Physical competition among one sex is intrasexual selection.",
      "Correct. Female choice is the defining clue here.",
      "Incorrect. The scenario involves nonrandom mating, not random drift.",
      "Incorrect. There is no population crash in the description."
    ]
  },
  {
    "id": "PADILLA-033",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "r/K Selection",
    "text": "Which organism would most likely show an r-selected life-history pattern?",
    "choices": [
      "A large mammal in a stable environment that produces few offspring and provides prolonged parental care.",
      "A small organism in an unstable environment that matures quickly and produces many offspring with little parental investment.",
      "An organism that reproduces only after many years and invests heavily in each young.",
      "A species whose population size remains close to carrying capacity and whose offspring survival is high because of extensive care."
    ],
    "correct": 1,
    "explain": "r-selected organisms are typically small, reproduce quickly, and produce many offspring in unstable environments. K-selected organisms show the opposite pattern: fewer offspring, slower development, and more parental investment.",
    "choiceExplanations": [
      "Incorrect. That is K-selected.",
      "Correct. This matches the r-selected pattern in the notes.",
      "Incorrect. Heavy investment and delayed reproduction fit K-selection.",
      "Incorrect. Again, that is a K-selected description."
    ]
  },
  {
    "id": "PADILLA-034",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Genetic Drift",
    "text": "Which statement best distinguishes genetic drift from natural selection?",
    "choices": [
      "Genetic drift changes allele frequencies through random sampling effects, especially in small populations.",
      "Genetic drift always increases adaptation to the environment.",
      "Genetic drift affects only genotype frequencies, never allele frequencies.",
      "Genetic drift occurs only when mutations are beneficial."
    ],
    "correct": 0,
    "explain": "Genetic drift is random change in allele frequency caused by chance events, and its effects are strongest in small populations. Unlike natural selection, drift does not consistently move populations toward better adaptation.",
    "choiceExplanations": [
      "Correct. This is the essential definition of drift.",
      "Incorrect. Drift can even reduce fitness by chance.",
      "Incorrect. Drift directly changes allele frequencies.",
      "Incorrect. Drift does not require beneficial mutation."
    ]
  },
  {
    "id": "PADILLA-035",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Founder Effect vs Bottleneck",
    "text": "A few individuals leave a mainland population and establish a new island population whose allele frequencies differ markedly from the source population. This is most specifically",
    "choices": [
      "gene flow",
      "the bottleneck effect",
      "the founder effect",
      "disruptive selection"
    ],
    "correct": 2,
    "explain": "The founder effect is a form of genetic drift in which a small subgroup starts a new population. Because that subgroup carries only a sample of the original gene pool, allele frequencies can differ substantially from the source population.",
    "choiceExplanations": [
      "Incorrect. Movement occurs, but the main concept is the sampling effect in the new small population.",
      "Incorrect. A bottleneck follows a dramatic reduction in size of an existing population, not colonization by founders.",
      "Correct. This is the founder effect.",
      "Incorrect. No phenotype-based selection pattern is described."
    ]
  },
  {
    "id": "PADILLA-036",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Bottleneck Effect",
    "text": "A wildfire drastically reduces a lizard population from 10,000 individuals to 35 survivors. Years later the population rebounds, but many alleles from the original population are missing. Which explanation is best?",
    "choices": [
      "Gene flow restored the original variation and then removed it again.",
      "Natural selection must have favored every missing allele against survival in the fire.",
      "The population experienced a bottleneck, a form of genetic drift that reduced genetic variation by chance.",
      "Mutation rates must have dropped to zero during the fire."
    ],
    "correct": 2,
    "explain": "A severe, random reduction in population size is a bottleneck. Because survivors represent only a sample of the former population, allele frequencies can shift by chance and variation is often lost.",
    "choiceExplanations": [
      "Incorrect. The key mechanism described is not gene flow.",
      "Incorrect. The fire need not have selected alleles based on fitness; chance survival is enough.",
      "Correct. This is the bottleneck effect.",
      "Incorrect. Lost variation here is due to sampling, not mutation shutting off."
    ]
  },
  {
    "id": "PADILLA-037",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Origin of Life",
    "text": "Which finding would provide the strongest support for the RNA world hypothesis rather than a DNA-first hypothesis?",
    "choices": [
      "A molecule can catalyze reactions while also serving as a template for copying sequence information.",
      "A molecule remains chemically stable for long periods in double-stranded form inside cells.",
      "A molecule stores hereditary information using thymine instead of uracil in its nitrogenous bases.",
      "A molecule is produced only after enzymes encoded by nuclear genes are already present."
    ],
    "correct": 0,
    "explain": "The RNA world hypothesis is supported by the idea that RNA can both store information and catalyze reactions. That combination makes RNA a plausible early hereditary molecule before the evolution of the more specialized DNA-protein system.",
    "choiceExplanations": [
      "Correct. A molecule that both stores information and catalyzes reactions fits the core logic of the RNA world hypothesis.",
      "Incorrect. Long-term stability favors DNA as modern genetic material, not RNA as the earliest catalytic information molecule.",
      "Incorrect. Thymine is associated with DNA, so this choice points away from an RNA-first model.",
      "Incorrect. If a molecule appears only after protein enzymes already exist, it does not explain how heredity began before proteins evolved."
    ]
  },
  {
    "id": "PADILLA-038",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Origin of Life",
    "text": "A researcher is trying to model stage 2 of chemical evolution described in the notes. Which result best matches that stage?",
    "choices": [
      "Simple inorganic gases are converted into amino acids and other small carbon compounds.",
      "Small organic subunits link together to produce longer chains such as peptides or nucleic acids.",
      "Membrane-bound cells begin carrying out aerobic respiration using oxygen from the atmosphere.",
      "Natural selection causes allele frequencies in a population of microbes to shift across generations."
    ],
    "correct": 1,
    "explain": "Stage 2 of chemical evolution involves monomers joining to form polymers. That is different from stage 1 abiotic synthesis of monomers, stage 3 self-replicating molecules, and later biological evolution in true populations.",
    "choiceExplanations": [
      "Incorrect. This describes abiotic synthesis of small organic molecules, which is stage 1 rather than stage 2.",
      "Correct. Stage 2 is the joining of monomers into polymers such as proteins or nucleic acids.",
      "Incorrect. Aerobic respiration in cells is far later than the prebiotic polymerization stage.",
      "Incorrect. Changes in allele frequency describe biological evolution, not prebiotic chemical evolution."
    ]
  },
  {
    "id": "PADILLA-039",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Early Earth",
    "text": "Why were stromatolites especially important to scientists studying early life on Earth?",
    "choices": [
      "They are fossilized layered structures formed by bacterial mats and preserve evidence of early prokaryotic communities.",
      "They are mineral deposits made only by the first eukaryotic algae and prove plants evolved before bacteria.",
      "They are volcanic rocks containing radioactive isotopes and therefore provide exact ages for the first animal fossils.",
      "They are sediment layers created during mass extinctions and therefore directly confirm catastrophism over gradualism."
    ],
    "correct": 0,
    "explain": "Stromatolites are layered structures formed by bacterial mats, so they are important fossil evidence for early prokaryotic life on Earth. They do not show that eukaryotes or animals came first, and they are not direct proof of catastrophism.",
    "choiceExplanations": [
      "Correct. This is why stromatolites are repeatedly used as evidence for ancient bacterial life.",
      "Incorrect. Stromatolites are associated with prokaryotic mats, not proof that plants or eukaryotic algae appeared first.",
      "Incorrect. Radioisotopes can date rocks, but stromatolites are valuable mainly because they preserve biological structure from bacterial mats.",
      "Incorrect. Stromatolites are evidence of ancient life, not direct evidence settling catastrophism versus gradualism."
    ]
  },
  {
    "id": "PADILLA-040",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Great Oxygenation Event",
    "text": "Which environmental change most directly followed the spread of oxygenic photosynthesis by cyanobacteria?",
    "choices": [
      "Atmospheric oxygen rose, allowing chemical reactions that changed minerals such as iron-bearing rocks.",
      "Atmospheric methane rose sharply, causing Earth to remain permanently reducing and oxygen-free.",
      "All prokaryotes immediately went extinct because oxygen could not be tolerated by any early cell type.",
      "Multicellular animals appeared at once because aerobic metabolism instantly solved every evolutionary constraint."
    ],
    "correct": 0,
    "explain": "Cyanobacteria released oxygen, and over time this raised atmospheric oxygen and altered Earth's chemistry, including oxidation of iron. The change was profound but gradual, not an immediate appearance of animals or extinction of all prokaryotes.",
    "choiceExplanations": [
      "Correct. This captures the major chemical consequence of the Great Oxygenation Event.",
      "Incorrect. Oxygenic photosynthesis increased oxygen rather than keeping Earth permanently oxygen-free.",
      "Incorrect. Many anaerobes were harmed, but prokaryotes as a group certainly did not all disappear.",
      "Incorrect. Oxygen was important for later evolution, but animals did not appear immediately after oxygen production began."
    ]
  },
  {
    "id": "PADILLA-041",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Endosymbiosis",
    "text": "Which observation best supports the endosymbiotic origin of mitochondria and chloroplasts?",
    "choices": [
      "These organelles contain their own DNA and resemble bacteria in several structural and reproductive features.",
      "These organelles are produced only by the Golgi apparatus and lack any trace of independent replication.",
      "These organelles store starch and lipids, showing they must have evolved from large vacuoles in plants.",
      "These organelles are always absent from protists, showing they evolved only after multicellular organisms arose."
    ],
    "correct": 0,
    "explain": "Endosymbiotic theory is supported by the bacterial-like features of mitochondria and chloroplasts, including their own DNA and division patterns. The other choices either describe unrelated organelles or make false claims about distribution.",
    "choiceExplanations": [
      "Correct. Their own DNA and bacterial traits are classic evidence for endosymbiosis.",
      "Incorrect. Independent replication is part of the evidence for endosymbiotic origin, not something absent.",
      "Incorrect. Food storage does not explain their origin, and they are not thought to have evolved from vacuoles.",
      "Incorrect. Many protists possess mitochondria and some have chloroplasts, so this claim is false."
    ]
  },
  {
    "id": "PADILLA-042",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Early Earth Timeline",
    "text": "A student says the first eukaryotes appeared before cyanobacteria altered Earth's atmosphere. Which response is most accurate based on the lesson sequence?",
    "choices": [
      "Cyanobacteria evolved first and contributed to atmospheric oxygenation before eukaryotes became established.",
      "Eukaryotes evolved first and later produced the bacterial ancestors of cyanobacteria through mutation.",
      "Cyanobacteria and eukaryotes appeared simultaneously because both required chloroplasts from the start.",
      "Eukaryotes were the earliest fossils on Earth, while prokaryotes appear only after the Archean Eon ended."
    ],
    "correct": 0,
    "explain": "The lesson timeline places early prokaryotes first, then cyanobacteria and oxygenation, and later the appearance and diversification of eukaryotes. Eukaryotes did not precede the oxygenation changes caused by cyanobacteria.",
    "choiceExplanations": [
      "Correct. This matches the sequence emphasized in the unit notes.",
      "Incorrect. Cyanobacteria are prokaryotes, not descendants produced by early eukaryotes.",
      "Incorrect. Cyanobacteria are not eukaryotes and do not require chloroplasts to exist.",
      "Incorrect. The earliest fossils are prokaryotic, not eukaryotic."
    ]
  },
  {
    "id": "PADILLA-043",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Darwin and Fossils",
    "text": "How did Hutton and Lyell most strongly influence Darwin's thinking?",
    "choices": [
      "They argued that slow geological processes operating over long periods could produce major change on Earth.",
      "They showed that every rock boundary must mark a sudden catastrophe that creates new species instantly.",
      "They provided the first genetic model explaining how alleles are inherited during reproduction.",
      "They demonstrated experimentally that acquired traits are copied into gametes and passed to offspring."
    ],
    "correct": 0,
    "explain": "Hutton and Lyell promoted gradualism in geology, showing that slow, continuous processes can create major change over immense time. That idea helped Darwin see how biological change could also accumulate gradually.",
    "choiceExplanations": [
      "Correct. This is the geological framework that strongly influenced Darwin.",
      "Incorrect. That reflects catastrophism associated with Cuvier rather than the gradualism of Hutton and Lyell.",
      "Incorrect. Genetics came later with Mendel, not Hutton and Lyell.",
      "Incorrect. This resembles Lamarckian inheritance, not the contribution of Hutton and Lyell."
    ]
  },
  {
    "id": "PADILLA-044",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Natural Selection",
    "text": "Which statement correctly distinguishes natural selection from evolution in a population?",
    "choices": [
      "Natural selection acts on individual phenotypes, whereas evolution is a change in allele frequencies across generations.",
      "Natural selection changes the genes of each organism directly, whereas evolution acts only on ecosystems as wholes.",
      "Natural selection always increases variation, whereas evolution always decreases variation in every population.",
      "Natural selection occurs only when populations are large, whereas evolution occurs only when populations are small."
    ],
    "correct": 0,
    "explain": "A major Unit 6 distinction is that natural selection acts on individuals based on phenotype, but populations evolve when allele frequencies change over generations. The other choices confuse levels of organization or make absolute claims that are false.",
    "choiceExplanations": [
      "Correct. This is one of the most testable distinctions in the unit.",
      "Incorrect. Selection does not directly rewrite genes inside individuals, and evolution is not limited to ecosystems.",
      "Incorrect. Neither process has a single universal effect on variation in all cases.",
      "Incorrect. Both natural selection and evolution can occur in populations of different sizes."
    ]
  },
  {
    "id": "PADILLA-045",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Resistance Evolution",
    "text": "A patient stops taking antibiotics as soon as symptoms improve. Why can this increase the frequency of resistant bacteria in the population?",
    "choices": [
      "Susceptible bacteria are removed first, so surviving resistant bacteria contribute a larger share of future offspring.",
      "Antibiotics cause every surviving bacterium to intentionally mutate in the exact gene needed for resistance.",
      "Stopping treatment allows antibiotics left in the blood to transform viruses into resistant bacterial strains.",
      "Symptoms improve only when bacteria begin reproducing faster, which guarantees beneficial mutations in all cells."
    ],
    "correct": 0,
    "explain": "Antibiotics impose selection: susceptible bacteria die more readily, while resistant bacteria survive and reproduce disproportionately. The drug does not intentionally direct mutations, nor does it turn viruses into bacteria.",
    "choiceExplanations": [
      "Correct. This captures how selection changes the composition of the bacterial population.",
      "Incorrect. Mutations arise randomly; antibiotics select among variants rather than instructing the needed mutation.",
      "Incorrect. Viruses and bacteria are different biological entities, and antibiotics do not convert one into the other.",
      "Incorrect. Improvement in symptoms does not mean all cells now carry beneficial mutations."
    ]
  },
  {
    "id": "PADILLA-046",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Evidence for Evolution",
    "text": "Which comparison provides the strongest direct molecular evidence that two species share a recent common ancestor?",
    "choices": [
      "They have highly similar DNA sequences across homologous genes and many shared derived molecular characters.",
      "They live on nearby islands and eat similar foods in broadly comparable habitats.",
      "They have body parts that perform similar functions despite very different developmental origins.",
      "They belong to the same kingdom and therefore must have diverged only recently in time."
    ],
    "correct": 0,
    "explain": "Comparisons of homologous DNA sequences provide especially strong evidence for common ancestry and degree of relatedness. Similar ecology or function can arise convergently and is therefore less direct than shared derived molecular homology.",
    "choiceExplanations": [
      "Correct. Shared molecular homologies are among the strongest lines of evidence for recent common ancestry.",
      "Incorrect. Geographic proximity can matter, but it is less direct than molecular evidence.",
      "Incorrect. Similar function with different origins suggests analogy from convergent evolution, not recent shared ancestry.",
      "Incorrect. Sharing a kingdom is far too broad to imply a recent divergence."
    ]
  },
  {
    "id": "PADILLA-047",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Cladistics",
    "text": "In a cladogram, which feature is most useful for identifying a clade?",
    "choices": [
      "A shared derived character inherited from the common ancestor of the group and its descendants.",
      "A trait that is present in the outgroup and therefore must have evolved most recently in the ingroup.",
      "A similarity caused by convergent evolution in species occupying similar ecological niches.",
      "A difference in branch length caused solely by the way the tree was drawn on the page."
    ],
    "correct": 0,
    "explain": "Clades are recognized using shared derived characters inherited from a common ancestor. Traits shared with the outgroup are usually primitive, convergent similarities are misleading, and branch placement on a page is not itself evidence.",
    "choiceExplanations": [
      "Correct. Shared derived characters are the key evidence for defining clades in cladistic analysis.",
      "Incorrect. Traits shared with the outgroup are generally considered primitive rather than newly derived in the ingroup.",
      "Incorrect. Convergent traits are analogous and can mislead phylogenetic inference.",
      "Incorrect. The visual spacing on the page does not define evolutionary relationships."
    ]
  },
  {
    "id": "PADILLA-048",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Outgroups",
    "text": "Why do systematists include an outgroup when constructing a cladogram for an ingroup of species?",
    "choices": [
      "To help distinguish ancestral characters from derived characters within the ingroup.",
      "To guarantee that the oldest species in the tree will always appear at the far left side.",
      "To make all branch lengths proportional to geological time without using molecular data.",
      "To ensure the species with the most traits is automatically treated as the common ancestor."
    ],
    "correct": 0,
    "explain": "Outgroup comparison helps determine which traits are ancestral and which are derived among the species being studied. It does not force left-right placement, automatically scale time, or identify the ancestor as the species with the most traits.",
    "choiceExplanations": [
      "Correct. This is the central purpose of using an outgroup in cladistic analysis.",
      "Incorrect. Left-right order on a tree is arbitrary and not the reason an outgroup is included.",
      "Incorrect. Outgroups do not by themselves calibrate trees to geological time.",
      "Incorrect. Ancestors are usually inferred, not chosen as the living species with the most features."
    ]
  },
  {
    "id": "PADILLA-049",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Taxonomy",
    "text": "Which statement about binomial nomenclature is accurate?",
    "choices": [
      "The genus name is capitalized, the specific epithet is not, and together the two words name the species.",
      "The specific epithet alone is sufficient because each epithet is unique across all genera on Earth.",
      "The genus name must always describe habitat, while the specific epithet must always describe morphology.",
      "The two parts of the name identify the family first and then the order for the organism being classified."
    ],
    "correct": 0,
    "explain": "In binomial nomenclature, the genus is capitalized and the specific epithet is not, and both parts together make up the species name. The specific epithet alone is not the full species name.",
    "choiceExplanations": [
      "Correct. This is the standard naming rule emphasized in taxonomy.",
      "Incorrect. Specific epithets can repeat across different genera, so they are not sufficient alone.",
      "Incorrect. Scientific names do not have to follow those content rules.",
      "Incorrect. Binomial names identify genus and specific epithet, not family and order."
    ]
  },
  {
    "id": "PADILLA-050",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Phylogeny",
    "text": "Which statement best explains why analogous traits are less reliable than homologous traits for reconstructing phylogeny?",
    "choices": [
      "Analogous traits can arise independently in unrelated lineages exposed to similar selective pressures.",
      "Analogous traits are always controlled by mitochondrial DNA rather than by nuclear genes.",
      "Analogous traits occur only in fossils, so they cannot be compared across living organisms.",
      "Analogous traits never affect phenotype and therefore cannot be observed in comparative anatomy."
    ],
    "correct": 0,
    "explain": "Analogous traits result from convergent evolution, so they may reflect similar selection rather than shared ancestry. Homologous traits, by contrast, are inherited from a common ancestor and are therefore more informative for phylogeny.",
    "choiceExplanations": [
      "Correct. This is why convergence can mislead evolutionary reconstruction.",
      "Incorrect. Analogy is not defined by whether a trait is controlled by mitochondrial or nuclear DNA.",
      "Incorrect. Analogous traits can occur in both living organisms and fossils.",
      "Incorrect. Analogous traits are phenotypic similarities, so they absolutely can be observed."
    ]
  },
  {
    "id": "PADILLA-051",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Species Concepts",
    "text": "Which example most clearly fits the biological species concept?",
    "choices": [
      "Two populations can mate in nature and produce viable, fertile offspring over multiple generations.",
      "Two populations look almost identical externally but occupy different trophic levels in the same habitat.",
      "Two fossil forms share many skeletal features and are placed in the same lineage by paleontologists.",
      "Two organisms use similar mating displays, although hybrid offspring are never tested for fertility."
    ],
    "correct": 0,
    "explain": "The biological species concept defines species by the ability to interbreed and produce fertile offspring. Similar appearance, fossil resemblance, or comparable mating signals may be useful in other species concepts but are not the core criterion here.",
    "choiceExplanations": [
      "Correct. Fertile offspring are the key feature of the biological species concept.",
      "Incorrect. This example fits ecological similarity or difference more than the biological species concept.",
      "Incorrect. Fossils are often classified using other species concepts because interbreeding cannot be tested directly.",
      "Incorrect. Mating displays can matter, but without evidence about successful fertile reproduction this is incomplete."
    ]
  },
  {
    "id": "PADILLA-052",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Reproductive Isolation",
    "text": "Two closely related frog species breed in the same pond, but one breeds in early spring and the other in midsummer. This is best classified as",
    "choices": [
      "temporal isolation, a prezygotic barrier that prevents mating before fertilization occurs.",
      "gametic isolation, a postzygotic barrier that reduces hybrid fertility after fertilization occurs.",
      "mechanical isolation, a prezygotic barrier caused by incompatible reproductive structures.",
      "hybrid breakdown, a postzygotic barrier seen only in the grandchildren of hybrid crosses."
    ],
    "correct": 0,
    "explain": "Breeding at different times is temporal isolation, one of the prezygotic barriers because it prevents mating and fertilization from occurring in the first place.",
    "choiceExplanations": [
      "Correct. Different mating times are the classic example of temporal prezygotic isolation.",
      "Incorrect. Gametic isolation involves failure of sperm and egg to unite, not different breeding seasons.",
      "Incorrect. Mechanical isolation concerns anatomy, not timing.",
      "Incorrect. Hybrid breakdown occurs after hybridization, not before mating."
    ]
  },
  {
    "id": "PADILLA-053",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Speciation",
    "text": "Which scenario best illustrates sympatric speciation rather than allopatric speciation?",
    "choices": [
      "A chromosome duplication event creates a reproductively isolated plant lineage within the same geographic area.",
      "A river changes course and separates one beetle population into two isolated valley populations.",
      "A mountain range prevents pollen from moving between two previously connected tree populations.",
      "An island chain forms and disperses a mainland bird population into physically separated habitats."
    ],
    "correct": 0,
    "explain": "Sympatric speciation occurs without geographic separation, often through chromosomal changes or nonrandom mating within the same area. The other scenarios all involve physical isolation and therefore fit allopatric speciation.",
    "choiceExplanations": [
      "Correct. Reproductive isolation arising within the same area is sympatric speciation.",
      "Incorrect. A river acting as a barrier is an allopatric situation.",
      "Incorrect. A mountain range physically isolating populations is allopatric speciation.",
      "Incorrect. Island separation is another classic allopatric setup."
    ]
  },
  {
    "id": "PADILLA-054",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Sexual Selection",
    "text": "Which result is the clearest example of intersexual selection?",
    "choices": [
      "Females preferentially mate with males displaying brighter plumage, increasing that trait in the population.",
      "Males with larger body size fight each other, and winners gain access to territories and mates.",
      "A severe drought kills most seedlings before they reproduce, favoring drought-tolerant genotypes.",
      "A predator removes the most conspicuous individuals from both sexes before the breeding season begins."
    ],
    "correct": 0,
    "explain": "Intersexual selection involves mate choice, often by females choosing among males. Male-male competition is intrasexual selection, while the other examples are not primarily about mate choice.",
    "choiceExplanations": [
      "Correct. This is classic mate choice, the hallmark of intersexual selection.",
      "Incorrect. Competition among members of one sex is intrasexual selection, not intersexual selection.",
      "Incorrect. This is natural selection on survival, not sexual selection through mate choice.",
      "Incorrect. Predation can shape traits, but it is not an example of intersexual selection."
    ]
  },
  {
    "id": "PADILLA-055",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "r/K Selection",
    "text": "Which life-history pattern is most consistent with an r-selected species?",
    "choices": [
      "Early reproduction, many small offspring, little parental care, and success in unstable environments.",
      "Late reproduction, few well-provisioned offspring, high parental investment, and stable population size.",
      "Long generation time, repeated parental defense of offspring, and strong competition near carrying capacity.",
      "Slow growth, delayed maturity, and low fecundity combined with extensive care for each juvenile."
    ],
    "correct": 0,
    "explain": "r-selected species are associated with rapid reproduction, many offspring, low parental investment, and unstable or frequently disturbed environments. The other choices describe K-selected tendencies.",
    "choiceExplanations": [
      "Correct. This combination best matches the r-selected pattern in the notes.",
      "Incorrect. This is more characteristic of K-selected organisms.",
      "Incorrect. Strong competition near carrying capacity is associated with K-selected life histories.",
      "Incorrect. Delayed maturity and high parental care also fit K-selected species."
    ]
  },
  {
    "id": "PADILLA-056",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Microevolution",
    "text": "Which statement best defines microevolution?",
    "choices": [
      "A change in allele frequencies within a population from one generation to the next.",
      "A change in body size within an individual organism as it develops through its life cycle.",
      "The origin of all major domains of life from the earliest universal common ancestor.",
      "Any large anatomical difference that appears between species occupying different ecological niches."
    ],
    "correct": 0,
    "explain": "Microevolution refers specifically to generation-to-generation changes in allele frequencies within populations. It does not describe individual development or all broad-scale evolutionary history.",
    "choiceExplanations": [
      "Correct. This is the population-genetic definition of microevolution.",
      "Incorrect. Developmental change within an individual is not evolution in the Darwinian sense.",
      "Incorrect. That refers to very deep evolutionary history, not microevolutionary change within populations.",
      "Incorrect. Anatomical difference alone is not the formal definition of microevolution."
    ]
  },
  {
    "id": "PADILLA-057",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Genetic Drift",
    "text": "A wildfire randomly kills most of a lizard population, leaving a few survivors whose allele frequencies differ from the original population. This is most directly an example of",
    "choices": [
      "the bottleneck effect, a form of genetic drift caused by a sharp reduction in population size.",
      "directional selection, because the environment intentionally favored the fittest genotype in advance.",
      "gene flow, because new alleles entered the surviving population from neighboring populations.",
      "nonrandom mating, because individuals selected partners with similar coloration after the fire."
    ],
    "correct": 0,
    "explain": "A random drastic reduction in population size is the bottleneck effect, which is a form of genetic drift. The key idea is chance sampling of survivors rather than differential fitness based on a specific trait.",
    "choiceExplanations": [
      "Correct. A sudden population crash causing random allele shifts is the bottleneck effect.",
      "Incorrect. The scenario emphasizes random survival, not trait-based selection.",
      "Incorrect. Gene flow requires movement of alleles between populations, not just survivor sampling.",
      "Incorrect. Nonrandom mating concerns partner choice, which is not what caused the allele shift here."
    ]
  },
  {
    "id": "PADILLA-058",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Founder Effect",
    "text": "A few birds are blown off course to a remote island and start a new population whose allele frequencies differ from the mainland population. Which process best explains this pattern?",
    "choices": [
      "The founder effect, because a small sample established a new population with nonrepresentative allele frequencies.",
      "The bottleneck effect, because the mainland population was sharply reduced by a random disaster.",
      "Balancing selection, because heterozygotes immediately became the most fit genotype on the island.",
      "Gene flow, because immigration from the island into the mainland increased mainland variation."
    ],
    "correct": 0,
    "explain": "The founder effect occurs when a small number of individuals establish a new population, carrying with them only a subset of the original gene pool. That can create allele frequencies different from those of the source population by chance alone.",
    "choiceExplanations": [
      "Correct. This is the classic founder-effect scenario.",
      "Incorrect. A bottleneck is caused by reduction of an existing population, not establishment of a new one by a few colonists.",
      "Incorrect. No evidence here suggests balancing selection or heterozygote advantage.",
      "Incorrect. The key process is sampling during colonization, not movement of alleles back into the mainland."
    ]
  },
  {
    "id": "PADILLA-059",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Hardy-Weinberg",
    "text": "In a population at Hardy-Weinberg equilibrium, the frequency of the recessive phenotype is 0.09. What is the expected frequency of heterozygotes?",
    "choices": [
      "0.42",
      "0.30",
      "0.18",
      "0.91"
    ],
    "correct": 0,
    "explain": "If the recessive phenotype frequency is 0.09, then q^2 = 0.09 and q = 0.3. Therefore p = 0.7, and the heterozygote frequency is 2pq = 2(0.7)(0.3) = 0.42.",
    "choiceExplanations": [
      "Correct. q^2 = 0.09, so q = 0.3 and 2pq = 0.42.",
      "Incorrect. 0.30 is the value of q, not the heterozygote frequency.",
      "Incorrect. 0.18 is not the result of 2pq for p = 0.7 and q = 0.3.",
      "Incorrect. 0.91 represents neither q^2 nor 2pq in this setup."
    ]
  },
  {
    "id": "PADILLA-060",
    "unit": "PADILLA",
    "difficulty": "hard",
    "topic": "Hardy-Weinberg",
    "text": "Which condition must be met for a population to remain in Hardy-Weinberg equilibrium at a locus?",
    "choices": [
      "Mating is random and forces such as mutation, migration, selection, and drift are absent or negligible.",
      "At least one allele provides a strong fitness advantage so natural selection can stabilize its frequency.",
      "The population experiences continual immigration that replaces lost alleles every generation.",
      "Individuals acquire useful traits during life and pass those traits directly into the next generation."
    ],
    "correct": 0,
    "explain": "Hardy-Weinberg equilibrium is a null model requiring random mating, a very large population, and no significant mutation, migration, or natural selection. The other choices describe violations of the equilibrium assumptions.",
    "choiceExplanations": [
      "Correct. This summarizes the required assumptions of the Hardy-Weinberg model.",
      "Incorrect. Strong selection violates Hardy-Weinberg equilibrium rather than maintaining it.",
      "Incorrect. Continual immigration is gene flow, which disrupts equilibrium.",
      "Incorrect. Acquired traits passing directly to offspring is not a Hardy-Weinberg condition and is biologically incorrect in this form."
    ]
  }
];
