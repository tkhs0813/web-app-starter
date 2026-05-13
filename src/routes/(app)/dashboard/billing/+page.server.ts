import { fail, redirect } from '@sveltejs/kit';
import { billingPlans, getPlanLimits, type BillingPlanId } from '$lib/server/app/billing';
import {
	createCheckoutSession,
	createPortalSession,
	getWorkspaceBilling
} from '$lib/server/app/billing.server';
import { ensurePersonalWorkspace } from '$lib/server/app/workspace';
import type { Actions, PageServerLoad } from './$types';

const paidPlanIds = ['pro', 'team'] as const;

function normalizePaidPlanId(value: FormDataEntryValue | null): BillingPlanId | null {
	return paidPlanIds.includes(value as (typeof paidPlanIds)[number])
		? (value as BillingPlanId)
		: null;
}

export const load: PageServerLoad = async ({ parent }) => {
	const { workspace } = await parent();
	const billing = await getWorkspaceBilling(workspace.id);

	return {
		plans: billingPlans,
		billing,
		currentPlan: billing.plan,
		limits: getPlanLimits(billing.effectivePlanId)
	};
};

export const actions: Actions = {
	checkout: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });

		const form = await request.formData();
		const planId = normalizePaidPlanId(form.get('planId'));
		if (!planId) return fail(400, { message: 'Choose a paid plan to start checkout.' });

		let checkoutUrl: string;
		try {
			const workspace = await ensurePersonalWorkspace(locals.user);
			const session = await createCheckoutSession({
				workspace,
				user: locals.user,
				planId,
				origin: new URL(request.url).origin
			});

			if (!session.url) return fail(500, { message: 'Stripe did not return a checkout URL.' });
			checkoutUrl = session.url;
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Checkout could not be started.'
			});
		}

		redirect(303, checkoutUrl);
	},
	portal: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });

		let portalUrl: string;
		try {
			const workspace = await ensurePersonalWorkspace(locals.user);
			const session = await createPortalSession({
				workspaceId: workspace.id,
				origin: new URL(request.url).origin
			});
			portalUrl = session.url;
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Billing portal could not be opened.'
			});
		}

		redirect(303, portalUrl);
	}
};
