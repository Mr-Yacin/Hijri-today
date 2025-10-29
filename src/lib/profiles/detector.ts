import type { CountryProfile, ProfileDetector } from './types.js';
import { getCountryProfile, getDefaultProfile, getProfileWithFallback } from './config.js';

// IP-based country detection mapping (expanded ranges - fallback only)
const IP_COUNTRY_MAPPING: Record<string, string> = {
	// Saudi Arabia
	'37.': 'SA',
	'46.': 'SA',
	'78.186.': 'SA',
	'188.': 'SA',
	'212.138.': 'SA',
	'213.130.': 'SA',
	
	// UAE
	'5.': 'AE',
	'31.': 'AE',
	'213.': 'AE',
	'85.158.': 'AE',
	'94.56.': 'AE',
	
	// Egypt
	'41.': 'EG',
	'62.': 'EG',
	'196.203.': 'EG',
	'197.': 'EG',
	'156.160.': 'EG',
	
	// Turkey
	'78.': 'TR',
	'88.': 'TR',
	'176.': 'TR',
	'95.': 'TR',
	'212.156.': 'TR',
	
	// Morocco - Expanded ranges
	'41.': 'MA',      // Maroc Telecom
	'42.': 'MA',      // Multiple ISPs
	'105.': 'MA',     // Maroc Telecom
	'154.': 'MA',     // Orange Morocco
	'160.': 'MA',     // INWI
	'188.': 'MA',     // Multiple ISPs
	'196.200.': 'MA', // Academic networks
	'196.217.': 'MA', // Government networks
	'212.217.': 'MA', // Commercial ISPs
	'213.136.': 'MA', // Maroc Telecom
	
	// Pakistan
	'39.': 'PK',
	'58.': 'PK',
	'103.31.': 'PK',
	'119.': 'PK',
	'180.': 'PK',
	
	// India
	'14.': 'IN',
	'27.': 'IN',
	'103.21.': 'IN',
	'117.': 'IN',
	'122.': 'IN',
	'157.': 'IN',
	
	// Indonesia
	'36.': 'ID',
	'103.28.': 'ID',
	'114.': 'ID',
	'125.': 'ID',
	'180.': 'ID',
	
	// Malaysia
	'103.16.': 'MY',
	'175.': 'MY',
	'202.': 'MY',
	'210.': 'MY'
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
	 * Detect country from Cloudflare's CF-IPCountry header (most reliable)
	 * @param cfCountry - CF-IPCountry header value
	 * @returns CountryProfile based on Cloudflare's geolocation
	 */
	detectFromCloudflare(cfCountry: string): CountryProfile {
		if (!cfCountry || typeof cfCountry !== 'string') {
			return getDefaultProfile();
		}

		const countryCode = cfCountry.trim().toUpperCase();
		
		// Direct country code mapping
		const profile = getCountryProfile(countryCode);
		if (profile) return profile;

		return getDefaultProfile();
	}

	/**
	 * Detect country from IP address using external geolocation service
	 * Uses simplified IP range mapping as fallback
	 * @param ip - IP address string
	 * @param useGeolocationAPI - Whether to use external geolocation API
	 * @returns CountryProfile based on IP geolocation
	 */
	async detectFromIP(ip: string, useGeolocationAPI: boolean = false): Promise<CountryProfile> {
		if (!ip || typeof ip !== 'string') {
			return getDefaultProfile();
		}

		// Try external geolocation API if enabled (server-side only)
		if (useGeolocationAPI && typeof window === 'undefined') {
			try {
				const { getCachedGeolocation } = await import('./geolocation.js');
				const geoResult = await getCachedGeolocation(ip);
				
				if (geoResult && geoResult.countryCode) {
					const profile = getCountryProfile(geoResult.countryCode);
					if (profile) return profile;
				}
			} catch (error) {
				console.warn('Geolocation API failed, falling back to IP ranges:', error);
			}
		}

		// Fallback to basic IP range detection
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
	 * Improved priority order with Cloudflare detection first
	 * @param options - Detection options
	 * @returns CountryProfile using best available detection method
	 */
	async detectCountry(options: {
		ip?: string;
		acceptLanguage?: string;
		timezone?: string;
		cookies?: Record<string, string>;
		cfCountry?: string; // Cloudflare CF-IPCountry header
		useGeolocationAPI?: boolean; // Whether to use external geolocation
	}): Promise<CountryProfile> {
		// 1. Check user override first (highest priority)
		if (options.cookies) {
			const override = this.getUserOverride(options.cookies);
			if (override) return override;
		}

		// 2. Try Cloudflare country detection (most reliable)
		if (options.cfCountry) {
			const cfProfile = this.detectFromCloudflare(options.cfCountry);
			if (cfProfile.country !== 'DEFAULT') {
				return cfProfile;
			}
		}

		// 3. Try timezone-based detection (more reliable than IP ranges)
		if (options.timezone) {
			const timezoneProfile = this.detectFromTimezone(options.timezone);
			if (timezoneProfile.country !== 'DEFAULT') {
				return timezoneProfile;
			}
		}

		// 4. Try IP-based detection (with optional geolocation API)
		if (options.ip) {
			const ipProfile = await this.detectFromIP(options.ip, options.useGeolocationAPI);
			if (ipProfile.country !== 'DEFAULT') {
				return ipProfile;
			}
		}

		// 5. Skip language detection (unreliable for location)
		// Language is user preference, not location indicator

		// 6. Fallback to default profile
		return getDefaultProfile();
	}
}