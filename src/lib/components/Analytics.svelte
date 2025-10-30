<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { initAnalytics, trackPageView, trackPerformance } from '$lib/analytics';
	import { ANALYTICS_CONFIG } from '$lib/config/analytics';
	import { currentLocale } from '$lib/i18n';

	// Initialize analytics on mount
	onMount(() => {
		if (ANALYTICS_CONFIG.enabled) {
			const analytics = initAnalytics(ANALYTICS_CONFIG);

			// Track initial page view
			trackPageView();

			// Track performance metrics after a short delay
			setTimeout(() => {
				trackPerformance();
			}, 1000);
		}
	});

	// Track page changes
	$: if ($page.url && ANALYTICS_CONFIG.enabled) {
		// Track page view on route changes
		trackPageView($page.url.pathname, document?.title);
	}
</script>

<!-- This component has no visual output -->