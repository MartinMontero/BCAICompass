const SECRET_KEY_RE =
  /(token|secret|password|passwd|api[-_]?key|authorization|cookie|session)/i;
const SECRET_QUERY_RE =
  /([?&](?:[^=&#\s]*?(?:token|secret|password|key|kpt|auth|session)[^=&#\s]*)=)[^&#\s]+/gi;
const BEARER_RE = /(Bearer\s+)[A-Za-z0-9._~+/=-]+/gi;

const SCRUB_MAX_DEPTH = 6;

export function scrubValue(value: unknown, depth = 0): unknown {
  if (typeof value === "string") {
    return value
      .replace(BEARER_RE, "$1<redacted>")
      .replace(SECRET_QUERY_RE, "$1<redacted>");
  }
  if (depth >= SCRUB_MAX_DEPTH || !value || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(v => scrubValue(v, depth + 1));
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SECRET_KEY_RE.test(k) ? "<redacted>" : scrubValue(v, depth + 1);
  }
  return out;
}

export function scrubCtx(
  ctx: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!ctx) return undefined;
  const scrubbed = scrubValue(ctx, 0);
  return typeof scrubbed === "object" && scrubbed !== null && !Array.isArray(scrubbed)
    ? (scrubbed as Record<string, unknown>)
    : undefined;
}
