import type { Handle, HandleServerError } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	const response = await svelteKitHandler({ event, resolve, auth, building });
	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	return response;
};

export const handle: Handle = handleBetterAuth;

export const handleError: HandleServerError = ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();
	console.error('[server:error]', {
		errorId,
		status,
		message,
		path: event.url.pathname,
		error
	});
	return {
		message: status === 404 ? message : 'Something went wrong. Please try again.',
		errorId,
		code: status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR'
	};
};
