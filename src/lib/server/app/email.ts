import { env } from '$env/dynamic/private';

type EmailMessage = {
	to: string;
	subject: string;
	text: string;
	html?: string;
};

export async function sendTransactionalEmail(message: EmailMessage) {
	// Cloudflare-ready placeholder: wire this to Resend/Postmark/SendGrid from one server-only module.
	// Keeping the template dependency-free makes the starter safe to clone and run immediately.
	if (!env.EMAIL_FROM || env.EMAIL_PROVIDER === 'console') {
		console.info('[email:console]', JSON.stringify(message, null, 2));
		return;
	}

	console.warn(
		`EMAIL_PROVIDER=${env.EMAIL_PROVIDER ?? 'unset'} is not implemented yet. Falling back to console email.`
	);
	console.info('[email:fallback]', JSON.stringify(message, null, 2));
}

export async function sendVerificationEmail(input: {
	user: { email: string; name?: string | null };
	url: string;
}) {
	await sendTransactionalEmail({
		to: input.user.email,
		subject: 'Verify your email',
		text: `Hi ${input.user.name ?? 'there'}, verify your email: ${input.url}`,
		html: `<p>Hi ${input.user.name ?? 'there'},</p><p><a href="${input.url}">Verify your email</a></p>`
	});
}

export async function sendPasswordResetEmail(input: {
	user: { email: string; name?: string | null };
	url: string;
}) {
	await sendTransactionalEmail({
		to: input.user.email,
		subject: 'Reset your password',
		text: `Hi ${input.user.name ?? 'there'}, reset your password: ${input.url}`,
		html: `<p>Hi ${input.user.name ?? 'there'},</p><p><a href="${input.url}">Reset your password</a></p>`
	});
}
