import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { HijriEngine } from '$lib/hijri/engine.js';
import { CountryProfileDetector } from '$lib/profiles/detector.js';

const hijriEngine = new HijriEngine();
const profileDetector = new CountryProfileDetector();

export const load: PageServerLoad = async ({ request, cookies, getClientAddress, params }) => {
	try {
		// Extract detection parameters from request
		const clientIP = getClientAddress();
		const acceptLanguage = request.headers.get('accept-language') || '';
		const timezone = 'UTC'; // Fallback for edge deployment
		
		// Convert cookies to record
		const cookieRecord: Record<string, string> = {};
		cookies.getAll().forEach(cookie => {
			cookieRecord[cookie.name] = cookie.value;
		});
		
		// Detect country profile
		const profile = profileDetector.detectCountry({
			ip: clientIP,
			acceptLanguage,
			timezone,
			cookies: cookieRecord
		});
		
		// Get today's Hijri date
		const todayHijri = hijriEngine.getTodayHijri(profile);
		
		// Redirect to current month
		const lang = params.lang;
		throw redirect(302, `/${lang}/calendar/${todayHijri.year}/${todayHijri.month}`);
		
	} catch (error) {
		// If it's already a redirect, re-throw it
		if (error && typeof error === 'object' && 'status' in error && error.status === 302) {
			throw error;
		}
		
		// Fallback to a default date if detection fails
		const lang = params.lang;
		throw redirect(302, `/${lang}/calendar/1447/5`); // Default to current approximate date
	}
};