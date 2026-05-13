import { describe, expect, it } from 'vitest';
import { checkRateLimit } from './rate-limit';

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
});
