import { describe, expect, it } from 'vitest';
import { checkRateLimit, checkRateLimitWithStorage } from './rate-limit';

describe('checkRateLimit', () => {
	it('blocks requests over the configured limit', () => {
		expect.assertions(4);
		const key = `test:${crypto.randomUUID()}`;
		expect(checkRateLimit({ key, limit: 2, windowSeconds: 60 }).allowed).toBe(true);
		expect(checkRateLimit({ key, limit: 2, windowSeconds: 60 }).allowed).toBe(true);
		const blocked = checkRateLimit({ key, limit: 2, windowSeconds: 60 });
		expect(blocked.allowed).toBe(false);
		expect(blocked.remaining).toBe(0);
	});

	it('can use Cloudflare KV-compatible storage for distributed rate limits', async () => {
		expect.assertions(3);
		const store = new Map<string, string>();
		const namespace = {
			async get(key: string) {
				return store.get(key) ?? null;
			},
			async put(key: string, value: string) {
				store.set(key, value);
			}
		};
		const key = `kv:${crypto.randomUUID()}`;
		expect(
			(await checkRateLimitWithStorage({ namespace, key, limit: 1, windowSeconds: 60 })).allowed
		).toBe(true);
		const blocked = await checkRateLimitWithStorage({
			namespace,
			key,
			limit: 1,
			windowSeconds: 60
		});
		expect(blocked.allowed).toBe(false);
		expect(blocked.remaining).toBe(0);
	});
});
