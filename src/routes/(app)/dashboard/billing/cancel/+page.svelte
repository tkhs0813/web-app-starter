<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Billing canceled — web-app-starter</title>
</svelte:head>

<div
	class="mx-auto max-w-2xl space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-slate-200"
>
	<p class="text-sm font-semibold tracking-[0.3em] text-slate-400 uppercase">Billing</p>
	<h1 class="text-3xl font-black text-white">Checkout canceled</h1>
	<p>No changes were made to your subscription.</p>
	<a
		class="inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
		href={resolve('/dashboard/billing')}
	>
		Back to billing
	</a>
</div>
