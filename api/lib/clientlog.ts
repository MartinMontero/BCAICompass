import type { Context } from "hono";
import { appendLine } from "./logger";
import { scrubCtx, scrubValue } from "./scrub";

const LOG_BODY_MAX = 64 * 1024;
const LOG_MAX_LINES_PER_REQUEST = 50;
const LOG_MAX_LINES_PER_MINUTE = 600;
const LOG_MAX_LINES_PER_MINUTE_GLOBAL = 3000;
const WINDOW_MAX_KEYS = 1024;
const WINDOW_MS = 60_000;

type ClientLine = {
  level?: string;
  msg?: string;
  ctx?: Record<string, unknown>;
};

type Window = { at: number; count: number };
const windowStart = new Map<string, Window>();
let globalWindow: Window = { at: 0, count: 0 };

function evictStale(now: number): void {
  if (windowStart.size < WINDOW_MAX_KEYS) return;
  for (const [k, v] of windowStart) {
    if (now - v.at > WINDOW_MS) windowStart.delete(k);
  }
  while (windowStart.size >= WINDOW_MAX_KEYS) {
    const oldest = windowStart.keys().next();
    if (oldest.done) break;
    windowStart.delete(oldest.value);
  }
}

function underRateLimit(key: string): boolean {
  const now = Date.now();
  if (now - globalWindow.at > WINDOW_MS) globalWindow = { at: now, count: 0 };
  if (globalWindow.count >= LOG_MAX_LINES_PER_MINUTE_GLOBAL) return false;
  const cur = windowStart.get(key);
  if (!cur || now - cur.at > WINDOW_MS) {
    evictStale(now);
    windowStart.set(key, { at: now, count: 1 });
    globalWindow.count += 1;
    return true;
  }
  if (cur.count >= LOG_MAX_LINES_PER_MINUTE) return false;
  cur.count += 1;
  globalWindow.count += 1;
  return true;
}

const LOG_VALUE_MAX = 1024;
function clampValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.length > LOG_VALUE_MAX
      ? value.slice(0, LOG_VALUE_MAX) + "…[truncated]"
      : value;
  }
  return value;
}
function clampRecord(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) out[k] = clampValue(v);
  return out;
}
const RESERVED_KEYS = new Set(["ts", "source", "level", "msg"]);
function reservedFiltered(ctx: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!ctx) return {};
  return Object.fromEntries(Object.entries(ctx).filter(([k]) => !RESERVED_KEYS.has(k)));
}

export async function handleClientLog(c: Context): Promise<Response> {
  const declared = Number(c.req.header("content-length") ?? "0");
  if (declared > LOG_BODY_MAX) return c.body(null, 413);
  let payload: unknown;
  try {
    const raw = await c.req.text();
    if (raw.length > LOG_BODY_MAX) return c.body(null, 413);
    payload = JSON.parse(raw);
  } catch {
    return c.body(null, 400);
  }
  const incoming: ClientLine[] = Array.isArray(payload) ? (payload as ClientLine[]) : [payload as ClientLine];
  if (incoming.length > LOG_MAX_LINES_PER_REQUEST) incoming.length = LOG_MAX_LINES_PER_REQUEST;
  const clientKey = c.req.header("cf-connecting-ip") ?? (c.req.header("x-forwarded-for") ?? "anon").split(",")[0].trim();
  for (const item of incoming) {
    if (!item || typeof item !== "object") continue;
    if (!underRateLimit(clientKey)) break;
    const level = typeof item.level === "string" ? item.level.slice(0, 16) : "info";
    const msg = typeof item.msg === "string" ? item.msg : "";
    const ctx = scrubCtx(item.ctx);
    const line = JSON.stringify(clampRecord({
      ts: new Date().toISOString(),
      source: "client",
      level,
      msg: scrubValue(msg),
      ...reservedFiltered(ctx),
    }));
    appendLine(line);
  }
  return c.body(null, 204);
}
