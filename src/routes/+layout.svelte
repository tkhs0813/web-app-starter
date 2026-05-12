<script lang="ts">
	import { resolve } from '$app/paths';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#020617" />
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100 antialiased">
	<header class="border-b border-white/10 bg-slate-950/80 backdrop-blur">
		<nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
			<a href={resolve('/')} class="flex items-center gap-2 font-semibold tracking-tight">
				<span
					class="grid size-8 place-items-center rounded-xl bg-cyan-400 text-sm font-black text-slate-950"
					>W</span
				>
				<span>web-app-starter</span>
			</a>
			<div class="flex items-center gap-3 text-sm text-slate-300">
				<a class="hidden hover:text-white sm:inline" href={resolve('/pricing')}>Pricing</a>
				<a class="hidden hover:text-white sm:inline" href={resolve('/docs')}>Docs</a>
				{#if data.user}
					<a
						class="rounded-full bg-white px-4 py-2 font-medium text-slate-950 hover:bg-cyan-200"
						href={resolve('/dashboard')}>Dashboard</a
					>
				{:else}
					<a class="hover:text-white" href={resolve('/login')}>Login</a>
					<a
						class="rounded-full bg-cyan-400 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-300"
						href={resolve('/login')}>Start</a
					>
				{/if}
			</div>
		</nav>
	</header>

	{@render children()}
</div>
