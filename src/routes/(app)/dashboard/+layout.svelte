<script lang="ts">
	import { resolve } from '$app/paths';
	let { children, data } = $props();

	const nav = [
		{ href: '/dashboard', label: 'Overview' },
		{ href: '/dashboard/projects', label: 'Projects' },
		{ href: '/dashboard/settings', label: 'Settings' },
		{ href: '/dashboard/billing', label: 'Billing' }
	] as const;
</script>

<div class="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[260px_1fr]">
	<aside class="rounded-3xl border border-white/10 bg-white/[0.04] p-4 lg:sticky lg:top-6 lg:h-fit">
		<div class="mb-6 rounded-2xl bg-slate-900 p-4">
			<p class="text-sm text-slate-400">Signed in as</p>
			<p class="truncate font-semibold text-white">{data.user.email}</p>
		</div>
		<nav class="space-y-2">
			{#each nav as item (item.href)}
				<a
					class="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
					href={resolve(item.href)}>{item.label}</a
				>
			{/each}
		</nav>
	</aside>

	<section>
		{@render children()}
	</section>
</div>
