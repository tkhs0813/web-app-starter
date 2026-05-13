import { describe, expect, it } from 'vitest';
import { billingPlans, getBillingPlan } from './billing';

describe('billing catalog', () => {
	it('ships with free, pro, and team plans', () => {
		expect(billingPlans.map((plan) => plan.id)).toEqual(['free', 'pro', 'team']);
	});

	it('returns the free plan as a safe fallback', () => {
		expect(getBillingPlan('pro').name).toBe('Pro');
		expect(getBillingPlan('unknown').id).toBe('free');
	});
});
