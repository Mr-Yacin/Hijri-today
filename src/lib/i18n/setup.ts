import { browser } from '$app/environment';
import { page } from '$app/stores';
import { init, register, locale, waitLocale, _ } from 'svelte-i18n';
import { writable, derived } from 'svelte/store';
import { i18nConfig } from './config.js';

// Register translation files
register('en', () => import('./locales/en.json'));
register('ar', () => import('./locales/ar.json'));

// Current locale store
export const currentLocale = writable<'ar' | 'en'>(i18nConfig.defaultLocale);

// Text direction store
export const textDirection = derived(currentLocale, ($locale) => 
	getTextDirection($locale)
);

// Initialize i18n with locale detection
export function setupI18n(initialLocale?: 'ar' | 'en') {
	const detectedLocale = initialLocale || detectLocaleFromPath() || detectLocaleFromBrowser();
	
	init({
		fallbackLocale: i18nConfig.defaultLocale,
		initialLocale: detectedLocale
	});
	
	currentLocale.set(detectedLocale);
}

// Detect locale from URL path (/ar or /en)
export function detectLocaleFromPath(): 'ar' | 'en' | null {
	if (browser) {
		const pathSegments = window.location.pathname.split('/');
		const langSegment = pathSegments[1];
		if (i18nConfig.supportedLocales.includes(langSegment as 'ar' | 'en')) {
			return langSegment as 'ar' | 'en';
		}
	}
	return null;
}

// Detect locale from browser language
export function detectLocaleFromBrowser(): 'ar' | 'en' {
	if (browser) {
		const browserLang = window.navigator.language.split('-')[0];
		if (i18nConfig.supportedLocales.includes(browserLang as 'ar' | 'en')) {
			return browserLang as 'ar' | 'en';
		}
	}
	return i18nConfig.defaultLocale;
}

// Set locale and wait for it to load
export async function setLocale(newLocale: 'ar' | 'en') {
	if (i18nConfig.supportedLocales.includes(newLocale)) {
		locale.set(newLocale);
		currentLocale.set(newLocale);
		await waitLocale(newLocale);
	}
}

// Get text direction for locale
export function getTextDirection(currentLocale: string): 'rtl' | 'ltr' {
	return i18nConfig.rtlLocales.includes(currentLocale as 'ar') ? 'rtl' : 'ltr';
}

// Format numbers according to locale with Arabic-Indic and Latin numerals
export function formatNumber(num: number, currentLocale: 'ar' | 'en'): string {
	const numberSystem = i18nConfig.numberSystems[currentLocale];
	
	// For Arabic, use Arabic-Indic numerals
	if (currentLocale === 'ar') {
		return new Intl.NumberFormat('ar-SA', { 
			numberingSystem: 'arab'
		}).format(num);
	}
	
	// For English, use Latin numerals
	return new Intl.NumberFormat('en-US', { 
		numberingSystem: 'latn'
	}).format(num);
}

// Format date numbers (for day, month, year display)
export function formatDateNumber(num: number, currentLocale: 'ar' | 'en'): string {
	return formatNumber(num, currentLocale);
}

// Get localized route path
export function getLocalizedPath(path: string, targetLocale: 'ar' | 'en'): string {
	// Remove existing locale prefix if present
	const cleanPath = path.replace(/^\/(ar|en)/, '');
	
	// Add target locale prefix
	return `/${targetLocale}${cleanPath}`;
}

// Get current locale from URL or fallback
export function getCurrentLocale(): 'ar' | 'en' {
	return detectLocaleFromPath() || i18nConfig.defaultLocale;
}