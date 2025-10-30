<script lang="ts">
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	interface BreadcrumbItem {
		label: string;
		url?: string;
	}

	export let items: BreadcrumbItem[] = [];
	export let locale: 'ar' | 'en' = 'en';

	// Generate breadcrumbs from current URL if no items provided
	$: breadcrumbs = items.length > 0 ? items : generateBreadcrumbsFromUrl();

	function generateBreadcrumbsFromUrl(): BreadcrumbItem[] {
		const currentPage = get(page);
		const segments = currentPage.url.pathname.split('/').filter(Boolean);
		
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
</script>

<nav class="breadcrumb" aria-label="Breadcrumb" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
	<ol class="breadcrumb-list">
		{#each breadcrumbs as item, index}
			<li class="breadcrumb-item">
				{#if item.url && index < breadcrumbs.length - 1}
					<a href={item.url} class="breadcrumb-link">
						{item.label}
					</a>
				{:else}
					<span class="breadcrumb-current" aria-current="page">
						{item.label}
					</span>
				{/if}
				{#if index < breadcrumbs.length - 1}
					<span class="breadcrumb-separator" aria-hidden="true">
						{locale === 'ar' ? '‹' : '›'}
					</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumb {
		padding: 0.5rem 1rem;
		background-color: #f9fafb;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}
	
	.breadcrumb-list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	
	.breadcrumb-item {
		display: flex;
		align-items: center;
	}
	
	.breadcrumb-link {
		color: #2563eb;
		text-decoration: none;
		transition: color 0.2s;
	}
	
	.breadcrumb-link:hover {
		color: #1d4ed8;
		text-decoration: underline;
	}
	
	.breadcrumb-current {
		color: #6b7280;
		font-weight: 500;
	}
	
	.breadcrumb-separator {
		margin: 0 0.5rem;
		color: #9ca3af;
		user-select: none;
	}

	/* RTL adjustments */
	:global([dir="rtl"]) .breadcrumb-list {
		flex-direction: row-reverse;
	}
	
	:global([dir="rtl"]) .breadcrumb-separator {
		margin: 0 0.25rem;
	}
</style>
