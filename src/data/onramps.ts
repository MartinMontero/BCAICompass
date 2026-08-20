import type { Category } from './organizations';

/**
 * Onramps are doors into the same dataset, named after what a visitor came to DO
 * rather than after what the records ARE.
 *
 * Nothing here is a fact. An onramp holds a question, a hand-written blurb and a
 * set of categories; every number it displays is computed from ORGANIZATIONS at
 * render time. No count is stored in this file, deliberately — a hardcoded count
 * is a fact that goes quietly wrong the next time a record lands, which is the
 * fabrication failure this project exists to avoid, just running in slow motion.
 */
export interface Onramp {
  id: string;
  /** Short label on the card. */
  label: string;
  /** The visitor's own sentence. */
  question: string;
  /** Categories this onramp filters to. */
  categories: Category[];
  /** One sentence, hand-written, no claims beyond what the records show. */
  blurb: string;
  /** True when the slice is too thin to present as answered. */
  thin?: boolean;
}

export const ONRAMPS: Onramp[] = [
  {
    id: 'build',
    label: 'Build something',
    question: "I'm building with AI in B.C.",
    categories: ['Companies & Applied AI', 'Compute & Infrastructure', 'Capital & Accelerators'],
    blurb: 'The companies shipping, the compute coming online, and the capital behind both.',
  },
  {
    id: 'research',
    label: 'Find the researchers',
    question: "I'm looking for labs and collaborators.",
    categories: ['Research & Academia'],
    blurb: "Where B.C.'s AI research actually happens — lab by lab, campus by campus.",
  },
  {
    id: 'policy',
    label: 'Write the policy',
    question: "I'm a public body figuring out AI.",
    categories: ['Public Sector & Policy'],
    blurb: "Who's already done it, and what they adopted.",
  },
  {
    id: 'fund',
    label: 'Fund or get funded',
    question: "I'm moving money into B.C. AI.",
    categories: ['Capital & Accelerators'],
    blurb: 'The funds and accelerators with B.C. AI in their portfolio.',
  },
  {
    id: 'people',
    label: 'Find your people',
    question: 'I just want a room to walk into.',
    categories: ['Community & Convening'],
    blurb: 'Chapters and gatherings across the province. Start anywhere.',
  },
  {
    id: 'learn',
    label: 'Learn the craft',
    question: 'I want to train or switch careers.',
    categories: ['Talent & Education'],
    // The thin flag came off on 2026-08-19. It was set when this slice held three
    // records, all in Metro Vancouver and Victoria — too little to answer the
    // question the card asks. It now spans the Fraser Valley, the Kootenays and
    // the north as well, so it can. COVERAGE.md still records that bootcamps and
    // most private training providers are unsearched; a usable slice is not a
    // finished one, and the difference belongs in the audit rather than the card.
    blurb: 'College programs, campus hubs and community academies — from the Fraser Valley to Prince George.',
  },
];
