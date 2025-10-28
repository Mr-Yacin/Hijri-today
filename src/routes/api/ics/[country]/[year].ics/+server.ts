import type { RequestHandler } from './$types.js';
import { HijriEngine } from '$lib/hijri/engine.js';
import { getProfileByCountry } from '$lib/profiles/utils.js';
import { rateLimit } from '$lib/utils/rate-limit.js';
import { generateAnnualICS } from '$lib/utils/ics-generator.js';

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

		const { country, year } = params;
		const yearNum = parseInt(year);

		// Validate country
		const profile = getProfileByCountry(country);
		if (!profile) {
			return new Response('Invalid country code', { status: 400 });
		}

		// Validate year
		if (isNaN(yearNum) || yearNum < 1300 || yearNum > 1500) {
			return new Response('Invalid year. Must be between 1300 and 1500 AH', { status: 400 });
		}

		// Check query parameters for format
		const searchParams = url.searchParams;
		const format = searchParams.get('format') || 'annual';
		const lang = searchParams.get('lang') || 'en';

		if (format !== 'annual' && format !== 'monthly') {
			return new Response('Invalid format. Must be "annual" or "monthly"', { status: 400 });
		}

		// Generate ICS content
		const icsContent = await generateAnnualICS(yearNum, profile, lang as 'ar' | 'en');

		// Set appropriate headers
		const filename = `hijri-${country}-${year}.ics`;
		
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