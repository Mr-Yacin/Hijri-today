import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { detectCountryProfile, getClientIP } from '$lib/profiles/utils.js';

export const GET: RequestHandler = async ({ request, url }) => {
	try {
		// Extract all relevant headers and data
		const ip = getClientIP(request);
		const forwardedFor = request.headers.get('x-forwarded-for');
		const realIp = request.headers.get('x-real-ip');
		const cfConnectingIp = request.headers.get('cf-connecting-ip');
		const acceptLanguage = request.headers.get('accept-language');
		const cfTimezone = request.headers.get('cf-timezone');
		const cfCountry = request.headers.get('cf-ipcountry');
		const userAgent = request.headers.get('user-agent');
		
		// Detect profile using current logic
		const detectedProfile = await detectCountryProfile(request);
		
		// Check for cache-busting parameter
		const bustCache = url.searchParams.has('bust');
		
		const debugInfo = {
			timestamp: new Date().toISOString(),
			detectedLocation: {
				country: detectedProfile.country,
				method: detectedProfile.method,
				displayName: detectedProfile.displayName,
				offset: detectedProfile.offset
			},
			ipInformation: {
				detectedIp: ip,
				xForwardedFor: forwardedFor,
				xRealIp: realIp,
				cfConnectingIp: cfConnectingIp
			},
			headers: {
				acceptLanguage,
				cfTimezone,
				cfCountry,
				userAgent: userAgent?.substring(0, 100) + '...' // Truncate for privacy
			},
			requestInfo: {
				url: request.url,
				method: request.method,
				cacheBusted: bustCache
			}
		};
		
		// Set no-cache headers to ensure fresh data
		const headers = {
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Pragma': 'no-cache',
			'Expires': '0',
			'Content-Type': 'application/json'
		};
		
		return json(debugInfo, { headers });
		
	} catch (error) {
		console.error('Debug location error:', error);
		
		return json({
			error: 'Failed to get location debug info',
			message: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString()
		}, { 
			status: 500,
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Content-Type': 'application/json'
			}
		});
	}
};