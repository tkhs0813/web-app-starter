import { describe, expect, it } from 'vitest';
import { makeWorkspaceSlug, normalizeProjectStatus } from './workspace';

describe('workspace helpers', () => {
	it('creates stable readable workspace slugs from user email addresses', () => {
		expect(makeWorkspaceSlug('Ryo Test', 'ryo@example.com')).toBe('ryo-test');
		expect(makeWorkspaceSlug('', 'hello.world+demo@example.com')).toBe('hello-world');
	});

	it('normalizes unknown project status values to backlog', () => {
		expect(normalizeProjectStatus('active')).toBe('active');
		expect(normalizeProjectStatus('done')).toBe('backlog');
	});
});
