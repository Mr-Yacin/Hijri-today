import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { HijriEngine } from '$lib/hijri/engine.js';
import { detectCountryProfile, getUserProfileOverride } from '$lib/profiles/utils.js';
import type { HijriDate } from '$lib/hijri/types.js';

export const GET: RequestHandler = async ({ url, request, cookies }) => {
	const startTime = Date.now();
	
	try {
		// Parse query parameters
		const searchParams = url.searchParams;
		const year = searchParams.get('year');
		const month = searchParams.get('month');
		const day = searchParams.get('day');
		const country = searchParams.get('country');

		if (!year || !month || !day) {
			return json({
				error: {
					code: 'MISSING_PARAMETERS',
					message: 'Missing required parameters: year, month, day'
				}
			}, { status: 400 });
		}

		// Initialize engine and get profile
		const engine = new HijriEngine();
		let profile;
		
		if (country) {
			// Use specific country if provided
			const { getProfileByCountry } = await import('$lib/profiles/utils.js');
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
			// Detect profile from request
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

export const POST: RequestHandler = async ({ request, cookies }) => {
	const startTime = Date.now();
	
	try {
		const body = await request.json();
		const { year, month, day, country } = body;

		if (!year || !month || !day) {
			return json({
				error: {
					code: 'MISSING_PARAMETERS',
					message: 'Missing required parameters: year, month, day'
				}
			}, { status: 400 });
		}

		// Initialize engine and get profile
		const engine = new HijriEngine();
		let profile;
		
		if (country) {
			const { getProfileByCountry } = await import('$lib/profiles/utils.js');
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