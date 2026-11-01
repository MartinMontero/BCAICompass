type Level = "info" | "warn" | "error";

const ENDPOINT = "/api/log";
let queue: Array<{ level: Level; msg: string; ctx?: Record<string, unknown> }> = [];
let scheduled = false;
const QUEUE_MAX = 500;
let dropped = 0;
const SEND_MAX_LINES = 50;
const CORRELATION_WINDOW_MS = 2000;
let recentIds: Array<{ id: string; at: number }> = [];

function rememberRequestId(id: string): void {
  const now = Date.now();
  recentIds.push({ id, at: now });
  recentIds = recentIds.filter(e => now - e.at <= CORRELATION_WINDOW_MS);
}

function unambiguousRequestId(): string | undefined {
  const now = Date.now();
  recentIds = recentIds.filter(e => now - e.at <= CORRELATION_WINDOW_MS);
  const distinct = new Set(recentIds.map(e => e.id));
  return distinct.size === 1 ? recentIds[recentIds.length - 1].id : undefined;
}

if (typeof window !== "undefined" && typeof window.fetch === "function") {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const response = await originalFetch(...args);
    try {
      const id = response.headers.get("x-request-id");
      if (id) rememberRequestId(id);
    } catch {
      // Ignore unreadable headers.
    }
    return response;
  };
}

function flush(): void {
  scheduled = false;
  const batch = queue;
  queue = [];
  if (batch.length === 0 && dropped === 0) return;
  if (dropped > 0) {
    batch.push({ level: "warn", msg: "client log queue overflowed; oldest entries dropped", ctx: { dropped } });
    dropped = 0;
  }
  const requestId = unambiguousRequestId();
  const stamped = requestId ? batch.map(item => ({ ...item, ctx: { requestId, ...item.ctx } })) : batch;
  for (let i = 0; i < stamped.length; i += SEND_MAX_LINES) send(stamped.slice(i, i + SEND_MAX_LINES));
}

function send(chunk: Array<{ level: Level; msg: string; ctx?: Record<string, unknown> }>): void {
  try {
    const body = JSON.stringify(chunk);
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch {
    // Logging must never break the app.
  }
}

function emit(level: Level, msg: string, ctx?: Record<string, unknown>): void {
  if (level === "error") console.error(msg, ctx ?? "");
  else if (level === "warn") console.warn(msg, ctx ?? "");
  else console.log(msg, ctx ?? "");
  if (queue.length >= QUEUE_MAX) {
    queue.shift();
    dropped += 1;
  }
  queue.push({ level, msg, ctx });
  if (!scheduled) {
    scheduled = true;
    queueMicrotask(flush);
  }
}

export const log = {
  info: (msg: string, ctx?: Record<string, unknown>) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => emit("error", msg, ctx),
};

if (typeof window !== "undefined") {
  window.addEventListener("error", e => {
    emit("error", e.message || "window.onerror", { filename: e.filename, lineno: e.lineno, colno: e.colno, stack: e.error?.stack });
  });
  window.addEventListener("unhandledrejection", e => {
    const reason = e.reason;
    emit("error", "unhandledrejection", { reason: reason instanceof Error ? reason.message : String(reason), stack: reason instanceof Error ? reason.stack : undefined });
  });
}

export default log;
