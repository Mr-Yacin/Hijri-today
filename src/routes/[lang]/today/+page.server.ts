import type { PageServerLoad } from './$types';
import { detectCountryProfile, getUserProfileOverride } from '$lib/profiles/utils.js';
import { generateTodayData, getCacheTTLUntilMidnight } from '$lib/utils/today-date.js';

export const load: PageServerLoad = async ({ request, cookies, params }) => {
	try {
		// Detect country profile
		const detectedProfile = await detectCountryProfile(request);
		const profile = getUserProfileOverride(cookies) || detectedProfile;
		
		// Generate today's data
		const todayData = generateTodayData(profile);
		
		// Set cache headers for edge caching
		const cacheMaxAge = getCacheTTLUntilMidnight();
		
		return {
			hijriDate: todayData.hijri,
			gregorianDate: todayData.gregorian,
			profile: todayData.profile,
			method: todayData.method,
			country: todayData.country,
			timestamp: todayData.timestamp,
			cacheHeaders: {
				'Cache-Control': `public, max-age=${Math.max(cacheMaxAge, 60)}, s-maxage=${Math.max(cacheMaxAge, 60)}`,
				'Vary': 'Accept-Language, CF-IPCountry'
			}
		};
		
	} catch (error) {
		console.error('Error in today page server load:', error);
		
		// Fallback to default profile and current date
		const { getDefaultProfile } = await import('$lib/profiles/config.js');
		const defaultProfile = getDefaultProfile();
		const fallbackData = generateTodayData(defaultProfile);
		
		return {
			hijriDate: fallbackData.hijri,
			gregorianDate: fallbackData.gregorian,
			profile: fallbackData.profile,
			method: fallbackData.method,
			country: fallbackData.country,
			timestamp: fallbackData.timestamp,
			error: 'Failed to load today data, showing fallback',
			cacheHeaders: {
				'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes for error case
				'Vary': 'Accept-Language'
			}
		};
	}
};