import { AppError } from "./errors";

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const entries = new Map<string, RateLimitEntry>();

function positiveInteger(name: "RATE_LIMIT_MAX" | "RATE_LIMIT_WINDOW_MIN"): number {
  const value = Number(process.env[name]);

  if (!Number.isInteger(value) || value <= 0) {
    throw new AppError(
      "INTERNAL",
      `${name} must be a positive integer.`
    );
  }

  return value;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();

    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

function cleanup(now: number, windowMs: number): void {
  for (const [ip, entry] of entries) {
    if (now - entry.windowStart >= windowMs) {
      entries.delete(ip);
    }
  }
}

export function rateLimit(request: Request): void {
  const max = positiveInteger("RATE_LIMIT_MAX");
  const windowMs = positiveInteger("RATE_LIMIT_WINDOW_MIN") * 60_000;

  const now = Date.now();

  cleanup(now, windowMs);

  const ip = clientIp(request);
  const entry = entries.get(ip);

  if (!entry || now - entry.windowStart >= windowMs) {
    entries.set(ip, {
      count: 1,
      windowStart: now,
    });
    return;
  }

  if (entry.count >= max) {
    throw new AppError(
      "RATE_LIMITED",
      "Too many requests. Please try again later."
    );
  }

  entry.count += 1;
}