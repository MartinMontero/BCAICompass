import fs from "fs";
import path from "path";
import { currentRequestId } from "./requestcontext";
import { scrubCtx, scrubValue } from "./scrub";

const LOG_DIR = process.env.KIMI_LOG_DIR ?? "/tmp/kimi-logs";
const LOG_FILE = process.env.KIMI_LOG_FILE ?? path.join(LOG_DIR, "app.log");
const LOG_MAX_BYTES = 8 * 1024 * 1024;

let bytesWritten = 0;
let sizeKnown = false;

function enforceBudget(lineLength: number): void {
  if (!sizeKnown) {
    try {
      bytesWritten = fs.statSync(LOG_FILE).size;
    } catch {
      bytesWritten = 0;
    }
    sizeKnown = true;
  }
  if (bytesWritten + lineLength <= LOG_MAX_BYTES) return;
  try {
    fs.writeFileSync(
      LOG_FILE,
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "warn",
        msg: "app.log exceeded its size budget; truncated",
        maxBytes: LOG_MAX_BYTES,
      }) + "\n"
    );
  } catch {
    return;
  }
  bytesWritten = 0;
}

let dirReady = false;
function ensureDir(): void {
  if (dirReady) return;
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    dirReady = true;
  } catch {
    // stdout remains available.
  }
}

type Level = "debug" | "info" | "warn" | "error";
const RESERVED_KEYS = new Set(["ts", "level", "msg", "requestId"]);

function write(level: Level, msg: string, ctx?: Record<string, unknown>): void {
  let line: string;
  try {
    const requestId = currentRequestId();
    const extra = Object.fromEntries(
      Object.entries(scrubCtx(ctx) ?? {}).filter(([k]) => !RESERVED_KEYS.has(k))
    );
    line = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      ...(requestId ? { requestId } : {}),
      msg: scrubValue(msg),
      ...extra,
    });
  } catch {
    return;
  }
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);

  ensureDir();
  try {
    enforceBudget(line.length + 1);
    fs.appendFileSync(LOG_FILE, line + "\n");
    bytesWritten += line.length + 1;
  } catch {
    // Best-effort sink.
  }
}

export function appendLine(line: string): void {
  try {
    console.log(line);
  } catch {
    // stdout is best-effort too.
  }
  ensureDir();
  try {
    enforceBudget(line.length + 1);
    fs.appendFileSync(LOG_FILE, line + "\n");
    bytesWritten += line.length + 1;
  } catch {
    // Best-effort.
  }
}

export const log = {
  info: (msg: string, ctx?: Record<string, unknown>) => write("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => write("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) =>
    write("error", msg, ctx),
  debug: (msg: string, ctx?: Record<string, unknown>) => write("debug", msg, ctx),
};

export const logFilePath = LOG_FILE;
