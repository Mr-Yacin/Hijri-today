import { browser } from '$app/environment';
import { init, register, locale, waitLocale, _ } from 'svelte-i18n';
import { writable, derived, get } from 'svelte/store';
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
export async function setupI18n(initialLocale?: 'ar' | 'en') {
	const detectedLocale = initialLocale || detectLocaleFromPath() || detectLocaleFromBrowser();

	await init({
		fallbackLocale: i18nConfig.defaultLocale,
		initialLocale: detectedLocale,
		loadingDelay: 200
	});

	currentLocale.set(detectedLocale);
	
	// Wait for the locale to be loaded
	await waitLocale(detectedLocale);
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
		try {
			locale.set(newLocale);
			currentLocale.set(newLocale);
			await waitLocale(newLocale);
		} catch (error) {
			console.error('Failed to set locale:', error);
			// Fallback to default locale
			locale.set(i18nConfig.defaultLocale);
			currentLocale.set(i18nConfig.defaultLocale);
			await waitLocale(i18nConfig.defaultLocale);
		}
	}
}

// Get text direction for locale
export function getTextDirection(currentLocale: string): 'rtl' | 'ltr' {
	return i18nConfig.rtlLocales.includes(currentLocale as 'ar') ? 'rtl' : 'ltr';
}

// Format numbers according to locale with Arabic-Indic and Latin numerals
export function formatNumber(num: number, currentLocale: 'ar' | 'en'): string {
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
	// For Arabic, use Arabic-Indic numerals without thousand separators
	if (currentLocale === 'ar') {
		return new Intl.NumberFormat('ar-SA', {
			numberingSystem: 'arab',
			useGrouping: false
		}).format(num);
	}

	// For English, use Latin numerals without thousand separators
	return new Intl.NumberFormat('en-US', {
		numberingSystem: 'latn',
		useGrouping: false
	}).format(num);
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

// Translation helper with fallback
export function t(key: string, fallback?: string): string {
	const translation = get(_)(key);
	// If translation equals the key, it means the translation wasn't found
	if (translation === key && fallback) {
		return fallback;
	}
	return translation;
}