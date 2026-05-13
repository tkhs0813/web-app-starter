<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Billing — web-app-starter</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<p class="text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">Billing</p>
		<h1 class="mt-3 text-4xl font-black text-white">Billing starter</h1>
		<p class="mt-4 max-w-2xl text-slate-300">
			The app ships with a typed billing catalog and Stripe lookup keys so a real checkout flow can
			be added without redesigning pricing.
		</p>
	</div>

	<div class="rounded-3xl border border-cyan-300/30 bg-cyan-300/10 p-5 text-cyan-100">
		Current plan: <strong>{data.currentPlan.name}</strong>. Checkout and portal endpoints are
		intentionally left as integration points for Stripe or Lemon Squeezy credentials.
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		{#each data.plans as plan (plan.id)}
			<article class="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
				<p class="text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">{plan.name}</p>
				<h2 class="mt-4 text-4xl font-black text-white">
					{plan.price}<span class="text-base text-slate-400">/mo</span>
				</h2>
				<p class="mt-3 min-h-16 text-sm text-slate-300">{plan.description}</p>
				<ul class="mt-5 space-y-2 text-sm text-slate-200">
					{#each plan.features as feature (feature)}
						<li>✓ {feature}</li>
					{/each}
				</ul>
				<p class="mt-5 rounded-2xl bg-slate-900 p-3 text-xs text-slate-400">
					Stripe lookup key: <code>{plan.stripeLookupKey}</code>
				</p>
			</article>
		{/each}
	</div>
</div>
