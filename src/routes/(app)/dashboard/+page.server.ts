import { listWorkspaceProjects, listWorkspaceTasks } from '$lib/server/app/workspace';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { workspace } = await parent();
	const [projects, tasks] = await Promise.all([
		listWorkspaceProjects(workspace.id),
		listWorkspaceTasks(workspace.id)
	]);

	return {
		stats: {
			projects: projects.length,
			activeProjects: projects.filter((project) => project.status === 'active').length,
			openTasks: tasks.filter((task) => !task.completed).length,
			completedTasks: tasks.filter((task) => task.completed).length
		},
		recentProjects: projects.slice(0, 3),
		recentTasks: tasks.slice(0, 5)
	};
};
