/**
 * Google Analytics 4 implementation with performance tracking
 */

declare global {
	interface Window {
		gtag: (...args: any[]) => void;
		dataLayer: any[];
	}
}

export interface AnalyticsConfig {
	measurementId: string;
	enabled: boolean;
}

export class GoogleAnalytics {
	private config: AnalyticsConfig;
	private initialized = false;

	constructor(config: AnalyticsConfig) {
		this.config = config;
	}

	/**
	 * Initialize Google Analytics
	 */
	init(): void {
		if (!this.config.enabled || this.initialized || typeof window === 'undefined') {
			return;
		}

		// Initialize dataLayer
		window.dataLayer = window.dataLayer || [];
		window.gtag = function() {
			window.dataLayer.push(arguments);
		};

		// Configure gtag
		window.gtag('js', new Date());
		window.gtag('config', this.config.measurementId, {
			// Performance tracking settings
			send_page_view: true,
			page_title: document.title,
			page_location: window.location.href,
			// Enhanced measurement for performance
			enhanced_measurement_settings: {
				scrolls: true,
				outbound_clicks: true,
				site_search: false,
				video_engagement: false,
				file_downloads: true
			}
		});

		// Load the Google Analytics script
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
		document.head.appendChild(script);

		this.initialized = true;
	}

	/**
	 * Track page view
	 */
	trackPageView(path?: string, title?: string): void {
		if (!this.config.enabled || typeof window === 'undefined' || !window.gtag) {
			return;
		}

		window.gtag('config', this.config.measurementId, {
			page_path: path || window.location.pathname,
			page_title: title || document.title,
			page_location: window.location.href
		});
	}

	/**
	 * Track custom event
	 */
	trackEvent(eventName: string, parameters?: Record<string, any>): void {
		if (!this.config.enabled || typeof window === 'undefined' || !window.gtag) {
			return;
		}

		window.gtag('event', eventName, parameters);
	}

	/**
	 * Track performance metrics
	 */
	trackPerformance(): void {
		if (!this.config.enabled || typeof window === 'undefined' || !window.gtag) {
			return;
		}

		// Track Core Web Vitals when available
		if ('PerformanceObserver' in window) {
			// Track Largest Contentful Paint (LCP)
			new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (entry.entryType === 'largest-contentful-paint') {
						window.gtag('event', 'web_vitals', {
							name: 'LCP',
							value: Math.round(entry.startTime),
							event_category: 'performance'
						});
					}
				}
			}).observe({ entryTypes: ['largest-contentful-paint'] });

			// Track First Input Delay (FID)
			new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (entry.entryType === 'first-input') {
						window.gtag('event', 'web_vitals', {
							name: 'FID',
							value: Math.round(entry.processingStart - entry.startTime),
							event_category: 'performance'
						});
					}
				}
			}).observe({ entryTypes: ['first-input'] });

			// Track Cumulative Layout Shift (CLS)
			let clsValue = 0;
			new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (!entry.hadRecentInput) {
						clsValue += entry.value;
					}
				}
				window.gtag('event', 'web_vitals', {
					name: 'CLS',
					value: Math.round(clsValue * 1000),
					event_category: 'performance'
				});
			}).observe({ entryTypes: ['layout-shift'] });
		}

		// Track basic navigation timing
		if (window.performance && window.performance.timing) {
			const timing = window.performance.timing;
			const loadTime = timing.loadEventEnd - timing.navigationStart;
			
			if (loadTime > 0) {
				window.gtag('event', 'page_load_time', {
					value: loadTime,
					event_category: 'performance'
				});
			}
		}
	}
}

// Default analytics instance
let analytics: GoogleAnalytics | null = null;

/**
 * Initialize analytics with configuration
 */
export function initAnalytics(config: AnalyticsConfig): GoogleAnalytics {
	analytics = new GoogleAnalytics(config);
	analytics.init();
	return analytics;
}

/**
 * Get the current analytics instance
 */
export function getAnalytics(): GoogleAnalytics | null {
	return analytics;
}

/**
 * Track page view (convenience function)
 */
export function trackPageView(path?: string, title?: string): void {
	analytics?.trackPageView(path, title);
}

/**
 * Track event (convenience function)
 */
export function trackEvent(eventName: string, parameters?: Record<string, any>): void {
	analytics?.trackEvent(eventName, parameters);
}

/**
 * Track performance (convenience function)
 */
export function trackPerformance(): void {
	analytics?.trackPerformance();
}