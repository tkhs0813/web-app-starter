import { and, eq } from 'drizzle-orm';
import type Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { billingCustomer, subscription, type user, type workspace } from '$lib/server/db/schema';
import {
	billingPlans,
	getBillingPlan,
	getBillingPlanByLookupKey,
	getEffectivePlanId,
	type BillingPlanId,
	type SubscriptionStatus
} from './billing';
import { getStripe } from '$lib/server/stripe';

type Workspace = typeof workspace.$inferSelect;
type User = typeof user.$inferSelect;
type WorkspaceSubscription = typeof subscription.$inferSelect;

export type BillingSummary = {
	customerId: string | null;
	subscription: WorkspaceSubscription | null;
	plan: ReturnType<typeof getBillingPlan>;
	effectivePlanId: BillingPlanId;
	status: SubscriptionStatus;
	isConfigured: boolean;
};

export function isStripeConfigured() {
	return Boolean(env.STRIPE_SECRET_KEY);
}

function getConfiguredLookupKey(planId: BillingPlanId) {
	if (planId === 'pro') return env.STRIPE_PRO_PRICE_LOOKUP_KEY || 'starter_pro_monthly';
	if (planId === 'team') return env.STRIPE_TEAM_PRICE_LOOKUP_KEY || 'starter_team_monthly';
	return null;
}

export async function getWorkspaceBilling(workspaceId: string): Promise<BillingSummary> {
	const [[customer], [workspaceSubscription]] = await Promise.all([
		db.select().from(billingCustomer).where(eq(billingCustomer.workspaceId, workspaceId)).limit(1),
		db.select().from(subscription).where(eq(subscription.workspaceId, workspaceId)).limit(1)
	]);

	const effectivePlanId = getEffectivePlanId({
		plan: workspaceSubscription?.plan,
		status: workspaceSubscription?.status
	});

	return {
		customerId: customer?.stripeCustomerId ?? workspaceSubscription?.stripeCustomerId ?? null,
		subscription: workspaceSubscription ?? null,
		plan: getBillingPlan(effectivePlanId),
		effectivePlanId,
		status: workspaceSubscription?.status ?? 'none',
		isConfigured: isStripeConfigured()
	};
}

async function ensureStripeCustomer(input: { workspace: Workspace; user: User }) {
	const [existingCustomer] = await db
		.select()
		.from(billingCustomer)
		.where(eq(billingCustomer.workspaceId, input.workspace.id))
		.limit(1);

	if (existingCustomer) return existingCustomer.stripeCustomerId;

	const stripe = getStripe();
	const customer = await stripe.customers.create({
		email: input.user.email,
		name: input.user.name ?? input.workspace.name,
		metadata: {
			workspaceId: input.workspace.id,
			userId: input.user.id
		}
	});

	await db.insert(billingCustomer).values({
		workspaceId: input.workspace.id,
		stripeCustomerId: customer.id
	});

	return customer.id;
}

export async function createCheckoutSession(input: {
	workspace: Workspace;
	user: User;
	planId: BillingPlanId;
	origin: string;
}) {
	const plan = getBillingPlan(input.planId);
	const lookupKey = getConfiguredLookupKey(plan.id);
	if (!lookupKey) throw new Error('Free plan does not require checkout');

	const customerId = await ensureStripeCustomer({ workspace: input.workspace, user: input.user });
	const stripe = getStripe();
	const prices = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
	const price = prices.data[0];
	if (!price) throw new Error(`Stripe price not found for lookup key: ${lookupKey}`);

	return stripe.checkout.sessions.create({
		mode: 'subscription',
		customer: customerId,
		client_reference_id: input.workspace.id,
		line_items: [{ price: price.id, quantity: 1 }],
		success_url: `${input.origin}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${input.origin}/dashboard/billing/cancel`,
		metadata: {
			workspaceId: input.workspace.id,
			planId: plan.id
		},
		subscription_data: {
			metadata: {
				workspaceId: input.workspace.id,
				planId: plan.id
			}
		}
	});
}

export async function createPortalSession(input: { workspaceId: string; origin: string }) {
	const billing = await getWorkspaceBilling(input.workspaceId);
	if (!billing.customerId) throw new Error('No Stripe customer found for this workspace');

	return getStripe().billingPortal.sessions.create({
		customer: billing.customerId,
		return_url: `${input.origin}/dashboard/billing`
	});
}

function getSubscriptionCurrentPeriodEnd(stripeSubscription: Stripe.Subscription) {
	const rawSubscription = stripeSubscription as unknown as { current_period_end?: number };
	return rawSubscription.current_period_end
		? new Date(rawSubscription.current_period_end * 1000)
		: null;
}

function getSubscriptionLookupKey(stripeSubscription: Stripe.Subscription) {
	return stripeSubscription.items.data[0]?.price.lookup_key ?? null;
}

function getWorkspaceIdFromSubscription(stripeSubscription: Stripe.Subscription) {
	return stripeSubscription.metadata.workspaceId;
}

export async function syncStripeSubscription(stripeSubscription: Stripe.Subscription) {
	const workspaceId = getWorkspaceIdFromSubscription(stripeSubscription);
	if (!workspaceId) throw new Error('Stripe subscription is missing metadata.workspaceId');

	const stripeCustomerId =
		typeof stripeSubscription.customer === 'string'
			? stripeSubscription.customer
			: stripeSubscription.customer.id;
	const lookupKey = getSubscriptionLookupKey(stripeSubscription);
	const plan = getBillingPlanByLookupKey(lookupKey);
	const status = stripeSubscription.status as SubscriptionStatus;
	const values = {
		workspaceId,
		stripeCustomerId,
		stripeSubscriptionId: stripeSubscription.id,
		plan: plan.id,
		status,
		priceLookupKey: lookupKey,
		currentPeriodEnd: getSubscriptionCurrentPeriodEnd(stripeSubscription),
		cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
		updatedAt: new Date()
	};

	await db
		.insert(billingCustomer)
		.values({ workspaceId, stripeCustomerId })
		.onConflictDoUpdate({
			target: billingCustomer.workspaceId,
			set: { stripeCustomerId, updatedAt: new Date() }
		});

	const [existingSubscription] = await db
		.select({ id: subscription.id })
		.from(subscription)
		.where(eq(subscription.workspaceId, workspaceId))
		.limit(1);

	if (existingSubscription) {
		await db.update(subscription).set(values).where(eq(subscription.id, existingSubscription.id));
		return;
	}

	await db.insert(subscription).values(values);
}

export async function markStripeSubscriptionCanceled(stripeSubscription: Stripe.Subscription) {
	await syncStripeSubscription(stripeSubscription);
	await db
		.update(subscription)
		.set({ status: 'canceled', updatedAt: new Date() })
		.where(
			and(
				eq(subscription.stripeSubscriptionId, stripeSubscription.id),
				eq(subscription.status, stripeSubscription.status as SubscriptionStatus)
			)
		);
}

export async function syncCheckoutSession(session: Stripe.Checkout.Session) {
	if (!session.subscription) return;
	const stripe = getStripe();
	const stripeSubscription = await stripe.subscriptions.retrieve(
		typeof session.subscription === 'string' ? session.subscription : session.subscription.id
	);
	await syncStripeSubscription(stripeSubscription);
}

export function paidPlans() {
	return billingPlans.filter((plan) => plan.stripeLookupKey);
}
