import type { CountryProfile, ProfileDetector } from './types.js';
import { getCountryProfile, getDefaultProfile, getProfileWithFallback } from './config.js';

// IP-based country detection mapping (simplified for common ranges)
const IP_COUNTRY_MAPPING: Record<string, string> = {
	// Saudi Arabia
	'37.': 'SA',
	'46.': 'SA',
	'78.186.': 'SA',
	'188.': 'SA',
	
	// UAE
	'5.': 'AE',
	'31.': 'AE',
	'213.': 'AE',
	
	// Egypt
	'41.': 'EG',
	'62.': 'EG',
	'196.203.': 'EG',
	
	// Turkey
	'78.': 'TR',
	'88.': 'TR',
	'176.': 'TR',
	
	// Morocco
	'105.': 'MA',
	'154.': 'MA',
	'196.200.': 'MA',
	
	// Pakistan
	'39.': 'PK',
	'58.': 'PK',
	'103.31.': 'PK',
	
	// India
	'14.': 'IN',
	'27.': 'IN',
	'103.21.': 'IN',
	'117.': 'IN',
	
	// Indonesia
	'36.': 'ID',
	'103.28.': 'ID',
	'114.': 'ID',
	
	// Malaysia
	'103.16.': 'MY',
	'175.': 'MY',
	'202.': 'MY'
};

// Language to country mapping
const LANGUAGE_COUNTRY_MAPPING: Record<string, string> = {
	'ar-SA': 'SA',
	'ar-AE': 'AE',
	'ar-EG': 'EG',
	'ar-MA': 'MA',
	'ar-JO': 'JO',
	'ar-LB': 'LB',
	'ar-SY': 'SY',
	'ar-IQ': 'IQ',
	'ar-KW': 'KW',
	'ar-QA': 'QA',
	'ar-BH': 'BH',
	'ar-OM': 'OM',
	'tr-TR': 'TR',
	'tr': 'TR',
	'ur-PK': 'PK',
	'ur': 'PK',
	'hi-IN': 'IN',
	'hi': 'IN',
	'bn-BD': 'BD',
	'bn': 'BD',
	'ms-MY': 'MY',
	'ms': 'MY',
	'id-ID': 'ID',
	'id': 'ID',
	'fa-IR': 'IR',
	'fa': 'IR'
};

// Timezone to country mapping
const TIMEZONE_COUNTRY_MAPPING: Record<string, string> = {
	'Asia/Riyadh': 'SA',
	'Asia/Dubai': 'AE',
	'Asia/Kuwait': 'KW',
	'Asia/Qatar': 'QA',
	'Asia/Bahrain': 'BH',
	'Asia/Muscat': 'OM',
	'Africa/Cairo': 'EG',
	'Europe/Istanbul': 'TR',
	'Africa/Casablanca': 'MA',
	'Asia/Amman': 'JO',
	'Asia/Beirut': 'LB',
	'Asia/Damascus': 'SY',
	'Asia/Baghdad': 'IQ',
	'Asia/Tehran': 'IR',
	'Asia/Karachi': 'PK',
	'Asia/Kolkata': 'IN',
	'Asia/Dhaka': 'BD',
	'Asia/Kuala_Lumpur': 'MY',
	'Asia/Jakarta': 'ID'
};

export class CountryProfileDetector implements ProfileDetector {
	/**
	 * Detect country from IP address
	 * Uses simplified IP range mapping for common country detection
	 * @param ip - IP address string
	 * @returns CountryProfile based on IP geolocation
	 */
	detectFromIP(ip: string): CountryProfile {
		if (!ip || typeof ip !== 'string') {
			return getDefaultProfile();
		}

		// Extract first octet or first two octets for basic detection
		const ipParts = ip.split('.');
		if (ipParts.length < 2) {
			return getDefaultProfile();
		}

		// Try first octet match
		const firstOctet = ipParts[0] + '.';
		if (IP_COUNTRY_MAPPING[firstOctet]) {
			const profile = getCountryProfile(IP_COUNTRY_MAPPING[firstOctet]);
			if (profile) return profile;
		}

		// Try first two octets match
		const firstTwoOctets = ipParts[0] + '.' + ipParts[1] + '.';
		if (IP_COUNTRY_MAPPING[firstTwoOctets]) {
			const profile = getCountryProfile(IP_COUNTRY_MAPPING[firstTwoOctets]);
			if (profile) return profile;
		}

		return getDefaultProfile();
	}

	/**
	 * Detect country from Accept-Language header
	 * Parses language preferences and maps to appropriate country
	 * @param acceptLanguage - Accept-Language header value
	 * @returns CountryProfile based on language preference
	 */
	detectFromLanguage(acceptLanguage: string): CountryProfile {
		if (!acceptLanguage || typeof acceptLanguage !== 'string') {
			return getDefaultProfile();
		}

		// Parse Accept-Language header (e.g., "ar-SA,ar;q=0.9,en;q=0.8")
		const languages = acceptLanguage
			.split(',')
			.map(lang => lang.split(';')[0].trim().toLowerCase())
			.filter(lang => lang.length > 0);

		// Try exact matches first (e.g., ar-SA)
		for (const lang of languages) {
			if (LANGUAGE_COUNTRY_MAPPING[lang]) {
				const profile = getCountryProfile(LANGUAGE_COUNTRY_MAPPING[lang]);
				if (profile) return profile;
			}
		}

		// Try base language matches (e.g., ar)
		for (const lang of languages) {
			const baseLang = lang.split('-')[0];
			if (LANGUAGE_COUNTRY_MAPPING[baseLang]) {
				const profile = getCountryProfile(LANGUAGE_COUNTRY_MAPPING[baseLang]);
				if (profile) return profile;
			}
		}

		// Default to Saudi Arabia for Arabic language
		if (languages.some(lang => lang.startsWith('ar'))) {
			return getProfileWithFallback('SA');
		}

		return getDefaultProfile();
	}

	/**
	 * Detect country from timezone
	 * Maps timezone identifiers to appropriate countries
	 * @param timezone - IANA timezone identifier
	 * @returns CountryProfile based on timezone
	 */
	detectFromTimezone(timezone: string): CountryProfile {
		if (!timezone || typeof timezone !== 'string') {
			return getDefaultProfile();
		}

		const normalizedTimezone = timezone.trim();
		
		// Direct timezone mapping
		if (TIMEZONE_COUNTRY_MAPPING[normalizedTimezone]) {
			const profile = getCountryProfile(TIMEZONE_COUNTRY_MAPPING[normalizedTimezone]);
			if (profile) return profile;
		}

		// Fallback based on timezone regions
		if (normalizedTimezone.startsWith('Asia/')) {
			// Default to Saudi Arabia for Middle East
			if (normalizedTimezone.includes('Riyadh') || normalizedTimezone.includes('Mecca')) {
				return getProfileWithFallback('SA');
			}
			// Default to UAE for Gulf region
			if (normalizedTimezone.includes('Dubai') || normalizedTimezone.includes('Abu_Dhabi')) {
				return getProfileWithFallback('AE');
			}
		}

		if (normalizedTimezone.startsWith('Africa/')) {
			// Default to Egypt for North Africa
			if (normalizedTimezone.includes('Cairo')) {
				return getProfileWithFallback('EG');
			}
			// Default to Morocco for West Africa
			if (normalizedTimezone.includes('Casablanca')) {
				return getProfileWithFallback('MA');
			}
		}

		if (normalizedTimezone.startsWith('Europe/')) {
			// Default to Turkey for European Muslim countries
			if (normalizedTimezone.includes('Istanbul')) {
				return getProfileWithFallback('TR');
			}
		}

		return getDefaultProfile();
	}

	/**
	 * Get user override from cookies
	 * Checks for user-set country preference in cookies
	 * @param cookies - Cookie key-value pairs
	 * @returns CountryProfile from user override or null if not set
	 */
	getUserOverride(cookies: Record<string, string>): CountryProfile | null {
		if (!cookies || typeof cookies !== 'object') {
			return null;
		}

		// Check for country override cookie
		const countryOverride = cookies['hijri-country'] || cookies['country'];
		if (countryOverride && typeof countryOverride === 'string') {
			const profile = getCountryProfile(countryOverride.toUpperCase());
			if (profile) return profile;
		}

		// Check for method override cookie (map to default country for that method)
		const methodOverride = cookies['hijri-method'] || cookies['method'];
		if (methodOverride && typeof methodOverride === 'string') {
			switch (methodOverride.toLowerCase()) {
				case 'ummalqura':
					return getProfileWithFallback('SA');
				case 'moonsighting_national':
					return getProfileWithFallback('PK');
				case 'diyanet':
					return getProfileWithFallback('TR');
			}
		}

		return null;
	}

	/**
	 * Comprehensive country detection using multiple methods
	 * Tries user override first, then IP, language, and timezone in order
	 * @param options - Detection options
	 * @returns CountryProfile using best available detection method
	 */
	detectCountry(options: {
		ip?: string;
		acceptLanguage?: string;
		timezone?: string;
		cookies?: Record<string, string>;
	}): CountryProfile {
		// 1. Check user override first (highest priority)
		if (options.cookies) {
			const override = this.getUserOverride(options.cookies);
			if (override) return override;
		}

		// 2. Try IP-based detection
		if (options.ip) {
			const ipProfile = this.detectFromIP(options.ip);
			// Only use IP detection if it's not the default (i.e., we found a match)
			if (ipProfile.country !== 'DEFAULT') {
				return ipProfile;
			}
		}

		// 3. Try language-based detection
		if (options.acceptLanguage) {
			const langProfile = this.detectFromLanguage(options.acceptLanguage);
			if (langProfile.country !== 'DEFAULT') {
				return langProfile;
			}
		}

		// 4. Try timezone-based detection
		if (options.timezone) {
			const timezoneProfile = this.detectFromTimezone(options.timezone);
			if (timezoneProfile.country !== 'DEFAULT') {
				return timezoneProfile;
			}
		}

		// 5. Fallback to default profile
		return getDefaultProfile();
	}
}