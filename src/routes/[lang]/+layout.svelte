<script lang="ts">
	import { onMount } from 'svelte';
	import { setupI18n, setLocale, textDirection, currentLocale } from '$lib/i18n';
	import { Navigation } from '$lib/components';
	import '../../app.css';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	let isI18nReady = false;

	// Initialize i18n on mount with server data
	onMount(async () => {
		await setupI18n(data.lang);
		await setLocale(data.lang);
		isI18nReady = true;
	});

	// Update locale when route changes
	$: if (isI18nReady && data.lang && (data.lang === 'ar' || data.lang === 'en')) {
		if ($currentLocale !== data.lang) {
			setLocale(data.lang);
		}
	}
</script>

{#if isI18nReady}
	<div class="app" dir={$textDirection} lang={$currentLocale}>
		<Navigation />
		<main class="main-content">
			<slot />
		</main>
	</div>
{:else}
	<div class="app loading" dir={data.lang === 'ar' ? 'rtl' : 'ltr'} lang={data.lang}>
		<div class="loading-container">
			<div class="loading-spinner"></div>
		</div>
	</div>
{/if}

<style>
	.app {
		min-height: 100vh;
		transition: direction 0.2s ease;
		background: #f9fafb;
	}

	.main-content {
		min-height: calc(100vh - 4rem); /* Account for navigation height */
	}

	/* RTL-specific styles */
	:global([dir="rtl"]) {
		text-align: right;
	}

	:global([dir="ltr"]) {
		text-align: left;
	}

	/* Loading state */
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
	}

	.loading-container {
		text-align: center;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f4f6;
		border-top: 4px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Global RTL utilities */
	:global([dir="rtl"]) :global(.rtl-flip) {
		transform: scaleX(-1);
	}

	:global([dir="rtl"]) :global(.ml-auto) {
		margin-left: auto;
		margin-right: 0;
	}

	:global([dir="rtl"]) :global(.mr-auto) {
		margin-right: auto;
		margin-left: 0;
	}
</style>