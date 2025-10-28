import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getAllProfiles } from '$lib/profiles/utils.js';
import { getAvailableYearRange } from '$lib/hijri/data.js';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const searchParams = url.searchParams;
		const country = searchParams.get('country');
		
		// Get available profiles and year range
		const profiles = getAllProfiles();
		const yearRange = getAvailableYearRange();
		
		// Filter by country if specified
		const availableProfiles = country 
			? profiles.filter(p => p.country.toLowerCase() === country.toLowerCase())
			: profiles;

		if (country && availableProfiles.length === 0) {
			return json({
				error: {
					code: 'INVALID_COUNTRY',
					message: `No profiles found for country: ${country}`
				}
			}, { status: 400 });
		}

		// Generate available endpoints
		const endpoints = availableProfiles.map(profile => ({
			country: profile.country,
			displayName: profile.displayName,
			method: profile.method,
			endpoints: {
				annual: `/api/ics/${profile.country}/{year}.ics`,
				monthly: `/api/ics/${profile.country}/{year}/{month}.ics`
			},
			examples: {
				annual: `/api/ics/${profile.country}/${yearRange.minYear}.ics`,
				monthly: `/api/ics/${profile.country}/${yearRange.minYear}/1.ics`
			},
			parameters: {
				year: `Hijri year (${yearRange.minYear}-${yearRange.maxYear})`,
				month: 'Hijri month (1-12)',
				lang: 'Language for event titles (ar|en, default: en)'
			}
		}));

		return json({
			availableCountries: availableProfiles.length,
			supportedYearRange: {
				min: yearRange.minYear,
				max: yearRange.maxYear
			},
			endpoints,
			usage: {
				description: 'Generate ICS calendar files for Hijri dates',
				formats: ['annual', 'monthly'],
				languages: ['ar', 'en'],
				contentType: 'text/calendar',
				caching: 'Files are cached for 24 hours'
			}
		});

	} catch (error) {
		return json({
			error: {
				code: 'LISTING_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error listing ICS endpoints'
			}
		}, { status: 500 });
	}
};