import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { sendPasswordResetEmail, sendVerificationEmail } from '$lib/server/app/email';
import { db } from '$lib/server/db';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		async sendResetPassword({ user, url }) {
			await sendPasswordResetEmail({ user, url });
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		async sendVerificationEmail({ user, url }) {
			await sendVerificationEmail({ user, url });
		}
	},
	user: {
		deleteUser: {
			enabled: true
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
