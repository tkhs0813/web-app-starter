type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(input: { key: string; limit: number; windowSeconds: number }) {
	const now = Date.now();
	const current = buckets.get(input.key);
	if (!current || current.resetAt <= now) {
		buckets.set(input.key, { count: 1, resetAt: now + input.windowSeconds * 1000 });
		return { allowed: true, remaining: input.limit - 1, resetAt: now + input.windowSeconds * 1000 };
	}
	if (current.count >= input.limit)
		return { allowed: false, remaining: 0, resetAt: current.resetAt };
	current.count += 1;
	return { allowed: true, remaining: input.limit - current.count, resetAt: current.resetAt };
}

export function getClientIp(request: Request) {
	return (
		request.headers.get('cf-connecting-ip') ??
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		'local'
	);
}
