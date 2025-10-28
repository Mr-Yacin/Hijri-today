import type { HijriDate, GregorianDate, CountryProfile, ConversionEngine } from './types.js';
import { binarySearchGregorianMonth, binarySearchHijriMonth, getAvailableYearRange } from './data.js';
import { HijriDateSchema, GregorianDateSchema } from './validation.js';

export class HijriEngine implements ConversionEngine {
	/**
	 * Convert Gregorian date to Hijri date using Umm al-Qura table lookup
	 */
	gregorianToHijri(date: GregorianDate, profile: CountryProfile): HijriDate {
		// Validate input date
		const validatedDate = GregorianDateSchema.parse(date);
		
		// Format date as ISO string for lookup
		const gregorianDateStr = `${validatedDate.year.toString().padStart(4, '0')}-${validatedDate.month.toString().padStart(2, '0')}-${validatedDate.day.toString().padStart(2, '0')}`;
		
		// Find the Hijri month that contains this Gregorian date
		const month = binarySearchGregorianMonth(gregorianDateStr);
		
		if (!month) {
			const range = getAvailableYearRange();
			throw new Error(`Date ${gregorianDateStr} is outside the supported range (${range.minYear}-${range.maxYear} AH)`);
		}
		
		// Calculate the day within the Hijri month
		const startDate = new Date(month.g_start);
		const targetDate = new Date(gregorianDateStr);
		const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
		
		// Validate that the calculated day is within the month
		if (daysDiff < 0 || daysDiff >= month.days) {
			throw new Error(`Invalid date calculation for ${gregorianDateStr}`);
		}
		
		const hijriDay = daysDiff + 1; // Hijri days are 1-indexed
		
		// Apply country profile offset
		let adjustedYear = month.h_year;
		let adjustedMonth = month.h_month;
		let adjustedDay = hijriDay + profile.offset;
		
		// Handle day overflow/underflow due to offset
		if (adjustedDay > month.days) {
			adjustedDay = adjustedDay - month.days;
			adjustedMonth++;
			if (adjustedMonth > 12) {
				adjustedMonth = 1;
				adjustedYear++;
			}
		} else if (adjustedDay < 1) {
			// Need to get previous month's days count
			const prevMonth = adjustedMonth === 1 ? 12 : adjustedMonth - 1;
			const prevYear = adjustedMonth === 1 ? adjustedYear - 1 : adjustedYear;
			const prevMonthData = binarySearchHijriMonth(prevYear, prevMonth);
			const prevMonthDays = prevMonthData?.days || 29; // Default to 29 if not found
			
			adjustedDay = prevMonthDays + adjustedDay;
			adjustedMonth = prevMonth;
			adjustedYear = prevYear;
		}
		
		return {
			year: adjustedYear,
			month: adjustedMonth,
			day: adjustedDay
		};
	}

	/**
	 * Convert Hijri date to Gregorian date using Umm al-Qura table lookup
	 */
	hijriToGregorian(date: HijriDate, profile: CountryProfile): GregorianDate {
		// Validate input date
		const validatedDate = HijriDateSchema.parse(date);
		
		// Apply reverse offset for country profile
		let lookupYear = validatedDate.year;
		let lookupMonth = validatedDate.month;
		let lookupDay = validatedDate.day - profile.offset;
		
		// Handle day overflow/underflow due to reverse offset
		if (lookupDay < 1) {
			const prevMonth = lookupMonth === 1 ? 12 : lookupMonth - 1;
			const prevYear = lookupMonth === 1 ? lookupYear - 1 : lookupYear;
			const prevMonthData = binarySearchHijriMonth(prevYear, prevMonth);
			const prevMonthDays = prevMonthData?.days || 29;
			
			lookupDay = prevMonthDays + lookupDay;
			lookupMonth = prevMonth;
			lookupYear = prevYear;
		}
		
		// Find the month data
		const month = binarySearchHijriMonth(lookupYear, lookupMonth);
		
		if (!month) {
			const range = getAvailableYearRange();
			throw new Error(`Hijri date ${validatedDate.year}/${validatedDate.month}/${validatedDate.day} is outside the supported range (${range.minYear}-${range.maxYear} AH)`);
		}
		
		// Handle day overflow after reverse offset
		if (lookupDay > month.days) {
			const nextMonth = lookupMonth === 12 ? 1 : lookupMonth + 1;
			const nextYear = lookupMonth === 12 ? lookupYear + 1 : lookupYear;
			const nextMonthData = binarySearchHijriMonth(nextYear, nextMonth);
			
			if (!nextMonthData) {
				throw new Error(`Cannot find next month data for overflow calculation`);
			}
			
			lookupDay = lookupDay - month.days;
			const gregorianStartDate = new Date(nextMonthData.g_start);
			gregorianStartDate.setDate(gregorianStartDate.getDate() + lookupDay - 1);
			
			return {
				year: gregorianStartDate.getFullYear(),
				month: gregorianStartDate.getMonth() + 1,
				day: gregorianStartDate.getDate()
			};
		}
		
		// Calculate the Gregorian date
		const startDate = new Date(month.g_start);
		const targetDate = new Date(startDate);
		targetDate.setDate(startDate.getDate() + lookupDay - 1);
		
		return {
			year: targetDate.getFullYear(),
			month: targetDate.getMonth() + 1,
			day: targetDate.getDate()
		};
	}

	/**
	 * Get today's Hijri date based on the current Gregorian date
	 */
	getTodayHijri(profile: CountryProfile): HijriDate {
		const today = new Date();
		const gregorianToday: GregorianDate = {
			year: today.getFullYear(),
			month: today.getMonth() + 1,
			day: today.getDate()
		};
		
		return this.gregorianToHijri(gregorianToday, profile);
	}

	/**
	 * Validate if a Hijri date is within the supported range
	 */
	isValidHijriDate(date: HijriDate): boolean {
		try {
			HijriDateSchema.parse(date);
			const range = getAvailableYearRange();
			return date.year >= range.minYear && date.year <= range.maxYear;
		} catch {
			return false;
		}
	}

	/**
	 * Validate if a Gregorian date is within the supported range
	 */
	isValidGregorianDate(date: GregorianDate): boolean {
		try {
			GregorianDateSchema.parse(date);
			// Check if the date can be found in our table
			const dateStr = `${date.year.toString().padStart(4, '0')}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
			return binarySearchGregorianMonth(dateStr) !== null;
		} catch {
			return false;
		}
	}

	/**
	 * Get the supported date range information
	 */
	getSupportedRange(): { hijri: { min: number; max: number }; gregorian: { min: string; max: string } } {
		const range = getAvailableYearRange();
		
		// Find the earliest and latest Gregorian dates in our table
		const firstMonth = binarySearchHijriMonth(range.minYear, 1);
		const lastMonth = binarySearchHijriMonth(range.maxYear, 12);
		
		return {
			hijri: {
				min: range.minYear,
				max: range.maxYear
			},
			gregorian: {
				min: firstMonth?.g_start || '1900-01-01',
				max: lastMonth ? (() => {
					const endDate = new Date(lastMonth.g_start);
					endDate.setDate(endDate.getDate() + lastMonth.days - 1);
					return endDate.toISOString().split('T')[0];
				})() : '2100-12-31'
			}
		};
	}
}