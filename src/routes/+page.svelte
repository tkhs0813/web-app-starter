<script lang="ts">
	import { resolve } from '$app/paths';
	const features = [
		'Turso/libSQL + Drizzle schema',
		'Better Auth email/password',
		'Protected dashboard, settings, billing placeholders',
		'Vitest, Playwright, Storybook, ESLint, Prettier',
		'Tailwind CSS v4 with forms and typography plugins',
		'GitHub Actions ready quality gates'
	];

	const commands = ['pnpm dev', 'pnpm check', 'pnpm lint', 'pnpm test:unit', 'pnpm build'];
</script>

<svelte:head>
	<title>web-app-starter — SvelteKit SaaS template</title>
	<meta
		name="description"
		content="A SvelteKit, Turso, Drizzle, Better Auth starter for OSS-friendly web apps."
	/>
</svelte:head>

<main>
	<section class="relative isolate overflow-hidden">
		<div class="absolute inset-x-0 top-0 -z-10 h-96 bg-cyan-500/20 blur-3xl"></div>
		<div class="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
			<div class="flex flex-col justify-center">
				<p
					class="mb-4 w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-200"
				>
					Ryo's strongest SvelteKit starter
				</p>
				<h1 class="text-5xl font-black tracking-tight text-white sm:text-7xl">
					Ship OSS-ready web apps without rebuilding the boring parts.
				</h1>
				<p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
					SvelteKit を中心に、Turso, Drizzle, Better Auth, Tailwind, Vitest, Playwright, Storybook
					を最初から統合したテンプレート。
				</p>
				<div class="mt-8 flex flex-wrap gap-3">
					<a
						class="rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
						href={resolve('/login')}>Create account</a
					>
					<a
						class="rounded-full border border-white/15 px-5 py-3 font-semibold text-white hover:bg-white/10"
						href={resolve('/dashboard')}>View dashboard</a
					>
				</div>
			</div>

			<div
				class="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-950/40"
			>
				<div class="mb-4 flex items-center gap-2">
					<span class="size-3 rounded-full bg-red-400"></span>
					<span class="size-3 rounded-full bg-yellow-400"></span>
					<span class="size-3 rounded-full bg-green-400"></span>
				</div>
				<div class="space-y-3 font-mono text-sm">
					{#each commands as command (command)}
						<div class="rounded-2xl bg-slate-900 px-4 py-3 text-cyan-100">
							<span class="text-slate-500">$</span>
							{command}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-7xl px-6 pb-24">
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each features as feature (feature)}
				<article class="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
					<div
						class="mb-4 grid size-10 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-200"
					>
						✓
					</div>
					<h2 class="font-semibold text-white">{feature}</h2>
				</article>
			{/each}
		</div>
	</section>
</main>
