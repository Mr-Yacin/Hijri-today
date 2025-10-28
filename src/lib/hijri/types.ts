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