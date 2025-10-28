import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	// Pass through server data and set cache headers
	return {
		...data
	};
};

// Enable SSR and prerendering for better performance
export const ssr = true;
export const prerender = false; // Dynamic content based on user location