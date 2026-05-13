import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

export function getStripe() {
	if (!env.STRIPE_SECRET_KEY) {
		throw new Error('STRIPE_SECRET_KEY is not configured');
	}

	return new Stripe(env.STRIPE_SECRET_KEY);
}

export function getStripeWebhookSecret() {
	if (!env.STRIPE_WEBHOOK_SECRET) {
		throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
	}

	return env.STRIPE_WEBHOOK_SECRET;
}
