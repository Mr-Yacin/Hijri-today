import { browser } from '$app/environment';
import { init, register, locale, waitLocale } from 'svelte-i18n';
import { i18nConfig } from './config.js';

// Register translation files
register('en', () => import('./locales/en.json'));
register('ar', () => import('./locales/ar.json'));

// Initialize i18n
export function setupI18n() {
	init({
		fallbackLocale: i18nConfig.defaultLocale,
		initialLocale: browser ? window.navigator.language.split('-')[0] : i18nConfig.defaultLocale
	});
}

// Set locale and wait for it to load
export async function setLocale(newLocale: 'ar' | 'en') {
	if (i18nConfig.supportedLocales.includes(newLocale)) {
		locale.set(newLocale);
		await waitLocale(newLocale);
	}
}

// Get text direction for locale
export function getTextDirection(currentLocale: string): 'rtl' | 'ltr' {
	return i18nConfig.rtlLocales.includes(currentLocale as 'ar') ? 'rtl' : 'ltr';
}

// Format numbers according to locale
export function formatNumber(num: number, currentLocale: 'ar' | 'en'): string {
	const numberSystem = i18nConfig.numberSystems[currentLocale];
	return new Intl.NumberFormat(currentLocale, { 
		numberingSystem: numberSystem 
	}).format(num);
}