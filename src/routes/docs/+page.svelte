<script lang="ts">
	let { data } = $props();
</script>

<svelte:head><title>Docs — web-app-starter</title></svelte:head>

<main class="mx-auto max-w-4xl px-6 py-20 text-slate-200">
	<div class="prose max-w-none prose-invert">
		<h1>web-app-starter docs</h1>
		<p>
			Cloudflare-first SvelteKit SaaS starter with auth, onboarding, teams, billing, projects, and
			deployment notes.
		</p>
		<h2>Included flows</h2>
		<ul>
			<li>Email/password auth with verification and password reset hooks</li>
			<li>First-run onboarding and workspace setup</li>
			<li>Team workspace members, invites, and role helpers</li>
			<li>Project/task CRUD with plan limits</li>
			<li>Stripe Checkout, Customer Portal, webhook sync, and subscription state</li>
			<li>Cloudflare Pages adapter, Wrangler config, security headers, and env checklist</li>
		</ul>
		<h2>Environment variables</h2>
		<pre><code
				>ORIGIN
DATABASE_URL
DATABASE_AUTH_TOKEN
BETTER_AUTH_SECRET
EMAIL_PROVIDER
EMAIL_FROM
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_LOOKUP_KEY
STRIPE_TEAM_PRICE_LOOKUP_KEY</code
			></pre>
		<h2>Production database workflow</h2>
		<ol>
			<li>Use <code>pnpm db:generate</code> for schema changes.</li>
			<li>Review generated SQL before applying it to Turso production.</li>
			<li>
				Use <code>pnpm db:migrate</code> for production. Keep <code>pnpm db:push:local</code> for disposable
				local DBs.
			</li>
		</ol>
	</div>

	<section class="mt-12 space-y-4">
		<h2 class="text-2xl font-black text-white">Deployment options</h2>
		{#each data.deploymentProviders as provider (provider.id)}
			<article class="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
				<h3 class="text-xl font-bold text-white">{provider.name}</h3>
				<p class="mt-2 text-slate-300">{provider.bestFor}</p>
				<p class="mt-3 text-sm text-slate-400">Adapter: <code>{provider.adapter}</code></p>
				<div class="mt-4 grid gap-4 md:grid-cols-2">
					<div>
						<p class="font-semibold text-white">Commands</p>
						<ul class="mt-2 space-y-1 text-sm text-slate-300">
							{#each provider.commands as command (command)}<li><code>{command}</code></li>{/each}
						</ul>
					</div>
					<div>
						<p class="font-semibold text-white">Required env</p>
						<ul class="mt-2 space-y-1 text-sm text-slate-300">
							{#each provider.env as envName (envName)}<li><code>{envName}</code></li>{/each}
						</ul>
					</div>
				</div>
			</article>
		{/each}
	</section>
</main>
