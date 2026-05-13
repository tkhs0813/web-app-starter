<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Onboarding — web-app-starter</title></svelte:head>

<main class="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
	<section>
		<p class="text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">First run</p>
		<h1 class="mt-3 text-5xl font-black text-white">Set up your workspace.</h1>
		<p class="mt-5 text-lg leading-8 text-slate-300">
			This step turns a raw account into a usable product workspace with starter data and a clear
			next action.
		</p>
		<ul class="mt-8 space-y-3 text-sm text-slate-300">
			{#each ['Confirm your profile', 'Name the workspace', 'Optionally create the first project', 'Land in the dashboard'] as item (item)}
				<li class="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">✓ {item}</li>
			{/each}
		</ul>
	</section>

	<form
		method="post"
		action="?/complete"
		use:enhance
		class="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
	>
		{#if form?.message}<p
				class="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-100"
			>
				{form.message}
			</p>{/if}
		<label class="block text-sm font-medium text-slate-200"
			>Display name
			<input
				class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
				value={data.user.name ?? ''}
				disabled
			/>
		</label>
		<label class="block text-sm font-medium text-slate-200"
			>Workspace name
			<input
				class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
				name="workspaceName"
				value={data.workspace.name}
				required
			/>
		</label>
		<label class="block text-sm font-medium text-slate-200"
			>First project <span class="text-slate-500">optional</span>
			<input
				class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
				name="projectName"
				placeholder="Launch checklist"
			/>
		</label>
		<button class="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
			>Finish setup</button
		>
	</form>
</main>
