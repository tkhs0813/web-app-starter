import { fail, redirect } from '@sveltejs/kit';
import { completeOnboarding, ensurePersonalWorkspace } from '$lib/server/app/workspace';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	const workspace = await ensurePersonalWorkspace(locals.user);
	if (workspace.onboardingCompletedAt) redirect(302, '/dashboard');
	return { user: locals.user, workspace };
};

export const actions: Actions = {
	complete: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const workspace = await ensurePersonalWorkspace(locals.user);
		const form = await request.formData();
		try {
			await completeOnboarding({
				workspaceId: workspace.id,
				workspaceName: form.get('workspaceName')?.toString() ?? '',
				projectName: form.get('projectName')?.toString()
			});
		} catch (error) {
			return fail(400, { message: error instanceof Error ? error.message : 'Onboarding failed' });
		}
		redirect(302, '/dashboard');
	}
};
