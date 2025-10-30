<script lang="ts">
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	interface BreadcrumbItem {
		label: string;
		url?: string;
	}

	export let items: BreadcrumbItem[] = [];
	export let locale: 'ar' | 'en' = 'en';

	// Performance optimization: memoize breadcrumb generation
	let lastUrl = '';
	let cachedBreadcrumbs: BreadcrumbItem[] = [];

	// Generate breadcrumbs from current URL if no items provided
	$: currentBreadcrumbs = items.length > 0 ? items : generateBreadcrumbsFromUrl();

	function generateBreadcrumbsFromUrl(): BreadcrumbItem[] {
		const currentPage = get(page);
		const currentUrl = currentPage.url.pathname;

		// Performance optimization: return cached result if URL hasn't changed
		if (currentUrl === lastUrl && cachedBreadcrumbs.length > 0) {
			return cachedBreadcrumbs;
		}

		const segments = currentUrl.split('/').filter(Boolean);

		// Skip language segment
		const langIndex = segments.findIndex(segment => ['ar', 'en'].includes(segment));
		const relevantSegments = langIndex >= 0 ? segments.slice(langIndex + 1) : segments;

		const result: BreadcrumbItem[] = [];

		// Add home link
		const lang = currentPage.params.lang || 'en';
		result.push({
			label: getCurrentPageLabel(currentPage, 'navigation.home', lang, lang === 'ar' ? 'الرئيسية' : 'Home'),
			url: `/${lang}`
		});

		let currentPath = `/${lang}`;

		for (let i = 0; i < relevantSegments.length; i++) {
			const segment = relevantSegments[i];
			currentPath += `/${segment}`;

			// Generate breadcrumb label based on segment
			const label = generateLabelFromSegment(segment, relevantSegments, i, currentPage, lang);

			result.push({
				label,
				url: i === relevantSegments.length - 1 ? undefined : currentPath
			});
		}

		// Cache the result
		lastUrl = currentUrl;
		cachedBreadcrumbs = result;

		return result;
	}

	function generateLabelFromSegment(segment: string, segments: string[], index: number, currentPage: any, lang: string): string {
		if (segment.match(/^\d+$/)) {
			// If it's a number, it's likely a year or month
			if (segments[index - 1] === 'calendar') {
				return getCurrentPageLabel(currentPage, 'calendar.year', lang, lang === 'ar' ? `سنة ${segment}` : `Year ${segment}`);
			} else if (index > 0 && segments[index - 1].match(/^\d+$/)) {
				// It's a month after a year
				const monthNames = lang === 'ar'
					? ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة']
					: ['Muharram', 'Safar', "Rabi' al-awwal", "Rabi' al-thani", 'Jumada al-awwal', 'Jumada al-thani', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', 'Dhu al-Qiadah', 'Dhu al-Hijjah'];
				return monthNames[parseInt(segment) - 1] || segment;
			}
			return segment;
		} else {
			// Handle route names
			switch (segment) {
				case 'calendar':
					return getCurrentPageLabel(currentPage, 'navigation.calendar', lang, lang === 'ar' ? 'التقويم' : 'Calendar');
				case 'convert':
					return getCurrentPageLabel(currentPage, 'navigation.convert', lang, lang === 'ar' ? 'التحويل' : 'Convert');
				case 'today':
					return getCurrentPageLabel(currentPage, 'navigation.today', lang, lang === 'ar' ? 'اليوم' : 'Today');
				default:
					// Capitalize or format the segment
					return segment.charAt(0).toUpperCase() + segment.slice(1);
			}
		}
	}

	function getCurrentPageLabel(currentPage: any, key: string, lang: string, fallback: string): string {
		// Try to get translation from current page data
		if (currentPage.data?.t && typeof currentPage.data.t === 'function') {
			const translated = currentPage.data.t(key);
			if (translated !== key) return translated;
		}
		return fallback;
	}

	// Generate JSON-LD schema for breadcrumbs
	$: schemaData = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		"itemListElement": currentBreadcrumbs.map((item, index) => ({
			"@type": "ListItem",
			"position": index + 1,
			"name": item.label,
			...(item.url && index < currentBreadcrumbs.length - 1 ? {
				"item": {
					"@type": "WebPage",
					"@id": item.url,
					"url": item.url,
					"name": item.label
				}
			} : {})
		}))
	};
</script>

<!-- JSON-LD Schema for SEO -->
<svelte:head>
	<script type="application/ld+json">
		{JSON.stringify(schemaData)}
	</script>
</svelte:head>

