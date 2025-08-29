// naive in-memory token bucket per IP (for demo only)
const buckets = new Map<string, { tokens: number; updatedAt: number }>();


export function allow(ip: string, rpm = Number(process.env.RATE_LIMIT_RPM||"60")) {
    const now = Date.now();
    const minute = 60_000;
    const refill = (tokens: number, elapsed: number) => Math.min(rpm, tokens + (elapsed / minute) * rpm);
    const b = buckets.get(ip) ?? { tokens: rpm, updatedAt: now };
    const tokens = refill(b.tokens, now - b.updatedAt);
    if (tokens < 1) { buckets.set(ip, { tokens, updatedAt: now }); return false; }
    buckets.set(ip, { tokens: tokens - 1, updatedAt: now });
    return true;
}