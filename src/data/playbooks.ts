export interface Playbook {
  id: string;
  title: string;
  summary: string;
  useWhen: string;
  filename: string;
  content: string;
}

export const PLAYBOOKS: Playbook[] = [
  {
    id: 'use-case-brief',
    title: 'AI use-case brief',
    summary: 'One page to align the problem, people, data, human checkpoint, and pilot before a vendor or model enters the room.',
    useWhen: 'Use this before procurement, a research approach, or a prototype sprint.',
    filename: 'bc-ai-use-case-brief.md',
    content: `# AI use-case brief

## 1. Problem and person
- **Task or decision to improve:**
- **Person who owns the task today:**
- **People affected by the result:**
- **Current workflow:**
- **Current baseline (time, quality, cost, access, or another measure):**
- **Cost of doing nothing:**

## 2. Smallest useful scope
- **One user group for the pilot:**
- **One workflow step AI may assist:**
- **Explicitly out of scope:**
- **Decision or action a person must still own:**
- **Human review and appeal route:**

## 3. Inputs and outputs
- **Example input:**
- **Useful output:**
- **Information the tool must not receive:**
- **What happens when the answer is uncertain:**

## 4. Data and access
- **Data owner:**
- **Data classes involved (public, internal, personal, confidential, Indigenous, other):**
- **Source and permission to use:**
- **Who needs access:**
- **Retention and deletion needs:**
- **Privacy, security, records, legal, accessibility, or data-governance reviewers to involve:**

## 5. Pilot design
- **Representative test cases:**
- **Expected result for each case:**
- **Baseline for comparison:**
- **Success measure and threshold:**
- **Failure modes to watch:**
- **Stop condition:**
- **Pilot owner and review date:**

## 6. Decision after the pilot
- **Scale / revise / stop:**
- **Evidence behind the decision:**
- **Training and operating owner:**
- **Vendor exit or rollback needs:**
`,
  },
  {
    id: 'pilot-scorecard',
    title: 'Pilot evaluation scorecard',
    summary: 'A test log and go/no-go worksheet for comparing AI-assisted work with the current baseline instead of collecting impressions.',
    useWhen: 'Use this with real representative cases before expanding access or signing a longer commitment.',
    filename: 'bc-ai-pilot-scorecard.md',
    content: `# AI pilot evaluation scorecard

## Pilot setup
- **Workflow and owner:**
- **Dates:**
- **Users:**
- **Tool / model / settings recorded:**
- **Current baseline:**
- **Success threshold:**
- **Stop condition:**

## Representative cases
Duplicate the row for each case. Use information approved for the pilot.

| Case | Expected result | AI-assisted result | Human correction needed | Severity | Time vs. baseline | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 01 |  |  |  |  |  |  |
| 02 |  |  |  |  |  |  |
| 03 |  |  |  |  |  |  |
| 04 |  |  |  |  |  |  |
| 05 |  |  |  |  |  |  |
| 06 |  |  |  |  |  |  |
| 07 |  |  |  |  |  |  |
| 08 |  |  |  |  |  |  |
| 09 |  |  |  |  |  |  |
| 10 |  |  |  |  |  |  |

## Results
- **Cases meeting the quality threshold:**
- **Cases requiring material correction:**
- **High-severity failures:**
- **Median time, current workflow:**
- **Median time, AI-assisted workflow including review:**
- **Accessibility or equity issues observed:**
- **Unexpected uses or workarounds:**
- **Total operating cost, including review and administration:**

## Failure review
- **Where did the tool fail?**
- **Could a user detect the failure?**
- **Who could be harmed, and how?**
- **Which controls worked?**
- **What must change before another test?**

## Decision
- **Scale / revise / stop:**
- **Decision owner:**
- **Evidence reviewed:**
- **Conditions for continuing:**
- **Next review date:**
- **Rollback or vendor-exit steps:**
`,
  },
  {
    id: 'procurement-checklist',
    title: 'Responsible procurement checklist',
    summary: 'Concrete questions for a vendor, internal reviewers, and the contract—covering data use, evaluation, incidents, accessibility, and exit.',
    useWhen: 'Use this before a pilot agreement, renewal, or material change to an AI-enabled service.',
    filename: 'bc-ai-responsible-procurement-checklist.md',
    content: `# Responsible AI procurement checklist

This is an internal planning worksheet, not legal advice. Adapt it with your organization’s privacy, security, procurement, accessibility, records, legal, and data-governance owners.

## Purpose and fit
- [ ] The use case, users, affected people, and human decision owner are documented.
- [ ] The vendor has shown evidence on representative cases, not only a demonstration.
- [ ] The current-workflow baseline and measurable pilot threshold are agreed.
- [ ] Material limitations and unsupported uses are written down.

## Data and secondary use
- [ ] Every input, output, log, recording, prompt, and derived-data class is listed.
- [ ] The contract states whether inputs, outputs, or derived data may train or improve any model.
- [ ] Secondary use, subprocessors, cross-border handling, retention, and deletion are documented.
- [ ] The organization can export and delete its data, with a stated format and timeline.
- [ ] Required privacy and security assessments are complete for our context.

## Quality and human oversight
- [ ] Evaluation covers representative, edge, accessibility, and failure cases.
- [ ] Users can identify, correct, report, and appeal a poor output.
- [ ] The vendor commits to notice for material model, feature, policy, or subprocessor changes.
- [ ] We can rerun evaluation after changes and suspend use when needed.

## Security, incidents, and continuity
- [ ] Access roles, authentication, logging, and administrative controls match our needs.
- [ ] Incident notice route, expected timeline, evidence preservation, and responsibilities are stated.
- [ ] Service availability, support, backup, and recovery expectations match the workflow’s criticality.
- [ ] A manual fallback exists for an outage or unsafe output.

## People and operations
- [ ] Accessibility needs and affected-user communication are addressed.
- [ ] Staff training, operating ownership, and a feedback channel are funded and assigned.
- [ ] Records retention, access/correction requests, and complaints have an internal owner.
- [ ] Indigenous data sovereignty and community-specific governance are addressed where relevant.

## Contract and exit
- [ ] Audit or assurance rights and documentation needs are clear.
- [ ] Renewal triggers a fresh review rather than automatic acceptance of changed terms.
- [ ] Exit assistance, export, deletion verification, and transition timing are agreed.
- [ ] A named owner can stop the service without waiting for procurement renewal.

## Review record
- **Reviewer(s):**
- **Date:**
- **Open questions and owners:**
- **Decision and conditions:**
- **Next review trigger or date:**
`,
  },
];

export const GOVERNANCE_REFERENCES = [
  {
    title: 'B.C. government — Privacy Impact Assessments',
    url: 'https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/privacy/privacy-impact-assessments',
    note: 'Official starting point for B.C. public bodies, including guidance and completion routes.',
  },
  {
    title: 'OIPC B.C. — Guidance documents',
    url: 'https://www.oipc.bc.ca/resources/',
    note: 'Current privacy guidance index for public bodies, private organizations, and individuals.',
  },
  {
    title: 'OIPC B.C. — PIPA and AI scribes',
    url: 'https://www.oipc.bc.ca/documents/guidance-documents/3082',
    note: 'A detailed, health-specific example of vendor questions and privacy controls.',
  },
  {
    title: 'OIPC B.C. — Protect your privacy when using AI tools',
    url: 'https://www.oipc.bc.ca/documents/infographics/3152',
    note: 'Practical privacy settings, retention, access, and correction reminders.',
  },
];
