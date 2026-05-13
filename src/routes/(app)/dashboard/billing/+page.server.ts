import { billingPlans, getBillingPlan } from '$lib/server/app/billing';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		plans: billingPlans,
		currentPlan: getBillingPlan('free')
	};
};
