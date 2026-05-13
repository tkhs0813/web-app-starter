import { redirect } from '@sveltejs/kit';
import { getWorkspaceMembership } from '$lib/server/app/permissions';
import { ensurePersonalWorkspace, listUserWorkspaces } from '$lib/server/app/workspace';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user)
		redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
	const workspace = await ensurePersonalWorkspace(locals.user);
	if (!workspace.onboardingCompletedAt && url.pathname !== '/dashboard/settings')
		redirect(302, '/onboarding');
	const [membership, workspaces] = await Promise.all([
		getWorkspaceMembership(workspace.id, locals.user.id),
		listUserWorkspaces(locals.user.id)
	]);

	return {
		user: locals.user,
		session: locals.session,
		workspace,
		membership,
		workspaces
	};
};
