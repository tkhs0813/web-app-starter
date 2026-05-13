type Bucket = { count: number; resetAt: number };
type RateLimitResult = { allowed: boolean; remaining: number; resetAt: number };
type RateLimitInput = { key: string; limit: number; windowSeconds: number };
type RateLimitStorage = {
	get(key: string): Promise<string | null>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

const buckets = new Map<string, Bucket>();

function evaluateBucket(
	input: RateLimitInput,
	current: Bucket | null,
	now = Date.now()
): [RateLimitResult, Bucket] {
	if (!current || current.resetAt <= now) {
		const next = { count: 1, resetAt: now + input.windowSeconds * 1000 };
		return [{ allowed: true, remaining: input.limit - 1, resetAt: next.resetAt }, next];
	}
	if (current.count >= input.limit) {
		return [{ allowed: false, remaining: 0, resetAt: current.resetAt }, current];
	}
	const next = { count: current.count + 1, resetAt: current.resetAt };
	return [{ allowed: true, remaining: input.limit - next.count, resetAt: current.resetAt }, next];
}

export function checkRateLimit(input: RateLimitInput) {
	const now = Date.now();
	const [result, next] = evaluateBucket(input, buckets.get(input.key) ?? null, now);
	buckets.set(input.key, next);
	return result;
}

export async function checkRateLimitWithStorage(
	input: RateLimitInput & { namespace?: RateLimitStorage }
) {
	if (!input.namespace) return checkRateLimit(input);
	const raw = await input.namespace.get(input.key);
	const current = raw ? (JSON.parse(raw) as Bucket) : null;
	const [result, next] = evaluateBucket(input, current);
	await input.namespace.put(input.key, JSON.stringify(next), {
		expirationTtl: Math.ceil((next.resetAt - Date.now()) / 1000)
	});
	return result;
}

export function getClientIp(request: Request) {
	return (
		request.headers.get('cf-connecting-ip') ??
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		'local'
	);
}
