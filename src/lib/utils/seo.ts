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
		imageAlt?: string;
		imageWidth?: number;
		imageHeight?: number;
	};
	jsonLd?: Record<string, any>;
	robots?: string;
	hreflang?: Array<{ lang: string; url: string }>;
	// New features
	breadcrumbs?: BreadcrumbItem[];
	faq?: FAQItem[];
}

export interface BreadcrumbItem {
	name: string;
	url: string;
}

export interface FAQItem {
	question: string;
	answer: string;
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
	const imageUrl = `${baseUrl}/api/og-image?text=${encodeURIComponent(hijriDateStr)}&locale=${locale}`;
	
	return {
		title,
		description,
		canonical,
		openGraph: {
			title,
			description,
			url: canonical,
			type: 'website',
			image: imageUrl,
			imageAlt: isArabic ? `التاريخ الهجري اليوم ${hijriDateStr}` : `Today's Hijri date ${hijriDateStr}`,
			imageWidth: 1200,
			imageHeight: 630
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
		},
		breadcrumbs: generateBreadcrumbs(locale, baseUrl, path, isArabic)
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
	const imageUrl = `${baseUrl}/api/og-image?text=${encodeURIComponent(monthName + ' ' + formattedYear)}&locale=${locale}`;
	
	return {
		title,
		description,
		canonical,
		openGraph: {
			title,
			description,
			url: canonical,
			type: 'website',
			image: imageUrl,
			imageAlt: isArabic ? `تقويم ${monthName} ${formattedYear} هـ` : `${monthName} ${formattedYear} AH Calendar`,
			imageWidth: 1200,
			imageHeight: 630
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
		},
		breadcrumbs: generateBreadcrumbs(locale, baseUrl, path, isArabic)
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
	const imageUrl = `${baseUrl}/api/og-image?text=${encodeURIComponent('Converter')}&locale=${locale}`;
	
	return {
		title,
		description,
		canonical,
		openGraph: {
			title,
			description,
			url: canonical,
			type: 'website',
			image: imageUrl,
			imageAlt: isArabic ? 'محول التاريخ الهجري والميلادي' : 'Hijri and Gregorian Date Converter',
			imageWidth: 1200,
			imageHeight: 630
		},
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'WebApplication',
			name: title,
			description,
			url: canonical,
			applicationCategory: 'UtilityApplication',
			operatingSystem: 'Web Browser'
		},
		breadcrumbs: generateBreadcrumbs(locale, baseUrl, path, isArabic),
		faq: generateFAQS(locale)
	};
}

function generateBreadcrumbs(
	locale: 'ar' | 'en',
	baseUrl: string,
	path: string,
	isArabic: boolean
): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [
		{
			name: isArabic ? 'الرئيسية' : 'Home',
			url: `${baseUrl}/${locale}`
		}
	];

	const pathSegments = path.split('/').filter(Boolean);
	
	if (pathSegments.length > 0) {
		const currentPath = pathSegments.join('/');
		if (pathSegments[0] === 'today') {
			breadcrumbs.push({
				name: isArabic ? 'اليوم' : 'Today',
				url: `${baseUrl}/${locale}/today`
			});
		} else if (pathSegments[0] === 'calendar') {
			breadcrumbs.push({
				name: isArabic ? 'التقويم' : 'Calendar',
				url: `${baseUrl}/${locale}/calendar`
			});
			
			if (pathSegments.length >= 3) {
				const year = pathSegments[1];
				const month = pathSegments[2];
				breadcrumbs.push({
					name: isArabic ? `سنة ${year}` : `Year ${year}`,
					url: `${baseUrl}/${locale}/calendar/${year}`
				});
				breadcrumbs.push({
					name: isArabic ? `شهر ${month}` : `Month ${month}`,
					url: `${baseUrl}/${locale}/calendar/${year}/${month}`
				});
			}
		} else if (pathSegments[0] === 'convert') {
			breadcrumbs.push({
				name: isArabic ? 'التحويل' : 'Convert',
				url: `${baseUrl}/${locale}/convert`
			});
		}
	}
	
	return breadcrumbs;
}

function generateFAQS(locale: 'ar' | 'en'): FAQItem[] {
	const isArabic = locale === 'ar';
	
	return [
		{
			question: isArabic 
				? 'كيفية تحويل التاريخ الهجري إلى الميلادي؟'
				: 'How to convert Hijri date to Gregorian?',
			answer: isArabic
				? 'يمكنك استخدام محول التاريخ الخاص بنا لتحويل أي تاريخ هجري إلى ميلادي بدقة عالية باستخدام التقويم الهجري السعودي (أم القرى).'
				: 'You can use our date converter to convert any Hijri date to Gregorian with high accuracy using the Saudi Hijri calendar (Umm al-Qura).'
		},
		{
			question: isArabic
				? 'ما هو الفرق بين التقويم الهجري والميلادي؟'
				: 'What is the difference between Hijri and Gregorian calendars?',
			answer: isArabic
				? 'التقويم الهجري يعتمد على الدورة القمرية (354-355 يوم في السنة) بينما التقويم الميلادي يعتمد على الدورة الشمسية (365-366 يوم في السنة).'
				: 'The Hijri calendar is based on lunar cycles (354-355 days per year) while the Gregorian calendar is based on solar cycles (365-366 days per year).'
		},
		{
			question: isArabic
				? 'هل التواريخ دقيقة؟'
				: 'Are the dates accurate?',
			answer: isArabic
				? 'نعم، نحن نستخدم التقويم الهجري السعودي الرسمي (أم القرى) والذي يعتبر المرجع الرسمي للحج والمواسم الدينية.'
				: 'Yes, we use the official Saudi Hijri calendar (Umm al-Qura) which is the official reference for Hajj and religious seasons.'
		},
		{
			question: isArabic
				? 'هل يمكنني الحصول على تقويم كامل؟'
				: 'Can I get a full calendar?',
			answer: isArabic
				? 'نعم، يمكنك عرض تقويم كامل لأي سنة هجرية مع التواريخ الميلادية المقابلة لكل يوم.'
				: 'Yes, you can view a complete calendar for any Hijri year with corresponding Gregorian dates for each day.'
		}
	];
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

// Add FAQ JSON-LD to existing structured data
export function addFAQTOSchema(seoData: SEOData, locale: 'ar' | 'en'): SEOData {
	if (!seoData.faq || !seoData.jsonLd) return seoData;

	const isArabic = locale === 'ar';
	
	const faqJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		'mainEntity': seoData.faq.map(faq => ({
			'@type': 'Question',
			'name': faq.question,
			'acceptedAnswer': {
				'@type': 'Answer',
				'text': faq.answer
			}
		}))
	};

	return {
		...seoData,
		jsonLd: [seoData.jsonLd, faqJsonLd]
	};
}
