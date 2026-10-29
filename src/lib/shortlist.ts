import type { Organization } from '../data/organizations';

export const SHORTLIST_STORAGE_KEY = 'bcac-shortlist-v1';
export const MAX_SHORTLIST = 50;

export function sanitizeShortlist(value: unknown, validIds: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && validIds.has(id)))].slice(0, MAX_SHORTLIST);
}

export function parseShortlist(raw: string | null, validIds: ReadonlySet<string>): string[] {
  if (!raw) return [];
  try {
    return sanitizeShortlist(JSON.parse(raw), validIds);
  } catch {
    return [];
  }
}

export function toggleShortlistId(ids: string[], id: string, validIds: ReadonlySet<string>): string[] {
  if (!validIds.has(id)) return ids;
  if (ids.includes(id)) return ids.filter((candidate) => candidate !== id);
  if (ids.length >= MAX_SHORTLIST) return ids;
  return [...ids, id];
}

function csvCell(value: string | number | null): string {
  const raw = value === null ? '' : String(value);
  // Spreadsheet applications may execute formula-like cells on import. Prefixing
  // with an apostrophe preserves the visible value while forcing text semantics.
  const text = /^[\s]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function shortlistToCsv(organizations: Organization[]): string {
  const header = ['Name', 'Category', 'Type', 'Location', 'Region', 'Website', 'Source', 'Verified'];
  const rows = organizations.map((organization) => [
    organization.name,
    organization.category,
    organization.orgType,
    organization.location,
    organization.region,
    organization.url,
    organization.sourceUrl,
    organization.verified,
  ]);
  return `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}

export function shortlistToMarkdown(organizations: Organization[]): string {
  const lines = ['# BC AI Compass shortlist', '', 'Saved from the verified directory at https://bc-aicompass.ca', ''];
  for (const organization of organizations) {
    lines.push(`## ${organization.name}`, '');
    lines.push(`- **Category:** ${organization.category}`);
    lines.push(`- **Location:** ${organization.location}; ${organization.region}`);
    lines.push(`- **Website:** ${organization.url}`);
    lines.push(`- **Source checked ${organization.verified}:** ${organization.sourceUrl}`);
    if (organization.description) lines.push(`- **Verified description:** ${organization.description}`);
    lines.push('');
  }
  if (organizations.length === 0) lines.push('No organizations saved.');
  return lines.join('\n');
}
