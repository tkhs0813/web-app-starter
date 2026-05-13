import { redirect, type RequestHandler } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request }) => {
	await auth.api.signOut({ headers: request.headers });
	redirect(302, '/login');
};
