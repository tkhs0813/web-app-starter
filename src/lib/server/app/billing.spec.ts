import { describe, expect, it } from 'vitest';
import {
	billingPlans,
	canCreateProject,
	getBillingPlan,
	getBillingPlanByLookupKey,
	getEffectivePlanId,
	getPlanLimits,
	isActiveSubscriptionStatus,
	projectLimitMessage
} from './billing';

describe('billing catalog', () => {
	it('ships with free, pro, and team plans', () => {
		expect(billingPlans.map((plan) => plan.id)).toEqual(['free', 'pro', 'team']);
	});

	it('returns the free plan as a safe fallback', () => {
		expect(getBillingPlan('pro').name).toBe('Pro');
		expect(getBillingPlan('unknown').id).toBe('free');
		expect(getBillingPlanByLookupKey('starter_team_monthly').id).toBe('team');
	});

	it('uses active subscription statuses to compute the effective plan', () => {
		expect(isActiveSubscriptionStatus('active')).toBe(true);
		expect(isActiveSubscriptionStatus('past_due')).toBe(false);
		expect(getEffectivePlanId({ plan: 'pro', status: 'active' })).toBe('pro');
		expect(getEffectivePlanId({ plan: 'pro', status: 'past_due' })).toBe('free');
	});

	it('enforces project limits for the free plan only', () => {
		expect(getPlanLimits('free').projects).toBe(3);
		expect(canCreateProject({ plan: 'free', projectCount: 2 })).toBe(true);
		expect(canCreateProject({ plan: 'free', projectCount: 3 })).toBe(false);
		expect(canCreateProject({ plan: 'pro', projectCount: 100 })).toBe(true);
		expect(projectLimitMessage('pro')).toBeNull();
		expect(projectLimitMessage('free')).toContain('3 projects');
	});
});
