// Join the 136-organization source review to the public People dataset.
// Every organization remains visible, including those with no confirmed profile.
import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';

const review = JSON.parse(await readFile('research/people-source-review.json', 'utf8'));
const result = await build({ entryPoints: ['src/data/people.ts'], bundle: true, format: 'esm', platform: 'node', write: false });
const { PEOPLE } = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));

const SPECIAL_NOTES = {
  'city-of-vancouver': 'Public pages reviewed. No confirmed AI-specific project lead was added; a general mayor is not presented as an AI project contact.',
  'ai-creativity-and-design': 'The public community page explicitly says no host names are confirmed publicly yet. No person is inferred into that role.',
};

const organizations = review.organizations.map((organization) => {
  const peopleIds = PEOPLE.filter((person) => person.relatedOrgIds.includes(organization.organizationId)).map((person) => person.id);
  return {
    ...organization,
    reviewOutcome: peopleIds.length > 0
      ? 'people-published'
      : organization.reviewStatus === 'pages-reviewed'
        ? 'reviewed-no-public-profile-confirmed'
        : 'no-readable-public-page',
    peopleIds,
    ...(SPECIAL_NOTES[organization.organizationId] ? { note: SPECIAL_NOTES[organization.organizationId] } : {}),
  };
});
const organizationsWithPublishedPeople = organizations.filter((organization) => organization.peopleIds.length > 0).length;
const output = {
  generatedAt: new Date().toISOString(),
  organizationCount: review.organizationCount,
  reviewedCount: organizations.length,
  coverageComplete: organizations.length === review.organizationCount,
  initialPeopleCount: 21,
  expandedPeopleCount: PEOPLE.length,
  organizationsWithPublishedPeople,
  organizationsWithoutPublishedPeople: organizations.length - organizationsWithPublishedPeople,
  organizations,
};
await writeFile('research/people-source-review.json', JSON.stringify(output, null, 2) + '\n');
console.log(`Coverage ledger complete: ${organizations.length} organizations, ${PEOPLE.length} people, ${organizationsWithPublishedPeople} organizations with published people.`);
