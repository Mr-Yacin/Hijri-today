<script lang="ts">
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n';
	import { currentLocale, formatDateNumber } from '$lib/i18n';
	import { DateDisplay, Card, Button, SEOHead } from '$lib/components';
	import { copyDateToClipboard, shareDateInfo, addDateToCalendar } from '$lib/utils/browser-actions';
	import { generateDateSEO, generateHreflangLinks } from '$lib/utils/seo';
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	// Extract data from server load
	$: ({ hijriDate, gregorianDate, profile, method, country, error } = data);
	
	// Generate SEO data
	$: monthName = $_(`months.hijri.${hijriDate.month}`);
	$: seoData = generateDateSEO(
		hijriDate,
		gregorianDate,
		$currentLocale,
		$page.url.origin,
		$page.url.pathname,
		monthName
	);
	$: seoData.hreflang = generateHreflangLinks($page.url.origin, $page.url.pathname);
	
	// Button states
	let isLoading = {
		copy: false,
		share: false,
		calendar: false
	};
	
	// Action handlers
	async function handleCopyDate() {
		isLoading.copy = true;
		try {
			await copyDateToClipboard(hijriDate, gregorianDate);
		} finally {
			isLoading.copy = false;
		}
	}
	
	async function handleShareDate() {
		isLoading.share = true;
		try {
			await shareDateInfo(hijriDate, gregorianDate);
		} finally {
			isLoading.share = false;
		}
	}
	
	async function handleAddToCalendar() {
		isLoading.calendar = true;
		try {
			await addDateToCalendar(hijriDate, gregorianDate);
		} finally {
			isLoading.calendar = false;
		}
	}
</script>

<SEOHead seo={seoData} />

<div class="container mx-auto px-4 py-8">
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold text-gray-900 mb-2">
			{$_('dates.today_hijri')}
		</h1>
		<p class="text-gray-600">
			{$_('common.today')}
		</p>
	</div>
	
	<div class="max-w-2xl mx-auto">
		{#if error}
			<div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
				<p class="text-sm">{error}</p>
			</div>
		{/if}
		
		<Card title="" variant="primary" padding="large">
			<div class="text-center">
				<DateDisplay
					hijriDay={hijriDate.day}
					hijriMonth={hijriDate.month}
					hijriYear={hijriDate.year}
					gregorianDay={gregorianDate.day}
					gregorianMonth={gregorianDate.month}
					gregorianYear={gregorianDate.year}
					size="large"
					showBoth={true}
				/>
				
				<div class="flex gap-4 justify-center mt-6 flex-wrap">
					<Button 
						variant="primary" 
						icon="📋" 
						loading={isLoading.copy}
						on:click={handleCopyDate}
					>
						{$_('actions.copy_date')}
					</Button>
					<Button 
						variant="outline" 
						icon="📤" 
						loading={isLoading.share}
						on:click={handleShareDate}
					>
						{$_('actions.share_date')}
					</Button>
					<Button 
						variant="outline" 
						icon="📅" 
						loading={isLoading.calendar}
						on:click={handleAddToCalendar}
					>
						{$_('actions.add_to_calendar')}
					</Button>
				</div>
			</div>
		</Card>
		
		<div class="mt-6 text-center text-sm text-gray-500">
			<p>{$_('common.method')}: {$_(`methods.${method}`)}</p>
			<p>{$_('common.country')}: {profile.displayName[$currentLocale] || country}</p>
		</div>
	</div>
</div>