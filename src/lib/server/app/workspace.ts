import { and, desc, eq, gt, isNull, ne } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	project,
	task,
	user,
	workspace,
	workspaceInvite,
	workspaceMember
} from '$lib/server/db/schema';
export type ProjectStatus = 'backlog' | 'active' | 'archived';
export type InviteRole = 'admin' | 'member';

const projectStatuses = ['backlog', 'active', 'archived'] as const;
const inviteRoles = ['admin', 'member'] as const;

export function makeWorkspaceSlug(
	name: string | null | undefined,
	email = 'workspace@example.com'
) {
	const emailLocalPart = email.split('@')[0]?.split('+')[0] ?? 'workspace';
	const source = name?.trim() || emailLocalPart || 'workspace';
	const slug = source
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 48);

	return slug || 'workspace';
}

export function normalizeProjectStatus(
	value: FormDataEntryValue | string | null | undefined
): ProjectStatus {
	return projectStatuses.includes(value as ProjectStatus) ? (value as ProjectStatus) : 'backlog';
}

export function normalizeInviteRole(
	value: FormDataEntryValue | string | null | undefined
): InviteRole {
	return inviteRoles.includes(value as InviteRole) ? (value as InviteRole) : 'member';
}

async function uniqueWorkspaceSlug(base: string) {
	const slug = makeWorkspaceSlug(base);
	for (let attempt = 0; attempt < 8; attempt += 1) {
		const candidate = attempt === 0 ? slug : `${slug}-${attempt + 1}`;
		const [existing] = await db
			.select({ id: workspace.id })
			.from(workspace)
			.where(eq(workspace.slug, candidate))
			.limit(1);
		if (!existing) return candidate;
	}
	return `${slug}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function ensurePersonalWorkspace(currentUser: {
	id: string;
	name?: string | null;
	email: string;
}) {
	const [existingMembership] = await db
		.select({ workspace })
		.from(workspaceMember)
		.innerJoin(workspace, eq(workspaceMember.workspaceId, workspace.id))
		.where(eq(workspaceMember.userId, currentUser.id))
		.limit(1);

	if (existingMembership) return existingMembership.workspace;

	const baseSlug = makeWorkspaceSlug(currentUser.name, currentUser.email);
	const id = crypto.randomUUID();
	const [createdWorkspace] = await db
		.insert(workspace)
		.values({
			id,
			name: currentUser.name ? `${currentUser.name}'s workspace` : 'Personal workspace',
			slug: `${baseSlug}-${currentUser.id.slice(0, 8)}`,
			ownerId: currentUser.id
		})
		.returning();

	await db.insert(workspaceMember).values({
		workspaceId: createdWorkspace.id,
		userId: currentUser.id,
		role: 'owner'
	});

	return createdWorkspace;
}

export async function listUserWorkspaces(userId: string) {
	return db
		.select({ workspace, membership: workspaceMember })
		.from(workspaceMember)
		.innerJoin(workspace, eq(workspaceMember.workspaceId, workspace.id))
		.where(eq(workspaceMember.userId, userId))
		.orderBy(desc(workspaceMember.createdAt));
}

export async function createTeamWorkspace(input: { ownerId: string; name: string }) {
	const name = input.name.trim();
	if (!name) throw new Error('Workspace name is required');
	const [createdWorkspace] = await db
		.insert(workspace)
		.values({ name, slug: await uniqueWorkspaceSlug(name), ownerId: input.ownerId })
		.returning();

	await db
		.insert(workspaceMember)
		.values({ workspaceId: createdWorkspace.id, userId: input.ownerId, role: 'owner' });
	return createdWorkspace;
}

export async function updateWorkspaceSettings(input: { workspaceId: string; name: string }) {
	const name = input.name.trim();
	if (!name) throw new Error('Workspace name is required');
	const [updated] = await db
		.update(workspace)
		.set({ name, slug: await uniqueWorkspaceSlug(name), updatedAt: new Date() })
		.where(eq(workspace.id, input.workspaceId))
		.returning();
	return updated;
}

export async function completeOnboarding(input: {
	workspaceId: string;
	workspaceName: string;
	projectName?: string;
}) {
	await updateWorkspaceSettings({ workspaceId: input.workspaceId, name: input.workspaceName });
	if (input.projectName?.trim()) {
		await createProject({
			workspaceId: input.workspaceId,
			name: input.projectName,
			status: 'active'
		});
	}
	const [updated] = await db
		.update(workspace)
		.set({ onboardingCompletedAt: new Date(), updatedAt: new Date() })
		.where(eq(workspace.id, input.workspaceId))
		.returning();
	return updated;
}

export async function listWorkspaceMembers(workspaceId: string) {
	return db
		.select({
			id: workspaceMember.id,
			role: workspaceMember.role,
			createdAt: workspaceMember.createdAt,
			userId: user.id,
			name: user.name,
			email: user.email
		})
		.from(workspaceMember)
		.innerJoin(user, eq(workspaceMember.userId, user.id))
		.where(eq(workspaceMember.workspaceId, workspaceId))
		.orderBy(desc(workspaceMember.createdAt));
}

async function sha256(input: string) {
	const bytes = new TextEncoder().encode(input);
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function createWorkspaceInvite(input: {
	workspaceId: string;
	email: string;
	role: InviteRole;
	invitedByUserId: string;
}) {
	const email = input.email.trim().toLowerCase();
	if (!email || !email.includes('@')) throw new Error('A valid email is required');
	const token = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
	const tokenHash = await sha256(token);
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
	await db
		.insert(workspaceInvite)
		.values({
			workspaceId: input.workspaceId,
			email,
			role: input.role,
			tokenHash,
			invitedByUserId: input.invitedByUserId,
			expiresAt
		})
		.onConflictDoUpdate({
			target: [workspaceInvite.workspaceId, workspaceInvite.email],
			set: {
				role: input.role,
				tokenHash,
				invitedByUserId: input.invitedByUserId,
				expiresAt,
				acceptedAt: null,
				updatedAt: new Date()
			}
		});
	return { token, expiresAt };
}

export async function listPendingInvites(workspaceId: string) {
	return db
		.select()
		.from(workspaceInvite)
		.where(
			and(
				eq(workspaceInvite.workspaceId, workspaceId),
				isNull(workspaceInvite.acceptedAt),
				gt(workspaceInvite.expiresAt, new Date())
			)
		)
		.orderBy(desc(workspaceInvite.createdAt));
}

export async function acceptWorkspaceInvite(input: {
	token: string;
	userId: string;
	email: string;
}) {
	const tokenHash = await sha256(input.token);
	const [invite] = await db
		.select()
		.from(workspaceInvite)
		.where(
			and(
				eq(workspaceInvite.tokenHash, tokenHash),
				isNull(workspaceInvite.acceptedAt),
				gt(workspaceInvite.expiresAt, new Date())
			)
		)
		.limit(1);
	if (!invite) throw new Error('Invite is invalid or expired');
	if (invite.email !== input.email.toLowerCase())
		throw new Error('This invite was sent to a different email');
	await db
		.insert(workspaceMember)
		.values({ workspaceId: invite.workspaceId, userId: input.userId, role: invite.role })
		.onConflictDoUpdate({
			target: [workspaceMember.workspaceId, workspaceMember.userId],
			set: { role: invite.role, updatedAt: new Date() }
		});
	await db
		.update(workspaceInvite)
		.set({ acceptedAt: new Date(), updatedAt: new Date() })
		.where(eq(workspaceInvite.id, invite.id));
	return invite.workspaceId;
}

export async function removeWorkspaceMember(input: {
	workspaceId: string;
	memberUserId: string;
	actorUserId: string;
}) {
	if (input.memberUserId === input.actorUserId) throw new Error('You cannot remove yourself');
	await db
		.delete(workspaceMember)
		.where(
			and(
				eq(workspaceMember.workspaceId, input.workspaceId),
				eq(workspaceMember.userId, input.memberUserId),
				ne(workspaceMember.role, 'owner')
			)
		);
}

export async function listWorkspaceProjects(workspaceId: string) {
	return db
		.select()
		.from(project)
		.where(eq(project.workspaceId, workspaceId))
		.orderBy(desc(project.createdAt));
}

export async function listWorkspaceTasks(workspaceId: string) {
	return db
		.select({
			id: task.id,
			title: task.title,
			priority: task.priority,
			completed: task.completed,
			createdAt: task.createdAt,
			projectId: task.projectId,
			projectName: project.name
		})
		.from(task)
		.leftJoin(project, eq(task.projectId, project.id))
		.where(eq(project.workspaceId, workspaceId))
		.orderBy(desc(task.createdAt));
}

export async function createProject(input: {
	workspaceId: string;
	name: string;
	description?: string;
	status?: ProjectStatus;
}) {
	const name = input.name.trim();
	if (!name) throw new Error('Project name is required');
	const [created] = await db
		.insert(project)
		.values({
			workspaceId: input.workspaceId,
			name,
			description: input.description?.trim() || null,
			status: input.status ?? 'backlog'
		})
		.returning();
	return created;
}

export async function updateProject(input: {
	workspaceId: string;
	projectId: string;
	name: string;
	description?: string;
	status: ProjectStatus;
}) {
	const name = input.name.trim();
	if (!name) throw new Error('Project name is required');
	const [updated] = await db
		.update(project)
		.set({
			name,
			description: input.description?.trim() || null,
			status: input.status,
			updatedAt: new Date()
		})
		.where(and(eq(project.id, input.projectId), eq(project.workspaceId, input.workspaceId)))
		.returning();
	return updated;
}

export async function deleteProject(workspaceId: string, projectId: string) {
	await db
		.delete(project)
		.where(and(eq(project.id, projectId), eq(project.workspaceId, workspaceId)));
}

export async function createTask(input: {
	workspaceId: string;
	projectId: string;
	title: string;
	priority?: number;
}) {
	const title = input.title.trim();
	if (!title) throw new Error('Task title is required');
	const [targetProject] = await db
		.select({ id: project.id })
		.from(project)
		.where(and(eq(project.id, input.projectId), eq(project.workspaceId, input.workspaceId)))
		.limit(1);
	if (!targetProject) throw new Error('Project not found');
	const [created] = await db
		.insert(task)
		.values({ projectId: targetProject.id, title, priority: input.priority ?? 1 })
		.returning();
	return created;
}

export async function toggleTask(workspaceId: string, taskId: string, completed: boolean) {
	const [targetTask] = await db
		.select({ id: task.id })
		.from(task)
		.innerJoin(project, eq(task.projectId, project.id))
		.where(and(eq(task.id, taskId), eq(project.workspaceId, workspaceId)))
		.limit(1);
	if (!targetTask) throw new Error('Task not found');
	await db.update(task).set({ completed, updatedAt: new Date() }).where(eq(task.id, targetTask.id));
}

export async function deleteTask(workspaceId: string, taskId: string) {
	const [targetTask] = await db
		.select({ id: task.id })
		.from(task)
		.innerJoin(project, eq(task.projectId, project.id))
		.where(and(eq(task.id, taskId), eq(project.workspaceId, workspaceId)))
		.limit(1);
	if (targetTask) await db.delete(task).where(eq(task.id, targetTask.id));
}

export async function updateUserProfile(userId: string, name: string) {
	const nextName = name.trim();
	if (!nextName) throw new Error('Name is required');
	const [updated] = await db
		.update(user)
		.set({ name: nextName, updatedAt: new Date() })
		.where(eq(user.id, userId))
		.returning();
	return updated;
}
