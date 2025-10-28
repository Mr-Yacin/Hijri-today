import type { PageServerLoad } from './$types';
import { HijriEngine } from '$lib/hijri/engine.js';
import { CountryProfileDetector } from '$lib/profiles/detector.js';
import type { CountryProfile, HijriDate, GregorianDate } from '$lib/hijri/types.js';

// Cache interface for edge caching
interface TodayCache {
	hijri: HijriDate;
	gregorian: GregorianDate;
	method: string;
	country: string;
	profile: CountryProfile;
	nextRefresh: string; // ISO timestamp for midnight
	timestamp: number;
}

// Initialize engine and detector
const hijriEngine = new HijriEngine();
const profileDetector = new CountryProfileDetector();

// Cache TTL in milliseconds (1 hour)
const CACHE_TTL = 60 * 60 * 1000;

// Get cache key for country-specific today data
function getCacheKey(countryCode: string): string {
	return `today:${countryCode}:${new Date().toISOString().split('T')[0]}`;
}

// Calculate next midnight in local timezone
function getNextMidnight(timezone: string): Date {
	const now = new Date();
	const tomorrow = new Date(now);
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);
	
	// For edge deployment, we'll use UTC midnight as approximation
	// In production, this would use proper timezone handling
	return tomorrow;
}

// Check if cache entry is still valid
function isCacheValid(cache: TodayCache): boolean {
	const now = Date.now();
	const nextRefresh = new Date(cache.nextRefresh).getTime();
	
	// Cache is valid if we haven't reached the next refresh time
	return now < nextRefresh && (now - cache.timestamp) < CACHE_TTL;
}

// Generate today's data for a given profile
function generateTodayData(profile: CountryProfile): TodayCache {
	const now = new Date();
	const gregorianToday: GregorianDate = {
		year: now.getFullYear(),
		month: now.getMonth() + 1,
		day: now.getDate()
	};
	
	const hijriToday = hijriEngine.getTodayHijri(profile);
	const nextMidnight = getNextMidnight(profile.timezone);
	
	return {
		hijri: hijriToday,
		gregorian: gregorianToday,
		method: profile.method,
		country: profile.country,
		profile,
		nextRefresh: nextMidnight.toISOString(),
		timestamp: Date.now()
	};
}

export const load: PageServerLoad = async ({ request, cookies, getClientAddress, params }) => {
	try {
		// Extract detection parameters from request
		const clientIP = getClientAddress();
		const acceptLanguage = request.headers.get('accept-language') || '';
		const userAgent = request.headers.get('user-agent') || '';
		
		// Get timezone from user agent or default (simplified approach)
		// In production, this would use more sophisticated timezone detection
		const timezone = 'UTC'; // Fallback for edge deployment
		
		// Convert cookies to record
		const cookieRecord: Record<string, string> = {};
		cookies.getAll().forEach(cookie => {
			cookieRecord[cookie.name] = cookie.value;
		});
		
		// Detect country profile using multiple methods
		const profile = profileDetector.detectCountry({
			ip: clientIP,
			acceptLanguage,
			timezone,
			cookies: cookieRecord
		});
		
		const cacheKey = getCacheKey(profile.country);
		
		// Try to get cached data (in production, this would use KV store)
		// For now, we'll generate fresh data each time
		let todayData: TodayCache;
		
		// In production with KV store:
		// const cachedData = await KV.get(cacheKey);
		// if (cachedData) {
		//   const parsed = JSON.parse(cachedData) as TodayCache;
		//   if (isCacheValid(parsed)) {
		//     todayData = parsed;
		//   }
		// }
		
		// Generate fresh data
		todayData = generateTodayData(profile);
		
		// In production with KV store:
		// await KV.put(cacheKey, JSON.stringify(todayData), {
		//   expirationTtl: Math.floor(CACHE_TTL / 1000)
		// });
		
		// Set cache headers for edge caching
		const cacheMaxAge = Math.floor((new Date(todayData.nextRefresh).getTime() - Date.now()) / 1000);
		
		return {
			hijriDate: todayData.hijri,
			gregorianDate: todayData.gregorian,
			profile: todayData.profile,
			method: todayData.method,
			country: todayData.country,
			nextRefresh: todayData.nextRefresh,
			cacheHeaders: {
				'Cache-Control': `public, max-age=${Math.max(cacheMaxAge, 60)}, s-maxage=${Math.max(cacheMaxAge, 60)}`,
				'Vary': 'Accept-Language, CF-IPCountry'
			}
		};
		
	} catch (error) {
		console.error('Error in today page server load:', error);
		
		// Fallback to default profile and current date
		const defaultProfile = profileDetector.detectCountry({});
		const fallbackData = generateTodayData(defaultProfile);
		
		return {
			hijriDate: fallbackData.hijri,
			gregorianDate: fallbackData.gregorian,
			profile: fallbackData.profile,
			method: fallbackData.method,
			country: fallbackData.country,
			nextRefresh: fallbackData.nextRefresh,
			error: 'Failed to load today data, showing fallback',
			cacheHeaders: {
				'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes for error case
				'Vary': 'Accept-Language'
			}
		};
	}
};