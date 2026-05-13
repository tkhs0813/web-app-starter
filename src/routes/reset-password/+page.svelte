<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Reset password — web-app-starter</title></svelte:head>

<main class="mx-auto max-w-xl px-6 py-16">
	<h1 class="text-4xl font-black text-white">Reset password</h1>
	<p class="mt-3 text-slate-300">Choose a new password for your account.</p>
	{#if form?.message}<p
			class="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-100"
		>
			{form.message}
		</p>{/if}
	<form
		method="post"
		use:enhance
		class="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
	>
		<input type="hidden" name="token" value={data.token} />
		<label class="block text-sm font-medium text-slate-200"
			>New password
			<input
				class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
				type="password"
				name="password"
				minlength="8"
				required
			/>
		</label>
		<button class="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950"
			>Reset password</button
		>
	</form>
</main>
