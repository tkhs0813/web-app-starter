export type DeploymentProvider = {
	id: 'vercel' | 'cloudflare-pages' | 'fly-io';
	name: string;
	bestFor: string;
	adapter: string;
	commands: string[];
	env: string[];
};

export const deploymentProviders: DeploymentProvider[] = [
	{
		id: 'vercel',
		name: 'Vercel',
		bestFor: 'Fast SvelteKit previews and SaaS-style apps with GitHub PR deployments.',
		adapter: '@sveltejs/adapter-vercel',
		commands: ['pnpm add -D @sveltejs/adapter-vercel', 'vercel link', 'vercel deploy'],
		env: [
			'ORIGIN',
			'DATABASE_URL',
			'DATABASE_AUTH_TOKEN',
			'BETTER_AUTH_SECRET',
			'STRIPE_SECRET_KEY',
			'STRIPE_WEBHOOK_SECRET'
		]
	},
	{
		id: 'cloudflare-pages',
		name: 'Cloudflare Pages',
		bestFor: 'Edge hosting, generous free tier, and OSS-friendly static/serverless deployments.',
		adapter: '@sveltejs/adapter-cloudflare',
		commands: ['pnpm add -D @sveltejs/adapter-cloudflare', 'pnpm build', 'wrangler pages deploy'],
		env: [
			'ORIGIN',
			'DATABASE_URL',
			'DATABASE_AUTH_TOKEN',
			'BETTER_AUTH_SECRET',
			'STRIPE_SECRET_KEY',
			'STRIPE_WEBHOOK_SECRET'
		]
	},
	{
		id: 'fly-io',
		name: 'Fly.io',
		bestFor: 'Long-running Node servers, regional apps, and Docker-based deployments.',
		adapter: '@sveltejs/adapter-node',
		commands: ['pnpm add -D @sveltejs/adapter-node', 'fly launch', 'fly deploy'],
		env: [
			'ORIGIN',
			'DATABASE_URL',
			'DATABASE_AUTH_TOKEN',
			'BETTER_AUTH_SECRET',
			'STRIPE_SECRET_KEY',
			'STRIPE_WEBHOOK_SECRET'
		]
	}
];
