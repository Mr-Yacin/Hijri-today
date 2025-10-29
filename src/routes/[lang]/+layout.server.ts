import type { LayoutServerLoad } from './$types';
import { setupI18n } from '$lib/i18n';

export const load: LayoutServerLoad = async ({ params, setHeaders }) => {
	const { lang } = params as { lang: 'ar' | 'en' };
	
	// Initialize i18n on server side
	await setupI18n(lang);
	
	// Set content language header
	setHeaders({
		'Content-Language': lang
	});
	
	return {
		lang
	};
};