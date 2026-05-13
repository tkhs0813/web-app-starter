import { error, json } from '@sveltejs/kit';
import type Stripe from 'stripe';
import {
	markStripeSubscriptionCanceled,
	syncCheckoutSession,
	syncStripeSubscription
} from '$lib/server/app/billing.server';
import { getStripe, getStripeWebhookSecret } from '$lib/server/stripe';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const signature = request.headers.get('stripe-signature');
	if (!signature) error(400, 'Missing Stripe signature');

	const payload = await request.text();
	let event: Stripe.Event;

	try {
		event = getStripe().webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
	} catch (cause) {
		console.error('Stripe webhook signature verification failed', cause);
		error(400, 'Invalid Stripe webhook signature');
	}

	switch (event.type) {
		case 'checkout.session.completed':
			await syncCheckoutSession(event.data.object as Stripe.Checkout.Session);
			break;
		case 'customer.subscription.created':
		case 'customer.subscription.updated':
			await syncStripeSubscription(event.data.object as Stripe.Subscription);
			break;
		case 'customer.subscription.deleted':
			await markStripeSubscriptionCanceled(event.data.object as Stripe.Subscription);
			break;
		case 'invoice.payment_succeeded':
		case 'invoice.payment_failed':
			break;
	}

	return json({ received: true });
};
