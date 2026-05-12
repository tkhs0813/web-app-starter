<script lang="ts">
	let { data } = $props();

	const stats = [
		{ label: 'Active projects', value: '3' },
		{ label: 'Team seats', value: '1' },
		{ label: 'Monthly spend', value: '$0' }
	];
</script>

<svelte:head>
	<title>Dashboard — web-app-starter</title>
</svelte:head>

<div class="space-y-6">
	<div class="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
		<p class="text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">Dashboard</p>
		<h1 class="mt-3 text-4xl font-black tracking-tight text-white">
			Welcome back, {data.user.name ?? data.user.email}
		</h1>
		<p class="mt-4 max-w-2xl text-slate-300">
			ここを各プロダクトのホームにする。まずは projects / settings / billing の標準導線を用意済み。
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		{#each stats as stat (stat.label)}
			<article class="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
				<p class="text-sm text-slate-400">{stat.label}</p>
				<p class="mt-2 text-3xl font-black text-white">{stat.value}</p>
			</article>
		{/each}
	</div>
</div>
