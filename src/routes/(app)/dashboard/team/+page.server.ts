import { fail } from '@sveltejs/kit';
import { canInviteMembers, requireWorkspaceRole } from '$lib/server/app/permissions';
import { sendTransactionalEmail } from '$lib/server/app/email';
import {
	createTeamWorkspace,
	createWorkspaceInvite,
	listPendingInvites,
	listWorkspaceMembers,
	normalizeInviteRole,
	removeWorkspaceMember,
	updateWorkspaceSettings
} from '$lib/server/app/workspace';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { workspace, membership, user, workspaces } = await parent();
	const [members, invites] = await Promise.all([
		listWorkspaceMembers(workspace.id),
		listPendingInvites(workspace.id)
	]);
	return {
		workspace,
		membership,
		user,
		workspaces,
		members,
		invites,
		canInvite: canInviteMembers(membership?.role ?? 'member')
	};
};

export const actions: Actions = {
	updateWorkspace: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const form = await request.formData();
		const workspaceId = form.get('workspaceId')?.toString() ?? '';
		await requireWorkspaceRole(workspaceId, locals.user.id, ['owner', 'admin']);
		try {
			await updateWorkspaceSettings({ workspaceId, name: form.get('name')?.toString() ?? '' });
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Workspace update failed'
			});
		}
		return { success: true, message: 'Workspace updated' };
	},
	createWorkspace: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const form = await request.formData();
		try {
			await createTeamWorkspace({
				ownerId: locals.user.id,
				name: form.get('name')?.toString() ?? ''
			});
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Workspace creation failed'
			});
		}
		return { success: true, message: 'Workspace created' };
	},
	inviteMember: async ({ request, locals, url }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const form = await request.formData();
		const workspaceId = form.get('workspaceId')?.toString() ?? '';
		await requireWorkspaceRole(workspaceId, locals.user.id, ['owner', 'admin']);
		try {
			const email = form.get('email')?.toString() ?? '';
			const invite = await createWorkspaceInvite({
				workspaceId,
				email,
				role: normalizeInviteRole(form.get('role')),
				invitedByUserId: locals.user.id
			});
			const inviteUrl = `${url.origin}/invite/${invite.token}`;
			await sendTransactionalEmail({
				to: email,
				subject: 'You were invited to a workspace',
				text: `Accept your invite: ${inviteUrl}`
			});
		} catch (error) {
			return fail(400, { message: error instanceof Error ? error.message : 'Invite failed' });
		}
		return { success: true, message: 'Invite sent' };
	},
	removeMember: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const form = await request.formData();
		const workspaceId = form.get('workspaceId')?.toString() ?? '';
		await requireWorkspaceRole(workspaceId, locals.user.id, ['owner', 'admin']);
		try {
			await removeWorkspaceMember({
				workspaceId,
				memberUserId: form.get('userId')?.toString() ?? '',
				actorUserId: locals.user.id
			});
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Remove member failed'
			});
		}
		return { success: true, message: 'Member removed' };
	}
};
