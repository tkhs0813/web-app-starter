<script lang="ts">
	let { data } = $props();

	const statLabels = [
		{ key: 'projects', label: 'Projects' },
		{ key: 'activeProjects', label: 'Active projects' },
		{ key: 'openTasks', label: 'Open tasks' },
		{ key: 'completedTasks', label: 'Completed tasks' }
	] as const;
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
			Your starter now includes a real personal workspace, CRUD-ready projects, tasks, and
			SaaS-shaped defaults.
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-4">
		{#each statLabels as stat (stat.key)}
			<div class="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
				<p class="text-sm text-slate-400">{stat.label}</p>
				<p class="mt-2 text-3xl font-black text-white">{data.stats[stat.key]}</p>
			</div>
		{/each}
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<section class="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
			<h2 class="text-xl font-bold text-white">Recent projects</h2>
			<div class="mt-4 space-y-3">
				{#each data.recentProjects as project (project.id)}
					<article class="rounded-2xl bg-slate-900/80 p-4">
						<p class="font-semibold text-white">{project.name}</p>
						<p class="text-sm text-slate-400">{project.status}</p>
					</article>
				{:else}
					<p class="text-sm text-slate-400">Create your first project from the Projects page.</p>
				{/each}
			</div>
		</section>

		<section class="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
			<h2 class="text-xl font-bold text-white">Recent tasks</h2>
			<div class="mt-4 space-y-3">
				{#each data.recentTasks as task (task.id)}
					<article class="rounded-2xl bg-slate-900/80 p-4">
						<p
							class:text-slate-500={task.completed}
							class:line-through={task.completed}
							class="font-semibold text-white"
						>
							{task.title}
						</p>
						<p class="text-sm text-slate-400">{task.projectName}</p>
					</article>
				{:else}
					<p class="text-sm text-slate-400">Add tasks to a project to see them here.</p>
				{/each}
			</div>
		</section>
	</div>
</div>
