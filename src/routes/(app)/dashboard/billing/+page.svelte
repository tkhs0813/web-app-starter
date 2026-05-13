<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	function formatDate(value: string | Date | null | undefined) {
		if (!value) return '—';
		return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
	}
</script>

<svelte:head>
	<title>Billing — web-app-starter</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<p class="text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">Billing</p>
		<h1 class="mt-3 text-4xl font-black text-white">Stripe billing starter</h1>
		<p class="mt-4 max-w-2xl text-slate-300">
			Workspace billing is wired for Stripe Checkout, Customer Portal, webhook sync, and plan
			limits. Add Stripe env vars and matching Price lookup keys to activate paid upgrades.
		</p>
	</div>

	{#if form?.message}
		<p class="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
			{form.message}
		</p>
	{/if}

	<div class="grid gap-4 lg:grid-cols-[1fr_auto]">
		<div class="rounded-3xl border border-cyan-300/30 bg-cyan-300/10 p-5 text-cyan-100">
			<p>
				Current plan: <strong>{data.currentPlan.name}</strong>
				<span class="text-cyan-200/80">({data.billing.status})</span>
			</p>
			<p class="mt-2 text-sm text-cyan-100/80">
				Projects: {data.limits.projects === 'unlimited'
					? 'unlimited'
					: `${data.limits.projects} max`}
				· Team members: {data.limits.teamMembers === 'unlimited'
					? 'unlimited'
					: `${data.limits.teamMembers} max`}
			</p>
			{#if data.billing.subscription}
				<p class="mt-2 text-sm text-cyan-100/80">
					Current period ends: {formatDate(data.billing.subscription.currentPeriodEnd)}
					{#if data.billing.subscription.cancelAtPeriodEnd}
						· Cancels at period end
					{/if}
				</p>
			{/if}
			{#if !data.billing.isConfigured}
				<p class="mt-3 rounded-2xl bg-slate-950/40 p-3 text-sm text-cyan-50">
					Stripe is not configured yet. Set <code>STRIPE_SECRET_KEY</code> and
					<code>STRIPE_WEBHOOK_SECRET</code> to enable checkout and portal actions.
				</p>
			{/if}
		</div>

		<form
			method="post"
			action="?/portal"
			use:enhance
			class="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
		>
			<button
				type="submit"
				class="w-full rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={!data.billing.customerId || !data.billing.isConfigured}
			>
				Manage billing
			</button>
			<p class="mt-3 max-w-xs text-xs text-slate-400">
				Card updates, cancellation, and invoices are delegated to Stripe Customer Portal.
			</p>
		</form>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		{#each data.plans as plan (plan.id)}
			<article
				class="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6"
				class:border-cyan-300={data.currentPlan.id === plan.id}
			>
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
					Stripe lookup key: <code>{plan.stripeLookupKey ?? 'none'}</code>
				</p>

				{#if plan.stripeLookupKey}
					<form method="post" action="?/checkout" use:enhance class="mt-auto pt-5">
						<input type="hidden" name="planId" value={plan.id} />
						<button
							type="submit"
							class="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={data.currentPlan.id === plan.id || !data.billing.isConfigured}
						>
							{data.currentPlan.id === plan.id ? 'Current plan' : `Upgrade to ${plan.name}`}
						</button>
					</form>
				{:else}
					<p class="mt-auto pt-5 text-sm font-semibold text-slate-400">Included by default</p>
				{/if}
			</article>
		{/each}
	</div>
</div>
