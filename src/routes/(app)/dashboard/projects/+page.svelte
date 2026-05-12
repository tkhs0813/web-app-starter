<script lang="ts">
	const projects = [
		{ name: 'Template hardening', status: 'In progress' },
		{ name: 'First OSS app', status: 'Planning' },
		{ name: 'SaaS experiment', status: 'Backlog' }
	];
</script>

<svelte:head>
	<title>Projects — web-app-starter</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<p class="text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">Projects</p>
		<h1 class="mt-3 text-4xl font-black text-white">Project workspace</h1>
	</div>

	<div class="grid gap-4">
		{#each projects as project (project.name)}
			<article
				class="flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-6"
			>
				<div>
					<h2 class="font-semibold text-white">{project.name}</h2>
					<p class="text-sm text-slate-400">{project.status}</p>
				</div>
				<button
					class="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
					>Open</button
				>
			</article>
		{/each}
	</div>
</div>
