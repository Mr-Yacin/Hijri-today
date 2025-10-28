import type { RequestHandler } from './$types.js';
import { HijriEngine } from '$lib/hijri/engine.js';
import { getProfileByCountry } from '$lib/profiles/utils.js';
import { rateLimit } from '$lib/utils/rate-limit.js';
import { generateMonthlyICS } from '$lib/utils/ics-generator.js';

export const GET: RequestHandler = async ({ params, url, getClientAddress }) => {
	try {
		// Apply rate limiting
		const clientIP = getClientAddress();
		const rateLimitResult = await rateLimit(clientIP, 'api-ics');
		
		if (!rateLimitResult.allowed) {
			return new Response('Rate limit exceeded', { 
				status: 429,
				headers: {
					'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
				}
			});
		}

		const { country, year, month } = params;
		const yearNum = parseInt(year);
		const monthNum = parseInt(month);

		// Validate country
		const profile = getProfileByCountry(country);
		if (!profile) {
			return new Response('Invalid country code', { status: 400 });
		}

		// Validate year and month
		if (isNaN(yearNum) || yearNum < 1300 || yearNum > 1500) {
			return new Response('Invalid year. Must be between 1300 and 1500 AH', { status: 400 });
		}

		if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
			return new Response('Invalid month. Must be between 1 and 12', { status: 400 });
		}

		// Check query parameters
		const searchParams = url.searchParams;
		const lang = searchParams.get('lang') || 'en';

		// Generate ICS content
		const icsContent = await generateMonthlyICS(yearNum, monthNum, profile, lang as 'ar' | 'en');

		// Set appropriate headers
		const filename = `hijri-${country}-${year}-${month.toString().padStart(2, '0')}.ics`;
		
		return new Response(icsContent, {
			headers: {
				'Content-Type': 'text/calendar; charset=utf-8',
				'Content-Disposition': `attachment; filename="${filename}"`,
				'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
				'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0'
			}
		});

	} catch (error) {
		console.error('ICS generation error:', error);
		return new Response('Internal server error', { status: 500 });
	}
};