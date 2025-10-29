import type { CountryProfile } from '../hijri/types.js';
import { CountryProfileDetector } from './detector.js';
import { parseCookies, getUserPreferences } from './cookies.js';
import { getAllProfiles as getAllProfilesFromConfig, getCountryProfile } from './config.js';

// Global detector instance
const detector = new CountryProfileDetector();

/**
 * Detect country profile from SvelteKit request
 * @param request - SvelteKit request object
 * @returns Promise<CountryProfile> - Detected country profile
 */
export async function detectCountryFromRequest(request: Request): Promise<CountryProfile> {
	// Extract detection data from request
	const ip = request.headers.get('x-forwarded-for') || 
	          request.headers.get('x-real-ip') || 
	          request.headers.get('cf-connecting-ip') || 
	          '127.0.0.1';
	
	const acceptLanguage = request.headers.get('accept-language') || '';
	const cookieHeader = request.headers.get('cookie') || '';
	const cookies = parseCookies(cookieHeader);
	
	// Get Cloudflare country detection (most reliable)
	const cfCountry = request.headers.get('cf-ipcountry') || '';
	
	// Try to get timezone from cookies or headers
	const timezone = cookies['timezone'] || 
	                request.headers.get('cf-timezone') || 
	                Intl.DateTimeFormat().resolvedOptions().timeZone;

	// Use comprehensive detection with improved priority
	return await detector.detectCountry({
		ip: ip.split(',')[0].trim(), // Use first IP if multiple
		acceptLanguage,
		timezone,
		cookies,
		cfCountry, // Add Cloudflare detection
		useGeolocationAPI: true // Enable geolocation API for better accuracy
	});
}

/**
 * Detect country profile from browser environment
 * @param options - Browser detection options
 * @returns CountryProfile - Detected country profile
 */
export async function detectCountryFromBrowser(options: {
	cookies?: Record<string, string>;
	language?: string;
	timezone?: string;
} = {}): Promise<CountryProfile> {
	const cookies = options.cookies || {};
	const language = options.language || navigator.language;
	const timezone = options.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

	return await detector.detectCountry({
		acceptLanguage: language,
		timezone,
		cookies,
		useGeolocationAPI: false // Don't use API in browser
	});
}

/**
 * Get effective country profile considering user preferences
 * @param detectedProfile - Profile detected from request/browser
 * @param userPreferences - User preferences from cookies
 * @returns CountryProfile - Final profile to use
 */
export async function getEffectiveProfile(
	detectedProfile: CountryProfile,
	userPreferences: ReturnType<typeof getUserPreferences>
): Promise<CountryProfile> {
	// If user has country override, use it
	if (userPreferences.country) {
		const { getCountryProfile } = await import('./config.js');
		const overrideProfile = getCountryProfile(userPreferences.country);
		if (overrideProfile) {
			return overrideProfile;
		}
	}

	// If user has method override, modify detected profile
	if (userPreferences.method && userPreferences.method !== detectedProfile.method) {
		return {
			...detectedProfile,
			method: userPreferences.method
		};
	}

	return detectedProfile;
}

/**
 * Create a profile detector instance
 * @returns CountryProfileDetector instance
 */
export function createDetector(): CountryProfileDetector {
	return new CountryProfileDetector();
}

/**
 * Get client IP from various headers
 * @param request - Request object
 * @returns string - Client IP address
 */
export function getClientIP(request: Request): string {
	// Try various headers in order of preference
	const headers = [
		'x-forwarded-for',
		'x-real-ip',
		'cf-connecting-ip',
		'x-client-ip',
		'x-forwarded',
		'forwarded-for',
		'forwarded'
	];

	for (const header of headers) {
		const value = request.headers.get(header);
		if (value) {
			// Handle comma-separated IPs (take the first one)
			const ip = value.split(',')[0].trim();
			if (ip && ip !== '127.0.0.1' && ip !== '::1') {
				return ip;
			}
		}
	}

	return '127.0.0.1'; // Fallback
}

/**
 * Validate and normalize country code
 * @param countryCode - Country code to validate
 * @returns string | null - Normalized country code or null if invalid
 */
export function normalizeCountryCode(countryCode: string): string | null {
	if (!countryCode || typeof countryCode !== 'string') {
		return null;
	}

	const normalized = countryCode.trim().toUpperCase();
	
	// Basic validation - should be 2 characters
	if (normalized.length !== 2) {
		return null;
	}

	// Check if it contains only letters
	if (!/^[A-Z]{2}$/.test(normalized)) {
		return null;
	}

	return normalized;
}

/**
 * Get all available country profiles
 * @returns CountryProfile[] - Array of all available profiles
 */
export function getAllProfiles(): CountryProfile[] {
	return getAllProfilesFromConfig();
}

/**
 * Get country profile by country code
 * @param countryCode - Two-letter country code
 * @returns CountryProfile | null - Profile for the country or null if not found
 */
export function getProfileByCountry(countryCode: string): CountryProfile | null {
	return getCountryProfile(countryCode);
}

/**
 * Detect country profile from request (wrapper function)
 * @param request - Request object
 * @returns Promise<CountryProfile> - Detected country profile
 */
export async function detectCountryProfile(request: Request): Promise<CountryProfile> {
	return detectCountryFromRequest(request);
}

/**
 * Get user profile override from cookies (wrapper function)
 * @param cookies - SvelteKit cookies object
 * @returns CountryProfile | null - User override profile or null
 */
export function getUserProfileOverride(cookies: any): CountryProfile | null {
	// Convert SvelteKit cookies to plain object
	const cookieObj: Record<string, string> = {};
	
	// Try to get cookies using SvelteKit's cookies.getAll() if available
	if (cookies && typeof cookies.getAll === 'function') {
		const allCookies = cookies.getAll();
		for (const cookie of allCookies) {
			cookieObj[cookie.name] = cookie.value;
		}
	} else if (cookies && typeof cookies.get === 'function') {
		// Fallback: try common cookie names
		const cookieNames = ['hijri-country', 'country', 'hijri-method', 'method'];
		for (const name of cookieNames) {
			const value = cookies.get(name);
			if (value) {
				cookieObj[name] = value;
			}
		}
	}

	// Use the detector to get user override
	const detector = new CountryProfileDetector();
	return detector.getUserOverride(cookieObj);
}
