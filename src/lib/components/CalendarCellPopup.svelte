<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { currentLocale, formatDateNumber } from '$lib/i18n/setup.js';
	import type { CalendarCell } from '../../routes/[lang]/calendar/[year]/[month]/+page.server.js';
	import type { CountryProfile } from '$lib/hijri/types.js';
	
	export let cell: CalendarCell;
	export let profile: CountryProfile;
	export let alternativeProfile: CountryProfile | null = null;
	export let alternativeCell: CalendarCell | null = null;
	export let onClose: () => void;
	
	$: locale = $currentLocale;
	$: isRTL = locale === 'ar';
	
	// Get month name
	function getHijriMonthName(month: number): string {
		return $_(`months.hijri.${month}`);
	}
	
	function getGregorianMonthName(month: number): string {
		return $_(`months.gregorian.${month}`);
	}
	
	// Copy date to clipboard
	async function copyDate(format: 'hijri' | 'gregorian') {
		try {
			let dateText: string;
			
			if (format === 'hijri') {
				dateText = `${formatDateNumber(cell.hijriDate.day, locale)} ${getHijriMonthName(cell.hijriDate.month)} ${formatDateNumber(cell.hijriDate.year, locale)}`;
				if (locale === 'ar') {
					dateText += ' هـ';
				} else {
					dateText += ' AH';
				}
			} else {
				dateText = `${formatDateNumber(cell.gregorianDate.day, locale)} ${getGregorianMonthName(cell.gregorianDate.month)} ${formatDateNumber(cell.gregorianDate.year, locale)}`;
				if (locale === 'ar') {
					dateText += ' م';
				} else {
					dateText += ' CE';
				}
			}
			
			await navigator.clipboard.writeText(dateText);
			
			// Show success feedback (could be enhanced with a toast notification)
			console.log('Date copied to clipboard:', dateText);
		} catch (error) {
			console.error('Failed to copy date:', error);
		}
	}
	
	// Share date
	async function shareDate() {
		const hijriText = `${formatDateNumber(cell.hijriDate.day, locale)} ${getHijriMonthName(cell.hijriDate.month)} ${formatDateNumber(cell.hijriDate.year, locale)}`;
		const gregorianText = `${formatDateNumber(cell.gregorianDate.day, locale)} ${getGregorianMonthName(cell.gregorianDate.month)} ${formatDateNumber(cell.gregorianDate.year, locale)}`;
		
		const shareText = locale === 'ar' 
			? `${hijriText} هـ يوافق ${gregorianText} م`
			: `${hijriText} AH corresponds to ${gregorianText} CE`;
		
		if (navigator.share) {
			try {
				await navigator.share({
					title: $_('actions.share_date'),
					text: shareText
				});
			} catch (error) {
				console.error('Failed to share:', error);
			}
		} else {
			// Fallback to copying to clipboard
			try {
				await navigator.clipboard.writeText(shareText);
				console.log('Date copied to clipboard for sharing:', shareText);
			} catch (error) {
				console.error('Failed to copy for sharing:', error);
			}
		}
	}
	
	// Handle keyboard events
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
	
	// Handle backdrop click
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Backdrop -->
<div 
	class="popup-backdrop" 
	on:click={handleBackdropClick}
	on:keydown={handleKeydown}
	role="dialog"
	aria-modal="true"
	aria-labelledby="popup-title"
	tabindex="-1"
>
	<!-- Popup Content -->
	<div class="popup-content" class:rtl={isRTL}>
		<!-- Header -->
		<header class="popup-header">
			<h2 id="popup-title" class="popup-title">
				{$_('dates.date_details')}
			</h2>
			<button 
				class="close-button"
				on:click={onClose}
				aria-label={$_('common.close')}
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</header>
		
		<!-- Date Information -->
		<div class="date-info">
			<!-- Hijri Date -->
			<div class="date-section hijri-section">
				<h3 class="date-type">{$_('dates.hijri')}</h3>
				<div class="date-display">
					<span class="date-text">
						{formatDateNumber(cell.hijriDate.day, locale)} 
						{getHijriMonthName(cell.hijriDate.month)} 
						{formatDateNumber(cell.hijriDate.year, locale)}
						{locale === 'ar' ? ' هـ' : ' AH'}
					</span>
				</div>
				<button 
					class="copy-button"
					on:click={() => copyDate('hijri')}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
					{$_('common.copy')}
				</button>
			</div>
			
			<!-- Gregorian Date -->
			<div class="date-section gregorian-section">
				<h3 class="date-type">{$_('dates.gregorian')}</h3>
				<div class="date-display">
					<span class="date-text">
						{formatDateNumber(cell.gregorianDate.day, locale)} 
						{getGregorianMonthName(cell.gregorianDate.month)} 
						{formatDateNumber(cell.gregorianDate.year, locale)}
						{locale === 'ar' ? ' م' : ' CE'}
					</span>
				</div>
				<button 
					class="copy-button"
					on:click={() => copyDate('gregorian')}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
					{$_('common.copy')}
				</button>
			</div>
		</div>
		
		<!-- Method Information -->
		<div class="method-info">
			<div class="method-section">
				<span class="method-label">{$_('common.method')}:</span>
				<span class="method-value">{profile.displayName[locale]}</span>
			</div>
			
			{#if alternativeProfile && alternativeCell}
				<div class="alternative-method">
					<div class="method-section">
						<span class="method-label">{$_('dates.alternative_method')}:</span>
						<span class="method-value">{alternativeProfile.displayName[locale]}</span>
					</div>
					<div class="date-difference">
						{#if alternativeCell.hijriDate.day !== cell.hijriDate.day}
							<span class="difference-indicator">
								{alternativeCell.hijriDate.day > cell.hijriDate.day ? '+' : ''}
								{alternativeCell.hijriDate.day - cell.hijriDate.day} 
								{$_('dates.days')}
							</span>
						{:else}
							<span class="no-difference">{$_('dates.same_date')}</span>
						{/if}
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Actions -->
		<div class="popup-actions">
			<button 
				class="action-button share-button"
				on:click={shareDate}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
				</svg>
				{$_('actions.share_date')}
			</button>
		</div>
	</div>
</div>

<style>
	.popup-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}
	
	.popup-content {
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
		max-width: 400px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}
	
	.popup-content.rtl {
		direction: rtl;
	}
	
	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 1.5rem 1rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.popup-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
	}
	
	.close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: none;
		border-radius: 0.375rem;
		background: transparent;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.close-button:hover {
		background: #f3f4f6;
		color: #374151;
	}
	
	.close-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
	
	.date-info {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.date-section {
		text-align: center;
	}
	
	.date-type {
		font-size: 0.875rem;
		font-weight: 500;
		color: #6b7280;
		margin: 0 0 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.date-display {
		margin-bottom: 0.75rem;
	}
	
	.date-text {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		display: block;
	}
	
	.hijri-section .date-text {
		color: #1f2937;
	}
	
	.gregorian-section .date-text {
		color: #374151;
	}
	
	.copy-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		background: white;
		color: #374151;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.copy-button:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}
	
	.copy-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
	
	.method-info {
		padding: 0 1.5rem 1.5rem;
		border-top: 1px solid #f3f4f6;
		padding-top: 1.5rem;
	}
	
	.method-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	
	.method-label {
		font-size: 0.875rem;
		color: #6b7280;
	}
	
	.method-value {
		font-size: 0.875rem;
		font-weight: 500;
		color: #111827;
	}
	
	.alternative-method {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #f3f4f6;
	}
	
	.date-difference {
		text-align: center;
		margin-top: 0.5rem;
	}
	
	.difference-indicator {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background: #fef3c7;
		color: #92400e;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}
	
	.no-difference {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background: #d1fae5;
		color: #065f46;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}
	
	.popup-actions {
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e7eb;
		display: flex;
		justify-content: center;
	}
	
	.action-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid #3b82f6;
		border-radius: 0.375rem;
		background: #3b82f6;
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.action-button:hover {
		background: #2563eb;
		border-color: #2563eb;
	}
	
	.action-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
	
	/* Mobile responsive */
	@media (max-width: 640px) {
		.popup-content {
			margin: 0.5rem;
			max-width: none;
		}
		
		.popup-header {
			padding: 1rem 1rem 0.75rem;
		}
		
		.popup-title {
			font-size: 1.125rem;
		}
		
		.date-info {
			padding: 1rem;
			gap: 1rem;
		}
		
		.date-text {
			font-size: 1.125rem;
		}
		
		.method-info {
			padding: 0 1rem 1rem;
		}
		
		.popup-actions {
			padding: 0.75rem 1rem;
		}
	}
</style>