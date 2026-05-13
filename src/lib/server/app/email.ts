import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';

type EmailMessage = {
	to: string;
	subject: string;
	text: string;
	html?: string;
};

const emailProviders = ['console', 'cloudflare'] as const;

type EmailProvider = (typeof emailProviders)[number];

function getEmailProvider(): EmailProvider {
	const provider = env.EMAIL_PROVIDER ?? 'console';

	if (emailProviders.includes(provider as EmailProvider)) {
		return provider as EmailProvider;
	}

	throw new Error(
		`Unsupported EMAIL_PROVIDER=${provider}. Use "console" for local development or "cloudflare" for production.`
	);
}

function getEmailFrom() {
	if (!env.EMAIL_FROM) {
		throw new Error('EMAIL_FROM is required when EMAIL_PROVIDER=cloudflare.');
	}

	return env.EMAIL_FROM;
}

export async function sendTransactionalEmail(message: EmailMessage) {
	const provider = getEmailProvider();

	if (provider === 'console') {
		console.info('[email:console]', JSON.stringify(message, null, 2));
		return;
	}

	const emailBinding = getRequestEvent().platform?.env?.EMAIL;

	if (!emailBinding) {
		throw new Error(
			'Cloudflare Email Service binding EMAIL is not configured. Add send_email to wrangler.jsonc and set EMAIL_PROVIDER=cloudflare only in Cloudflare runtime.'
		);
	}

	await emailBinding.send({
		to: message.to,
		from: getEmailFrom(),
		subject: message.subject,
		text: message.text,
		html: message.html
	});
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
