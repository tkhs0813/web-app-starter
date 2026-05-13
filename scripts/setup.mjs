#!/usr/bin/env node
import { existsSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

if (!existsSync('.env')) {
	copyFileSync('.env.example', '.env');
	console.log('Created .env from .env.example');
} else {
	console.log('.env already exists');
}

execSync('pnpm install', { stdio: 'inherit' });
execSync('pnpm db:push:local', { stdio: 'inherit' });
console.log('\nStarter setup complete. Run: pnpm dev');
