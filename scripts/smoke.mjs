#!/usr/bin/env node
const baseUrl = process.env.SMOKE_TEST_URL ?? 'http://localhost:8788';
const paths = ['/', '/pricing', '/docs', '/login'];

for (const path of paths) {
	const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });
	if (response.status >= 500) {
		throw new Error(`${path} returned ${response.status}`);
	}
	console.log(`✓ ${path} ${response.status}`);
}
