import { deploymentProviders } from '$lib/server/app/deployment';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { deploymentProviders };
};
