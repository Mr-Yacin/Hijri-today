<script lang="ts">
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n';
	import { currentLocale } from '$lib/i18n';
	import { Card, Button, SEOHead } from '$lib/components';
	import { generateHreflangLinks } from '$lib/utils/seo';
	
	// Generate SEO data for calendar overview page
	$: isArabic = $currentLocale === 'ar';
	$: seoData = {
		title: isArabic ? 'التقويم الهجري - تقويم إسلامي شامل' : 'Hijri Calendar - Complete Islamic Calendar',
		description: isArabic 
			? 'تقويم هجري شامل مع التواريخ الميلادية المقابلة - تقويم إسلامي دقيق لجميع الأشهر والسنوات'
			: 'Complete Hijri calendar with corresponding Gregorian dates - Accurate Islamic calendar for all months and years',
		canonical: `${$page.url.origin}${$page.url.pathname}`,
		openGraph: {
			title: isArabic ? 'التقويم الهجري - تقويم إسلامي شامل' : 'Hijri Calendar - Complete Islamic Calendar',
			description: isArabic 
				? 'تقويم هجري شامل مع التواريخ الميلادية المقابلة'
				: 'Complete Hijri calendar with corresponding Gregorian dates',
			url: `${$page.url.origin}${$page.url.pathname}`,
			type: 'website'
		},
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'WebApplication',
			name: isArabic ? 'التقويم الهجري' : 'Hijri Calendar',
			description: isArabic 
				? 'تقويم هجري شامل مع التواريخ الميلادية المقابلة'
				: 'Complete Hijri calendar with corresponding Gregorian dates',
			url: `${$page.url.origin}${$page.url.pathname}`,
			applicationCategory: 'UtilityApplication'
		},
		hreflang: generateHreflangLinks($page.url.origin, $page.url.pathname)
	};
</script>

<SEOHead seo={seoData} />

<div class="container mx-auto px-4 py-8">
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold text-gray-900 mb-2">
			{$_('common.calendar')}
		</h1>
		<p class="text-gray-600">
			{$_('months.hijri.5')} 1447
		</p>
	</div>
	
	<div class="max-w-4xl mx-auto">
		<Card title="" variant="default" padding="medium">
			<div class="calendar-placeholder text-center py-12">
				<div class="text-6xl mb-4">📅</div>
				<p class="text-gray-600">
					{$_('common.calendar')} - Coming Soon
				</p>
			</div>
		</Card>
	</div>
</div>