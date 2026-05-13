import { describe, expect, it } from 'vitest';
import { getPasswordStrength, isTurnstileConfigured, verifyTurnstileToken } from './security';

describe('security helpers', () => {
	it('requires practical password strength for production auth forms', () => {
		expect(getPasswordStrength('short').valid).toBe(false);
		expect(getPasswordStrength('longbutmissingnumbers').valid).toBe(false);
		expect(getPasswordStrength('CorrectHorse9').valid).toBe(true);
	});

	it('treats Turnstile as optional unless a secret is configured', async () => {
		expect(isTurnstileConfigured('')).toBe(false);
		expect(await verifyTurnstileToken({ token: '', secret: '' })).toEqual({
			success: true,
			skipped: true
		});
	});
});
