export type RetryOptions = {
  attempts?: number;
  baseMs?: number;
  maxMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

const DEFAULT_SHOULD_RETRY = (error: unknown) => {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("429") || msg.includes("rate") || msg.includes("timeout")) return true;
    if (msg.includes("500") || msg.includes("502") || msg.includes("503")) return true;
  }
  return false;
};

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseMs = options.baseMs ?? 400;
  const maxMs = options.maxMs ?? 4_000;
  const shouldRetry = options.shouldRetry ?? DEFAULT_SHOULD_RETRY;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt >= attempts || !shouldRetry(error, attempt)) break;
      const delay = Math.min(maxMs, baseMs * 2 ** (attempt - 1));
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
