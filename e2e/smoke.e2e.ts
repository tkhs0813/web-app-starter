import { expect, test } from '@playwright/test';

test('public pages render', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/web-app-starter/i);
	await page.goto('/login');
	await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
	await page.goto('/docs');
	await expect(page.getByRole('heading', { name: 'web-app-starter docs' })).toBeVisible();
});

test('dashboard redirects anonymous users to login', async ({ page }) => {
	await page.goto('/dashboard');
	await expect(page).toHaveURL(/\/login\?redirectTo=/);
});
