import { fail } from '@sveltejs/kit';
import {
	canCreateWorkspace,
	canInviteTeamMember,
	teamMemberLimitMessage,
	workspaceLimitMessage
} from '$lib/server/app/billing';
import { getWorkspaceBilling } from '$lib/server/app/billing.server';
import { canInviteMembers, requireWorkspaceRole } from '$lib/server/app/permissions';
import { sendTransactionalEmail } from '$lib/server/app/email';
import {
	createTeamWorkspace,
	createWorkspaceInvite,
	getPendingInvite,
	listUserWorkspaces,
	listPendingInvites,
	listWorkspaceMembers,
	normalizeMemberRole,
	normalizeInviteRole,
	removeWorkspaceMember,
	revokeWorkspaceInvite,
	updateWorkspaceMemberRole,
	updateWorkspaceSettings
} from '$lib/server/app/workspace';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { workspace, membership, user, workspaces } = await parent();
	const [members, invites, billing] = await Promise.all([
		listWorkspaceMembers(workspace.id),
		listPendingInvites(workspace.id),
		getWorkspaceBilling(workspace.id)
	]);
	return {
		workspace,
		membership,
		user,
		workspaces,
		members,
		invites,
		billing,
		canInvite: canInviteMembers(membership?.role ?? 'member'),
		canAddMember: canInviteTeamMember({
			plan: billing.effectivePlanId,
			memberCount: members.length
		}),
		teamLimitMessage: teamMemberLimitMessage(billing.effectivePlanId)
	};
};

function workspaceIdFromForm(form: FormData) {
	return form.get('workspaceId')?.toString() ?? '';
}

async function sendInviteEmail(input: { email: string; token: string; origin: string }) {
	const inviteUrl = `${input.origin}/invite/${input.token}`;
	await sendTransactionalEmail({
		to: input.email,
		subject: 'You were invited to a workspace',
		text: `Accept your invite: ${inviteUrl}`
	});
}

export const actions: Actions = {
	updateWorkspace: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const form = await request.formData();
		const workspaceId = workspaceIdFromForm(form);
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
			const workspaces = await listUserWorkspaces(locals.user.id);
			const billing = await getWorkspaceBilling(
				workspaces[0]?.workspace.id ?? workspaceIdFromForm(form)
			);
			if (
				!canCreateWorkspace({ plan: billing.effectivePlanId, workspaceCount: workspaces.length })
			) {
				return fail(403, {
					message: workspaceLimitMessage(billing.effectivePlanId) ?? 'Plan limit reached'
				});
			}
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
		const workspaceId = workspaceIdFromForm(form);
		await requireWorkspaceRole(workspaceId, locals.user.id, ['owner', 'admin']);
		try {
			const members = await listWorkspaceMembers(workspaceId);
			const billing = await getWorkspaceBilling(workspaceId);
			if (!canInviteTeamMember({ plan: billing.effectivePlanId, memberCount: members.length })) {
				return fail(403, {
					message: teamMemberLimitMessage(billing.effectivePlanId) ?? 'Plan limit reached'
				});
			}
			const email = form.get('email')?.toString() ?? '';
			const invite = await createWorkspaceInvite({
				workspaceId,
				email,
				role: normalizeInviteRole(form.get('role')),
				invitedByUserId: locals.user.id
			});
			await sendInviteEmail({ email, token: invite.token, origin: url.origin });
		} catch (error) {
			return fail(400, { message: error instanceof Error ? error.message : 'Invite failed' });
		}
		return { success: true, message: 'Invite sent' };
	},
	removeMember: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const form = await request.formData();
		const workspaceId = workspaceIdFromForm(form);
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
	},
	updateMemberRole: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const form = await request.formData();
		const workspaceId = workspaceIdFromForm(form);
		await requireWorkspaceRole(workspaceId, locals.user.id, ['owner', 'admin']);
		try {
			await updateWorkspaceMemberRole({
				workspaceId,
				memberUserId: form.get('userId')?.toString() ?? '',
				actorUserId: locals.user.id,
				nextRole: normalizeMemberRole(form.get('role'))
			});
		} catch (error) {
			return fail(400, { message: error instanceof Error ? error.message : 'Role update failed' });
		}
		return { success: true, message: 'Member role updated' };
	},
	revokeInvite: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const form = await request.formData();
		const workspaceId = workspaceIdFromForm(form);
		await requireWorkspaceRole(workspaceId, locals.user.id, ['owner', 'admin']);
		await revokeWorkspaceInvite({ workspaceId, inviteId: form.get('inviteId')?.toString() ?? '' });
		return { success: true, message: 'Invite revoked' };
	},
	resendInvite: async ({ request, locals, url }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const form = await request.formData();
		const workspaceId = workspaceIdFromForm(form);
		await requireWorkspaceRole(workspaceId, locals.user.id, ['owner', 'admin']);
		try {
			const existing = await getPendingInvite(workspaceId, form.get('inviteId')?.toString() ?? '');
			if (!existing) throw new Error('Invite not found');
			const invite = await createWorkspaceInvite({
				workspaceId,
				email: existing.email,
				role: existing.role,
				invitedByUserId: locals.user.id
			});
			await sendInviteEmail({ email: existing.email, token: invite.token, origin: url.origin });
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Invite resend failed'
			});
		}
		return { success: true, message: 'Invite resent' };
	}
};
