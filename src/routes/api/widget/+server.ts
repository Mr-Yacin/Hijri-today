import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { HijriEngine } from '$lib/hijri/engine.js';
import { detectCountryProfile, getUserProfileOverride, getProfileByCountry } from '$lib/profiles/utils.js';
import { rateLimit } from '$lib/utils/rate-limit.js';

export const GET: RequestHandler = async ({ url, request, cookies, getClientAddress }) => {
	const startTime = Date.now();
	
	try {
		// Apply rate limiting (more lenient for widget endpoint)
		const clientIP = getClientAddress();
		const rateLimitResult = await rateLimit(clientIP, 'api-widget');
		
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
					'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET',
					'Access-Control-Allow-Headers': 'Content-Type'
				}
			});
		}

		// Parse query parameters
		const searchParams = url.searchParams;
		const country = searchParams.get('country');
		const lang = searchParams.get('lang') || 'en';
		const format = searchParams.get('format') || 'json'; // json or jsonp
		const callback = searchParams.get('callback'); // for JSONP

		// Validate language
		if (!['ar', 'en'].includes(lang)) {
			return json({
				error: {
					code: 'INVALID_LANGUAGE',
					message: 'Language must be either "ar" or "en"'
				}
			}, { 
				status: 400,
				headers: {
					'Access-Control-Allow-Origin': '*'
				}
			});
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
				}, { 
					status: 400,
					headers: {
						'Access-Control-Allow-Origin': '*'
					}
				});
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

		// Prepare response data
		const responseData = {
			hijri: hijriToday,
			gregorian: gregorianToday,
			method: profile.method,
			country: profile.country,
			offset: profile.offset,
			displayName: profile.displayName,
			lang: lang,
			timestamp: today.toISOString(),
			processingTime,
			widget: {
				version: '1.0.0',
				apiUrl: url.origin + '/api/widget',
				scriptUrl: url.origin + '/hijri-widget.js'
			}
		};

		// Calculate cache TTL until midnight local time
		const now = new Date();
		const midnight = new Date(now);
		midnight.setHours(24, 0, 0, 0); // Next midnight
		const secondsUntilMidnight = Math.floor((midnight.getTime() - now.getTime()) / 1000);

		const headers = {
			'Cache-Control': `public, max-age=${Math.min(secondsUntilMidnight, 3600)}`, // Cache until midnight or 1 hour max
			'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET',
			'Access-Control-Allow-Headers': 'Content-Type'
		};

		// Handle JSONP format
		if (format === 'jsonp' && callback) {
			// Validate callback name for security
			if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(callback)) {
				return json({
					error: {
						code: 'INVALID_CALLBACK',
						message: 'Invalid callback function name'
					}
				}, { 
					status: 400,
					headers
				});
			}

			const jsonpResponse = `${callback}(${JSON.stringify(responseData)});`;
			
			return new Response(jsonpResponse, {
				status: 200,
				headers: {
					...headers,
					'Content-Type': 'application/javascript; charset=utf-8'
				}
			});
		}

		// Return JSON response
		return json(responseData, { headers });

	} catch (error) {
		const processingTime = Date.now() - startTime;
		
		return json({
			error: {
				code: 'WIDGET_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error in widget API'
			},
			processingTime
		}, { 
			status: 500,
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
};

// Handle preflight requests for CORS
export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Max-Age': '86400'
		}
	});
};