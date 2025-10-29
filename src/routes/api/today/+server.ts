import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { detectCountryProfile, getUserProfileOverride, getProfileByCountry } from '$lib/profiles/utils.js';
import { rateLimit } from '$lib/utils/rate-limit.js';
import { generateTodayData, getCacheTTLUntilMidnight } from '$lib/utils/today-date.js';

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

		// Get profile
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

		// Generate today's data
		const todayData = generateTodayData(profile);
		const processingTime = Date.now() - startTime;
		const secondsUntilMidnight = getCacheTTLUntilMidnight();

		return json({
			hijri: todayData.hijri,
			gregorian: todayData.gregorian,
			method: todayData.method,
			country: todayData.country,
			offset: profile.offset,
			timestamp: todayData.timestamp,
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