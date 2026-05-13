<script lang="ts">
	import { resolve } from '$app/paths';
	let { children, data } = $props();

	const nav = [
		{ href: '/dashboard', label: 'Overview' },
		{ href: '/dashboard/projects', label: 'Projects' },
		{ href: '/dashboard/team', label: 'Team' },
		{ href: '/dashboard/settings', label: 'Settings' },
		{ href: '/dashboard/billing', label: 'Billing' }
	] as const;
</script>

<div class="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[260px_1fr]">
	<aside class="rounded-3xl border border-white/10 bg-white/[0.04] p-4 lg:sticky lg:top-6 lg:h-fit">
		<div class="mb-6 rounded-2xl bg-slate-900 p-4">
			<p class="text-sm text-slate-400">Workspace</p>
			<p class="truncate font-semibold text-white">{data.workspace.name}</p>
			<p class="mt-2 text-xs text-slate-500">Role</p>
			<p class="truncate text-sm text-cyan-200">{data.membership?.role ?? 'member'}</p>
			<p class="mt-3 text-xs text-slate-500">Signed in as</p>
			<p class="truncate text-sm text-slate-300">{data.user.email}</p>
		</div>
		<nav class="space-y-2">
			{#each nav as item (item.href)}
				<a
					class="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
					href={resolve(item.href)}>{item.label}</a
				>
			{/each}
		</nav>
		<form method="post" action={resolve('/logout')} class="mt-6">
			<button
				type="submit"
				class="w-full rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-semibold text-red-100 hover:bg-red-400/10"
				>Log out</button
			>
		</form>
	</aside>

	<section>{@render children()}</section>
</div>
