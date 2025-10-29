import type { PageServerLoad } from './$types.js';
import { HijriEngine } from '$lib/hijri/engine.js';
import { detectCountryProfile, getUserProfileOverride } from '$lib/profiles/utils.js';
import type { HijriDate, GregorianDate } from '$lib/hijri/types.js';

export const load: PageServerLoad = async ({ url, request, cookies }) => {
	const engine = new HijriEngine();
	
	// Detect country profile
	const detectedProfile = await detectCountryProfile(request);
	const userProfile = getUserProfileOverride(cookies) || detectedProfile;
	
	// Parse URL parameters for conversion state
	const searchParams = url.searchParams;
	const mode = searchParams.get('mode') || 'gToH'; // gToH or hToG
	
	let initialConversion: {
		input: HijriDate | GregorianDate | null;
		result: HijriDate | GregorianDate | null;
		mode: 'gToH' | 'hToG';
		error?: string;
	} = {
		input: null,
		result: null,
		mode: mode as 'gToH' | 'hToG'
	};
	
	try {
		if (mode === 'gToH') {
			const year = searchParams.get('gy');
			const month = searchParams.get('gm');
			const day = searchParams.get('gd');
			
			if (year && month && day) {
				const gregorianDate: GregorianDate = {
					year: parseInt(year),
					month: parseInt(month),
					day: parseInt(day)
				};
				
				if (engine.isValidGregorianDate(gregorianDate)) {
					const hijriResult = engine.gregorianToHijri(gregorianDate, userProfile);
					initialConversion = {
						input: gregorianDate,
						result: hijriResult,
						mode: 'gToH'
					};
				} else {
					initialConversion.error = 'errors.invalid_gregorian_date';
				}
			}
		} else if (mode === 'hToG') {
			const year = searchParams.get('hy');
			const month = searchParams.get('hm');
			const day = searchParams.get('hd');
			
			if (year && month && day) {
				const hijriDate: HijriDate = {
					year: parseInt(year),
					month: parseInt(month),
					day: parseInt(day)
				};
				
				if (engine.isValidHijriDate(hijriDate)) {
					const gregorianResult = engine.hijriToGregorian(hijriDate, userProfile);
					initialConversion = {
						input: hijriDate,
						result: gregorianResult,
						mode: 'hToG'
					};
				} else {
					initialConversion.error = 'errors.invalid_hijri_date';
				}
			}
		}
	} catch (error) {
		initialConversion.error = error instanceof Error ? error.message : 'errors.conversion_error_server';
	}
	
	// Get supported date ranges for validation
	const supportedRange = engine.getSupportedRange();
	
	return {
		profile: userProfile,
		initialConversion,
		supportedRange
	};
};