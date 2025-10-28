import type { CountryProfile } from '../hijri/types.js';
import profilesData from './data.json';

// Type-safe country profiles data
const COUNTRY_PROFILES = profilesData as Record<string, CountryProfile>;

/**
 * Get country profile by country code
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns CountryProfile or null if not found
 */
export function getCountryProfile(countryCode: string): CountryProfile | null {
	const normalizedCode = countryCode.toUpperCase();
	return COUNTRY_PROFILES[normalizedCode] || null;
}

/**
 * Get default country profile (Saudi Arabia - Umm al-Qura)
 * @returns Default CountryProfile
 */
export function getDefaultProfile(): CountryProfile {
	return COUNTRY_PROFILES.DEFAULT;
}

/**
 * Get all available country profiles
 * @returns Array of all CountryProfile objects
 */
export function getAllProfiles(): CountryProfile[] {
	return Object.values(COUNTRY_PROFILES).filter(profile => profile.country !== 'DEFAULT');
}

/**
 * Get country profiles by calculation method
 * @param method - Calculation method to filter by
 * @returns Array of CountryProfile objects using the specified method
 */
export function getProfilesByMethod(method: CountryProfile['method']): CountryProfile[] {
	return getAllProfiles().filter(profile => profile.method === method);
}

/**
 * Validate country profile data
 * @param profile - CountryProfile to validate
 * @returns boolean indicating if profile is valid
 */
export function validateProfile(profile: any): profile is CountryProfile {
	if (!profile || typeof profile !== 'object') {
		return false;
	}

	// Check required string fields
	if (typeof profile.country !== 'string' || profile.country.length !== 2) {
		return false;
	}

	// Check method is valid
	const validMethods = ['ummalqura', 'moonsighting_national', 'diyanet'];
	if (!validMethods.includes(profile.method)) {
		return false;
	}

	// Check offset is a number
	if (typeof profile.offset !== 'number' || !Number.isInteger(profile.offset)) {
		return false;
	}

	// Check offset is within reasonable range (-2 to +2 days)
	if (profile.offset < -2 || profile.offset > 2) {
		return false;
	}

	// Check displayName structure
	if (!profile.displayName || typeof profile.displayName !== 'object') {
		return false;
	}

	if (typeof profile.displayName.ar !== 'string' || typeof profile.displayName.en !== 'string') {
		return false;
	}

	// Check timezone is a string
	if (typeof profile.timezone !== 'string' || profile.timezone.length === 0) {
		return false;
	}

	return true;
}

/**
 * Get country profile with fallback to default
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns CountryProfile (never null, falls back to default)
 */
export function getProfileWithFallback(countryCode: string): CountryProfile {
	const profile = getCountryProfile(countryCode);
	return profile || getDefaultProfile();
}

/**
 * Check if a country code is supported
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns boolean indicating if country is supported
 */
export function isCountrySupported(countryCode: string): boolean {
	return getCountryProfile(countryCode) !== null;
}

/**
 * Get supported country codes
 * @returns Array of supported country codes
 */
export function getSupportedCountries(): string[] {
	return getAllProfiles().map(profile => profile.country);
}