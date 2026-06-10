"use client";

import { useMemo, useState } from "react";
import {
  ModeBadge,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
} from "../components/ui/study-kit";
import { PADILLA_QUESTIONS } from "./questions";

const KEY_NOTE_TOPICS = [
  {
    number: 1,
    title: "Archean Eon",
    points: [
      "About 4.0 to 2.5 billion years ago.",
      "Early atmosphere was mostly carbon dioxide, water vapor, and methane.",
      "Earth formed about 4.5 billion years ago.",
      "It took about 500 million years for the crust to solidify.",
      "The oldest microorganism fossils in the notes are about 3.5 billion years old, found in western Australia.",
      "Early life was dominated by prokaryotes.",
      "One of the earliest major divergences was Bacteria versus Archaea.",
    ],
  },
  {
    number: 2,
    title: "Stromatolites",
    points: [
      "Stromatolites are fossilized bacterial mats.",
      "They are important because they are fossil evidence of very early prokaryotic life.",
      "If you see stromatolites in a question, think ancient prokaryotes, bacterial mats, and early Earth evidence for life.",
    ],
  },
  {
    number: 3,
    title: "Origin of Life: Chemical Evolution",
    points: [
      "The notes give a four-step model: abiotic synthesis of small organic molecules, monomers joined to form polymers, origin of self-replicating molecules, and packaging into protobionts.",
      "Abiotic means nonliving or nonbiological.",
      "A monomer is a small building block.",
      "A polymer is a larger molecule made of monomers.",
      "A protobiont is an aggregate of abiotically produced molecules that maintains some internal chemistry and shows some life-like properties.",
    ],
  },
  {
    number: 4,
    title: "Protobionts",
    points: [
      "Not true cells yet.",
      "They are membrane-like collections of molecules.",
      "They matter because they are a possible bridge between chemistry and the first cells.",
      "They may show an internal chemical environment, simple metabolism-like behavior, and some organization.",
    ],
  },
  {
    number: 5,
    title: "RNA World Hypothesis",
    points: [
      "RNA is proposed to have come before DNA because it can both store information and have catalytic properties.",
      "DNA stores information very well, but it is not catalytic in the same way.",
      "Protein enzymes are catalytic, but proteins do not self-template genetic information.",
      "RNA is a logical early candidate because it combines both jobs better than DNA or proteins alone.",
    ],
  },
  {
    number: 6,
    title: "Miller-Urey Experiment",
    points: [
      "Tried to simulate early Earth conditions.",
      "Showed that organic molecules could form from inorganic starting materials under assumed ancient Earth conditions.",
      "It did not create life.",
      "It supports the idea that the building blocks of life could form naturally before cells existed.",
    ],
  },
  {
    number: 7,
    title: "Hydrothermal Vent Hypothesis",
    points: [
      "Hydrothermal vents are emphasized as a possible site where simple compounds became more complex.",
      "Vents matter because they provide an energy source, mineral surfaces, a chemically rich environment, and a possible protected environment for early reactions.",
    ],
  },
  {
    number: 8,
    title: "Endosymbiotic Theory",
    points: [
      "A larger ancestral cell engulfed smaller prokaryotes.",
      "Those engulfed prokaryotes became mitochondria and chloroplasts.",
      "This explains how eukaryotic cells gained complex organelles.",
      "Endosymbiosis is strongly tied to the success and diversification of eukaryotes.",
    ],
  },
  {
    number: 9,
    title: "Great Oxygenation Event",
    points: [
      "About 2.5 to 2.0 billion years ago.",
      "Cyanobacteria evolved and produced large amounts of oxygen through photosynthesis.",
      "Oxygen reacted with atmospheric methane and changed Earth permanently.",
      "This eventually led to a more oxygen-rich atmosphere and blue skies.",
      "Red bands and banded iron formations are evidence because oxygen oxidized iron in rocks.",
    ],
  },
  {
    number: 10,
    title: "Cyanobacteria",
    points: [
      "Early photosynthetic prokaryotes.",
      "About 2.7 billion years ago in the notes.",
      "First organisms to photosynthesize and release oxygen at a major scale.",
      "They were crucial to atmospheric change.",
    ],
  },
  {
    number: 11,
    title: "Darwin's Research / HMS Beagle",
    points: [
      "Darwin traveled on the HMS Beagle.",
      "He collected plants and animals from South America.",
      "He noticed that organisms were adapted to different environments.",
      "The Galapagos Islands were especially important for his thinking about geographic distribution and adaptation.",
    ],
  },
  {
    number: 12,
    title: "Paleontology",
    points: [
      "Paleontology means study of fossils.",
      "Fossils are remains or traces of past organisms, usually in sedimentary rock.",
      "Fossils helped build the groundwork for Darwin's ideas.",
    ],
  },
  {
    number: 13,
    title: "Catastrophism",
    points: [
      "Associated with Georges Cuvier.",
      "It is the idea that boundaries between rock strata reflect catastrophic events.",
      "It was important historically, but it did not explain gradual change over long time scales as well as gradualism did.",
    ],
  },
  {
    number: 14,
    title: "Gradualism",
    points: [
      "Gradualism means profound change can happen through the cumulative effects of slow, continuous processes.",
      "Associated with Hutton and Lyell.",
      "This influenced Darwin because if Earth changes slowly over immense time, life could also change over immense time.",
    ],
  },
  {
    number: 15,
    title: "Adaptation",
    points: [
      "An adaptation is an inherited trait that improves survival or reproduction in a particular environment.",
      "Darwin connected adaptation with the formation of new species.",
      "Galapagos finches are the classic example because different beaks match different food sources and different niches.",
    ],
  },
  {
    number: 16,
    title: "Natural Selection",
    points: [
      "More individuals are born than can survive.",
      "Individuals vary.",
      "Some variation is heritable.",
      "Individuals with traits better suited to the environment leave more offspring.",
      "Over generations, favorable alleles become more common.",
      "Natural selection acts on individual phenotypes, but populations evolve.",
    ],
  },
  {
    number: 17,
    title: "Descent with Modification",
    points: [
      "Present-day species descended from ancestral species.",
      "This explains both the unity of life through shared ancestry and the diversity of life through branching change over time.",
    ],
  },
  {
    number: 18,
    title: "Darwin vs. Wallace",
    points: [
      "Darwin developed his ideas for years.",
      "In 1858, Alfred Russel Wallace sent Darwin a manuscript with a similar theory of natural selection.",
      "Darwin then moved quickly to publish On the Origin of Species in 1859.",
    ],
  },
  {
    number: 19,
    title: "Relative Dating",
    points: [
      "In sedimentary rock, deeper strata are generally older.",
      "A fossil lower in the strata is usually older than one above it.",
      "This does not give exact age, only relative age.",
    ],
  },
  {
    number: 20,
    title: "Evidence for Evolution",
    points: [
      "The notes reinforce fossils, comparative anatomy, DNA and molecular evidence, biogeography, and observed evolutionary change.",
      "Resistance in bacteria and viruses is a direct modern example.",
    ],
  },
  {
    number: 21,
    title: "Antibiotic Resistance / Drug Resistance",
    points: [
      "Antibiotics do not make bacteria try harder.",
      "They create a selection pressure.",
      "Susceptible bacteria die first.",
      "Resistant bacteria survive and reproduce.",
      "The same logic applies to drug-resistant HIV.",
      "This is a modern, direct example of natural selection.",
    ],
  },
  {
    number: 22,
    title: "DNA as Evidence of Common Ancestry",
    points: [
      "DNA and the genetic code reflect shared ancestry.",
      "Comparing DNA sequences helps show how species are related.",
      "More similar DNA usually suggests a more recent common ancestor.",
    ],
  },
  {
    number: 23,
    title: "Mutation",
    points: [
      "A mutation is a change in gene structure producing a variant form that may be inherited.",
      "Mutation is the ultimate source of new genetic variation.",
    ],
  },
  {
    number: 24,
    title: "Cladogram",
    points: [
      "A cladogram is a branching diagram that represents a hypothesis about evolutionary relationships.",
      "It shows patterns of common ancestry, not just surface similarity.",
      "Relatedness depends on how recent the common ancestor is, not how close two species are drawn on the page.",
    ],
  },
  {
    number: 25,
    title: "Phylogenetic Tree",
    points: [
      "Shows evolutionary relationships among species or groups.",
      "Nodes represent common ancestors.",
      "Branches nearest the tips represent more recent lineages.",
      "Branches farther from the root are not more advanced; they just represent different lineages.",
    ],
  },
  {
    number: 26,
    title: "LUCA",
    points: [
      "LUCA stands for Last Universal Common Ancestor.",
      "It is the hypothesized common ancestral cell from which Bacteria, Archaea, and Eukarya originated.",
    ],
  },
  {
    number: 27,
    title: "Homologous Genes",
    points: [
      "Genes shared by species because they were inherited from a common ancestor.",
      "Molecular homology is powerful evidence for common descent.",
    ],
  },
  {
    number: 28,
    title: "Orthologous Genes",
    points: [
      "Orthologous genes are homologous genes that diverged after a speciation event.",
      "Their main function is often conserved.",
      "These are especially useful for comparing related species.",
    ],
  },
  {
    number: 29,
    title: "Taxonomy",
    points: [
      "Taxonomy is the ordered division of organisms into categories based on characteristics.",
      "Linnaeus's system is still useful because it gives binomial nomenclature and hierarchical classification.",
    ],
  },
  {
    number: 30,
    title: "Binomial Nomenclature",
    points: [
      "Two-part scientific name: genus and specific epithet.",
      "The genus is capitalized.",
      "The full species name is italicized or latinized.",
      "The specific epithet alone is not the full species name.",
    ],
  },
  {
    number: 31,
    title: "Clade",
    points: [
      "A clade includes an ancestral species and all of its descendants.",
      "Clades are nested within larger clades.",
      "A valid clade must be monophyletic in AP Biology language.",
    ],
  },
  {
    number: 32,
    title: "Outgroup",
    points: [
      "An outgroup is closely related to the ingroup but not part of it.",
      "It helps identify which characters are shared primitive and shared derived.",
      "If both outgroup and ingroup have a trait, that trait is usually considered primitive.",
    ],
  },
  {
    number: 33,
    title: "Shared Derived Characters",
    points: [
      "Traits that evolved in a lineage after it split from the outgroup.",
      "These are the most useful for building cladograms.",
      "Examples from the character table include vertebral column, hinged jaws, four walking legs, amniotic egg, and hair.",
    ],
  },
  {
    number: 34,
    title: "Molecular Homology",
    points: [
      "Systematists compare DNA sequences with computer and math tools.",
      "Sequence similarity helps estimate relatedness.",
      "Similarity from convergent evolution can mislead if you only look at anatomy.",
    ],
  },
  {
    number: 35,
    title: "Convergent Evolution",
    points: [
      "Unrelated organisms can evolve similar traits because they face similar selective pressures.",
      "Similarity does not always mean close relatedness.",
      "The mole example in the notes is useful for this.",
    ],
  },
  {
    number: 36,
    title: "Biological Species Concept",
    points: [
      "A species is a group of organisms that can interbreed and produce fertile offspring.",
      "Its main focus is reproductive isolation.",
    ],
  },
  {
    number: 37,
    title: "Limits of the Biological Species Concept",
    points: [
      "It does not work as well for fossils.",
      "It does not work as well for asexual organisms.",
      "It also struggles with some subspecies and geographically variable populations.",
    ],
  },
  {
    number: 38,
    title: "Other Species Concepts",
    points: [
      "Morphological species concept is based on physical traits.",
      "Recognition species concept is based on successful mating signals.",
      "Cohesion species concept is based on discrete phenotypic entities.",
      "Ecological species concept is based on niche, role, or function.",
      "Evolutionary species concept is based on lineage and evolutionary history.",
    ],
  },
  {
    number: 39,
    title: "Prezygotic Barriers",
    points: [
      "Prevent fertilization from happening.",
      "Habitat isolation.",
      "Behavioral isolation.",
      "Temporal isolation.",
      "Mechanical isolation.",
      "Gametic isolation.",
    ],
  },
  {
    number: 40,
    title: "Postzygotic Barriers",
    points: [
      "Fertilization happens, but offspring problems occur.",
      "Reduced viability.",
      "Reduced fertility.",
      "Hybrid breakdown.",
    ],
  },
  {
    number: 41,
    title: "Allopatric Speciation",
    points: [
      "Gene flow is interrupted by geographic isolation.",
      "Physical barriers split populations.",
      "Over time, mutation, drift, and selection can make them reproductively isolated.",
    ],
  },
  {
    number: 42,
    title: "Sympatric Speciation",
    points: [
      "Speciation without geographic separation.",
      "It can happen through nonrandom mating or chromosomal changes.",
      "It is often associated with polyploidy in plants, though the slide emphasizes chromosomal changes generally.",
    ],
  },
  {
    number: 43,
    title: "Gradualism vs. Punctuated Equilibrium",
    points: [
      "Gradualism means species change slowly over time.",
      "Punctuated equilibrium means long periods of little change interrupted by short bursts of rapid change.",
    ],
  },
  {
    number: 44,
    title: "Sexual Selection",
    points: [
      "A form of natural selection for mating success.",
      "It can lead to sexual dimorphism, where males and females differ in secondary sex traits.",
    ],
  },
  {
    number: 45,
    title: "Intrasexual Selection",
    points: [
      "Competition within one sex for access to mates.",
      "Usually male-male competition.",
      "Think fighting, dominance, antlers, and large size.",
    ],
  },
  {
    number: 46,
    title: "Intersexual Selection",
    points: [
      "One sex chooses mates from the other sex.",
      "Usually female choice in examples.",
      "It often favors showy male traits.",
    ],
  },
  {
    number: 47,
    title: "Reproductive Handicap of Sexual Reproduction",
    points: [
      "Sexual reproduction often produces fewer reproductive descendants than asexual reproduction.",
      "Sexual reproduction increases genetic variation, which can help with disease resistance and adaptation.",
    ],
  },
  {
    number: 48,
    title: "r-selected vs. K-selected",
    points: [
      "r-selected organisms are small, fast growing, common in unstable environments, produce many offspring, and provide low parental care.",
      "K-selected organisms are larger, slower growing, common in stable environments, produce fewer offspring, and provide more parental care.",
    ],
  },
  {
    number: 49,
    title: "Population Genetics",
    points: [
      "Study of how populations change genetically over time.",
      "It combines Mendelian genetics with Darwinian evolution.",
      "Populations, not individuals, are the units of evolution.",
    ],
  },
  {
    number: 50,
    title: "Microevolution",
    points: [
      "Microevolution is change in the genetic makeup of a population from generation to generation.",
      "It is usually measured as changes in allele frequencies.",
    ],
  },
  {
    number: 51,
    title: "Gene Pool",
    points: [
      "The total aggregate of genes in a population at one time.",
      "It includes all alleles at all loci in all individuals.",
    ],
  },
  {
    number: 52,
    title: "Allele Frequency",
    points: [
      "The proportion of a certain allele in the gene pool.",
      "Evolution at the population level is basically a change in allele frequency over time.",
    ],
  },
  {
    number: 53,
    title: "Modern Synthesis",
    points: [
      "Combines Darwin's natural selection, Mendelian genetics, and population genetics.",
      "It focuses on populations as the units of evolution.",
    ],
  },
  {
    number: 54,
    title: "Genetic Drift",
    points: [
      "Random change in allele frequency.",
      "Strongest in small populations.",
      "It is not the same as natural selection because it is based on chance, not fitness advantage.",
    ],
  },
  {
    number: 55,
    title: "Bottleneck Effect",
    points: [
      "A population is suddenly reduced in size.",
      "The surviving gene pool is a random sample of the original.",
      "Genetic variation usually drops.",
      "Future allele frequencies may look very different from the original population.",
    ],
  },
  {
    number: 56,
    title: "Founder Effect",
    points: [
      "A small subgroup leaves a population and starts a new one.",
      "The new population may have allele frequencies very different from the source population just by chance.",
    ],
  },
  {
    number: 57,
    title: "Selection Patterns",
    points: [
      "Directional selection favors one extreme and shifts the mean.",
      "Stabilizing selection favors the intermediate phenotype and removes extremes.",
      "Disruptive selection favors both extremes and selects against the average phenotype.",
    ],
  },
  {
    number: 58,
    title: "Hardy-Weinberg",
    points: [
      "It is a null model describing what a population looks like if it is not evolving.",
      "Key equations: p + q = 1 and p^2 + 2pq + q^2 = 1.",
      "p is the frequency of the dominant allele and q is the frequency of the recessive allele.",
      "p^2 is homozygous dominant, 2pq is heterozygous, and q^2 is homozygous recessive.",
      "Conditions: very large population, random mating, no mutation, no migration or gene flow, and no natural selection.",
    ],
  },
] as const;

const NOTE_COMPARISONS = [
  "Natural selection is nonrandom; genetic drift is random.",
  "Individuals are selected; populations evolve.",
  "Homologous traits suggest common ancestry; analogous traits usually reflect convergent evolution.",
  "Cladogram means a hypothesis of relationships; taxonomy means naming and classifying organisms.",
  "Prezygotic barriers prevent fertilization; postzygotic barriers act after fertilization.",
  "Allopatric speciation uses geographic isolation; sympatric speciation does not require a physical barrier.",
  "Miller-Urey supports abiotic formation of organic molecules; it does not prove exactly how life began.",
] as const;

const RED_TERMS = [
  "Archean Eon",
  "Stromatolites",
  "Great Oxygenation Event",
  "Cyanobacteria",
  "Paleontology",
  "Gradualism",
  "Cladogram",
  "Phylogenetic Tree",
  "Homologous Genes",
  "LUCA",
  "Taxonomy",
  "Binomial",
  "Clade",
  "Outgroup",
  "Sexual Selection",
  "Intrasexual Selection",
  "Reproductive Handicap",
  "r-selected",
  "K-selected",
  "Allopatric",
  "Sympatric",
  "Microevolution",
  "Population Genetics",
  "Genetic Drift",
  "Bottleneck Effect",
  "Founder Effect",
] as const;

export default function PadillaPage() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [visibleExplanations, setVisibleExplanations] = useState<Record<number, boolean>>({});
  const [crossedOut, setCrossedOut] = useState<Record<number, boolean>>({});

  const question = PADILLA_QUESTIONS[questionIndex] ?? null;
  function resetQuestionState() {
    setSelected(null);
    setVisibleExplanations({});
    setCrossedOut({});
  }

  function goToQuestion(nextIndex: number) {
    resetQuestionState();
    setQuestionIndex(nextIndex);
  }

  function choiceExplain(index: number) {
    if (!question) return "";
    if (question.choiceExplanations?.[index]) {
      return question.choiceExplanations[index];
    }
    return index === question.correct ? question.explain : "Incorrect. Recheck the logic behind this choice before moving on.";
  }

  if (!question) {
    return (
      <main className="grid gap-6 lg:gap-8">
        <PageHeader
          eyebrow="PADILLA"
          title="Unit 6 Study Guide"
          description="This tab is ready for its own custom MCQ bank. Send the exact questions you want and they can be dropped into this route."
        />
      </main>
    );
  }

  return (
    <main className="grid gap-6 lg:gap-8">
      <PageHeader
        eyebrow="PADILLA"
        title="Unit 6 Study Guide"
        description="This page was made to help you study for the Unit 6 FRQs on Wednesdays. It includes notes and questions sourced from the slides and review videos Mr. Padilla recommended to us."
      />

      <SectionCard
        title="Question"
        description="This page mirrors the MCQ experience and uses a custom Unit 6 question bank for targeted review."
        tone="blue"
      >
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <ModeBadge label="PADILLA" tone="blue" />
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
              Custom MCQ tab
            </span>
          </div>

          <div className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">{question.text}</h2>

            <div className="mt-5 grid gap-3">
              {question.choices.map((choice, index) => {
                const isDisabled = selected !== null;
                const isCorrectChoice = index === question.correct;
                const isWrongSelected = selected === index && !isCorrectChoice;
                const labelClass = selected !== null ? (isCorrectChoice ? "text-emerald-950" : isWrongSelected ? "text-rose-950" : "text-slate-950") : "text-slate-950";
                const choiceClass = selected !== null
                  ? isCorrectChoice
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : isWrongSelected
                      ? "border-rose-300 bg-rose-50 text-rose-900"
                      : "border-slate-200 bg-white text-slate-600"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50";

                return (
                  <div key={index} className="grid gap-2">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => {
                          setSelected(index);
                          setVisibleExplanations({ [index]: true });
                        }}
                        disabled={isDisabled}
                        className={`flex-1 rounded-2xl border px-4 py-3 text-left text-sm text-slate-800 shadow-sm transition ${choiceClass} ${crossedOut[index] ? "opacity-55 line-through" : ""}`}
                      >
                        <span className={`font-semibold ${labelClass}`}>{String.fromCharCode(65 + index)}.</span> {choice}
                      </button>

                      <button
                        onClick={() => setCrossedOut((current) => ({ ...current, [index]: !current[index] }))}
                        aria-label={crossedOut[index] ? "Uncross option" : "Cross out option"}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition ${crossedOut[index] ? "border-slate-300 bg-slate-100 text-slate-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                      >
                        {crossedOut[index] ? "Undo" : "Cross out"}
                      </button>

                      {selected !== null ? (
                        <button
                          onClick={() => setVisibleExplanations((current) => ({ ...current, [index]: !current[index] }))}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition ${visibleExplanations[index] ? (isCorrectChoice ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-rose-300 bg-rose-50 text-rose-900") : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                        >
                          {visibleExplanations[index] ? "Hide explanation" : "Show explanation"}
                        </button>
                      ) : null}
                    </div>

                    {visibleExplanations[index] && selected !== null ? (
                      <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${isCorrectChoice ? "border-emerald-300 bg-emerald-50 text-emerald-900" : isWrongSelected ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                        {choiceExplain(index)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <SecondaryButton onClick={() => goToQuestion(Math.max(0, questionIndex - 1))} disabled={questionIndex === 0}>
                Previous question
              </SecondaryButton>
              <PrimaryButton onClick={() => goToQuestion(Math.min(PADILLA_QUESTIONS.length - 1, questionIndex + 1))} disabled={questionIndex >= PADILLA_QUESTIONS.length - 1}>
                Next question
              </PrimaryButton>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Key Notes"
        description="High-yield Unit 6 review points to scan while the current question stays at the top of the page."
        tone="amber"
      >
        <div className="grid gap-5">
          <ol className="grid gap-5">
            {KEY_NOTE_TOPICS.map((topic) => (
              <li key={topic.number} className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <strong className="text-base tracking-tight text-slate-950">
                  {topic.number}. {topic.title}
                </strong>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 marker:text-amber-600">
                  {topic.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
            <section className="rounded-[1.2rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <h2 className="text-base font-semibold tracking-tight text-amber-950">Don't Mix These Up</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-950 marker:text-amber-700">
                {NOTE_COMPARISONS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-[1.2rem] border border-sky-200 bg-sky-50 p-5 shadow-sm">
              <h2 className="text-base font-semibold tracking-tight text-sky-950">Red Terms to Know Cold</h2>
              <ul className="mt-3 grid gap-x-6 gap-y-2 pl-5 text-sm leading-6 text-sky-950 marker:text-sky-700 sm:grid-cols-2">
                {RED_TERMS.map((term) => (
                  <li key={term} className="list-disc">{term}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </SectionCard>
    </main>
  );
}