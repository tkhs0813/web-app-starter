<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();

	const statuses = ['backlog', 'active', 'archived'] as const;
</script>

<svelte:head>
	<title>Projects — web-app-starter</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<p class="text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">Projects</p>
		<h1 class="mt-3 text-4xl font-black text-white">Project workspace</h1>
		<p class="mt-3 max-w-2xl text-slate-300">
			Create projects, edit their status, and track tasks against the personal workspace.
		</p>
	</div>

	{#if form?.message}
		<p class="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
			{form.message}
		</p>
	{/if}

	<form
		method="post"
		action="?/createProject"
		use:enhance
		class="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:grid-cols-[1fr_1fr_auto]"
	>
		<label class="block text-sm font-medium text-slate-200">
			Project name
			<input
				name="name"
				required
				class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
			/>
		</label>
		<label class="block text-sm font-medium text-slate-200">
			Description
			<input
				name="description"
				class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
			/>
		</label>
		<button
			type="submit"
			class="self-end rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
		>
			Create
		</button>
	</form>

	<div class="grid gap-4">
		{#each data.projects as project (project.id)}
			<article class="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
				<form
					method="post"
					action="?/updateProject"
					use:enhance
					class="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto]"
				>
					<input type="hidden" name="projectId" value={project.id} />
					<label class="text-sm font-medium text-slate-200">
						Name
						<input
							name="name"
							value={project.name}
							class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
						/>
					</label>
					<label class="text-sm font-medium text-slate-200">
						Description
						<input
							name="description"
							value={project.description ?? ''}
							class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
						/>
					</label>
					<label class="text-sm font-medium text-slate-200">
						Status
						<select
							name="status"
							class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
						>
							{#each statuses as status (status)}
								<option value={status} selected={project.status === status}>{status}</option>
							{/each}
						</select>
					</label>
					<button
						type="submit"
						class="self-end rounded-2xl border border-white/15 px-4 py-3 font-semibold text-white hover:bg-white/10"
					>
						Save
					</button>
				</form>

				<form
					method="post"
					action="?/createTask"
					use:enhance
					class="mt-5 flex flex-col gap-3 md:flex-row"
				>
					<input type="hidden" name="projectId" value={project.id} />
					<input
						name="title"
						required
						placeholder="New task"
						class="flex-1 rounded-2xl border-white/10 bg-slate-900 text-white"
					/>
					<input
						name="priority"
						type="number"
						min="1"
						max="5"
						value="1"
						class="w-28 rounded-2xl border-white/10 bg-slate-900 text-white"
					/>
					<button type="submit" class="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950"
						>Add task</button
					>
				</form>

				<div class="mt-5 space-y-2">
					{#each data.tasks.filter((task) => task.projectId === project.id) as task (task.id)}
						<div class="flex items-center justify-between rounded-2xl bg-slate-900/80 p-3">
							<form method="post" action="?/toggleTask" use:enhance class="flex items-center gap-3">
								<input type="hidden" name="taskId" value={task.id} />
								<input type="hidden" name="completed" value={(!task.completed).toString()} />
								<button
									type="submit"
									class="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200"
								>
									{task.completed ? 'Undo' : 'Done'}
								</button>
								<span
									class:line-through={task.completed}
									class:text-slate-500={task.completed}
									class="text-sm text-white"
								>
									{task.title}
								</span>
							</form>
							<form method="post" action="?/deleteTask" use:enhance>
								<input type="hidden" name="taskId" value={task.id} />
								<button type="submit" class="text-xs font-semibold text-red-200 hover:text-red-100"
									>Delete</button
								>
							</form>
						</div>
					{:else}
						<p class="text-sm text-slate-500">No tasks yet.</p>
					{/each}
				</div>

				<form method="post" action="?/deleteProject" use:enhance class="mt-5 text-right">
					<input type="hidden" name="projectId" value={project.id} />
					<button type="submit" class="text-sm font-semibold text-red-200 hover:text-red-100"
						>Delete project</button
					>
				</form>
			</article>
		{:else}
			<p class="rounded-3xl border border-dashed border-white/15 p-8 text-slate-400">
				No projects yet. Create one above.
			</p>
		{/each}
	</div>
</div>
