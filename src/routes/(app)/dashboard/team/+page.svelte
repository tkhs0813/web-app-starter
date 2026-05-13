<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Team — web-app-starter</title></svelte:head>

<div class="space-y-6">
	<div>
		<p class="text-sm font-semibold tracking-[0.3em] text-cyan-300 uppercase">Workspace</p>
		<h1 class="mt-3 text-4xl font-black text-white">Team and permissions</h1>
	</div>

	{#if form?.message}<p
			class="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-cyan-100"
		>
			{form.message}
		</p>{/if}

	<section class="grid gap-6 lg:grid-cols-2">
		<form
			method="post"
			action="?/updateWorkspace"
			use:enhance
			class="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
		>
			<input type="hidden" name="workspaceId" value={data.workspace.id} />
			<h2 class="text-xl font-bold text-white">Workspace settings</h2>
			<label class="block text-sm text-slate-200"
				>Name
				<input
					class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
					name="name"
					value={data.workspace.name}
				/>
			</label>
			<button class="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950"
				>Save workspace</button
			>
		</form>

		<form
			method="post"
			action="?/createWorkspace"
			use:enhance
			class="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
		>
			<h2 class="text-xl font-bold text-white">Create another workspace</h2>
			<label class="block text-sm text-slate-200"
				>Workspace name
				<input
					class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
					name="name"
					placeholder="Acme Team"
				/>
			</label>
			<button
				class="rounded-2xl border border-white/15 px-4 py-3 font-semibold text-white hover:bg-white/10"
				>Create workspace</button
			>
		</form>
	</section>

	<section class="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
		<div class="flex items-center justify-between gap-4">
			<h2 class="text-xl font-bold text-white">Members</h2>
			<p class="text-sm text-slate-400">{data.members.length} member(s)</p>
		</div>
		<div class="mt-4 divide-y divide-white/10">
			{#each data.members as member (member.userId)}
				<div class="flex items-center justify-between gap-4 py-4">
					<div>
						<p class="font-semibold text-white">{member.name}</p>
						<p class="text-sm text-slate-400">{member.email}</p>
					</div>
					<div class="flex items-center gap-3">
						<span class="rounded-full bg-slate-900 px-3 py-1 text-xs text-cyan-200"
							>{member.role}</span
						>
						{#if data.canInvite && member.role !== 'owner'}
							<form method="post" action="?/removeMember" use:enhance>
								<input type="hidden" name="workspaceId" value={data.workspace.id} /><input
									type="hidden"
									name="userId"
									value={member.userId}
								/>
								<button class="text-sm font-semibold text-red-200 hover:text-red-100">Remove</button
								>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>

	{#if data.canInvite}
		<form
			method="post"
			action="?/inviteMember"
			use:enhance
			class="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:grid-cols-[1fr_180px_auto]"
		>
			<input type="hidden" name="workspaceId" value={data.workspace.id} />
			<label class="block text-sm text-slate-200"
				>Invite email
				<input
					class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white"
					type="email"
					name="email"
					required
				/>
			</label>
			<label class="block text-sm text-slate-200"
				>Role
				<select class="mt-2 w-full rounded-2xl border-white/10 bg-slate-900 text-white" name="role"
					><option value="member">Member</option><option value="admin">Admin</option></select
				>
			</label>
			<button class="self-end rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950"
				>Invite</button
			>
		</form>
	{/if}

	<section class="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
		<h2 class="text-xl font-bold text-white">Pending invites</h2>
		<div class="mt-4 space-y-3">
			{#each data.invites as invite (invite.id)}
				<p class="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-300">
					{invite.email} · {invite.role} · expires {invite.expiresAt.toLocaleDateString()}
				</p>
			{:else}
				<p class="text-sm text-slate-400">No pending invites.</p>
			{/each}
		</div>
	</section>
</div>
