import { createEvents, type EventAttributes } from 'ics';
import { HijriEngine } from '$lib/hijri/engine.js';
import type { CountryProfile, HijriDate } from '$lib/hijri/types.js';
import { binarySearchHijriMonth } from '$lib/hijri/data.js';

// Hijri month names in Arabic and English
const HIJRI_MONTHS = {
	ar: [
		'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
		'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
	],
	en: [
		'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani', 'Jumada al-awwal', 'Jumada al-thani',
		'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
	]
};

/**
 * Generate annual ICS calendar for a specific Hijri year
 * @param hijriYear - Hijri year (e.g., 1447)
 * @param profile - Country profile for calculation method
 * @param lang - Language for event titles ('ar' or 'en')
 * @returns Promise<string> - ICS calendar content
 */
export async function generateAnnualICS(
	hijriYear: number,
	profile: CountryProfile,
	lang: 'ar' | 'en' = 'en'
): Promise<string> {
	const engine = new HijriEngine();
	const events: EventAttributes[] = [];

	// Generate events for each month of the Hijri year
	for (let month = 1; month <= 12; month++) {
		const monthData = binarySearchHijriMonth(hijriYear, month);
		if (!monthData) continue;

		// Create month start event
		const hijriDate: HijriDate = { year: hijriYear, month, day: 1 };
		const gregorianDate = engine.hijriToGregorian(hijriDate, profile);
		
		const monthName = HIJRI_MONTHS[lang][month - 1];
		const title = lang === 'ar' 
			? `بداية شهر ${monthName} ${hijriYear} هـ`
			: `Start of ${monthName} ${hijriYear} AH`;
		
		const description = lang === 'ar'
			? `بداية شهر ${monthName} للعام الهجري ${hijriYear} حسب ${profile.displayName.ar}`
			: `Beginning of ${monthName} in Hijri year ${hijriYear} according to ${profile.displayName.en}`;

		events.push({
			title,
			description,
			start: [gregorianDate.year, gregorianDate.month, gregorianDate.day],
			duration: { days: 1 },
			categories: ['Hijri Calendar', 'Islamic'],
			uid: `hijri-${hijriYear}-${month}-01-${profile.country}@hijri-platform`,
			productId: 'hijri-date-platform',
			calName: lang === 'ar' ? 'التقويم الهجري' : 'Hijri Calendar'
		});

		// Add special events for Ramadan and Hajj months
		if (month === 9) { // Ramadan
			const ramadanTitle = lang === 'ar' ? `شهر رمضان المبارك ${hijriYear} هـ` : `Holy Month of Ramadan ${hijriYear} AH`;
			const ramadanDesc = lang === 'ar' 
				? `بداية شهر رمضان المبارك - شهر الصيام والقرآن`
				: `Beginning of the holy month of Ramadan - month of fasting and Quran`;
			
			events.push({
				title: ramadanTitle,
				description: ramadanDesc,
				start: [gregorianDate.year, gregorianDate.month, gregorianDate.day],
				duration: { days: 1 },
				categories: ['Hijri Calendar', 'Islamic', 'Ramadan'],
				uid: `ramadan-${hijriYear}-${profile.country}@hijri-platform`,
				productId: 'hijri-date-platform'
			});
		}

		if (month === 12) { // Dhu al-Hijjah
			const hajjTitle = lang === 'ar' ? `شهر ذو الحجة ${hijriYear} هـ` : `Month of Hajj ${hijriYear} AH`;
			const hajjDesc = lang === 'ar'
				? `شهر ذو الحجة - شهر الحج والأضحى`
				: `Dhu al-Hijjah - month of Hajj and Eid al-Adha`;
			
			events.push({
				title: hajjTitle,
				description: hajjDesc,
				start: [gregorianDate.year, gregorianDate.month, gregorianDate.day],
				duration: { days: 1 },
				categories: ['Hijri Calendar', 'Islamic', 'Hajj'],
				uid: `hajj-month-${hijriYear}-${profile.country}@hijri-platform`,
				productId: 'hijri-date-platform'
			});
		}
	}

	// Generate ICS content
	const { error, value } = createEvents(events);
	
	if (error) {
		throw new Error(`Failed to generate ICS: ${error.message}`);
	}

	return value || '';
}

/**
 * Generate monthly ICS calendar for a specific Hijri month
 * @param hijriYear - Hijri year (e.g., 1447)
 * @param hijriMonth - Hijri month (1-12)
 * @param profile - Country profile for calculation method
 * @param lang - Language for event titles ('ar' or 'en')
 * @returns Promise<string> - ICS calendar content
 */
export async function generateMonthlyICS(
	hijriYear: number,
	hijriMonth: number,
	profile: CountryProfile,
	lang: 'ar' | 'en' = 'en'
): Promise<string> {
	const engine = new HijriEngine();
	const events: EventAttributes[] = [];

	const monthData = binarySearchHijriMonth(hijriYear, hijriMonth);
	if (!monthData) {
		throw new Error(`No data found for Hijri month ${hijriYear}/${hijriMonth}`);
	}

	const monthName = HIJRI_MONTHS[lang][hijriMonth - 1];

	// Generate daily events for the entire month
	for (let day = 1; day <= monthData.days; day++) {
		const hijriDate: HijriDate = { year: hijriYear, month: hijriMonth, day };
		const gregorianDate = engine.hijriToGregorian(hijriDate, profile);
		
		const title = lang === 'ar'
			? `${day} ${monthName} ${hijriYear} هـ`
			: `${day} ${monthName} ${hijriYear} AH`;
		
		const description = lang === 'ar'
			? `${day} ${monthName} ${hijriYear} هجري - ${gregorianDate.day}/${gregorianDate.month}/${gregorianDate.year} ميلادي`
			: `${day} ${monthName} ${hijriYear} AH - ${gregorianDate.day}/${gregorianDate.month}/${gregorianDate.year} CE`;

		events.push({
			title,
			description,
			start: [gregorianDate.year, gregorianDate.month, gregorianDate.day],
			duration: { days: 1 },
			categories: ['Hijri Calendar', 'Islamic'],
			uid: `hijri-${hijriYear}-${hijriMonth}-${day.toString().padStart(2, '0')}-${profile.country}@hijri-platform`,
			productId: 'hijri-date-platform',
			calName: lang === 'ar' ? `${monthName} ${hijriYear} هـ` : `${monthName} ${hijriYear} AH`
		});

		// Add special events for important days
		if (hijriMonth === 1 && day === 1) { // New Hijri Year
			const newYearTitle = lang === 'ar' ? `رأس السنة الهجرية ${hijriYear} هـ` : `Hijri New Year ${hijriYear} AH`;
			const newYearDesc = lang === 'ar' 
				? `بداية السنة الهجرية الجديدة ${hijriYear}`
				: `Beginning of the new Hijri year ${hijriYear}`;
			
			events.push({
				title: newYearTitle,
				description: newYearDesc,
				start: [gregorianDate.year, gregorianDate.month, gregorianDate.day],
				duration: { days: 1 },
				categories: ['Hijri Calendar', 'Islamic', 'New Year'],
				uid: `hijri-new-year-${hijriYear}-${profile.country}@hijri-platform`,
				productId: 'hijri-date-platform'
			});
		}

		if (hijriMonth === 9 && day === 1) { // First day of Ramadan
			const ramadanStartTitle = lang === 'ar' ? `أول يوم رمضان ${hijriYear} هـ` : `First Day of Ramadan ${hijriYear} AH`;
			
			events.push({
				title: ramadanStartTitle,
				description: lang === 'ar' ? 'بداية شهر الصيام المبارك' : 'Beginning of the blessed fasting month',
				start: [gregorianDate.year, gregorianDate.month, gregorianDate.day],
				duration: { days: 1 },
				categories: ['Hijri Calendar', 'Islamic', 'Ramadan'],
				uid: `ramadan-start-${hijriYear}-${profile.country}@hijri-platform`,
				productId: 'hijri-date-platform'
			});
		}
	}

	// Generate ICS content
	const { error, value } = createEvents(events);
	
	if (error) {
		throw new Error(`Failed to generate monthly ICS: ${error.message}`);
	}

	return value || '';
}

/**
 * Generate ICS for a specific date range
 * @param startHijri - Start Hijri date
 * @param endHijri - End Hijri date
 * @param profile - Country profile
 * @param lang - Language
 * @returns Promise<string> - ICS calendar content
 */
export async function generateDateRangeICS(
	startHijri: HijriDate,
	endHijri: HijriDate,
	profile: CountryProfile,
	lang: 'ar' | 'en' = 'en'
): Promise<string> {
	const engine = new HijriEngine();
	const events: EventAttributes[] = [];

	// Simple implementation - iterate through months in the range
	for (let year = startHijri.year; year <= endHijri.year; year++) {
		const startMonth = year === startHijri.year ? startHijri.month : 1;
		const endMonth = year === endHijri.year ? endHijri.month : 12;

		for (let month = startMonth; month <= endMonth; month++) {
			const monthData = binarySearchHijriMonth(year, month);
			if (!monthData) continue;

			const startDay = (year === startHijri.year && month === startHijri.month) ? startHijri.day : 1;
			const endDay = (year === endHijri.year && month === endHijri.month) ? endHijri.day : monthData.days;

			for (let day = startDay; day <= endDay; day++) {
				const hijriDate: HijriDate = { year, month, day };
				const gregorianDate = engine.hijriToGregorian(hijriDate, profile);
				
				const monthName = HIJRI_MONTHS[lang][month - 1];
				const title = lang === 'ar'
					? `${day} ${monthName} ${year} هـ`
					: `${day} ${monthName} ${year} AH`;
				
				events.push({
					title,
					start: [gregorianDate.year, gregorianDate.month, gregorianDate.day],
					duration: { days: 1 },
					categories: ['Hijri Calendar', 'Islamic'],
					uid: `hijri-${year}-${month}-${day.toString().padStart(2, '0')}-${profile.country}@hijri-platform`,
					productId: 'hijri-date-platform'
				});
			}
		}
	}

	const { error, value } = createEvents(events);
	
	if (error) {
		throw new Error(`Failed to generate date range ICS: ${error.message}`);
	}

	return value || '';
}