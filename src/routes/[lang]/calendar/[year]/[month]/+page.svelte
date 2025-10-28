<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import { currentLocale, formatDateNumber } from '$lib/i18n/setup.js';
	import { HijriEngine } from '$lib/hijri/engine.js';
	import { getCountryProfiles } from '$lib/profiles/config.js';
	import CalendarCellPopup from '$lib/components/CalendarCellPopup.svelte';
	import type { PageData } from './$types';
	import type { CalendarCell } from './+page.server.js';
	import type { CountryProfile } from '$lib/hijri/types.js';
	
	export let data: PageData;
	
	$: calendar = data.calendar;
	$: locale = $currentLocale;
	$: isRTL = locale === 'ar';
	
	// State for popup and method toggle
	let selectedCell: CalendarCell | null = null;
	let showPopup = false;
	let alternativeProfile: CountryProfile | null = null;
	let alternativeCell: CalendarCell | null = null;
	let showMethodToggle = false;
	let focusedCellIndex = -1;
	
	// Initialize Hijri engine for alternative calculations
	const hijriEngine = new HijriEngine();
	
	// Get available country profiles for method comparison
	$: availableProfiles = getCountryProfiles();
	$: alternativeProfiles = availableProfiles.filter(p => 
		p.country !== calendar.profile.country && 
		p.method !== calendar.profile.method
	);
	
	// Navigation functions
	function navigateToMonth(year: number, month: number) {
		const lang = $page.params.lang;
		goto(`/${lang}/calendar/${year}/${month}`);
	}
	
	function goToPreviousMonth() {
		let prevYear = calendar.hijriYear;
		let prevMonth = calendar.hijriMonth - 1;
		
		if (prevMonth < 1) {
			prevMonth = 12;
			prevYear--;
		}
		
		navigateToMonth(prevYear, prevMonth);
	}
	
	function goToNextMonth() {
		let nextYear = calendar.hijriYear;
		let nextMonth = calendar.hijriMonth + 1;
		
		if (nextMonth > 12) {
			nextMonth = 1;
			nextYear++;
		}
		
		navigateToMonth(nextYear, nextMonth);
	}
	
	function jumpToToday() {
		navigateToMonth(calendar.todayHijri.year, calendar.todayHijri.month);
	}
	
	// Toggle method comparison
	function toggleMethodComparison() {
		showMethodToggle = !showMethodToggle;
		
		if (showMethodToggle && alternativeProfiles.length > 0) {
			alternativeProfile = alternativeProfiles[0];
		} else {
			alternativeProfile = null;
		}
	}
	
	// Calculate alternative date for a cell
	function calculateAlternativeCell(cell: CalendarCell): CalendarCell | null {
		if (!alternativeProfile) return null;
		
		try {
			// Convert using alternative profile
			const altHijri = hijriEngine.gregorianToHijri(cell.gregorianDate, alternativeProfile);
			const altGregorian = hijriEngine.hijriToGregorian(altHijri, alternativeProfile);
			
			return {
				hijriDate: altHijri,
				gregorianDate: altGregorian,
				isCurrentMonth: cell.isCurrentMonth,
				isToday: cell.isToday,
				dayOfWeek: cell.dayOfWeek
			};
		} catch (error) {
			console.error('Error calculating alternative date:', error);
			return null;
		}
	}
	
	// Get month name
	function getHijriMonthName(month: number): string {
		return $_(`months.hijri.${month}`);
	}
	
	// Get weekday names
	function getWeekdayNames(): string[] {
		if (locale === 'ar') {
			return ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
		}
		return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	}
	
	// Handle cell click - show detailed popup
	function handleCellClick(cell: CalendarCell) {
		selectedCell = cell;
		alternativeCell = calculateAlternativeCell(cell);
		showPopup = true;
	}
	
	// Close popup
	function closePopup() {
		showPopup = false;
		selectedCell = null;
		alternativeCell = null;
	}
	
	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				if (isRTL) {
					goToNextMonth();
				} else {
					goToPreviousMonth();
				}
				break;
			case 'ArrowRight':
				event.preventDefault();
				if (isRTL) {
					goToPreviousMonth();
				} else {
					goToNextMonth();
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (focusedCellIndex >= 7) {
					focusedCellIndex -= 7;
					focusCell(focusedCellIndex);
				}
				break;
			case 'ArrowDown':
				event.preventDefault();
				if (focusedCellIndex < calendar.cells.length - 7) {
					focusedCellIndex += 7;
					focusCell(focusedCellIndex);
				}
				break;
			case 'Home':
				event.preventDefault();
				jumpToToday();
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				if (focusedCellIndex >= 0 && focusedCellIndex < calendar.cells.length) {
					handleCellClick(calendar.cells[focusedCellIndex]);
				}
				break;
			case 'Escape':
				event.preventDefault();
				if (showPopup) {
					closePopup();
				}
				break;
		}
	}
	
	// Focus a specific cell
	function focusCell(index: number) {
		const cellElement = document.querySelector(`[data-cell-index="${index}"]`) as HTMLElement;
		if (cellElement) {
			cellElement.focus();
		}
	}
	
	// Handle cell focus
	function handleCellFocus(index: number) {
		focusedCellIndex = index;
	}
	
	// Check if dates are different between methods
	function hasDifference(cell: CalendarCell): boolean {
		if (!alternativeProfile) return false;
		const altCell = calculateAlternativeCell(cell);
		return altCell ? altCell.hijriDate.day !== cell.hijriDate.day : false;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="calendar-container" class:rtl={isRTL}>
	<!-- Calendar Header with Navigation -->
	<header class="calendar-header">
		<div class="calendar-nav">
			<button 
				class="nav-button prev-button"
				on:click={goToPreviousMonth}
				aria-label={isRTL ? 'الشهر التالي' : 'Previous month'}
			>
				{#if isRTL}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				{:else}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				{/if}
			</button>
			
			<h1 class="calendar-title">
				{getHijriMonthName(calendar.hijriMonth)} {formatDateNumber(calendar.hijriYear, locale)}
			</h1>
			
			<button 
				class="nav-button next-button"
				on:click={goToNextMonth}
				aria-label={isRTL ? 'الشهر السابق' : 'Next month'}
			>
				{#if isRTL}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				{:else}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				{/if}
			</button>
		</div>
		
		<div class="calendar-actions">
			<button 
				class="method-toggle-button"
				class:active={showMethodToggle}
				on:click={toggleMethodComparison}
				disabled={alternativeProfiles.length === 0}
			>
				{$_('dates.compare_methods') || 'Compare Methods'}
			</button>
			<button 
				class="today-button"
				on:click={jumpToToday}
			>
				{$_('common.today')}
			</button>
		</div>
	</header>
	
	<!-- Calendar Grid -->
	<div class="calendar-grid">
		<!-- Weekday Headers -->
		<div class="weekday-headers">
			{#each getWeekdayNames() as weekday}
				<div class="weekday-header">
					{weekday}
				</div>
			{/each}
		</div>
		
		<!-- Calendar Cells -->
		<div class="calendar-cells">
			{#each calendar.cells as cell, index}
				<button
					class="calendar-cell"
					class:current-month={cell.isCurrentMonth}
					class:other-month={!cell.isCurrentMonth}
					class:today={cell.isToday}
					class:has-difference={showMethodToggle && hasDifference(cell)}
					data-cell-index={index}
					on:click={() => handleCellClick(cell)}
					on:focus={() => handleCellFocus(index)}
					tabindex={cell.isCurrentMonth ? 0 : -1}
					aria-label={`${formatDateNumber(cell.hijriDate.day, locale)} ${getHijriMonthName(cell.hijriDate.month)} ${formatDateNumber(cell.hijriDate.year, locale)}`}
				>
					<div class="cell-content">
						<div class="hijri-date">
							{formatDateNumber(cell.hijriDate.day, locale)}
						</div>
						<div class="gregorian-date">
							{formatDateNumber(cell.gregorianDate.day, locale)}
						</div>
						{#if showMethodToggle && hasDifference(cell)}
							<div class="difference-indicator">
								<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
								</svg>
							</div>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</div>
	
	<!-- Calendar Footer -->
	<footer class="calendar-footer">
		<div class="method-info">
			<span class="method-label">{$_('common.method')}:</span>
			<span class="method-value">{calendar.profile.displayName[locale]}</span>
			{#if showMethodToggle && alternativeProfile}
				<span class="alternative-method-info">
					vs {alternativeProfile.displayName[locale]}
				</span>
			{/if}
		</div>
		<div class="legend">
			<div class="legend-item">
				<div class="legend-color hijri-color"></div>
				<span>{$_('dates.hijri')}</span>
			</div>
			<div class="legend-item">
				<div class="legend-color gregorian-color"></div>
				<span>{$_('dates.gregorian')}</span>
			</div>
			{#if showMethodToggle}
				<div class="legend-item">
					<div class="legend-color difference-color"></div>
					<span>{$_('dates.method_difference') || 'Method Difference'}</span>
				</div>
			{/if}
		</div>
	</footer>
</div>

<!-- Popup -->
{#if showPopup && selectedCell}
	<CalendarCellPopup 
		cell={selectedCell}
		profile={calendar.profile}
		{alternativeProfile}
		{alternativeCell}
		onClose={closePopup}
	/>
{/if}

<style>
	.calendar-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem;
	}
	
	.calendar-container.rtl {
		direction: rtl;
	}
	
	/* Header Styles */
	.calendar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}
	
	.calendar-nav {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.nav-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		background: white;
		color: #374151;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.nav-button:hover {
		background: #f3f4f6;
		border-color: #9ca3af;
	}
	
	.nav-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
	
	.calendar-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
		min-width: 200px;
		text-align: center;
	}
	
	.method-toggle-button {
		padding: 0.5rem 1rem;
		border: 1px solid #6b7280;
		border-radius: 0.5rem;
		background: white;
		color: #374151;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
	}
	
	.method-toggle-button:hover {
		background: #f9fafb;
		border-color: #4b5563;
	}
	
	.method-toggle-button.active {
		background: #fbbf24;
		border-color: #f59e0b;
		color: #92400e;
	}
	
	.method-toggle-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.method-toggle-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
	
	.today-button {
		padding: 0.5rem 1rem;
		border: 1px solid #3b82f6;
		border-radius: 0.5rem;
		background: #3b82f6;
		color: white;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.today-button:hover {
		background: #2563eb;
		border-color: #2563eb;
	}
	
	.today-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
	
	/* Grid Styles */
	.calendar-grid {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: hidden;
		background: white;
	}
	
	.weekday-headers {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.weekday-header {
		padding: 0.75rem;
		text-align: center;
		font-weight: 600;
		color: #374151;
		font-size: 0.875rem;
	}
	
	.calendar-cells {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}
	
	.calendar-cell {
		aspect-ratio: 1;
		border: none;
		border-right: 1px solid #e5e7eb;
		border-bottom: 1px solid #e5e7eb;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.calendar-cell:nth-child(7n) {
		border-right: none;
	}
	
	.calendar-cell:hover {
		background: #f3f4f6;
	}
	
	.calendar-cell:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
		z-index: 1;
	}
	
	.calendar-cell.other-month {
		background: #f9fafb;
		color: #9ca3af;
	}
	
	.calendar-cell.other-month:hover {
		background: #f3f4f6;
	}
	
	.calendar-cell.today {
		background: #dbeafe;
		border-color: #3b82f6;
		position: relative;
	}
	
	.calendar-cell.today::after {
		content: '';
		position: absolute;
		top: 2px;
		right: 2px;
		width: 6px;
		height: 6px;
		background: #3b82f6;
		border-radius: 50%;
	}
	
	.calendar-cell.has-difference {
		border-color: #f59e0b;
		background: #fffbeb;
	}
	
	.calendar-cell.has-difference:hover {
		background: #fef3c7;
	}
	
	.cell-content {
		text-align: center;
		line-height: 1.2;
		position: relative;
		width: 100%;
	}
	
	.difference-indicator {
		position: absolute;
		top: -2px;
		left: -2px;
		color: #f59e0b;
		z-index: 1;
	}
	
	.hijri-date {
		font-size: 1rem;
		font-weight: 600;
		color: #111827;
	}
	
	.gregorian-date {
		font-size: 0.75rem;
		color: #6b7280;
		margin-top: 0.125rem;
	}
	
	.calendar-cell.other-month .hijri-date {
		color: #9ca3af;
	}
	
	.calendar-cell.other-month .gregorian-date {
		color: #d1d5db;
	}
	
	/* Footer Styles */
	.calendar-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
		flex-wrap: wrap;
		gap: 1rem;
	}
	
	.method-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}
	
	.method-label {
		color: #6b7280;
	}
	
	.method-value {
		font-weight: 500;
		color: #111827;
	}
	
	.alternative-method-info {
		font-size: 0.75rem;
		color: #f59e0b;
		font-weight: 500;
		margin-left: 0.5rem;
	}
	
	.legend {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
	}
	
	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	
	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 2px;
	}
	
	.hijri-color {
		background: #111827;
	}
	
	.gregorian-color {
		background: #6b7280;
	}
	
	.difference-color {
		background: #f59e0b;
	}
	
	/* Responsive Design */
	@media (max-width: 640px) {
		.calendar-container {
			padding: 0.5rem;
		}
		
		.calendar-header {
			flex-direction: column;
			align-items: stretch;
		}
		
		.calendar-actions {
			flex-direction: column;
			gap: 0.5rem;
		}
		
		.calendar-nav {
			justify-content: center;
		}
		
		.calendar-title {
			font-size: 1.25rem;
		}
		
		.calendar-cell {
			padding: 0.25rem;
		}
		
		.hijri-date {
			font-size: 0.875rem;
		}
		
		.gregorian-date {
			font-size: 0.625rem;
		}
		
		.calendar-footer {
			flex-direction: column;
			align-items: stretch;
			text-align: center;
		}
		
		.legend {
			justify-content: center;
		}
	}
</style>