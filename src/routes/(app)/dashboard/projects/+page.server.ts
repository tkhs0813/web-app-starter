import { fail } from '@sveltejs/kit';
import {
	createProject,
	createTask,
	deleteProject,
	deleteTask,
	ensurePersonalWorkspace,
	listWorkspaceProjects,
	listWorkspaceTasks,
	normalizeProjectStatus,
	toggleTask,
	updateProject
} from '$lib/server/app/workspace';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { workspace } = await parent();
	const [projects, tasks] = await Promise.all([
		listWorkspaceProjects(workspace.id),
		listWorkspaceTasks(workspace.id)
	]);

	return { projects, tasks };
};

export const actions: Actions = {
	createProject: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const workspace = await ensurePersonalWorkspace(locals.user);
		const form = await request.formData();

		try {
			await createProject({
				workspaceId: workspace.id,
				name: form.get('name')?.toString() ?? '',
				description: form.get('description')?.toString(),
				status: normalizeProjectStatus(form.get('status'))
			});
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Project creation failed'
			});
		}

		return { success: true };
	},
	updateProject: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const workspace = await ensurePersonalWorkspace(locals.user);
		const form = await request.formData();

		try {
			await updateProject({
				workspaceId: workspace.id,
				projectId: form.get('projectId')?.toString() ?? '',
				name: form.get('name')?.toString() ?? '',
				description: form.get('description')?.toString(),
				status: normalizeProjectStatus(form.get('status'))
			});
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Project update failed'
			});
		}

		return { success: true };
	},
	deleteProject: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const workspace = await ensurePersonalWorkspace(locals.user);
		const form = await request.formData();
		await deleteProject(workspace.id, form.get('projectId')?.toString() ?? '');
		return { success: true };
	},
	createTask: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const workspace = await ensurePersonalWorkspace(locals.user);
		const form = await request.formData();

		try {
			await createTask({
				workspaceId: workspace.id,
				projectId: form.get('projectId')?.toString() ?? '',
				title: form.get('title')?.toString() ?? '',
				priority: Number(form.get('priority') ?? 1)
			});
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Task creation failed'
			});
		}

		return { success: true };
	},
	toggleTask: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const workspace = await ensurePersonalWorkspace(locals.user);
		const form = await request.formData();
		await toggleTask(
			workspace.id,
			form.get('taskId')?.toString() ?? '',
			form.get('completed') === 'true'
		);
		return { success: true };
	},
	deleteTask: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const workspace = await ensurePersonalWorkspace(locals.user);
		const form = await request.formData();
		await deleteTask(workspace.id, form.get('taskId')?.toString() ?? '');
		return { success: true };
	}
};
