import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(302, '/dashboard');
	return {};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			await auth.api.signInEmail({ body: { email, password, callbackURL: '/dashboard' } });
		} catch (error) {
			if (error instanceof APIError)
				return fail(400, { message: error.message || 'Signin failed' });
			return fail(500, { message: 'Unexpected error' });
		}

		redirect(302, '/dashboard');
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? email.split('@')[0];

		try {
			await auth.api.signUpEmail({ body: { email, password, name, callbackURL: '/dashboard' } });
		} catch (error) {
			if (error instanceof APIError)
				return fail(400, { message: error.message || 'Registration failed' });
			return fail(500, { message: 'Unexpected error' });
		}

		redirect(302, '/dashboard');
	},
	signInSocial: async (event) => {
		const formData = await event.request.formData();
		const provider = formData.get('provider')?.toString() ?? 'github';
		const callbackURL = formData.get('callbackURL')?.toString() ?? '/dashboard';
		const result = await auth.api.signInSocial({
			body: { provider: provider as 'github', callbackURL }
		});

		if (result.url) redirect(302, result.url);
		return fail(400, { message: 'Social sign-in failed' });
	}
};
