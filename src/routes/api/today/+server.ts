import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { HijriEngine } from '$lib/hijri/engine.js';
import { detectCountryProfile, getUserProfileOverride, getProfileByCountry } from '$lib/profiles/utils.js';
import { rateLimit } from '$lib/utils/rate-limit.js';

export const GET: RequestHandler = async ({ url, request, cookies, getClientAddress }) => {
	const startTime = Date.now();
	
	try {
		// Apply rate limiting (more lenient for today endpoint)
		const clientIP = getClientAddress();
		const rateLimitResult = await rateLimit(clientIP, 'api-today');
		
		if (!rateLimitResult.allowed) {
			return json({
				error: {
					code: 'RATE_LIMIT_EXCEEDED',
					message: 'Too many requests. Please try again later.',
					retryAfter: rateLimitResult.retryAfter
				}
			}, { 
				status: 429,
				headers: {
					'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
				}
			});
		}

		// Parse query parameters
		const searchParams = url.searchParams;
		const country = searchParams.get('country');

		// Initialize engine and get profile
		const engine = new HijriEngine();
		let profile;
		
		if (country) {
			profile = getProfileByCountry(country);
			if (!profile) {
				return json({
					error: {
						code: 'INVALID_COUNTRY',
						message: `Unsupported country code: ${country}`
					}
				}, { status: 400 });
			}
		} else {
			const detectedProfile = await detectCountryProfile(request);
			profile = getUserProfileOverride(cookies) || detectedProfile;
		}

		// Get today's date
		const today = new Date();
		const gregorianToday = {
			year: today.getFullYear(),
			month: today.getMonth() + 1,
			day: today.getDate()
		};

		const hijriToday = engine.getTodayHijri(profile);
		const processingTime = Date.now() - startTime;

		// Calculate cache TTL until midnight local time
		const now = new Date();
		const midnight = new Date(now);
		midnight.setHours(24, 0, 0, 0); // Next midnight
		const secondsUntilMidnight = Math.floor((midnight.getTime() - now.getTime()) / 1000);

		return json({
			hijri: hijriToday,
			gregorian: gregorianToday,
			method: profile.method,
			country: profile.country,
			offset: profile.offset,
			timestamp: now.toISOString(),
			processingTime
		}, {
			headers: {
				'Cache-Control': `public, max-age=${Math.min(secondsUntilMidnight, 3600)}`, // Cache until midnight or 1 hour max
				'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0'
			}
		});

	} catch (error) {
		const processingTime = Date.now() - startTime;
		
		return json({
			error: {
				code: 'TODAY_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error getting today\'s date'
			},
			processingTime
		}, { status: 500 });
	}
};