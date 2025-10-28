<script lang="ts">
	import { page } from '$app/stores';
	import { _ } from 'svelte-i18n';
	import { currentLocale, textDirection, formatDateNumber } from '$lib/i18n';
	import DateDisplay from '$lib/components/DateDisplay.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	// Extract data from server load
	$: ({ hijriDate, gregorianDate, profile, method, country, error } = data);
	
	// Format dates for display
	$: hijriMonthName = $_(`months.hijri.${hijriDate.month}`);
	$: gregorianMonthName = $_(`months.gregorian.${gregorianDate.month}`);
	
	// Method display names
	$: methodDisplayName = profile.displayName[$currentLocale];
	
	// Copy functionality
	async function copyDate() {
		const dateText = $currentLocale === 'ar' 
			? `${formatDateNumber(hijriDate.day, $currentLocale)} ${hijriMonthName} ${formatDateNumber(hijriDate.year, $currentLocale)} هـ`
			: `${formatDateNumber(hijriDate.day, $currentLocale)} ${hijriMonthName} ${formatDateNumber(hijriDate.year, $currentLocale)} AH`;
		
		try {
			await navigator.clipboard.writeText(dateText);
			// In a real app, you'd show a toast notification here
			console.log('Date copied to clipboard');
		} catch (err) {
			console.error('Failed to copy date:', err);
		}
	}
	
	// Share functionality
	async function shareDate() {
		const dateText = $currentLocale === 'ar' 
			? `${formatDateNumber(hijriDate.day, $currentLocale)} ${hijriMonthName} ${formatDateNumber(hijriDate.year, $currentLocale)} هـ`
			: `${formatDateNumber(hijriDate.day, $currentLocale)} ${hijriMonthName} ${formatDateNumber(hijriDate.year, $currentLocale)} AH`;
		
		const shareData = {
			title: $_('dates.today_hijri'),
			text: dateText,
			url: $page.url.toString()
		};
		
		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				// Fallback to copying URL
				await navigator.clipboard.writeText(`${dateText} - ${$page.url.toString()}`);
				console.log('Date and URL copied to clipboard');
			}
		} catch (err) {
			console.error('Failed to share date:', err);
		}
	}
	
	// Add to calendar functionality
	function addToCalendar() {
		const startDate = new Date(gregorianDate.year, gregorianDate.month - 1, gregorianDate.day);
		const endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + 1);
		
		const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
		
		const eventTitle = $currentLocale === 'ar' 
			? `${formatDateNumber(hijriDate.day, $currentLocale)} ${hijriMonthName} ${formatDateNumber(hijriDate.year, $currentLocale)} هـ`
			: `${formatDateNumber(hijriDate.day, $currentLocale)} ${hijriMonthName} ${formatDateNumber(hijriDate.year, $currentLocale)} AH`;
		
		const icsContent = [
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//Hijri Date Platform//EN',
			'BEGIN:VEVENT',
			`DTSTART;VALUE=DATE:${startDate.toISOString().split('T')[0].replace(/-/g, '')}`,
			`DTEND;VALUE=DATE:${endDate.toISOString().split('T')[0].replace(/-/g, '')}`,
			`SUMMARY:${eventTitle}`,
			`DESCRIPTION:${eventTitle} (${formatDateNumber(gregorianDate.day, $currentLocale)} ${gregorianMonthName} ${formatDateNumber(gregorianDate.year, $currentLocale)})`,
			'END:VEVENT',
			'END:VCALENDAR'
		].join('\r\n');
		
		const blob = new Blob([icsContent], { type: 'text/calendar' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `hijri-date-${hijriDate.year}-${hijriDate.month}-${hijriDate.day}.ics`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
	
	// JSON-LD structured data
	$: jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		"name": $_('dates.today_hijri'),
		"description": `${$_('dates.today_hijri')} - ${formatDateNumber(hijriDate.day, $currentLocale)} ${hijriMonthName} ${formatDateNumber(hijriDate.year, $currentLocale)}`,
		"url": $page.url.toString(),
		"mainEntity": {
			"@type": "Event",
			"name": `${formatDateNumber(hijriDate.day, $currentLocale)} ${hijriMonthName} ${formatDateNumber(hijriDate.year, $currentLocale)}`,
			"startDate": `${gregorianDate.year}-${gregorianDate.month.toString().padStart(2, '0')}-${gregorianDate.day.toString().padStart(2, '0')}`,
			"description": `${$_('dates.hijri')} ${formatDateNumber(hijriDate.day, $currentLocale)} ${hijriMonthName} ${formatDateNumber(hijriDate.year, $currentLocale)} ${$currentLocale === 'ar' ? 'هـ' : 'AH'}`
		}
	};
</script>

<svelte:head>
	<title>{$_('dates.today_hijri')} - {formatDateNumber(hijriDate.day, $currentLocale)} {hijriMonthName} {formatDateNumber(hijriDate.year, $currentLocale)}</title>
	<meta name="description" content="{$_('dates.today_hijri')} - {formatDateNumber(hijriDate.day, $currentLocale)} {hijriMonthName} {formatDateNumber(hijriDate.year, $currentLocale)} {$currentLocale === 'ar' ? 'هـ' : 'AH'}" />
	<meta property="og:title" content="{$_('dates.today_hijri')} - {formatDateNumber(hijriDate.day, $currentLocale)} {hijriMonthName} {formatDateNumber(hijriDate.year, $currentLocale)}" />
	<meta property="og:description" content="{$_('dates.today_hijri')} - {formatDateNumber(hijriDate.day, $currentLocale)} {hijriMonthName} {formatDateNumber(hijriDate.year, $currentLocale)} {$currentLocale === 'ar' ? 'هـ' : 'AH'}" />
	<meta property="og:url" content="{$page.url.toString()}" />
	<meta property="og:type" content="website" />
	
	<!-- JSON-LD structured data -->
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<main class="container mx-auto px-4 py-8" dir={$textDirection}>
	<!-- Answer-first content structure -->
	<section class="text-center mb-8">
		<h1 class="text-3xl font-bold mb-4 text-gray-900">
			{$_('dates.today_hijri')}
		</h1>
		
		{#if error}
			<div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
				<p class="text-sm">{error}</p>
			</div>
		{/if}
		
		<!-- Primary date display - answer first -->
		<Card class="max-w-2xl mx-auto mb-6">
			<div class="text-center py-8">
				<!-- Hijri Date - Primary -->
				<div class="mb-6">
					<div class="text-4xl font-bold text-blue-600 mb-2">
						<span class="date-number">{formatDateNumber(hijriDate.day, $currentLocale)}</span>
						<span class="mx-3">{hijriMonthName}</span>
						<span class="date-number">{formatDateNumber(hijriDate.year, $currentLocale)}</span>
					</div>
					<div class="text-lg text-gray-600">
						{$currentLocale === 'ar' ? 'هـ' : 'AH'}
					</div>
				</div>
				
				<!-- Gregorian Date - Secondary -->
				<div class="text-xl text-gray-700 mb-6">
					<span class="date-number">{formatDateNumber(gregorianDate.day, $currentLocale)}</span>
					<span class="mx-2">{gregorianMonthName}</span>
					<span class="date-number">{formatDateNumber(gregorianDate.year, $currentLocale)}</span>
					<span class="ml-2 text-sm">
						{$currentLocale === 'ar' ? 'م' : 'CE'}
					</span>
				</div>
				
				<!-- Action buttons -->
				<div class="flex flex-wrap justify-center gap-3">
					<Button variant="primary" on:click={copyDate}>
						{$_('actions.copy_date')}
					</Button>
					<Button variant="outline" on:click={shareDate}>
						{$_('actions.share_date')}
					</Button>
					<Button variant="outline" on:click={addToCalendar}>
						{$_('actions.add_to_calendar')}
					</Button>
				</div>
			</div>
		</Card>
	</section>
	
	<!-- Method and country information -->
	<section class="max-w-2xl mx-auto">
		<Card>
			<div class="p-6">
				<h2 class="text-xl font-semibold mb-4 text-gray-900">
					{$_('common.method')} & {$_('common.country')}
				</h2>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Calculation Method -->
					<div class="bg-gray-50 rounded-lg p-4">
						<div class="text-sm text-gray-600 mb-1">
							{$_('common.method')}
						</div>
						<div class="font-semibold text-gray-900">
							{methodDisplayName}
						</div>
						<div class="text-xs text-gray-500 mt-1">
							{method}
						</div>
					</div>
					
					<!-- Country Profile -->
					<div class="bg-gray-50 rounded-lg p-4">
						<div class="text-sm text-gray-600 mb-1">
							{$_('common.country')}
						</div>
						<div class="font-semibold text-gray-900">
							{country}
						</div>
						<div class="text-xs text-gray-500 mt-1">
							{profile.timezone}
						</div>
					</div>
				</div>
				
				<!-- Method explanation -->
				<div class="mt-4 p-4 bg-blue-50 rounded-lg">
					<p class="text-sm text-blue-800">
						{#if $currentLocale === 'ar'}
							يتم حساب التاريخ الهجري باستخدام {methodDisplayName} المعتمد في {country}.
						{:else}
							The Hijri date is calculated using the {methodDisplayName} method adopted in {country}.
						{/if}
					</p>
				</div>
			</div>
		</Card>
	</section>
</main>

<style>
	.date-number {
		font-feature-settings: 'tnum' 1; /* Tabular numbers for alignment */
	}
	
	/* RTL-specific adjustments */
	:global([dir="rtl"]) .mx-2 {
		margin-left: 0.5rem;
		margin-right: 0.5rem;
	}
	
	:global([dir="rtl"]) .mx-3 {
		margin-left: 0.75rem;
		margin-right: 0.75rem;
	}
	
	:global([dir="rtl"]) .ml-2 {
		margin-right: 0.5rem;
		margin-left: 0;
	}
	
	/* Ensure proper spacing for Arabic text */
	:global([dir="rtl"]) .text-center {
		text-align: center;
	}
	
	/* Animation for smooth loading */
	main {
		animation: fadeIn 0.3s ease-in-out;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>