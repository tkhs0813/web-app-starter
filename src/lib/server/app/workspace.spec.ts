import { describe, expect, it } from 'vitest';
import {
	canRemoveWorkspaceRole,
	canUpdateWorkspaceRole,
	makeWorkspaceSlug,
	normalizeMemberRole,
	normalizeProjectStatus
} from './workspace';

describe('workspace helpers', () => {
	it('creates stable readable workspace slugs from user email addresses', () => {
		expect(makeWorkspaceSlug('Ryo Test', 'ryo@example.com')).toBe('ryo-test');
		expect(makeWorkspaceSlug('', 'hello.world+demo@example.com')).toBe('hello-world');
	});

	it('normalizes unknown project status values to backlog', () => {
		expect(normalizeProjectStatus('active')).toBe('active');
		expect(normalizeProjectStatus('done')).toBe('backlog');
	});

	it('normalizes editable member roles without allowing owner escalation from forms', () => {
		expect(normalizeMemberRole('admin')).toBe('admin');
		expect(normalizeMemberRole('owner')).toBe('member');
		expect(normalizeMemberRole('unknown')).toBe('member');
	});

	it('protects owners from unsafe remove and role-change operations', () => {
		expect(canRemoveWorkspaceRole('owner')).toBe(false);
		expect(canRemoveWorkspaceRole('admin')).toBe(true);
		expect(
			canUpdateWorkspaceRole({ actorRole: 'admin', targetRole: 'member', nextRole: 'admin' })
		).toBe(true);
		expect(
			canUpdateWorkspaceRole({ actorRole: 'admin', targetRole: 'owner', nextRole: 'member' })
		).toBe(false);
		expect(
			canUpdateWorkspaceRole({ actorRole: 'member', targetRole: 'member', nextRole: 'admin' })
		).toBe(false);
	});
});
