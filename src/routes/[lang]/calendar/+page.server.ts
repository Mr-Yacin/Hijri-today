import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { HijriEngine } from '$lib/hijri/engine.js';
import { detectCountryProfile, getUserProfileOverride } from '$lib/profiles/utils.js';

const hijriEngine = new HijriEngine();

export const load: PageServerLoad = async ({ request, cookies, params }) => {
	try {
		// Detect country profile using the same method as convert page
		const detectedProfile = await detectCountryProfile(request);
		const profile = getUserProfileOverride(cookies) || detectedProfile;
		
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