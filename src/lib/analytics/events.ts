import { trackEvent } from './google-analytics.js';

/**
 * Track date conversion events
 */
export function trackDateConversion(fromCalendar: 'hijri' | 'gregorian', toCalendar: 'hijri' | 'gregorian', method?: string) {
	trackEvent('date_conversion', {
		from_calendar: fromCalendar,
		to_calendar: toCalendar,
		calculation_method: method,
		event_category: 'engagement'
	});
}

/**
 * Track calendar method selection
 */
export function trackMethodSelection(method: string) {
	trackEvent('method_selection', {
		calculation_method: method,
		event_category: 'engagement'
	});
}

/**
 * Track language change
 */
export function trackLanguageChange(language: string) {
	trackEvent('language_change', {
		language: language,
		event_category: 'engagement'
	});
}

/**
 * Track widget usage
 */
export function trackWidgetUsage(action: 'embed' | 'copy' | 'download') {
	trackEvent('widget_usage', {
		action: action,
		event_category: 'engagement'
	});
}

/**
 * Track calendar export
 */
export function trackCalendarExport(format: 'ics' | 'other') {
	trackEvent('calendar_export', {
		format: format,
		event_category: 'engagement'
	});
}

/**
 * Track error events
 */
export function trackError(errorType: string, errorMessage?: string) {
	trackEvent('error', {
		error_type: errorType,
		error_message: errorMessage,
		event_category: 'error'
	});
}