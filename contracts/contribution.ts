import { z } from 'zod';

const publicUrl = z.string().trim().max(2048).url().refine((value) => {
  const url = new URL(value);
  return url.protocol === 'https:' || url.protocol === 'http:';
}, 'Use a public HTTP or HTTPS URL.');

export const contributionSchema = z.strictObject({
  kind: z.enum(['add-organization', 'correct-record', 'suggest-public-ai']),
  name: z.string().trim().min(2).max(160),
  website: publicUrl,
  sourceUrl: publicUrl,
  location: z.string().trim().max(160).optional().default(''),
  details: z.string().trim().min(20).max(3000),
  consent: z.literal(true),
  formStartedAt: z.number().int().positive(),
  honeypot: z.string().max(0),
}).superRefine((value, context) => {
  if (value.kind === 'add-organization' && value.location.length < 2) {
    context.addIssue({
      code: 'custom',
      path: ['location'],
      message: 'Add the organization’s B.C. location or province-wide presence.',
    });
  }
});

export type ContributionInput = z.input<typeof contributionSchema>;
export type Contribution = z.output<typeof contributionSchema>;

export const CONTRIBUTION_KIND_LABELS: Record<Contribution['kind'], string> = {
  'add-organization': 'Add an organization',
  'correct-record': 'Correct a record',
  'suggest-public-ai': 'Suggest a Public AI resource',
};
