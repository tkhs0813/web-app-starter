<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
</script>

<svelte:head><title>Settings — web-app-starter</title></svelte:head>

<div class="max-w-3xl space-y-6">
	<div>
		<p class="text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">Settings</p>
		<h1 class="mt-3 text-4xl font-black text-white">Account settings</h1>
	</div>

	{#if form?.message}<p
			class="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-sm text-cyan-100"
		>
			{form.message}
		</p>{/if}

	<form
		method="post"
		action="?/updateProfile"
		use:enhance
		class="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
	>
		<h2 class="text-xl font-bold text-white">Profile</h2>
		<label class="block text-sm font-medium text-slate-200"
			>Name
			<input
				name="name"
				class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
				value={data.user.name ?? ''}
			/>
		</label>
		<label class="block text-sm font-medium text-slate-200"
			>Email
			<input
				class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
				type="email"
				value={data.user.email}
				disabled
			/>
		</label>
		<button type="submit" class="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950"
			>Save profile</button
		>
	</form>

	<form
		method="post"
		action="?/changePassword"
		use:enhance
		class="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
	>
		<h2 class="text-xl font-bold text-white">Password</h2>
		<label class="block text-sm font-medium text-slate-200"
			>Current password
			<input
				name="currentPassword"
				type="password"
				class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
				autocomplete="current-password"
				required
			/>
		</label>
		<label class="block text-sm font-medium text-slate-200"
			>New password
			<input
				name="newPassword"
				type="password"
				class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
				autocomplete="new-password"
				minlength="8"
				required
			/>
		</label>
		<label class="flex items-center gap-3 text-sm text-slate-300"
			><input
				name="revokeOtherSessions"
				type="checkbox"
				class="rounded border-white/10 bg-slate-900"
			/> Log out other sessions</label
		>
		<button
			class="rounded-2xl border border-white/15 px-4 py-3 font-semibold text-white hover:bg-white/10"
			>Change password</button
		>
	</form>

	<section class="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
		<h2 class="text-xl font-bold text-white">Sessions</h2>
		<p class="text-sm text-slate-400">
			Revoke all other sessions if a device was lost or your token leaked.
		</p>
		<form method="post" action="?/revokeSessions" use:enhance>
			<button
				class="rounded-2xl border border-white/15 px-4 py-3 font-semibold text-white hover:bg-white/10"
				>Revoke other sessions</button
			>
		</form>
	</section>

	<form
		method="post"
		action="?/deleteAccount"
		use:enhance
		class="space-y-4 rounded-3xl border border-red-400/30 bg-red-400/10 p-6"
	>
		<h2 class="text-xl font-bold text-red-100">Danger zone</h2>
		<p class="text-sm text-red-100/80">
			Delete the account and all Better Auth sessions. Product data linked by user id may need
			project-specific cleanup hooks.
		</p>
		<label class="block text-sm font-medium text-red-100"
			>Confirm password
			<input
				name="password"
				type="password"
				class="mt-2 w-full rounded-2xl border-red-400/30 bg-slate-950 text-white"
				required
			/>
		</label>
		<button class="rounded-2xl bg-red-400 px-4 py-3 font-semibold text-slate-950"
			>Delete account</button
		>
	</form>
</div>
