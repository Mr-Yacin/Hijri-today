<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { currentLocale, formatDateNumber, textDirection } from '$lib/i18n';

	export let hijriDay: number;
	export let hijriMonth: number;
	export let hijriYear: number;
	export let gregorianDay: number;
	export let gregorianMonth: number;
	export let gregorianYear: number;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let showBoth: boolean = true;

	$: hijriMonthName = $_(`months.hijri.${hijriMonth}`);
	$: gregorianMonthName = $_(`months.gregorian.${gregorianMonth}`);

	$: sizeClasses = {
		small: 'text-sm',
		medium: 'text-lg',
		large: 'text-2xl'
	};
</script>

<div class="date-display {sizeClasses[size]}" dir={$textDirection}>
	<div class="hijri-date font-semibold mb-2">
		<span class="date-number">{formatDateNumber(hijriDay, $currentLocale)}</span>
		<span class="date-month mx-2">{hijriMonthName}</span>
		<span class="date-number">{formatDateNumber(hijriYear, $currentLocale)}</span>
		<span class="date-suffix text-gray-600 text-sm">
			{$currentLocale === 'ar' ? 'هـ' : 'AH'}
		</span>
	</div>
	
	{#if showBoth}
		<div class="gregorian-date text-gray-600 text-sm">
			<span class="date-number">{formatDateNumber(gregorianDay, $currentLocale)}</span>
			<span class="date-month mx-2">{gregorianMonthName}</span>
			<span class="date-number">{formatDateNumber(gregorianYear, $currentLocale)}</span>
			<span class="date-suffix">
				{$currentLocale === 'ar' ? 'م' : 'CE'}
			</span>
		</div>
	{/if}
</div>

<style>
	.date-display {
		transition: all 0.2s ease;
	}

	/* RTL-specific spacing adjustments */
	:global([dir="rtl"]) .date-display .mx-2 {
		margin-left: 0.5rem;
		margin-right: 0.5rem;
	}

	:global([dir="ltr"]) .date-display .mx-2 {
		margin-left: 0.5rem;
		margin-right: 0.5rem;
	}

	.date-number {
		font-feature-settings: 'tnum' 1; /* Tabular numbers for alignment */
	}
</style>