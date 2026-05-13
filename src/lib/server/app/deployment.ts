export type DeploymentProvider = {
	id: 'cloudflare-pages' | 'cloudflare-workers' | 'vercel';
	name: string;
	bestFor: string;
	adapter: string;
	commands: string[];
	env: string[];
};

const requiredEnv = [
	'ORIGIN',
	'DATABASE_URL',
	'DATABASE_AUTH_TOKEN',
	'BETTER_AUTH_SECRET',
	'EMAIL_PROVIDER',
	'EMAIL_FROM',
	'STRIPE_SECRET_KEY',
	'STRIPE_WEBHOOK_SECRET'
];

export const deploymentProviders: DeploymentProvider[] = [
	{
		id: 'cloudflare-pages',
		name: 'Cloudflare Pages',
		bestFor:
			'Default target for this starter: Git-backed previews, edge SSR, and a friendly OSS deployment story.',
		adapter: '@sveltejs/adapter-cloudflare',
		commands: ['pnpm build', 'pnpm cf:dev', 'pnpm cf:deploy'],
		env: requiredEnv
	},
	{
		id: 'cloudflare-workers',
		name: 'Cloudflare Workers',
		bestFor:
			'Use when you want Workers Static Assets and direct Wrangler deploys instead of Pages projects.',
		adapter: '@sveltejs/adapter-cloudflare',
		commands: ['pnpm build', 'wrangler deploy'],
		env: requiredEnv
	},
	{
		id: 'vercel',
		name: 'Vercel (portable fallback)',
		bestFor: 'A documented escape hatch if a product later needs Vercel-specific integrations.',
		adapter: '@sveltejs/adapter-vercel',
		commands: ['pnpm add -D @sveltejs/adapter-vercel', 'vercel deploy'],
		env: requiredEnv
	}
];
