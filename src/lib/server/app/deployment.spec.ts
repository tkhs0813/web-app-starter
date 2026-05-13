import { describe, expect, it } from 'vitest';
import { deploymentProviders } from './deployment';

describe('deployment providers', () => {
	it('documents stable deployment options for the starter', () => {
		expect(deploymentProviders.map((provider) => provider.id)).toEqual([
			'cloudflare-pages',
			'cloudflare-workers',
			'vercel'
		]);
		expect(deploymentProviders[0]?.adapter).toBe('@sveltejs/adapter-cloudflare');
		expect(
			deploymentProviders.every((provider) => provider.env.includes('BETTER_AUTH_SECRET'))
		).toBe(true);
	});
});
