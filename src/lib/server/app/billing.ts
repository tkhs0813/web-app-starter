export type BillingPlan = {
	id: 'free' | 'pro' | 'team';
	name: string;
	price: string;
	description: string;
	features: string[];
	stripeLookupKey: string;
};

export const billingPlans: BillingPlan[] = [
	{
		id: 'free',
		name: 'Free',
		price: '$0',
		description: 'Validate the idea and keep one personal workspace moving.',
		features: ['1 workspace', '3 projects', 'Community support'],
		stripeLookupKey: 'starter_free'
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

export function getBillingPlan(planId: string | null | undefined) {
	return billingPlans.find((plan) => plan.id === planId) ?? billingPlans[0];
}
