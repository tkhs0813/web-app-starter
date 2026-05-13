import { and, eq } from 'drizzle-orm';
import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { workspaceMember, type workspace } from '$lib/server/db/schema';

export type WorkspaceRole = 'owner' | 'admin' | 'member';
export type Workspace = typeof workspace.$inferSelect;

export const roleRank: Record<WorkspaceRole, number> = { owner: 3, admin: 2, member: 1 };

export function canManageBilling(role: WorkspaceRole) {
	return role === 'owner';
}

export function canInviteMembers(role: WorkspaceRole) {
	return role === 'owner' || role === 'admin';
}

export function canManageWorkspace(role: WorkspaceRole) {
	return role === 'owner' || role === 'admin';
}

export function hasWorkspaceRole(role: WorkspaceRole, allowed: WorkspaceRole[]) {
	return allowed.includes(role);
}

export function requireUser(event: Pick<RequestEvent, 'locals' | 'url'>) {
	if (!event.locals.user) {
		const redirectTo = event.url.pathname + event.url.search;
		redirect(302, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}
	return event.locals.user;
}

export async function getWorkspaceMembership(workspaceId: string, userId: string) {
	const [membership] = await db
		.select()
		.from(workspaceMember)
		.where(and(eq(workspaceMember.workspaceId, workspaceId), eq(workspaceMember.userId, userId)))
		.limit(1);
	return membership ?? null;
}

export async function requireWorkspaceMember(workspaceId: string, userId: string) {
	const membership = await getWorkspaceMembership(workspaceId, userId);
	if (!membership) error(403, 'You are not a member of this workspace');
	return membership;
}

export async function requireWorkspaceRole(
	workspaceId: string,
	userId: string,
	allowed: WorkspaceRole[]
) {
	const membership = await requireWorkspaceMember(workspaceId, userId);
	if (!hasWorkspaceRole(membership.role as WorkspaceRole, allowed))
		error(403, 'Insufficient permissions');
	return membership;
}
