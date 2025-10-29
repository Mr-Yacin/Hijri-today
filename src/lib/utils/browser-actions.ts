import { get } from 'svelte/store';
import { _ } from 'svelte-i18n';
import { currentLocale, formatDateNumber } from '$lib/i18n';
import { showToast } from './toast';
import type { HijriDate, GregorianDate } from '$lib/hijri/types';

/**
 * Copy date information to clipboard
 */
export async function copyDateToClipboard(
	hijriDate: HijriDate,
	gregorianDate: GregorianDate
): Promise<boolean> {
	try {
		const locale = get(currentLocale);
		const t = get(_);
		
		const hijriText = `${formatDateNumber(hijriDate.day, locale)} ${t(`months.hijri.${hijriDate.month}`)} ${formatDateNumber(hijriDate.year, locale)} ${locale === 'ar' ? 'هـ' : 'AH'}`;
		const gregorianText = `${formatDateNumber(gregorianDate.day, locale)} ${t(`months.gregorian.${gregorianDate.month}`)} ${formatDateNumber(gregorianDate.year, locale)} ${locale === 'ar' ? 'م' : 'CE'}`;
		
		const textToCopy = `${t('dates.hijri_date')}: ${hijriText}\n${t('dates.gregorian_date')}: ${gregorianText}`;
		
		await navigator.clipboard.writeText(textToCopy);
		showToast(get(_)('actions.copy_date') + ' ✓', 'success');
		return true;
	} catch (error) {
		console.error('Failed to copy to clipboard:', error);
		showToast('Failed to copy date', 'error');
		return false;
	}
}

/**
 * Share date information using Web Share API or fallback to clipboard
 */
export async function shareDateInfo(
	hijriDate: HijriDate,
	gregorianDate: GregorianDate
): Promise<boolean> {
	try {
		const locale = get(currentLocale);
		const t = get(_);
		
		const hijriText = `${formatDateNumber(hijriDate.day, locale)} ${t(`months.hijri.${hijriDate.month}`)} ${formatDateNumber(hijriDate.year, locale)} ${locale === 'ar' ? 'هـ' : 'AH'}`;
		const gregorianText = `${formatDateNumber(gregorianDate.day, locale)} ${t(`months.gregorian.${gregorianDate.month}`)} ${formatDateNumber(gregorianDate.year, locale)} ${locale === 'ar' ? 'م' : 'CE'}`;
		
		const shareData = {
			title: t('dates.today_hijri'),
			text: `${t('dates.hijri_date')}: ${hijriText}\n${t('dates.gregorian_date')}: ${gregorianText}`,
			url: window.location.href
		};

		// Check if Web Share API is supported
		if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
			await navigator.share(shareData);
			showToast(get(_)('actions.share_date') + ' ✓', 'success');
			return true;
		} else {
			// Fallback to clipboard
			const success = await copyDateToClipboard(hijriDate, gregorianDate);
			if (success) {
				showToast('Date copied to clipboard (share not supported)', 'info');
			}
			return success;
		}
	} catch (error) {
		console.error('Failed to share:', error);
		// Fallback to clipboard on error
		const success = await copyDateToClipboard(hijriDate, gregorianDate);
		if (success) {
			showToast('Date copied to clipboard (share failed)', 'info');
		}
		return success;
	}
}

/**
 * Generate and download ICS calendar file for a specific date
 */
export async function addDateToCalendar(
	hijriDate: HijriDate,
	gregorianDate: GregorianDate
): Promise<boolean> {
	try {
		const locale = get(currentLocale);
		const t = get(_);
		
		const hijriText = `${formatDateNumber(hijriDate.day, locale)} ${t(`months.hijri.${hijriDate.month}`)} ${formatDateNumber(hijriDate.year, locale)} ${locale === 'ar' ? 'هـ' : 'AH'}`;
		
		// Create ICS content for the specific date
		const icsContent = [
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//Hijri Date Platform//EN',
			'CALSCALE:GREGORIAN',
			'BEGIN:VEVENT',
			`UID:hijri-${hijriDate.year}-${hijriDate.month}-${hijriDate.day}-${Date.now()}@hijri-platform`,
			`DTSTART;VALUE=DATE:${gregorianDate.year}${gregorianDate.month.toString().padStart(2, '0')}${gregorianDate.day.toString().padStart(2, '0')}`,
			`DTEND;VALUE=DATE:${gregorianDate.year}${gregorianDate.month.toString().padStart(2, '0')}${(gregorianDate.day + 1).toString().padStart(2, '0')}`,
			`SUMMARY:${hijriText}`,
			`DESCRIPTION:${t('dates.hijri_date')}: ${hijriText}\\n${t('dates.gregorian_date')}: ${formatDateNumber(gregorianDate.day, locale)} ${t(`months.gregorian.${gregorianDate.month}`)} ${formatDateNumber(gregorianDate.year, locale)}`,
			'CATEGORIES:Hijri Calendar,Islamic',
			'END:VEVENT',
			'END:VCALENDAR'
		].join('\r\n');

		// Create and download the file
		const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		
		const link = document.createElement('a');
		link.href = url;
		link.download = `hijri-${hijriDate.year}-${hijriDate.month}-${hijriDate.day}.ics`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		
		URL.revokeObjectURL(url);
		showToast(get(_)('actions.add_to_calendar') + ' ✓', 'success');
		return true;
	} catch (error) {
		console.error('Failed to create calendar event:', error);
		showToast('Failed to create calendar event', 'error');
		return false;
	}
}