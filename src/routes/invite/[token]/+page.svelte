<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Accept invite — web-app-starter</title></svelte:head>

<main class="mx-auto max-w-xl px-6 py-16">
	<h1 class="text-4xl font-black text-white">Accept workspace invite</h1>
	<p class="mt-3 text-slate-300">
		Signed in as {data.user.email}. Accepting will add this account to the invited workspace.
	</p>
	{#if form?.message}<p
			class="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-100"
		>
			{form.message}
		</p>{/if}
	<form method="post" action="?/accept" use:enhance class="mt-8">
		<button class="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
			>Accept invite</button
		>
	</form>
</main>
