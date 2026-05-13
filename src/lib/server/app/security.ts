export type PasswordStrength = {
	valid: boolean;
	score: number;
	reasons: string[];
};

export function getPasswordStrength(password: string): PasswordStrength {
	const reasons: string[] = [];
	let score = 0;

	if (password.length >= 12) score += 1;
	else reasons.push('Use at least 12 characters.');

	if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
	else reasons.push('Mix uppercase and lowercase letters.');

	if (/\d/.test(password)) score += 1;
	else reasons.push('Add at least one number.');

	if (/[^A-Za-z0-9]/.test(password) || password.length >= 16) score += 1;
	else reasons.push('Add a symbol or use a longer passphrase.');

	return { valid: score >= 3, score, reasons };
}

export function isTurnstileConfigured(secret: string | null | undefined) {
	return Boolean(secret?.trim());
}

export async function verifyTurnstileToken(input: {
	token: string | null | undefined;
	secret: string | null | undefined;
	ip?: string;
	fetcher?: typeof fetch;
}) {
	if (!isTurnstileConfigured(input.secret)) return { success: true, skipped: true } as const;
	if (!input.token)
		return { success: false, skipped: false, error: 'Missing Turnstile token' } as const;

	const body = new FormData();
	body.set('secret', input.secret ?? '');
	body.set('response', input.token);
	if (input.ip) body.set('remoteip', input.ip);

	const response = await (input.fetcher ?? fetch)(
		'https://challenges.cloudflare.com/turnstile/v0/siteverify',
		{ method: 'POST', body }
	);
	const result = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };
	return {
		success: result.success === true,
		skipped: false,
		error: result.success
			? undefined
			: (result['error-codes'] ?? ['Turnstile verification failed']).join(', ')
	} as const;
}
