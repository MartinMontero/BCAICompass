import { AsyncLocalStorage } from "async_hooks";

export const REQUEST_ID_HEADER = "x-request-id";

const storage = new AsyncLocalStorage<string>();

export function runWithRequestId<T>(requestId: string, fn: () => T): T {
  return storage.run(requestId, fn);
}

export function currentRequestId(): string | undefined {
  return storage.getStore();
}
