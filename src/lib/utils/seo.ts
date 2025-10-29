import type { HijriDate, GregorianDate } from '$lib/hijri/types';
import { formatDateNumber } from '$lib/i18n';

export interface SEOData {
	title: string;
	description: string;
	canonical?: string;
	openGraph?: {
		title: string;
		description: string;
		url: string;
		type: string;
		image?: string;
	};
	jsonLd?: Record<string, any>;
	robots?: string;
	hreflang?: Array<{ lang: string; url: string }>;
}

export function generateDateSEO(
	hijriDate: HijriDate,
	gregorianDate: GregorianDate,
	locale: 'ar' | 'en',
	baseUrl: string,
	path: string,
	monthName?: string
): SEOData {
	const isArabic = locale === 'ar';
	const hijriYear = formatDateNumber(hijriDate.year, locale);
	const hijriDay = formatDateNumber(hijriDate.day, locale);
	const gregorianYear = formatDateNumber(gregorianDate.year, locale);
	const gregorianDay = formatDateNumber(gregorianDate.day, locale);
	
	const hijriSuffix = isArabic ? 'هـ' : 'AH';
	const gregorianSuffix = isArabic ? 'م' : 'CE';
	
	const hijriDateStr = `${hijriDay} ${monthName || ''} ${hijriYear} ${hijriSuffix}`.trim();
	const gregorianDateStr = `${gregorianDay}/${gregorianDate.month}/${gregorianYear} ${gregorianSuffix}`;
	
	const title = isArabic 
		? `التاريخ الهجري اليوم - ${hijriDateStr}`
		: `Today's Hijri Date - ${hijriDateStr}`;
	
	const description = isArabic
		? `التاريخ الهجري اليوم ${hijriDateStr} يوافق ${gregorianDateStr} - تحويل دقيق للتاريخ الإسلامي`
		: `Today's Hijri date ${hijriDateStr} corresponds to ${gregorianDateStr} - Accurate Islamic calendar conversion`;
	
	const canonical = `${baseUrl}${path}`;
	
	return {
		title,
		description,
		canonical,
		openGraph: {
			title,
			description,
			url: canonical,
			type: 'website'
		},
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'WebPage',
			name: title,
			description,
			url: canonical,
			mainEntity: {
				'@type': 'Event',
				name: hijriDateStr,
				startDate: `${gregorianDate.year}-${gregorianDate.month.toString().padStart(2, '0')}-${gregorianDate.day.toString().padStart(2, '0')}`,
				description: `${isArabic ? 'التاريخ الهجري' : 'Hijri date'} ${hijriDateStr}`
			}
		}
	};
}

export function generateCalendarSEO(
	year: number,
	month: number,
	monthName: string,
	locale: 'ar' | 'en',
	baseUrl: string,
	path: string
): SEOData {
	const isArabic = locale === 'ar';
	const formattedYear = formatDateNumber(year, locale);
	
	const title = isArabic
		? `تقويم ${monthName} ${formattedYear} هـ - التقويم الهجري`
		: `${monthName} ${formattedYear} AH Calendar - Hijri Calendar`;
	
	const description = isArabic
		? `تقويم شهر ${monthName} ${formattedYear} هجري مع التواريخ الميلادية المقابلة - تقويم إسلامي دقيق`
		: `${monthName} ${formattedYear} Hijri calendar with corresponding Gregorian dates - Accurate Islamic calendar`;
	
	const canonical = `${baseUrl}${path}`;
	
	return {
		title,
		description,
		canonical,
		openGraph: {
			title,
			description,
			url: canonical,
			type: 'website'
		},
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'WebPage',
			name: title,
			description,
			url: canonical,
			mainEntity: {
				'@type': 'Calendar',
				name: `${monthName} ${formattedYear}`,
				description: `${isArabic ? 'تقويم هجري لشهر' : 'Hijri calendar for'} ${monthName} ${formattedYear}`
			}
		}
	};
}

export function generateConvertSEO(
	locale: 'ar' | 'en',
	baseUrl: string,
	path: string,
	conversionResult?: {
		from: 'hijri' | 'gregorian';
		input: HijriDate | GregorianDate;
		result: HijriDate | GregorianDate;
	}
): SEOData {
	const isArabic = locale === 'ar';
	
	let title = isArabic
		? 'تحويل التاريخ الهجري والميلادي - محول التاريخ الإسلامي'
		: 'Hijri Gregorian Date Converter - Islamic Calendar Converter';
	
	let description = isArabic
		? 'محول دقيق للتاريخ بين التقويم الهجري والميلادي - تحويل فوري للتواريخ الإسلامية بطرق حساب متعددة'
		: 'Accurate date converter between Hijri and Gregorian calendars - Instant Islamic date conversion with multiple calculation methods';
	
	// Enhanced SEO if there's a conversion result
	if (conversionResult) {
		const { from, input, result } = conversionResult;
		
		if (from === 'gregorian') {
			const gDate = input as GregorianDate;
			const hDate = result as HijriDate;
			const inputStr = `${gDate.day}/${gDate.month}/${gDate.year}`;
			const resultStr = `${formatDateNumber(hDate.day, locale)}/${hDate.month}/${formatDateNumber(hDate.year, locale)} ${isArabic ? 'هـ' : 'AH'}`;
			
			title = isArabic
				? `تحويل ${inputStr} إلى ${resultStr} - محول التاريخ الهجري`
				: `Convert ${inputStr} to ${resultStr} - Hijri Date Converter`;
		} else {
			const hDate = input as HijriDate;
			const gDate = result as GregorianDate;
			const inputStr = `${formatDateNumber(hDate.day, locale)}/${hDate.month}/${formatDateNumber(hDate.year, locale)} ${isArabic ? 'هـ' : 'AH'}`;
			const resultStr = `${gDate.day}/${gDate.month}/${gDate.year}`;
			
			title = isArabic
				? `تحويل ${inputStr} إلى ${resultStr} - محول التاريخ الميلادي`
				: `Convert ${inputStr} to ${resultStr} - Gregorian Date Converter`;
		}
	}
	
	const canonical = `${baseUrl}${path}`;
	
	return {
		title,
		description,
		canonical,
		openGraph: {
			title,
			description,
			url: canonical,
			type: 'website'
		},
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'WebApplication',
			name: title,
			description,
			url: canonical,
			applicationCategory: 'UtilityApplication',
			operatingSystem: 'Web Browser'
		}
	};
}

export function generateHreflangLinks(
	baseUrl: string,
	path: string,
	supportedLocales: string[] = ['en', 'ar']
): Array<{ lang: string; url: string }> {
	return supportedLocales.map(lang => ({
		lang,
		url: `${baseUrl}/${lang}${path.replace(/^\/[a-z]{2}/, '')}`
	}));
}