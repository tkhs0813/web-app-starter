<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Billing success — web-app-starter</title>
</svelte:head>

<div
	class="mx-auto max-w-2xl space-y-4 rounded-3xl border border-cyan-300/30 bg-cyan-300/10 p-8 text-cyan-50"
>
	<p class="text-sm font-semibold tracking-[0.3em] text-cyan-200 uppercase">Billing</p>
	<h1 class="text-3xl font-black text-white">Payment received</h1>
	<p>
		Stripe accepted the checkout session. Your subscription will update after the webhook syncs.
	</p>
	<a
		class="inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
		href={resolve('/dashboard/billing')}
	>
		Back to billing
	</a>
</div>
