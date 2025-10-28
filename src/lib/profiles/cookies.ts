import type { CountryProfile } from '../hijri/types.js';

/**
 * Cookie names for user preferences
 */
export const COOKIE_NAMES = {
	COUNTRY: 'hijri-country',
	METHOD: 'hijri-method',
	LANGUAGE: 'hijri-language'
} as const;

/**
 * Cookie options for user preferences
 */
export const COOKIE_OPTIONS = {
	maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
	path: '/',
	sameSite: 'lax' as const,
	secure: true,
	httpOnly: false // Allow client-side access for language switching
};

/**
 * Set country preference cookie
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Cookie string for Set-Cookie header
 */
export function setCountryCookie(countryCode: string): string {
	const value = countryCode.toUpperCase();
	return `${COOKIE_NAMES.COUNTRY}=${value}; Max-Age=${COOKIE_OPTIONS.maxAge}; Path=${COOKIE_OPTIONS.path}; SameSite=${COOKIE_OPTIONS.sameSite}; Secure`;
}

/**
 * Set method preference cookie
 * @param method - Calculation method
 * @returns Cookie string for Set-Cookie header
 */
export function setMethodCookie(method: CountryProfile['method']): string {
	return `${COOKIE_NAMES.METHOD}=${method}; Max-Age=${COOKIE_OPTIONS.maxAge}; Path=${COOKIE_OPTIONS.path}; SameSite=${COOKIE_OPTIONS.sameSite}; Secure`;
}

/**
 * Set language preference cookie
 * @param language - Language code (ar or en)
 * @returns Cookie string for Set-Cookie header
 */
export function setLanguageCookie(language: 'ar' | 'en'): string {
	return `${COOKIE_NAMES.LANGUAGE}=${language}; Max-Age=${COOKIE_OPTIONS.maxAge}; Path=${COOKIE_OPTIONS.path}; SameSite=${COOKIE_OPTIONS.sameSite}; Secure`;
}

/**
 * Clear country preference cookie
 * @returns Cookie string for Set-Cookie header to clear the cookie
 */
export function clearCountryCookie(): string {
	return `${COOKIE_NAMES.COUNTRY}=; Max-Age=0; Path=${COOKIE_OPTIONS.path}`;
}

/**
 * Clear method preference cookie
 * @returns Cookie string for Set-Cookie header to clear the cookie
 */
export function clearMethodCookie(): string {
	return `${COOKIE_NAMES.METHOD}=; Max-Age=0; Path=${COOKIE_OPTIONS.path}`;
}

/**
 * Clear language preference cookie
 * @returns Cookie string for Set-Cookie header to clear the cookie
 */
export function clearLanguageCookie(): string {
	return `${COOKIE_NAMES.LANGUAGE}=; Max-Age=0; Path=${COOKIE_OPTIONS.path}`;
}

/**
 * Parse cookies from request header
 * @param cookieHeader - Cookie header value
 * @returns Object with cookie key-value pairs
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
	if (!cookieHeader || typeof cookieHeader !== 'string') {
		return {};
	}

	const cookies: Record<string, string> = {};
	
	cookieHeader.split(';').forEach(cookie => {
		const [name, ...rest] = cookie.split('=');
		if (name && rest.length > 0) {
			const value = rest.join('=');
			cookies[name.trim()] = decodeURIComponent(value.trim());
		}
	});

	return cookies;
}

/**
 * Get user preferences from cookies
 * @param cookies - Cookie key-value pairs
 * @returns User preferences object
 */
export function getUserPreferences(cookies: Record<string, string>): {
	country?: string;
	method?: CountryProfile['method'];
	language?: 'ar' | 'en';
} {
	const preferences: {
		country?: string;
		method?: CountryProfile['method'];
		language?: 'ar' | 'en';
	} = {};

	// Get country preference
	const country = cookies[COOKIE_NAMES.COUNTRY];
	if (country && typeof country === 'string' && country.length === 2) {
		preferences.country = country.toUpperCase();
	}

	// Get method preference
	const method = cookies[COOKIE_NAMES.METHOD];
	const validMethods: CountryProfile['method'][] = ['ummalqura', 'moonsighting_national', 'diyanet'];
	if (method && validMethods.includes(method as CountryProfile['method'])) {
		preferences.method = method as CountryProfile['method'];
	}

	// Get language preference
	const language = cookies[COOKIE_NAMES.LANGUAGE];
	if (language === 'ar' || language === 'en') {
		preferences.language = language;
	}

	return preferences;
}