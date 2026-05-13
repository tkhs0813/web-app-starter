import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
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
	},
	changePassword: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const form = await request.formData();
		try {
			await auth.api.changePassword({
				headers: request.headers,
				body: {
					currentPassword: form.get('currentPassword')?.toString() ?? '',
					newPassword: form.get('newPassword')?.toString() ?? '',
					revokeOtherSessions: form.get('revokeOtherSessions') === 'on'
				}
			});
		} catch (error) {
			if (error instanceof APIError)
				return fail(400, { message: error.message || 'Password change failed' });
			return fail(500, { message: 'Unexpected error' });
		}
		return { success: true, message: 'Password updated' };
	},
	revokeSessions: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		try {
			await auth.api.revokeSessions({ headers: request.headers });
		} catch (error) {
			if (error instanceof APIError)
				return fail(400, { message: error.message || 'Session revocation failed' });
			return fail(500, { message: 'Unexpected error' });
		}
		return { success: true, message: 'Other sessions revoked' };
	},
	deleteAccount: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		const form = await request.formData();
		try {
			await auth.api.deleteUser({
				headers: request.headers,
				body: { password: form.get('password')?.toString() ?? '' }
			});
		} catch (error) {
			if (error instanceof APIError)
				return fail(400, { message: error.message || 'Account deletion failed' });
			return fail(500, { message: 'Unexpected error' });
		}
		redirect(302, '/');
	}
};
