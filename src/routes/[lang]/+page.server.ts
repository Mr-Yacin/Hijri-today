import type { PageServerLoad } from './$types';
import { HijriEngine } from '$lib/hijri/engine.js';
import { detectCountryProfile, getUserProfileOverride } from '$lib/profiles/utils.js';
import type { CountryProfile, GregorianDate } from '$lib/hijri/types.js';

// Initialize engine
const hijriEngine = new HijriEngine();

// Generate today's data for a given profile
function generateTodayData(profile: CountryProfile) {
	const now = new Date();
	const gregorianToday: GregorianDate = {
		year: now.getFullYear(),
		month: now.getMonth() + 1,
		day: now.getDate()
	};
	
	const hijriToday = hijriEngine.getTodayHijri(profile);
	
	return {
		hijri: hijriToday,
		gregorian: gregorianToday,
		method: profile.method,
		country: profile.country,
		profile
	};
}

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