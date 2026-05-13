import { fail } from '@sveltejs/kit';
import { updateUserProfile } from '$lib/server/app/workspace';
import type { Actions } from './$types';

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const form = await request.formData();

		try {
			await updateUserProfile(locals.user.id, form.get('name')?.toString() ?? '');
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Profile update failed'
			});
		}

		return { success: true, message: 'Profile updated' };
	}
};
