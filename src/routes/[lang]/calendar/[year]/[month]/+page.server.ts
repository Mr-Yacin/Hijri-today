import type { PageServerLoad } from './$types';
import { HijriEngine } from '$lib/hijri/engine.js';
import { detectCountryProfile, getUserProfileOverride } from '$lib/profiles/utils.js';
import type { CountryProfile, HijriDate, GregorianDate } from '$lib/hijri/types.js';
import { error } from '@sveltejs/kit';

// Calendar cell data structure
export interface CalendarCell {
	hijriDate: HijriDate;
	gregorianDate: GregorianDate;
	isCurrentMonth: boolean;
	isToday: boolean;
	dayOfWeek: number; // 0 = Sunday, 6 = Saturday
}

// Calendar month data
export interface CalendarMonth {
	hijriYear: number;
	hijriMonth: number;
	cells: CalendarCell[];
	profile: CountryProfile;
	todayHijri: HijriDate;
	todayGregorian: GregorianDate;
}

// Initialize engine
const hijriEngine = new HijriEngine();

// Generate calendar cells for a given Hijri month
function generateCalendarCells(
	hijriYear: number,
	hijriMonth: number,
	profile: CountryProfile,
	todayHijri: HijriDate,
	todayGregorian: GregorianDate
): CalendarCell[] {
	const cells: CalendarCell[] = [];
	
	try {
		// Get the first day of the Hijri month
		const firstDayHijri: HijriDate = { year: hijriYear, month: hijriMonth, day: 1 };
		const firstDayGregorian = hijriEngine.hijriToGregorian(firstDayHijri, profile);
		
		// Create Date object for the first day to get day of week
		const firstDate = new Date(firstDayGregorian.year, firstDayGregorian.month - 1, firstDayGregorian.day);
		const firstDayOfWeek = firstDate.getDay(); // 0 = Sunday
		
		// Add cells for previous month to fill the first week
		for (let i = 0; i < firstDayOfWeek; i++) {
			const dayOffset = firstDayOfWeek - i;
			const prevDate = new Date(firstDate);
			prevDate.setDate(prevDate.getDate() - dayOffset);
			
			const prevGregorian: GregorianDate = {
				year: prevDate.getFullYear(),
				month: prevDate.getMonth() + 1,
				day: prevDate.getDate()
			};
			
			const prevHijri = hijriEngine.gregorianToHijri(prevGregorian, profile);
			
			cells.push({
				hijriDate: prevHijri,
				gregorianDate: prevGregorian,
				isCurrentMonth: false,
				isToday: isDateToday(prevHijri, prevGregorian, todayHijri, todayGregorian),
				dayOfWeek: prevDate.getDay()
			});
		}
		
		// Add cells for current month
		// We'll generate up to 31 days and stop when we hit the next month
		let currentDay = 1;
		let currentDate = new Date(firstDate);
		
		while (currentDay <= 31) {
			try {
				const currentHijri: HijriDate = { year: hijriYear, month: hijriMonth, day: currentDay };
				const currentGregorian = hijriEngine.hijriToGregorian(currentHijri, profile);
				
				// Check if we've moved to the next Hijri month
				const verifyHijri = hijriEngine.gregorianToHijri(currentGregorian, profile);
				if (verifyHijri.month !== hijriMonth || verifyHijri.year !== hijriYear) {
					break;
				}
				
				cells.push({
					hijriDate: currentHijri,
					gregorianDate: currentGregorian,
					isCurrentMonth: true,
					isToday: isDateToday(currentHijri, currentGregorian, todayHijri, todayGregorian),
					dayOfWeek: new Date(currentGregorian.year, currentGregorian.month - 1, currentGregorian.day).getDay()
				});
				
				currentDay++;
			} catch {
				// End of month reached
				break;
			}
		}
		
		// Fill remaining cells to complete 6 weeks (42 cells total)
		const lastCell = cells[cells.length - 1];
		if (lastCell) {
			const lastDate = new Date(lastCell.gregorianDate.year, lastCell.gregorianDate.month - 1, lastCell.gregorianDate.day);
			
			while (cells.length < 42) {
				lastDate.setDate(lastDate.getDate() + 1);
				
				const nextGregorian: GregorianDate = {
					year: lastDate.getFullYear(),
					month: lastDate.getMonth() + 1,
					day: lastDate.getDate()
				};
				
				const nextHijri = hijriEngine.gregorianToHijri(nextGregorian, profile);
				
				cells.push({
					hijriDate: nextHijri,
					gregorianDate: nextGregorian,
					isCurrentMonth: false,
					isToday: isDateToday(nextHijri, nextGregorian, todayHijri, todayGregorian),
					dayOfWeek: lastDate.getDay()
				});
			}
		}
		
	} catch (err) {
		console.error('Error generating calendar cells:', err);
		// Return empty array on error
		return [];
	}
	
	return cells;
}

// Check if a date is today
function isDateToday(
	hijriDate: HijriDate,
	gregorianDate: GregorianDate,
	todayHijri: HijriDate,
	todayGregorian: GregorianDate
): boolean {
	return (
		hijriDate.year === todayHijri.year &&
		hijriDate.month === todayHijri.month &&
		hijriDate.day === todayHijri.day
	) || (
		gregorianDate.year === todayGregorian.year &&
		gregorianDate.month === todayGregorian.month &&
		gregorianDate.day === todayGregorian.day
	);
}

export const load: PageServerLoad = async ({ params, request, cookies }) => {
	try {
		// Parse and validate parameters
		const year = parseInt(params.year);
		const month = parseInt(params.month);
		
		if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
			throw error(400, 'Invalid year or month parameter');
		}
		
		// Check if the year is within supported range
		const supportedRange = hijriEngine.getSupportedRange();
		if (year < supportedRange.hijri.min || year > supportedRange.hijri.max) {
			throw error(400, `Year ${year} is outside supported range (${supportedRange.hijri.min}-${supportedRange.hijri.max} AH)`);
		}
		
		// Detect country profile using the same method as convert page
		const detectedProfile = await detectCountryProfile(request);
		const profile = getUserProfileOverride(cookies) || detectedProfile;
		
		// Get today's dates for highlighting
		const todayHijri = hijriEngine.getTodayHijri(profile);
		const now = new Date();
		const todayGregorian: GregorianDate = {
			year: now.getFullYear(),
			month: now.getMonth() + 1,
			day: now.getDate()
		};
		
		// Generate calendar cells
		const cells = generateCalendarCells(year, month, profile, todayHijri, todayGregorian);
		
		// Calculate cache duration (longer for past/future months, shorter for current month)
		const isCurrentMonth = year === todayHijri.year && month === todayHijri.month;
		const cacheMaxAge = isCurrentMonth ? 3600 : 86400; // 1 hour for current month, 24 hours for others
		
		const calendarData: CalendarMonth = {
			hijriYear: year,
			hijriMonth: month,
			cells,
			profile,
			todayHijri,
			todayGregorian
		};
		
		return {
			calendar: calendarData,
			cacheHeaders: {
				'Cache-Control': `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}`,
				'Vary': 'Accept-Language, CF-IPCountry'
			}
		};
		
	} catch (err) {
		console.error('Error in calendar page server load:', err);
		
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		
		throw error(500, 'Failed to load calendar data');
	}
};