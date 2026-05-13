import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '$lib/server/auth';
import { checkRateLimit, getClientIp } from '$lib/server/app/rate-limit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) redirect(302, url.searchParams.get('redirectTo') || '/dashboard');
	return { redirectTo: url.searchParams.get('redirectTo') || '/dashboard' };
};

function authLimit(request: Request, action: string) {
	const ip = getClientIp(request);
	return checkRateLimit({ key: `auth:${action}:${ip}`, limit: 10, windowSeconds: 60 });
}

export const actions: Actions = {
	signInEmail: async (event) => {
		const limit = authLimit(event.request, 'signin');
		if (!limit.allowed) return fail(429, { message: 'Too many attempts. Try again shortly.' });
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const redirectTo = formData.get('redirectTo')?.toString() || '/dashboard';

		try {
			await auth.api.signInEmail({ body: { email, password, callbackURL: redirectTo } });
		} catch (error) {
			if (error instanceof APIError)
				return fail(400, { message: error.message || 'Signin failed' });
			return fail(500, { message: 'Unexpected error' });
		}

		redirect(302, redirectTo);
	},
	signUpEmail: async (event) => {
		const limit = authLimit(event.request, 'signup');
		if (!limit.allowed) return fail(429, { message: 'Too many attempts. Try again shortly.' });
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() || email.split('@')[0];
		const redirectTo = formData.get('redirectTo')?.toString() || '/onboarding';

		try {
			await auth.api.signUpEmail({ body: { email, password, name, callbackURL: redirectTo } });
		} catch (error) {
			if (error instanceof APIError)
				return fail(400, { message: error.message || 'Registration failed' });
			return fail(500, { message: 'Unexpected error' });
		}

		return { success: true, message: 'Check your inbox to verify your email, then sign in.' };
	},
	requestPasswordReset: async (event) => {
		const limit = authLimit(event.request, 'password-reset');
		if (!limit.allowed) return fail(429, { message: 'Too many attempts. Try again shortly.' });
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		try {
			await auth.api.requestPasswordReset({ body: { email, redirectTo: '/reset-password' } });
		} catch (error) {
			if (error instanceof APIError)
				return fail(400, { message: error.message || 'Password reset failed' });
			return fail(500, { message: 'Unexpected error' });
		}
		return { success: true, message: 'If that email exists, a reset link has been sent.' };
	}
};
