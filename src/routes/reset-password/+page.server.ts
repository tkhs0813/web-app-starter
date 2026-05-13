import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => ({ token: url.searchParams.get('token') ?? '' });

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const token = form.get('token')?.toString() ?? '';
		const newPassword = form.get('password')?.toString() ?? '';
		try {
			await auth.api.resetPassword({ body: { token, newPassword } });
		} catch (error) {
			if (error instanceof APIError)
				return fail(400, { message: error.message || 'Password reset failed' });
			return fail(500, { message: 'Unexpected error' });
		}
		redirect(302, '/login');
	}
};
