import { NextRequest, NextResponse } from 'next/server';

// ==========================================
// 1. IN-MEMORY LRU CACHE WITH TTL
// ==========================================
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;
  private readonly defaultTtlMs: number;

  constructor(maxSize = 250, defaultTtlMs = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh position for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict oldest (first inserted key)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const diagnosticCache = new LRUCache<any>(100, 10 * 60 * 1000); // 10 min TTL
export const triageCache = new LRUCache<any>(150, 15 * 60 * 1000); // 15 min TTL
export const videoGuideCache = new LRUCache<any>(80, 30 * 60 * 1000); // 30 min TTL

// ==========================================
// 2. LIGHTWEIGHT SLIDING WINDOW RATE LIMITER
// ==========================================
interface RateLimitRecord {
  timestamps: number[];
}

interface RateLimitCheckResult {
  limited: boolean;
  message: string;
  retryAfterSeconds?: number;
}

function createRateLimiterCore(options: { maxRequests: number; windowMs: number; message?: string }) {
  const ipStore = new Map<string, RateLimitRecord>();
  const { maxRequests, windowMs, message = 'Rate limit exceeded. Please try again shortly.' } = options;

  // Periodic cleanup every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  return function checkLimit(clientIp: string): RateLimitCheckResult {
    const now = Date.now();

    let record = ipStore.get(clientIp);
    if (!record) {
      record = { timestamps: [] };
      ipStore.set(clientIp, record);
    }

    // Filter out timestamps outside window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      return {
        limited: true,
        message,
        retryAfterSeconds: Math.ceil((record.timestamps[0] + windowMs - now) / 1000),
      };
    }

    record.timestamps.push(now);
    return { limited: false, message };
  };
}

/**
 * Next.js Route Handler rate limiter - call check(req) at the top of a
 * handler; a non-null return is a ready-to-return 429 response.
 */
export function createNextRateLimiter(options: { maxRequests: number; windowMs: number; message?: string }) {
  const checkLimit = createRateLimiterCore(options);

  return {
    check(req: NextRequest): NextResponse | null {
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
      const result = checkLimit(clientIp);

      if (result.limited) {
        return NextResponse.json(
          { success: false, error: result.message, retryAfterSeconds: result.retryAfterSeconds },
          { status: 429 }
        );
      }

      return null;
    },
  };
}

// ==========================================
// 3. TIMEOUT CIRCUIT BREAKER WRAPPER
// ==========================================
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 4500, fallback: T): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutHandle = setTimeout(() => {
      resolve(fallback);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (err) {
    clearTimeout(timeoutHandle!);
    return fallback;
  }
}

// ==========================================
// 4. SHARED NEXT.JS ROUTE HANDLER RATE LIMITERS
// ==========================================
export const aiRateLimiterNext = createNextRateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000,
  message: 'AI throughput limit reached. Please wait a moment before sending another request.',
});

export const formRateLimiterNext = createNextRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000,
  message: 'Submission limit reached. Please wait a moment before resubmitting.',
});
