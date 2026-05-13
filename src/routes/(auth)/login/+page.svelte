<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Login — web-app-starter</title>
</svelte:head>

<main class="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
	<section class="flex flex-col justify-center">
		<p class="mb-4 text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">Auth included</p>
		<h1 class="text-4xl font-black tracking-tight text-white sm:text-6xl">
			Sign in and start building.
		</h1>
		<p class="mt-5 text-lg leading-8 text-slate-300">
			Email/password 認証を用意済み。あとで OAuth, magic link, team auth も足しやすい構成。
		</p>
	</section>

	<section
		class="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-950/30"
	>
		<form class="space-y-5" method="post" action="?/signInEmail" use:enhance>
			{#if form?.message}
				<p
					class="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100"
				>
					{form.message}
				</p>
			{/if}

			<label class="block text-sm font-medium text-slate-200">
				Email
				<input
					class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white placeholder:text-slate-500 focus:border-cyan-300 focus:ring-cyan-300"
					type="email"
					name="email"
					autocomplete="email"
					required
				/>
			</label>

			<label class="block text-sm font-medium text-slate-200">
				Password
				<input
					class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white placeholder:text-slate-500 focus:border-cyan-300 focus:ring-cyan-300"
					type="password"
					name="password"
					autocomplete="current-password"
					required
					minlength="8"
				/>
			</label>

			<label class="block text-sm font-medium text-slate-200">
				Name <span class="text-slate-500">for signup</span>
				<input
					class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white placeholder:text-slate-500 focus:border-cyan-300 focus:ring-cyan-300"
					name="name"
					autocomplete="name"
				/>
			</label>

			<div class="grid gap-3 sm:grid-cols-2">
				<button
					class="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
					>Login</button
				>
				<button
					formaction="?/signUpEmail"
					class="rounded-2xl border border-white/15 px-4 py-3 font-semibold text-white hover:bg-white/10"
					>Create account</button
				>
			</div>
		</form>
	</section>
</main>
