import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { project, task, user, workspace, workspaceMember } from '$lib/server/db/schema';

export type ProjectStatus = 'backlog' | 'active' | 'archived';

const projectStatuses = ['backlog', 'active', 'archived'] as const;

export function makeWorkspaceSlug(name: string | null | undefined, email: string) {
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
		.values({
			projectId: targetProject.id,
			title,
			priority: input.priority ?? 1
		})
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
