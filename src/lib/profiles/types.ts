import type { CountryProfile } from '../hijri/types.js';

/**
 * Interface for country profile detection
 */
export interface ProfileDetector {
	detectFromIP(ip: string): CountryProfile;
	detectFromLanguage(acceptLanguage: string): CountryProfile;
	detectFromTimezone(timezone: string): CountryProfile;
	getUserOverride(cookies: Record<string, string>): CountryProfile | null;
	detectCountry(options: {
		ip?: string;
		acceptLanguage?: string;
		timezone?: string;
		cookies?: Record<string, string>;
	}): CountryProfile;
}

/**
 * Detection options for country profile detection
 */
export interface DetectionOptions {
	ip?: string;
	acceptLanguage?: string;
	timezone?: string;
	cookies?: Record<string, string>;
}

/**
 * User preferences from cookies
 */
export interface UserPreferences {
	country?: string;
	method?: CountryProfile['method'];
	language?: 'ar' | 'en';
}