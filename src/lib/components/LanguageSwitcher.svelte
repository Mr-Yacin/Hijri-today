<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { currentLocale, getLocalizedPath } from '$lib/i18n';
	import { trackLanguageChange } from '$lib/analytics';

	export let showLabels: boolean = true;
	export let variant: 'button' | 'dropdown' = 'button';

	$: currentPath = $page.url.pathname;
	$: otherLocale = $currentLocale === 'ar' ? 'en' : 'ar';

	async function switchLanguage(targetLocale: 'ar' | 'en') {
		const previousLanguage = $currentLocale;
		const newPath = getLocalizedPath(currentPath, targetLocale);
		await goto(newPath);

		// Track language change for analytics
		trackLanguageChange(targetLocale, previousLanguage);
	}
</script>

{#if variant === 'button'}
	<div class="language-switcher flex gap-2" role="group" aria-label={$_('common.switch_language')}>
		<button
			class="lang-btn {$currentLocale === 'ar' ? 'active' : ''}"
			class:active={$currentLocale === 'ar'}
			on:click={() => switchLanguage('ar')}
			aria-pressed={$currentLocale === 'ar'}
		>
			{showLabels ? $_('navigation.arabic') : 'ع'}
		</button>
		<button
			class="lang-btn {$currentLocale === 'en' ? 'active' : ''}"
			class:active={$currentLocale === 'en'}
			on:click={() => switchLanguage('en')}
			aria-pressed={$currentLocale === 'en'}
		>
			{showLabels ? $_('navigation.english') : 'EN'}
		</button>
	</div>
{:else}
	<div class="language-dropdown relative">
		<select
			class="lang-select"
			value={$currentLocale}
			on:change={(e) => switchLanguage(e.currentTarget.value as 'ar' | 'en')}
			aria-label={$_('common.switch_language')}
		>
			<option value="ar">{$_('navigation.arabic')}</option>
			<option value="en">{$_('navigation.english')}</option>
		</select>
	</div>
{/if}

<style>
	.language-switcher {
		display: flex;
		border-radius: 0.375rem;
		overflow: hidden;
		border: 1px solid #e5e7eb;
	}

	.lang-btn {
		padding: 0.5rem 1rem;
		background: white;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.lang-btn:hover {
		background: #f3f4f6;
	}

	.lang-btn.active {
		background: #3b82f6;
		color: white;
	}

	.lang-btn:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.lang-select {
		padding: 0.5rem 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		background: white;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.lang-select:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
		border-color: #3b82f6;
	}

	/* RTL adjustments */
	:global([dir="rtl"]) .language-switcher {
		flex-direction: row-reverse;
	}
</style>