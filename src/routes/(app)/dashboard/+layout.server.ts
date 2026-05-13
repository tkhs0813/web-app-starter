import { redirect } from '@sveltejs/kit';
import { ensurePersonalWorkspace } from '$lib/server/app/workspace';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/login');
	const workspace = await ensurePersonalWorkspace(locals.user);

	return {
		user: locals.user,
		session: locals.session,
		workspace
	};
};
