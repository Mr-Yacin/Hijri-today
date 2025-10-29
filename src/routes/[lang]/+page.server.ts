import type { PageServerLoad } from './$types';
import { detectCountryProfile, getUserProfileOverride } from '$lib/profiles/utils.js';
import { generateTodayData } from '$lib/utils/today-date.js';

export const load: PageServerLoad = async ({ request, cookies }) => {
	try {
		// Detect country profile using the same method as convert page
		const detectedProfile = await detectCountryProfile(request);
		const profile = getUserProfileOverride(cookies) || detectedProfile;
		
		// Generate today's data
		const todayData = generateTodayData(profile);
		
		return {
			hijriDate: todayData.hijri,
			gregorianDate: todayData.gregorian,
			profile: todayData.profile,
			method: todayData.method,
			country: todayData.country
		};
		
	} catch (error) {
		console.error('Error in homepage server load:', error);
		
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
			error: 'Failed to load date data, showing fallback'
		};
	}
};