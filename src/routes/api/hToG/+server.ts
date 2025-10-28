import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { HijriEngine } from '$lib/hijri/engine.js';
import { detectCountryProfile, getUserProfileOverride, getProfileByCountry } from '$lib/profiles/utils.js';
import type { HijriDate } from '$lib/hijri/types.js';
import { rateLimit } from '$lib/utils/rate-limit.js';

export const GET: RequestHandler = async ({ url, request, cookies, getClientAddress }) => {
	const startTime = Date.now();
	
	try {
		// Apply rate limiting
		const clientIP = getClientAddress();
		const rateLimitResult = await rateLimit(clientIP, 'api-conversion');
		
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
		const dateParam = searchParams.get('date');
		const country = searchParams.get('country');

		// Support both date parameter and individual year/month/day parameters
		let year: string | null, month: string | null, day: string | null;
		
		if (dateParam) {
			// Parse date in YYYY-MM-DD format for Hijri (e.g., 1447-05-03)
			const dateParts = dateParam.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
			if (!dateParts) {
				return json({
					error: {
						code: 'INVALID_DATE_FORMAT',
						message: 'Date must be in YYYY-MM-DD format'
					}
				}, { status: 400 });
			}
			[, year, month, day] = dateParts;
		} else {
			year = searchParams.get('year');
			month = searchParams.get('month');
			day = searchParams.get('day');
		}

		if (!year || !month || !day) {
			return json({
				error: {
					code: 'MISSING_PARAMETERS',
					message: 'Missing required parameters. Use either "date" (YYYY-MM-DD) or "year", "month", "day"'
				}
			}, { status: 400 });
		}

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

		// Validate and convert date
		const hijriDate: HijriDate = {
			year: parseInt(year),
			month: parseInt(month),
			day: parseInt(day)
		};

		if (!engine.isValidHijriDate(hijriDate)) {
			return json({
				error: {
					code: 'INVALID_DATE',
					message: 'Invalid Hijri date or date out of supported range'
				}
			}, { status: 400 });
		}

		const gregorianResult = engine.hijriToGregorian(hijriDate, profile);
		const processingTime = Date.now() - startTime;

		return json({
			gregorian: gregorianResult,
			hijri: hijriDate,
			method: profile.method,
			country: profile.country,
			offset: profile.offset,
			processingTime
		}, {
			headers: {
				'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
				'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0'
			}
		});

	} catch (error) {
		const processingTime = Date.now() - startTime;
		
		return json({
			error: {
				code: 'CONVERSION_ERROR',
				message: error instanceof Error ? error.message : 'Unknown conversion error'
			},
			processingTime
		}, { status: 500 });
	}
};