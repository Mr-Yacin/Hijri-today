<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { setupI18n, setLocale, textDirection, currentLocale } from '$lib/i18n';
	import { Navigation } from '$lib/components';
	import '../../app.css';

	// Get language from route parameter
	$: lang = $page.params.lang as 'ar' | 'en';

	// Initialize i18n on mount
	onMount(async () => {
		setupI18n(lang);
		await setLocale(lang);
	});

	// Update locale when route changes
	$: if (lang && (lang === 'ar' || lang === 'en')) {
		setLocale(lang);
	}
</script>

<div class="app" dir={$textDirection} lang={$currentLocale}>
	<Navigation />
	<main class="main-content">
		<slot />
	</main>
</div>

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