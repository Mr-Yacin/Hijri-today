import { HijriEngine } from '$lib/hijri/engine.js';
import type { CountryProfile, HijriDate, GregorianDate } from '$lib/hijri/types.js';

export interface TodayDateResult {
	hijri: HijriDate;
	gregorian: GregorianDate;
	method: string;
	country: string;
	profile: CountryProfile;
	timestamp: string;
}

// Initialize engine once
const hijriEngine = new HijriEngine();

/**
 * Generate today's date data for a given profile
 */
export function generateTodayData(profile: CountryProfile): TodayDateResult {
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
		profile,
		timestamp: now.toISOString()
	};
}

/**
 * Calculate cache TTL until midnight local time
 */
export function getCacheTTLUntilMidnight(): number {
	const now = new Date();
	const midnight = new Date(now);
	midnight.setHours(24, 0, 0, 0); // Next midnight
	return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}