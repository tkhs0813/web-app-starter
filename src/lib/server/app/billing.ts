export type BillingPlanId = 'free' | 'pro' | 'team';

export type BillingPlan = {
	id: BillingPlanId;
	name: string;
	price: string;
	description: string;
	features: string[];
	stripeLookupKey: string | null;
};

export type SubscriptionStatus =
	| 'trialing'
	| 'active'
	| 'past_due'
	| 'canceled'
	| 'incomplete'
	| 'incomplete_expired'
	| 'unpaid'
	| 'paused'
	| 'none';

export type PlanLimits = {
	projects: number | 'unlimited';
	workspaces: number | 'unlimited';
	teamMembers: number | 'unlimited';
};

export const billingPlans: BillingPlan[] = [
	{
		id: 'free',
		name: 'Free',
		price: '$0',
		description: 'Validate the idea and keep one personal workspace moving.',
		features: ['1 workspace', '3 projects', 'Community support'],
		stripeLookupKey: null
	},
	{
		id: 'pro',
		name: 'Pro',
		price: '$19',
		description: 'For solo builders shipping real products.',
		features: ['Unlimited projects', 'Priority workflows', 'Email support'],
		stripeLookupKey: 'starter_pro_monthly'
	},
	{
		id: 'team',
		name: 'Team',
		price: '$49',
		description: 'For small teams that need collaboration defaults.',
		features: ['Team workspaces', 'Role-based access', 'Shared billing'],
		stripeLookupKey: 'starter_team_monthly'
	}
];

export const planLimits: Record<BillingPlanId, PlanLimits> = {
	free: { projects: 3, workspaces: 1, teamMembers: 1 },
	pro: { projects: 'unlimited', workspaces: 1, teamMembers: 1 },
	team: { projects: 'unlimited', workspaces: 'unlimited', teamMembers: 'unlimited' }
};

export const activeSubscriptionStatuses: SubscriptionStatus[] = ['trialing', 'active'];

export function getBillingPlan(planId: string | null | undefined) {
	return billingPlans.find((plan) => plan.id === planId) ?? billingPlans[0];
}

export function getBillingPlanByLookupKey(lookupKey: string | null | undefined) {
	return billingPlans.find((plan) => plan.stripeLookupKey === lookupKey) ?? billingPlans[0];
}

export function getPlanLimits(planId: string | null | undefined) {
	return planLimits[getBillingPlan(planId).id];
}

export function isActiveSubscriptionStatus(status: string | null | undefined) {
	return activeSubscriptionStatuses.includes(status as SubscriptionStatus);
}

export function getEffectivePlanId(input: {
	plan: string | null | undefined;
	status: string | null | undefined;
}): BillingPlanId {
	if (!isActiveSubscriptionStatus(input.status)) return 'free';
	return getBillingPlan(input.plan).id;
}

export function canCreateProject(input: { plan: string | null | undefined; projectCount: number }) {
	const limit = getPlanLimits(input.plan).projects;
	return limit === 'unlimited' || input.projectCount < limit;
}

export function projectLimitMessage(plan: string | null | undefined) {
	const limit = getPlanLimits(plan).projects;
	if (limit === 'unlimited') return null;
	return `Free plan is limited to ${limit} projects. Upgrade to Pro to create more.`;
}
