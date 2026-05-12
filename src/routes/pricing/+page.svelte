<svelte:head>
	<title>Pricing — web-app-starter</title>
</svelte:head>

<main class="mx-auto max-w-5xl px-6 py-20">
	<p class="text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">Pricing</p>
	<h1 class="mt-3 text-5xl font-black text-white">Simple pricing page included.</h1>
	<div class="mt-10 grid gap-4 md:grid-cols-3">
		{#each ['Free', 'Pro', 'Team'] as plan (plan)}
			<article class="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
				<h2 class="text-xl font-bold text-white">{plan}</h2>
				<p class="mt-2 text-slate-400">Replace this with your real offer.</p>
				<p class="mt-6 text-4xl font-black text-white">$0</p>
			</article>
		{/each}
	</div>
</main>
