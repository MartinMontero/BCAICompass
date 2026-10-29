import {
  ORGANIZATIONS,
  REGIONS,
  type Category,
  type Organization,
  type Region,
} from '../data/organizations';
import { PATHWAYS, type Pathway } from '../data/pathways';

export type GoalId = 'adopt' | 'build' | 'research' | 'fund' | 'learn' | 'connect' | 'policy';
export type PlanRegion = 'All regions' | Region;

export interface PlanStep {
  title: string;
  detail: string;
}

export interface Goal {
  id: GoalId;
  label: string;
  title: string;
  summary: string;
  categories: Category[];
  priorityIds: string[];
  pathwayIds: string[];
  steps: PlanStep[];
}

export const GOALS: Goal[] = [
  {
    id: 'adopt',
    label: 'Adopt AI at work',
    title: 'Move from a vague idea to a bounded pilot.',
    summary: 'For a team choosing a workflow, testing it safely, and deciding whether to scale.',
    categories: ['Public Sector & Policy', 'Research & Academia', 'Companies & Applied AI', 'Community & Convening', 'Capital & Accelerators'],
    priorityIds: ['city-of-kelowna', 'ai-ethical-futures-lab', 'ubc-trustml', 'digital-technology-supercluster', 'bc-ai-ecosystem-association'],
    pathwayIds: [],
    steps: [
      { title: 'Frame one workflow', detail: 'Name the user, the task, today’s time or quality baseline, and the decision a person still owns. Use the use-case brief below.' },
      { title: 'Bound data and risk', detail: 'List the data owner, personal or confidential information, access needs, retention, and vendor questions. Involve your privacy, security, or legal owner where applicable.' },
      { title: 'Test against a baseline', detail: 'Assemble representative cases, record expected outputs, log failures, and set a stop condition before the pilot begins.' },
      { title: 'Assign the operating owner', detail: 'Decide who trains users, reviews output quality, handles incidents, and can end the pilot or exit the vendor.' },
    ],
  },
  {
    id: 'build',
    label: 'Build an AI product',
    title: 'Find the room, the backing, and the technical evidence.',
    summary: 'For a founder moving from a problem worth solving to a testable product.',
    categories: ['Community & Convening', 'Capital & Accelerators', 'Research & Academia', 'Compute & Infrastructure', 'Companies & Applied AI'],
    priorityIds: ['bc-ai-ecosystem-association', 'new-ventures-bc', 'innovate-bc', 'caida', 'sanctuary-ai', 'bcnet'],
    pathwayIds: ['founders-route', 'interior-corridor'],
    steps: [
      { title: 'Write the smallest useful promise', detail: 'Name one user, one painful task, and the result your first prototype must improve. Keep model choice out of the problem statement.' },
      { title: 'Test the problem with people', detail: 'Use a community room or accelerator to critique the workflow and find design partners before buying infrastructure.' },
      { title: 'Prototype with a measured baseline', detail: 'Compare the AI-assisted workflow with the current manual workflow on the same cases. Record errors, review time, and cost.' },
      { title: 'Add specialist capacity only when needed', detail: 'Approach a lab, compute provider, or capital program with the evidence from the prototype and a specific unanswered question.' },
    ],
  },
  {
    id: 'research',
    label: 'Find a research collaborator',
    title: 'Turn a broad field into a specific research question.',
    summary: 'For a team seeking a lab, campus group, or applied research partner.',
    categories: ['Research & Academia', 'Compute & Infrastructure'],
    priorityIds: ['caida', 'ubc-data-science-institute', 'sfu-big-data-hub', 'uvic-computer-science', 'thompson-rivers-university', 'bcnet'],
    pathwayIds: [],
    steps: [
      { title: 'State the researchable question', detail: 'Write the decision or phenomenon, the population or material involved, and what a useful result would let you do.' },
      { title: 'Inventory your contribution', detail: 'List the data, domain expertise, equipment, funding, or student project scope you can actually bring.' },
      { title: 'Shortlist by published work', detail: 'Read each lab’s current source page and choose groups whose stated work matches the question—not just the largest institution.' },
      { title: 'Send a concise collaboration note', detail: 'Include the question, your contribution, desired expertise, timeline, and a small first conversation. Clarify data and IP expectations early.' },
    ],
  },
  {
    id: 'fund',
    label: 'Find funding or an accelerator',
    title: 'Prepare the evidence before opening the application.',
    summary: 'For a founder or organization comparing programs and capital-support routes.',
    categories: ['Capital & Accelerators', 'Public Sector & Policy'],
    priorityIds: ['new-ventures-bc', 'innovate-bc', 'pacifican', 'digital-technology-supercluster', 'bc-tech-association', 'viatec'],
    pathwayIds: ['founders-route'],
    steps: [
      { title: 'Define the use of support', detail: 'Specify the milestone, the evidence you need to reach it, and whether mentorship, pilot access, grant support, or investment is the real need.' },
      { title: 'Check the live program page', detail: 'Confirm current eligibility, intake dates, geography, obligations, and review criteria on the organization’s own site. Do not rely on the directory alone.' },
      { title: 'Build a reusable evidence pack', detail: 'Prepare the problem, customer evidence, prototype results, team capacity, budget, and the milestone this support unlocks.' },
      { title: 'Track the application and follow-through', detail: 'Record the owner, deadline, submitted materials, questions, decision, and next action in one shared place.' },
    ],
  },
  {
    id: 'learn',
    label: 'Learn or teach AI',
    title: 'Choose learning by audience and outcome.',
    summary: 'For career switchers, educators, students, and community learning organizers.',
    categories: ['Talent & Education', 'Community & Convening', 'Research & Academia'],
    priorityIds: ['first-nations-technology-council', 'ed-ai-education-meetup', 'ai-at-uvic', 'ufv-computing', 'selkirk-college', 'college-of-new-caledonia', 'ethos-lab'],
    pathwayIds: ['indigenous-ai', 'chapter-circuit'],
    steps: [
      { title: 'Name the learner and outcome', detail: 'Write who the learning is for, their starting point, and the task they should be able to complete afterwards.' },
      { title: 'Choose the right format', detail: 'Compare a course, campus hub, community meetup, or project-based academy by time, prerequisites, location, and evidence of completion.' },
      { title: 'Verify the current offering', detail: 'Open the provider’s page and confirm the next intake, delivery format, cost, accessibility, and eligibility before making a commitment.' },
      { title: 'Finish with an artifact', detail: 'Use a small project, lesson, or evaluated workflow to demonstrate the skill and create a concrete reason to meet the community.' },
    ],
  },
  {
    id: 'connect',
    label: 'Join a community',
    title: 'Find a room and make the first visit useful.',
    summary: 'For anyone looking for chapters, recurring gatherings, and peer learning in B.C.',
    categories: ['Community & Convening'],
    priorityIds: ['bc-ai-ecosystem-association', 'vancouver-ai', 'fv-ai-fraser-valley-ai', 'cv-ai-comox-valley-ai', 'ai-ethical-futures-lab', 'ed-ai-education-meetup'],
    pathwayIds: ['chapter-circuit'],
    steps: [
      { title: 'Pick by place or practice', detail: 'Choose a nearby chapter or a domain group whose recurring conversation matches what you want to learn or contribute.' },
      { title: 'Confirm the next session', detail: 'Open the community’s current page for the date, venue, registration, accessibility, and whether the session is a talk, lab, or social.' },
      { title: 'Bring a two-sentence introduction', detail: 'Say what you are working on and what you hope to learn or offer. A specific introduction makes the room easier to navigate.' },
      { title: 'Close the loop', detail: 'Write down one person, one resource, and one next session. Offer a correction, demo, or useful source when you can.' },
    ],
  },
  {
    id: 'policy',
    label: 'Govern AI in a public organization',
    title: 'Learn from public practice, then make accountability explicit.',
    summary: 'For public bodies developing policy, procurement, or an accountable service pilot.',
    categories: ['Public Sector & Policy', 'Research & Academia', 'Community & Convening'],
    priorityIds: ['comox-valley-regional-district', 'city-of-kelowna', 'ai-ethical-futures-lab', 'ubc-trustml', 'ubc-hai', 'bc-ai-ecosystem-association'],
    pathwayIds: [],
    steps: [
      { title: 'Map the decision and affected people', detail: 'Document the service decision, who is affected, the human appeal route, and which parts must never be delegated to the tool.' },
      { title: 'Review comparable public practice', detail: 'Read the primary policies and service pages linked here. Borrow questions and controls, not another jurisdiction’s legal conclusions.' },
      { title: 'Complete the required internal reviews', detail: 'Engage privacy, security, accessibility, records, procurement, Indigenous data governance, and legal owners as applicable to your organization.' },
      { title: 'Pilot with public accountability', detail: 'Set evaluation measures, human review, incident handling, notice, an appeal channel, and a date to publish or revisit the decision to continue.' },
    ],
  },
];

export interface ActionPlan {
  goal: Goal;
  region: PlanRegion;
  organizations: Organization[];
  pathways: Pathway[];
}

export function buildActionPlan(goalId: GoalId, region: PlanRegion = 'All regions', limit = 6): ActionPlan {
  const goal = GOALS.find((candidate) => candidate.id === goalId) ?? GOALS[0];
  const categories = new Set(goal.categories);
  const priority = new Map(goal.priorityIds.map((id, index) => [id, index]));
  const cappedLimit = Math.max(1, Math.min(12, Math.floor(limit) || 6));

  const organizations = ORGANIZATIONS
    .map((organization, index) => ({ organization, index }))
    .filter(({ organization }) => {
      if (!categories.has(organization.category)) return false;
      if (region === 'All regions') return true;
      return organization.region === region || organization.region === 'Province-wide';
    })
    .sort((a, b) => {
      const aPriority = priority.get(a.organization.id) ?? 10_000;
      const bPriority = priority.get(b.organization.id) ?? 10_000;
      if (aPriority !== bPriority) return aPriority - bPriority;
      if (region !== 'All regions') {
        const aLocal = a.organization.region === region ? 0 : 1;
        const bLocal = b.organization.region === region ? 0 : 1;
        if (aLocal !== bLocal) return aLocal - bLocal;
      }
      return a.index - b.index;
    })
    .slice(0, cappedLimit)
    .map(({ organization }) => organization);

  const pathwayIds = new Set(goal.pathwayIds);
  const pathways = PATHWAYS.filter((pathway) => pathwayIds.has(pathway.id));
  return { goal, region, organizations, pathways };
}

export function planToMarkdown(plan: ActionPlan): string {
  const lines = [
    `# BC AI Compass action plan — ${plan.goal.label}`,
    '',
    plan.goal.title,
    '',
    `Region: ${plan.region}`,
    '',
    '## Checklist',
    '',
    ...plan.goal.steps.flatMap((step, index) => [`${index + 1}. **${step.title}** — ${step.detail}`, '']),
    '## Verified organizations to investigate',
    '',
  ];
  for (const organization of plan.organizations) {
    lines.push(`- [${organization.name}](${organization.url}) — ${organization.location}; ${organization.region}. [Source checked ${organization.verified}](${organization.sourceUrl})`);
  }
  if (plan.organizations.length === 0) lines.push('- No verified record matches this goal and region yet. Use the contribution route on BC AI Compass to suggest one.');
  lines.push('', '## Note', '', 'Checklist items are general planning guidance. Organization facts come from the linked, dated sources; confirm current program details before acting.', '');
  return lines.join('\n');
}

export const PLAN_REGIONS: PlanRegion[] = ['All regions', ...REGIONS];
