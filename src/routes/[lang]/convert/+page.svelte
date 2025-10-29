<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Card, Button } from '$lib/components';
	import { HijriEngine } from '$lib/hijri/engine.js';
	import type { HijriDate, GregorianDate, CountryProfile } from '$lib/hijri/types.js';
	import type { PageData } from './$types.js';

	export let data: PageData;

	// Initialize engine
	const engine = new HijriEngine();

	// State management
	let activeTab: 'gToH' | 'hToG' = data.initialConversion.mode;
	let isConverting = false;
	let conversionError = '';

	// Gregorian to Hijri form state
	let gDay = data.initialConversion.mode === 'gToH' && data.initialConversion.input ? (data.initialConversion.input as GregorianDate).day : '';
	let gMonth = data.initialConversion.mode === 'gToH' && data.initialConversion.input ? (data.initialConversion.input as GregorianDate).month : '';
	let gYear = data.initialConversion.mode === 'gToH' && data.initialConversion.input ? (data.initialConversion.input as GregorianDate).year : '';
	let gResult: HijriDate | null = data.initialConversion.mode === 'gToH' ? data.initialConversion.result as HijriDate : null;

	// Hijri to Gregorian form state
	let hDay = data.initialConversion.mode === 'hToG' && data.initialConversion.input ? (data.initialConversion.input as HijriDate).day : '';
	let hMonth = data.initialConversion.mode === 'hToG' && data.initialConversion.input ? (data.initialConversion.input as HijriDate).month : '';
	let hYear = data.initialConversion.mode === 'hToG' && data.initialConversion.input ? (data.initialConversion.input as HijriDate).year : '';
	let hResult: GregorianDate | null = data.initialConversion.mode === 'hToG' ? data.initialConversion.result as GregorianDate : null;

	// Validation state
	let gValidation = { day: '', month: '', year: '', general: '' };
	let hValidation = { day: '', month: '', year: '', general: '' };

	// Method comparison state
	let showMethodComparison = false;
	let methodComparisonResults: Array<{
		method: string;
		profile: CountryProfile;
		result: HijriDate | GregorianDate;
		difference?: string;
	}> = [];

	// Available profiles for method comparison
	let availableProfiles: CountryProfile[] = [];

	// Initialize error from server
	if (data.initialConversion.error) {
		conversionError = data.initialConversion.error;
	}

	// Load available profiles for method comparison
	import { getAllProfiles } from '$lib/profiles/utils.js';
	availableProfiles = getAllProfiles();

	// Reactive validation for Gregorian inputs
	$: validateGregorianInputs(gDay, gMonth, gYear);
	$: validateHijriInputs(hDay, hMonth, hYear);

	function validateGregorianInputs(day: string | number, month: string | number, year: string | number) {
		gValidation = { day: '', month: '', year: '', general: '' };

		if (day && (Number(day) < 1 || Number(day) > 31)) {
			gValidation.day = $_('dates.invalid_date');
		}
		if (month && (Number(month) < 1 || Number(month) > 12)) {
			gValidation.month = $_('dates.invalid_date');
		}
		if (year && (Number(year) < data.supportedRange.gregorian.min.split('-')[0] || Number(year) > data.supportedRange.gregorian.max.split('-')[0])) {
			gValidation.year = $_('dates.date_out_of_range');
		}

		// Real-time conversion if all fields are valid and filled
		if (day && month && year && !gValidation.day && !gValidation.month && !gValidation.year) {
			convertGregorianToHijri();
		} else {
			gResult = null;
		}
	}

	function validateHijriInputs(day: string | number, month: string | number, year: string | number) {
		hValidation = { day: '', month: '', year: '', general: '' };

		if (day && (Number(day) < 1 || Number(day) > 30)) {
			hValidation.day = $_('dates.invalid_date');
		}
		if (month && (Number(month) < 1 || Number(month) > 12)) {
			hValidation.month = $_('dates.invalid_date');
		}
		if (year && (Number(year) < data.supportedRange.hijri.min || Number(year) > data.supportedRange.hijri.max)) {
			hValidation.year = $_('dates.date_out_of_range');
		}

		// Real-time conversion if all fields are valid and filled
		if (day && month && year && !hValidation.day && !hValidation.month && !hValidation.year) {
			convertHijriToGregorian();
		} else {
			hResult = null;
		}
	}

	async function convertGregorianToHijri() {
		if (!gDay || !gMonth || !gYear) return;

		isConverting = true;
		conversionError = '';

		try {
			const gregorianDate: GregorianDate = {
				year: Number(gYear),
				month: Number(gMonth),
				day: Number(gDay)
			};

			if (!engine.isValidGregorianDate(gregorianDate)) {
				throw new Error($_('dates.invalid_date'));
			}

			gResult = engine.gregorianToHijri(gregorianDate, data.profile);
			
			// Update URL state
			if (browser) {
				const url = new URL($page.url);
				url.searchParams.set('mode', 'gToH');
				url.searchParams.set('gy', gYear.toString());
				url.searchParams.set('gm', gMonth.toString());
				url.searchParams.set('gd', gDay.toString());
				goto(url.toString(), { replaceState: true, noScroll: true });
			}

		} catch (error) {
			conversionError = error instanceof Error ? error.message : $_('dates.conversion_error');
			gResult = null;
		} finally {
			isConverting = false;
		}
	}

	async function convertHijriToGregorian() {
		if (!hDay || !hMonth || !hYear) return;

		isConverting = true;
		conversionError = '';

		try {
			const hijriDate: HijriDate = {
				year: Number(hYear),
				month: Number(hMonth),
				day: Number(hDay)
			};

			if (!engine.isValidHijriDate(hijriDate)) {
				throw new Error($_('dates.invalid_date'));
			}

			hResult = engine.hijriToGregorian(hijriDate, data.profile);
			
			// Update URL state
			if (browser) {
				const url = new URL($page.url);
				url.searchParams.set('mode', 'hToG');
				url.searchParams.set('hy', hYear.toString());
				url.searchParams.set('hm', hMonth.toString());
				url.searchParams.set('hd', hDay.toString());
				goto(url.toString(), { replaceState: true, noScroll: true });
			}

		} catch (error) {
			conversionError = error instanceof Error ? error.message : $_('dates.conversion_error');
			hResult = null;
		} finally {
			isConverting = false;
		}
	}

	function switchTab(tab: 'gToH' | 'hToG') {
		activeTab = tab;
		conversionError = '';
		showMethodComparison = false;
		
		// Clear URL parameters when switching tabs
		if (browser) {
			const url = new URL($page.url);
			url.search = '';
			goto(url.toString(), { replaceState: true, noScroll: true });
		}
	}

	async function copyResult() {
		if (!browser) return;

		let textToCopy = '';
		if (activeTab === 'gToH' && gResult) {
			textToCopy = `${gDay}/${gMonth}/${gYear} = ${hResult?.day}/${hResult?.month}/${hResult?.year} ${$_('dates.hijri')}`;
		} else if (activeTab === 'hToG' && hResult) {
			textToCopy = `${hDay}/${hMonth}/${hYear} ${$_('dates.hijri')} = ${hResult?.day}/${hResult?.month}/${hResult?.year}`;
		}

		try {
			await navigator.clipboard.writeText(textToCopy);
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	}

	async function shareResult() {
		if (!browser || !navigator.share) return;

		let shareText = '';
		if (activeTab === 'gToH' && gResult) {
			shareText = `${gDay}/${gMonth}/${gYear} = ${gResult.day}/${gResult.month}/${gResult.year} ${$_('dates.hijri')}`;
		} else if (activeTab === 'hToG' && hResult) {
			shareText = `${hDay}/${hMonth}/${hYear} ${$_('dates.hijri')} = ${hResult.day}/${hResult.month}/${hResult.year}`;
		}

		try {
			await navigator.share({
				title: $_('common.convert'),
				text: shareText,
				url: $page.url.toString()
			});
		} catch (error) {
			// Fallback to copy
			copyResult();
		}
	}

	// Generate month options
	function generateMonthOptions(type: 'gregorian' | 'hijri') {
		const options = [];
		for (let i = 1; i <= 12; i++) {
			options.push({
				value: i,
				label: $_(`months.${type}.${i}`)
			});
		}
		return options;
	}

	// Method comparison functionality
	function compareWithOtherMethods() {
		if (!availableProfiles.length) return;

		methodComparisonResults = [];
		
		try {
			if (activeTab === 'gToH' && gDay && gMonth && gYear) {
				const gregorianDate: GregorianDate = {
					year: Number(gYear),
					month: Number(gMonth),
					day: Number(gDay)
				};

				// Get results from different methods
				for (const profile of availableProfiles) {
					try {
						const result = engine.gregorianToHijri(gregorianDate, profile);
						let difference = '';
						
						// Calculate difference from current result
						if (gResult) {
							const daysDiff = calculateDateDifference(gResult, result);
							if (daysDiff !== 0) {
								difference = daysDiff > 0 ? `+${daysDiff} days` : `${daysDiff} days`;
							}
						}

						methodComparisonResults.push({
							method: profile.method,
							profile,
							result,
							difference
						});
					} catch (error) {
						// Skip profiles that can't convert this date
						continue;
					}
				}
			} else if (activeTab === 'hToG' && hDay && hMonth && hYear) {
				const hijriDate: HijriDate = {
					year: Number(hYear),
					month: Number(hMonth),
					day: Number(hDay)
				};

				// Get results from different methods
				for (const profile of availableProfiles) {
					try {
						const result = engine.hijriToGregorian(hijriDate, profile);
						let difference = '';
						
						// Calculate difference from current result
						if (hResult) {
							const daysDiff = calculateGregorianDateDifference(hResult, result);
							if (daysDiff !== 0) {
								difference = daysDiff > 0 ? `+${daysDiff} days` : `${daysDiff} days`;
							}
						}

						methodComparisonResults.push({
							method: profile.method,
							profile,
							result,
							difference
						});
					} catch (error) {
						// Skip profiles that can't convert this date
						continue;
					}
				}
			}

			showMethodComparison = true;
		} catch (error) {
			console.error('Method comparison error:', error);
		}
	}

	function calculateDateDifference(date1: HijriDate, date2: HijriDate): number {
		// Simple approximation - convert to days since epoch
		const days1 = (date1.year - 1) * 354 + (date1.month - 1) * 29.5 + date1.day;
		const days2 = (date2.year - 1) * 354 + (date2.month - 1) * 29.5 + date2.day;
		return Math.round(days1 - days2);
	}

	function calculateGregorianDateDifference(date1: GregorianDate, date2: GregorianDate): number {
		const d1 = new Date(date1.year, date1.month - 1, date1.day);
		const d2 = new Date(date2.year, date2.month - 1, date2.day);
		return Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
	}
</script>

<svelte:head>
	<title>{$_('common.convert')} - Hijri Date Platform</title>
	<meta name="description" content="Convert between Hijri and Gregorian dates instantly with accurate Umm al-Qura calculations" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold text-gray-900 mb-2">
			{$_('common.convert')}
		</h1>
		<p class="text-gray-600">
			{$_('dates.convert_to_hijri')} / {$_('dates.convert_to_gregorian')}
		</p>
	</div>
	
	<div class="max-w-4xl mx-auto">
		<!-- Tab Navigation -->
		<div class="flex border-b border-gray-200 mb-6">
			<button
				class="px-6 py-3 font-medium text-sm border-b-2 transition-colors"
				class:border-blue-500={activeTab === 'gToH'}
				class:text-blue-600={activeTab === 'gToH'}
				class:border-transparent={activeTab !== 'gToH'}
				class:text-gray-500={activeTab !== 'gToH'}
				on:click={() => switchTab('gToH')}
			>
				{$_('dates.convert_to_hijri')}
			</button>
			<button
				class="px-6 py-3 font-medium text-sm border-b-2 transition-colors"
				class:border-blue-500={activeTab === 'hToG'}
				class:text-blue-600={activeTab === 'hToG'}
				class:border-transparent={activeTab !== 'hToG'}
				class:text-gray-500={activeTab !== 'hToG'}
				on:click={() => switchTab('hToG')}
			>
				{$_('dates.convert_to_gregorian')}
			</button>
		</div>

		<!-- Error Display -->
		{#if conversionError}
			<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
				<div class="flex">
					<div class="text-red-800">
						<strong>{$_('common.error')}:</strong> {conversionError}
					</div>
				</div>
			</div>
		{/if}

		<!-- Gregorian to Hijri Tab -->
		{#if activeTab === 'gToH'}
			<div class="grid md:grid-cols-2 gap-6">
				<!-- Input Form -->
				<Card title="{$_('dates.gregorian')} {$_('dates.day')}" variant="default" padding="medium">
					<div class="space-y-4">
						<div>
							<label for="g-day" class="block text-sm font-medium text-gray-700 mb-2">
								{$_('dates.day')}
							</label>
							<input
								id="g-day"
								type="number"
								min="1"
								max="31"
								bind:value={gDay}
								class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								class:border-red-300={gValidation.day}
								class:border-gray-300={!gValidation.day}
								placeholder="28"
							/>
							{#if gValidation.day}
								<p class="text-red-600 text-sm mt-1">{gValidation.day}</p>
							{/if}
						</div>
						<div>
							<label for="g-month" class="block text-sm font-medium text-gray-700 mb-2">
								{$_('dates.month')}
							</label>
							<select
								id="g-month"
								bind:value={gMonth}
								class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								class:border-red-300={gValidation.month}
								class:border-gray-300={!gValidation.month}
							>
								<option value="">Select month</option>
								{#each generateMonthOptions('gregorian') as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
							{#if gValidation.month}
								<p class="text-red-600 text-sm mt-1">{gValidation.month}</p>
							{/if}
						</div>
						<div>
							<label for="g-year" class="block text-sm font-medium text-gray-700 mb-2">
								{$_('dates.year')}
							</label>
							<input
								id="g-year"
								type="number"
								min={data.supportedRange.gregorian.min.split('-')[0]}
								max={data.supportedRange.gregorian.max.split('-')[0]}
								bind:value={gYear}
								class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								class:border-red-300={gValidation.year}
								class:border-gray-300={!gValidation.year}
								placeholder="2025"
							/>
							{#if gValidation.year}
								<p class="text-red-600 text-sm mt-1">{gValidation.year}</p>
							{/if}
						</div>
					</div>
				</Card>

				<!-- Result Display -->
				<Card title="{$_('dates.conversion_result')}" variant="primary" padding="medium">
					{#if isConverting}
						<div class="flex items-center justify-center py-8">
							<div class="text-blue-600">{$_('common.loading')}</div>
						</div>
					{:else if gResult}
						<div class="space-y-4">
							<div class="text-center">
								<div class="text-3xl font-bold text-blue-900 mb-2">
									{gResult.day} {$_(`months.hijri.${gResult.month}`)} {gResult.year}
								</div>
								<div class="text-gray-600">
									{$_('dates.hijri')} • {$_(`methods.${data.profile.method}`)}
								</div>
							</div>
							
							<div class="flex gap-2 justify-center">
								<Button variant="outline" size="small" on:click={copyResult}>
									{$_('common.copy')}
								</Button>
								<Button variant="outline" size="small" on:click={shareResult}>
									{$_('common.share')}
								</Button>
								<Button variant="ghost" size="small" on:click={compareWithOtherMethods}>
									{$_('dates.method_comparison')}
								</Button>
							</div>
						</div>
					{:else}
						<div class="text-center py-8 text-gray-500">
							Enter a valid Gregorian date to see the conversion
						</div>
					{/if}
				</Card>
			</div>
		{/if}

		<!-- Hijri to Gregorian Tab -->
		{#if activeTab === 'hToG'}
			<div class="grid md:grid-cols-2 gap-6">
				<!-- Input Form -->
				<Card title="{$_('dates.hijri')} {$_('dates.day')}" variant="default" padding="medium">
					<div class="space-y-4">
						<div>
							<label for="h-day" class="block text-sm font-medium text-gray-700 mb-2">
								{$_('dates.day')}
							</label>
							<input
								id="h-day"
								type="number"
								min="1"
								max="30"
								bind:value={hDay}
								class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								class:border-red-300={hValidation.day}
								class:border-gray-300={!hValidation.day}
								placeholder="3"
							/>
							{#if hValidation.day}
								<p class="text-red-600 text-sm mt-1">{hValidation.day}</p>
							{/if}
						</div>
						<div>
							<label for="h-month" class="block text-sm font-medium text-gray-700 mb-2">
								{$_('dates.month')}
							</label>
							<select
								id="h-month"
								bind:value={hMonth}
								class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								class:border-red-300={hValidation.month}
								class:border-gray-300={!hValidation.month}
							>
								<option value="">Select month</option>
								{#each generateMonthOptions('hijri') as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
							{#if hValidation.month}
								<p class="text-red-600 text-sm mt-1">{hValidation.month}</p>
							{/if}
						</div>
						<div>
							<label for="h-year" class="block text-sm font-medium text-gray-700 mb-2">
								{$_('dates.year')}
							</label>
							<input
								id="h-year"
								type="number"
								min={data.supportedRange.hijri.min}
								max={data.supportedRange.hijri.max}
								bind:value={hYear}
								class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								class:border-red-300={hValidation.year}
								class:border-gray-300={!hValidation.year}
								placeholder="1447"
							/>
							{#if hValidation.year}
								<p class="text-red-600 text-sm mt-1">{hValidation.year}</p>
							{/if}
						</div>
					</div>
				</Card>

				<!-- Result Display -->
				<Card title="{$_('dates.conversion_result')}" variant="primary" padding="medium">
					{#if isConverting}
						<div class="flex items-center justify-center py-8">
							<div class="text-blue-600">{$_('common.loading')}</div>
						</div>
					{:else if hResult}
						<div class="space-y-4">
							<div class="text-center">
								<div class="text-3xl font-bold text-blue-900 mb-2">
									{hResult.day} {$_(`months.gregorian.${hResult.month}`)} {hResult.year}
								</div>
								<div class="text-gray-600">
									{$_('dates.gregorian')} • {$_(`methods.${data.profile.method}`)}
								</div>
							</div>
							
							<div class="flex gap-2 justify-center">
								<Button variant="outline" size="small" on:click={copyResult}>
									{$_('common.copy')}
								</Button>
								<Button variant="outline" size="small" on:click={shareResult}>
									{$_('common.share')}
								</Button>
								<Button variant="ghost" size="small" on:click={compareWithOtherMethods}>
									{$_('dates.method_comparison')}
								</Button>
							</div>
						</div>
					{:else}
						<div class="text-center py-8 text-gray-500">
							Enter a valid Hijri date to see the conversion
						</div>
					{/if}
				</Card>
			</div>
		{/if}

		<!-- Method Comparison Results -->
		{#if showMethodComparison && methodComparisonResults.length > 0}
			<div class="mt-8">
				<Card title="{$_('dates.method_comparison')}" variant="secondary" padding="medium">
					<div class="space-y-3">
						{#each methodComparisonResults as comparison}
							<div class="flex justify-between items-center p-3 bg-white rounded border">
								<div class="flex-1">
									<div class="font-medium text-gray-900">
										{$_(`methods.${comparison.method}`)}
									</div>
									<div class="text-sm text-gray-600">
										{comparison.profile.country} • {comparison.profile.displayName[$page.params.lang === 'ar' ? 'ar' : 'en']}
									</div>
								</div>
								<div class="text-right">
									<div class="font-mono text-lg">
										{#if activeTab === 'gToH'}
											{comparison.result.day}/{comparison.result.month}/{comparison.result.year}
										{:else}
											{comparison.result.day}/{comparison.result.month}/{comparison.result.year}
										{/if}
									</div>
									{#if comparison.difference}
										<div class="text-sm" class:text-red-600={comparison.difference.includes('-')} class:text-green-600={comparison.difference.includes('+')}>
											{comparison.difference}
										</div>
									{:else}
										<div class="text-sm text-gray-500">Same as current</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
					<div class="mt-4 text-center">
						<Button variant="ghost" size="small" on:click={() => showMethodComparison = false}>
							Hide Comparison
						</Button>
					</div>
				</Card>
			</div>
		{/if}

		<!-- Method Information -->
		<div class="mt-8 text-center">
			<div class="bg-gray-50 rounded-lg p-4">
				<p class="text-sm text-gray-600">
					Using <strong>{$_(`methods.${data.profile.method}`)}</strong> method for <strong>{data.profile.country}</strong>
					{#if data.profile.offset !== 0}
						with {data.profile.offset > 0 ? '+' : ''}{data.profile.offset} day offset
					{/if}
				</p>
			</div>
		</div>
	</div>
</div>