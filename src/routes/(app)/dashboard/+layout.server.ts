import { redirect } from '@sveltejs/kit';
import { getBillingStatusTone } from '$lib/server/app/billing';
import { getWorkspaceBilling } from '$lib/server/app/billing.server';
import { getWorkspaceMembership } from '$lib/server/app/permissions';
import {
	ensurePersonalWorkspace,
	getUserWorkspaceById,
	listUserWorkspaces
} from '$lib/server/app/workspace';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, locals, url }) => {
	if (!locals.user)
		redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);

	const personalWorkspace = await ensurePersonalWorkspace(locals.user);
	const workspaces = await listUserWorkspaces(locals.user.id);
	const requestedWorkspaceId =
		url.searchParams.get('workspace') ?? cookies.get('active_workspace_id');
	const selected = requestedWorkspaceId
		? await getUserWorkspaceById(locals.user.id, requestedWorkspaceId)
		: undefined;
	const workspace = selected?.workspace ?? personalWorkspace;

	if (requestedWorkspaceId && selected) {
		cookies.set('active_workspace_id', workspace.id, {
			path: '/',
			sameSite: 'lax',
			httpOnly: true
		});
	}

	if (!workspace.onboardingCompletedAt && url.pathname !== '/dashboard/settings')
		redirect(302, '/onboarding');

	const [membership, billing] = await Promise.all([
		getWorkspaceMembership(workspace.id, locals.user.id),
		getWorkspaceBilling(workspace.id)
	]);

	const emailVerified = (locals.user as { emailVerified?: boolean }).emailVerified ?? true;

	return {
		user: locals.user,
		session: locals.session,
		workspace,
		membership,
		workspaces,
		billing,
		billingTone: getBillingStatusTone(billing.status),
		emailVerified
	};
};
