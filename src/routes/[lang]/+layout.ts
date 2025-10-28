import type { LayoutLoad } from './$types';
import { i18nConfig } from '$lib/i18n';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params }) => {
	const { lang } = params;
	
	// Validate language parameter
	if (!i18nConfig.supportedLocales.includes(lang as 'ar' | 'en')) {
		throw error(404, 'Language not supported');
	}

	return {
		lang: lang as 'ar' | 'en'
	};
};