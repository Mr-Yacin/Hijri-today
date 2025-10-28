// Core types for Hijri date system
export interface HijriDate {
	year: number;
	month: number;
	day: number;
}

export interface GregorianDate {
	year: number;
	month: number;
	day: number;
}

export interface ConversionEngine {
	gregorianToHijri(date: GregorianDate, profile: CountryProfile): HijriDate;
	hijriToGregorian(date: HijriDate, profile: CountryProfile): GregorianDate;
	getTodayHijri(profile: CountryProfile): HijriDate;
}

export interface CountryProfile {
	country: string;
	method: 'ummalqura' | 'moonsighting_national' | 'diyanet';
	offset: number;
	displayName: { ar: string; en: string };
	timezone: string;
}

// Umm al-Qura table data structures
export interface UmmAlQuraMonth {
	h_year: number;
	h_month: number;
	g_start: string; // ISO date string (YYYY-MM-DD)
	days: number;
}

export interface UmmAlQuraMetadata {
	source: string;
	range: string;
	lastUpdated: string;
	description: string;
}

export interface UmmAlQuraTable {
	metadata: UmmAlQuraMetadata;
	months: UmmAlQuraMonth[];
}