import { ORGANIZATIONS } from './organizations';

/**
 * Pathways are ordered routes through the dataset — the province-and-practice
 * equivalent of builderworkshop's walking trails, which chained venues you could
 * cross on foot. Nothing here is walkable; these are sequences of relationship.
 *
 * A stop is an id in organizations.ts and nothing more. No pathway carries a fact
 * about an organization: the name, region and everything else are read from the
 * record at render time, so a pathway can never drift out of sync with the record
 * it points at. Stops that do not resolve are dropped by RESOLVED_PATHWAYS below
 * rather than silently rendering blanks.
 */
export interface Pathway {
  id: string;
  name: string;
  blurb: string;
  /** Organization ids from organizations.ts, in route order. */
  stops: string[];
  /** Optional one-line sourced note. Only where specified below. */
  note?: string;
}

/** Minimum stops for a pathway to be worth publishing as a route. */
export const MIN_STOPS = 3;

const DRAFT_PATHWAYS: Pathway[] = [
  {
    id: 'founders-route',
    name: "The Founder's Route",
    blurb:
      "From the room where you pitch to the compute you'll train on — community, capital, infrastructure, and a company that's already walked it.",
    // Room -> capital -> compute -> a company that got there. New Ventures BC and
    // Innovate BC are the two Capital & Accelerators records with province-wide
    // mandates rather than a single region, which is what a founder anywhere in BC
    // can actually reach.
    stops: [
      'bc-ai-ecosystem-association',
      'new-ventures-bc',
      'innovate-bc',
      'telus-kamloops-ai-factory',
      'sanctuary-ai',
    ],
  },
  {
    id: 'interior-corridor',
    name: 'The Interior Compute Corridor',
    blurb:
      "Kamloops to Nicola Lake — where B.C.'s sovereign compute is actually being built, and who's building it.",
    // Every Thompson-Okanagan Compute & Infrastructure record, north to south:
    // the four Kamloops sites, then Merritt, then Nicola Lake.
    stops: [
      'telus-kamloops-ai-factory',
      'bell-ai-fabric-kamloops',
      'bell-ai-fabric-kamloops-tru',
      'bell-ai-fabric-kamloops-2',
      'bell-ai-fabric-merritt',
      'buzz-hpc',
      'upper-nicola-band-data-centre',
    ],
    // Supported by research/GOVERNMENT-LAYER.md: "BC Hydro notifies successful
    // applicants for the 400 MW AI and data-centre allocation in mid-September 2026."
    note: 'BC Hydro decides the power behind all of this in September 2026.',
  },
  {
    id: 'indigenous-ai',
    name: 'The Indigenous AI Route',
    blurb:
      'From digital sovereignty to a $500-million data centre — Indigenous-led AI across the province.',
    // Established organizations first, newest infrastructure last. The First
    // Peoples' Cultural Council has no verified record yet and is therefore absent
    // rather than invented — logged in research/VERIFICATION.md.
    stops: [
      'first-nations-technology-council',
      'animikii',
      'upper-nicola-band-data-centre',
      'prophet-river-first-nation-data-centre',
    ],
  },
  {
    id: 'chapter-circuit',
    name: 'The Chapter Circuit',
    blurb:
      'The rooms, in walking-in order — Vancouver, the Fraser Valley, the Comox Valley. Start at the one nearest you.',
    // Vancouver outward. Surrey was dropped from the blurb on 2026-08-19 once
    // bc-ai.ca resolved it: Surrey AI is a monthly EVENT SERIES, not a chapter,
    // and its momentum became FV+AI. bc-ai.ca/communities/fraser-valley-ai reads
    // "The Surrey roots ... Surrey AI built the momentum" and labels FV+AI
    // "Regional chapter 01". Three rooms, three stops — the blurb now matches.
    stops: ['vancouver-ai', 'fv-ai-fraser-valley-ai', 'cv-ai-comox-valley-ai'],
  },
];

const KNOWN_IDS = new Set(ORGANIZATIONS.map((o) => o.id));

/**
 * Pathways with unresolvable stops dropped, and pathways left under MIN_STOPS
 * excluded entirely.
 *
 * Padding a short route with a loosely related record would make the route lie
 * about the ecosystem; publishing a two-stop "route" would make it lie about
 * itself. Excluding it does neither.
 */
export const PATHWAYS: Pathway[] = DRAFT_PATHWAYS.map((p) => ({
  ...p,
  stops: p.stops.filter((id) => KNOWN_IDS.has(id)),
})).filter((p) => p.stops.length >= MIN_STOPS);

/** Stops named in a draft pathway that no record answers to. Surfaced for the audit. */
export const UNRESOLVED_STOPS: string[] = DRAFT_PATHWAYS.flatMap((p) =>
  p.stops.filter((id) => !KNOWN_IDS.has(id))
);
