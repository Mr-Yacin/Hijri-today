// Import and re-export from hijri types
import type { CountryProfile } from '../hijri/types.js';
export type { CountryProfile } from '../hijri/types.js';

// Country profile types
export interface ProfileDetector {
	detectFromIP(ip: string): CountryProfile;
	detectFromLanguage(acceptLanguage: string): CountryProfile;
	detectFromTimezone(timezone: string): CountryProfile;
	getUserOverride(cookies: Record<string, string>): CountryProfile | null;
}