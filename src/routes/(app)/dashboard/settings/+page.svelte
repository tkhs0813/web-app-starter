<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Settings — web-app-starter</title>
</svelte:head>

<div class="max-w-2xl space-y-6">
	<div>
		<p class="text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">Settings</p>
		<h1 class="mt-3 text-4xl font-black text-white">Account settings</h1>
	</div>

	<form class="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
		<label class="block text-sm font-medium text-slate-200">
			Name
			<input
				class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
				value={data.user.name ?? ''}
			/>
		</label>
		<label class="block text-sm font-medium text-slate-200">
			Email
			<input
				class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
				type="email"
				value={data.user.email}
				disabled
			/>
		</label>
		<button type="button" class="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950"
			>Save placeholder</button
		>
	</form>
</div>
