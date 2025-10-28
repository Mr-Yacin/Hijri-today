import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { i18nConfig } from '$lib/i18n';

export const load: PageLoad = async () => {
	// Redirect to default language
	throw redirect(302, `/${i18nConfig.defaultLocale}`);
};