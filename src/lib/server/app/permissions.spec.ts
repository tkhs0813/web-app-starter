import { describe, expect, it } from 'vitest';
import {
	canInviteMembers,
	canManageBilling,
	canManageWorkspace,
	hasWorkspaceRole
} from './permissions';

describe('workspace permissions', () => {
	it('limits billing management to owners', () => {
		expect.assertions(3);
		expect(canManageBilling('owner')).toBe(true);
		expect(canManageBilling('admin')).toBe(false);
		expect(canManageBilling('member')).toBe(false);
	});

	it('allows owners and admins to manage workspace collaboration', () => {
		expect.assertions(6);
		expect(canInviteMembers('owner')).toBe(true);
		expect(canInviteMembers('admin')).toBe(true);
		expect(canInviteMembers('member')).toBe(false);
		expect(canManageWorkspace('owner')).toBe(true);
		expect(canManageWorkspace('admin')).toBe(true);
		expect(canManageWorkspace('member')).toBe(false);
	});

	it('checks explicit role allowlists', () => {
		expect.assertions(2);
		expect(hasWorkspaceRole('admin', ['owner', 'admin'])).toBe(true);
		expect(hasWorkspaceRole('member', ['owner', 'admin'])).toBe(false);
	});
});
