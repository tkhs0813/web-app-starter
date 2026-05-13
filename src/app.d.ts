import type { Session, User } from 'better-auth/minimal';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
		}

		interface Error {
			message: string;
			errorId?: string;
			code?: string;
		}

		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				EMAIL?: SendEmail;
				RATE_LIMIT?: KVNamespace;
				[key: string]: string | SendEmail | KVNamespace | undefined;
			};
			context?: ExecutionContext;
			cf?: IncomingRequestCfProperties;
		}
	}
}

export {};
