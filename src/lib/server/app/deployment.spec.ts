import { describe, expect, it } from 'vitest';
import { deploymentProviders } from './deployment';

describe('deployment providers', () => {
	it('documents stable deployment options for the starter', () => {
		expect(deploymentProviders.map((provider) => provider.id)).toEqual([
			'vercel',
			'cloudflare-pages',
			'fly-io'
		]);
		expect(deploymentProviders.every((provider) => provider.env.length > 0)).toBe(true);
	});
});
