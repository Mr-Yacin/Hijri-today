import { validateUmmAlQuraTable } from './validation.js';
import type { UmmAlQuraTable, UmmAlQuraMonth } from './types.js';
import ummAlQuraData from './umm_al_qura.json';

// Load and validate Umm al-Qura data
let _cachedTable: UmmAlQuraTable | null = null;

export function getUmmAlQuraTable(): UmmAlQuraTable {
	if (!_cachedTable) {
		try {
			_cachedTable = validateUmmAlQuraTable(ummAlQuraData);
		} catch (error) {
			throw new Error(`Invalid Umm al-Qura data: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
	return _cachedTable;
}

// Helper functions for table operations
export function findMonthByHijri(year: number, month: number): UmmAlQuraMonth | null {
	const table = getUmmAlQuraTable();
	return table.months.find(m => m.h_year === year && m.h_month === month) || null;
}

export function findMonthByGregorian(gregorianDate: string): UmmAlQuraMonth | null {
	const table = getUmmAlQuraTable();
	const targetDate = new Date(gregorianDate);
	
	// Find the month where the Gregorian date falls within the month's range
	for (const month of table.months) {
		const startDate = new Date(month.g_start);
		const endDate = new Date(startDate);
		endDate.setDate(startDate.getDate() + month.days - 1);
		
		if (targetDate >= startDate && targetDate <= endDate) {
			return month;
		}
	}
	
	return null;
}

export function getAvailableYearRange(): { minYear: number; maxYear: number } {
	const table = getUmmAlQuraTable();
	const years = table.months.map(m => m.h_year);
	return {
		minYear: Math.min(...years),
		maxYear: Math.max(...years)
	};
}

// Binary search for efficient month lookup by Hijri date
export function binarySearchHijriMonth(year: number, month: number): UmmAlQuraMonth | null {
	const table = getUmmAlQuraTable();
	const months = table.months;
	
	let left = 0;
	let right = months.length - 1;
	
	while (left <= right) {
		const mid = Math.floor((left + right) / 2);
		const currentMonth = months[mid];
		
		if (currentMonth.h_year === year && currentMonth.h_month === month) {
			return currentMonth;
		}
		
		// Compare by year first, then by month
		const currentValue = currentMonth.h_year * 12 + currentMonth.h_month;
		const targetValue = year * 12 + month;
		
		if (currentValue < targetValue) {
			left = mid + 1;
		} else {
			right = mid - 1;
		}
	}
	
	return null;
}

// Binary search for efficient month lookup by Gregorian date
export function binarySearchGregorianMonth(gregorianDate: string): UmmAlQuraMonth | null {
	const table = getUmmAlQuraTable();
	const months = table.months;
	const targetDate = new Date(gregorianDate);
	
	let left = 0;
	let right = months.length - 1;
	
	while (left <= right) {
		const mid = Math.floor((left + right) / 2);
		const currentMonth = months[mid];
		const startDate = new Date(currentMonth.g_start);
		const endDate = new Date(startDate);
		endDate.setDate(startDate.getDate() + currentMonth.days - 1);
		
		if (targetDate >= startDate && targetDate <= endDate) {
			return currentMonth;
		}
		
		if (targetDate < startDate) {
			right = mid - 1;
		} else {
			left = mid + 1;
		}
	}
	
	return null;
}