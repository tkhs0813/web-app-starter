import { fail, redirect } from '@sveltejs/kit';
import { acceptWorkspaceInvite } from '$lib/server/app/workspace';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params, url }) => {
	if (!locals.user) redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	return { token: params.token, user: locals.user };
};

export const actions: Actions = {
	accept: async ({ locals, params }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		try {
			await acceptWorkspaceInvite({
				token: params.token,
				userId: locals.user.id,
				email: locals.user.email
			});
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Invite accept failed'
			});
		}
		redirect(302, '/dashboard/team');
	}
};
