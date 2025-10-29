import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getClientIP } from '$lib/profiles/utils.js';

export const GET: RequestHandler = async ({ request }) => {
	try {
		// Get all IP-related headers
		const detectedIp = getClientIP(request);
		const xForwardedFor = request.headers.get('x-forwarded-for');
		const xRealIp = request.headers.get('x-real-ip');
		const cfConnectingIp = request.headers.get('cf-connecting-ip');
		const cfCountry = request.headers.get('cf-ipcountry');
		
		// Simple response with just IP info
		const ipInfo = {
			ip: detectedIp,
			country: cfCountry || 'Unknown',
			headers: {
				'x-forwarded-for': xForwardedFor,
				'x-real-ip': xRealIp,
				'cf-connecting-ip': cfConnectingIp,
				'cf-ipcountry': cfCountry
			},
			timestamp: new Date().toISOString()
		};
		
		// Set no-cache headers
		const headers = {
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Pragma': 'no-cache',
			'Expires': '0',
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*' // Allow CORS for external use
		};
		
		return json(ipInfo, { headers });
		
	} catch (error) {
		console.error('My IP error:', error);
		
		return json({
			error: 'Failed to get IP information',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { 
			status: 500,
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Content-Type': 'application/json'
			}
		});
	}
};