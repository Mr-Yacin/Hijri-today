<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	
	let widgetScript: HTMLScriptElement;
	let widgetCSS: HTMLLinkElement;
	let testResults: Record<string, any> = {};
	let isTestingComplete = false;

	onMount(() => {
		// Load widget CSS
		widgetCSS = document.createElement('link');
		widgetCSS.rel = 'stylesheet';
		widgetCSS.href = '/hijri-widget.css';
		document.head.appendChild(widgetCSS);

		// Load widget script
		widgetScript = document.createElement('script');
		widgetScript.src = '/hijri-widget.js';
		widgetScript.async = true;
		widgetScript.onload = () => {
			// Wait a bit for widgets to initialize
			setTimeout(runTests, 2000);
		};
		document.head.appendChild(widgetScript);

		return () => {
			if (widgetScript) {
				document.head.removeChild(widgetScript);
			}
			if (widgetCSS) {
				document.head.removeChild(widgetCSS);
			}
		};
	});

	function runTests() {
		console.log('Running widget tests...');
		
		// Test 1: Check if HijriWidget global is available
		testResults.globalAPI = typeof window.HijriWidget !== 'undefined';
		
		// Test 2: Check widget statistics
		if (window.HijriWidget) {
			testResults.stats = window.HijriWidget.getStats();
		}
		
		// Test 3: Check if widgets are rendered
		const widgets = document.querySelectorAll('.hijri-widget');
		testResults.widgetCount = widgets.length;
		testResults.widgetsRendered = widgets.length > 0;
		
		// Test 4: Check if widgets have content
		let widgetsWithContent = 0;
		widgets.forEach(widget => {
			const dateElement = widget.querySelector('.hijri-widget-hijri-date');
			if (dateElement && dateElement.textContent && dateElement.textContent.trim() !== '') {
				widgetsWithContent++;
			}
		});
		testResults.widgetsWithContent = widgetsWithContent;
		
		// Test 5: Check theme classes
		const themes = ['light', 'dark', 'compact', 'minimal', 'auto'];
		testResults.themeTests = {};
		themes.forEach(theme => {
			const themeWidgets = document.querySelectorAll(`.hijri-widget-${theme}`);
			testResults.themeTests[theme] = themeWidgets.length > 0;
		});
		
		// Test 6: Check RTL support
		const rtlWidgets = document.querySelectorAll('.hijri-widget-rtl');
		testResults.rtlSupport = rtlWidgets.length > 0;
		
		// Test 7: Check copy buttons
		const copyButtons = document.querySelectorAll('.hijri-widget-copy-btn');
		testResults.copyButtons = copyButtons.length;
		
		isTestingComplete = true;
		console.log('Widget tests completed:', testResults);
	}

	function refreshAllWidgets() {
		if (window.HijriWidget) {
			window.HijriWidget.refresh();
		}
	}

	function testCopyFunctionality() {
		const copyButton = document.querySelector('.hijri-widget-copy-btn') as HTMLButtonElement;
		if (copyButton) {
			copyButton.click();
		}
	}
</script>

<svelte:head>
	<title>Hijri Widget Test Page</title>
	<meta name="description" content="Test page for Hijri Date Widget functionality and themes" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<header class="text-center mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-4">Hijri Widget Test Page</h1>
		<p class="text-lg text-gray-600">
			This page tests all widget functionality, themes, and configurations.
		</p>
	</header>

	<!-- Test Controls -->
	<section class="mb-8 bg-blue-50 p-6 rounded-lg">
		<h2 class="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
		<div class="flex gap-4 flex-wrap">
			<button 
				on:click={refreshAllWidgets}
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
			>
				Refresh All Widgets
			</button>
			<button 
				on:click={testCopyFunctionality}
				class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
			>
				Test Copy Function
			</button>
			<button 
				on:click={runTests}
				class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
			>
				Run Tests Again
			</button>
		</div>
	</section>

	<!-- Test Results -->
	{#if isTestingComplete}
	<section class="mb-8 bg-gray-50 p-6 rounded-lg">
		<h2 class="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
			<div class="bg-white p-4 rounded border">
				<h3 class="font-medium text-gray-900">Global API</h3>
				<p class="text-sm {testResults.globalAPI ? 'text-green-600' : 'text-red-600'}">
					{testResults.globalAPI ? '✓ Available' : '✗ Not Available'}
				</p>
			</div>
			
			<div class="bg-white p-4 rounded border">
				<h3 class="font-medium text-gray-900">Widget Count</h3>
				<p class="text-sm text-gray-600">
					{testResults.widgetCount} widgets found
				</p>
			</div>
			
			<div class="bg-white p-4 rounded border">
				<h3 class="font-medium text-gray-900">Content Loaded</h3>
				<p class="text-sm {testResults.widgetsWithContent > 0 ? 'text-green-600' : 'text-red-600'}">
					{testResults.widgetsWithContent} widgets with content
				</p>
			</div>
			
			<div class="bg-white p-4 rounded border">
				<h3 class="font-medium text-gray-900">RTL Support</h3>
				<p class="text-sm {testResults.rtlSupport ? 'text-green-600' : 'text-red-600'}">
					{testResults.rtlSupport ? '✓ Working' : '✗ Not Working'}
				</p>
			</div>
			
			<div class="bg-white p-4 rounded border">
				<h3 class="font-medium text-gray-900">Copy Buttons</h3>
				<p class="text-sm text-gray-600">
					{testResults.copyButtons} copy buttons found
				</p>
			</div>
			
			<div class="bg-white p-4 rounded border">
				<h3 class="font-medium text-gray-900">Widget Stats</h3>
				{#if testResults.stats}
					<p class="text-xs text-gray-600">
						Total: {testResults.stats.totalWidgets}<br>
						Loading: {testResults.stats.loadingWidgets}<br>
						Errors: {testResults.stats.errorCount}
					</p>
				{:else}
					<p class="text-sm text-red-600">No stats available</p>
				{/if}
			</div>
		</div>
		
		<!-- Theme Test Results -->
		{#if testResults.themeTests}
		<div class="mt-6">
			<h3 class="font-medium text-gray-900 mb-3">Theme Tests</h3>
			<div class="grid grid-cols-5 gap-2">
				{#each Object.entries(testResults.themeTests) as [theme, working]}
					<div class="bg-white p-2 rounded border text-center">
						<div class="text-xs font-medium text-gray-700">{theme}</div>
						<div class="text-sm {working ? 'text-green-600' : 'text-red-600'}">
							{working ? '✓' : '✗'}
						</div>
					</div>
				{/each}
			</div>
		</div>
		{/if}
	</section>
	{/if}

	<!-- Theme Tests -->
	<section class="mb-8">
		<h2 class="text-2xl font-semibold text-gray-900 mb-6">Theme Tests</h2>
		
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			<!-- Light Theme -->
			<div class="bg-white p-6 rounded-lg border">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Light Theme (Default)</h3>
				<div data-hijri-widget data-lang="en" data-theme="light"></div>
			</div>

			<!-- Dark Theme -->
			<div class="bg-gray-900 p-6 rounded-lg">
				<h3 class="text-lg font-medium text-white mb-4">Dark Theme</h3>
				<div data-hijri-widget data-lang="en" data-theme="dark"></div>
			</div>

			<!-- Auto Theme -->
			<div class="bg-gray-100 p-6 rounded-lg border">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Auto Theme</h3>
				<div data-hijri-widget data-lang="en" data-theme="auto"></div>
			</div>

			<!-- Compact Theme -->
			<div class="bg-white p-6 rounded-lg border">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Compact Theme</h3>
				<div data-hijri-widget data-lang="en" data-theme="compact"></div>
			</div>

			<!-- Minimal Theme -->
			<div class="bg-white p-6 rounded-lg border">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Minimal Theme</h3>
				<div data-hijri-widget data-lang="en" data-theme="minimal"></div>
			</div>

			<!-- Compact Dark -->
			<div class="bg-gray-900 p-6 rounded-lg">
				<h3 class="text-lg font-medium text-white mb-4">Compact Dark</h3>
				<div data-hijri-widget data-lang="en" data-theme="compact dark"></div>
			</div>
		</div>
	</section>

	<!-- Language Tests -->
	<section class="mb-8">
		<h2 class="text-2xl font-semibold text-gray-900 mb-6">Language Tests</h2>
		
		<div class="grid md:grid-cols-2 gap-6">
			<!-- English -->
			<div class="bg-white p-6 rounded-lg border">
				<h3 class="text-lg font-medium text-gray-900 mb-4">English (LTR)</h3>
				<div data-hijri-widget data-lang="en" data-country="SA"></div>
			</div>

			<!-- Arabic -->
			<div class="bg-white p-6 rounded-lg border">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Arabic (RTL)</h3>
				<div data-hijri-widget data-lang="ar" data-country="SA"></div>
			</div>
		</div>
	</section>

	<!-- Country Tests -->
	<section class="mb-8">
		<h2 class="text-2xl font-semibold text-gray-900 mb-6">Country Tests</h2>
		
		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-white p-4 rounded-lg border">
				<h4 class="text-sm font-medium text-gray-700 mb-2">🇸🇦 Saudi Arabia</h4>
				<div data-hijri-widget data-country="SA" data-lang="en"></div>
			</div>
			
			<div class="bg-white p-4 rounded-lg border">
				<h4 class="text-sm font-medium text-gray-700 mb-2">🇲🇦 Morocco</h4>
				<div data-hijri-widget data-country="MA" data-lang="en"></div>
			</div>
			
			<div class="bg-white p-4 rounded-lg border">
				<h4 class="text-sm font-medium text-gray-700 mb-2">🇹🇷 Turkey</h4>
				<div data-hijri-widget data-country="TR" data-lang="en"></div>
			</div>
			
			<div class="bg-white p-4 rounded-lg border">
				<h4 class="text-sm font-medium text-gray-700 mb-2">🇪🇬 Egypt</h4>
				<div data-hijri-widget data-country="EG" data-lang="en"></div>
			</div>
			
			<div class="bg-white p-4 rounded-lg border">
				<h4 class="text-sm font-medium text-gray-700 mb-2">🇦🇪 UAE</h4>
				<div data-hijri-widget data-country="AE" data-lang="en"></div>
			</div>
			
			<div class="bg-white p-4 rounded-lg border">
				<h4 class="text-sm font-medium text-gray-700 mb-2">🇵🇰 Pakistan</h4>
				<div data-hijri-widget data-country="PK" data-lang="en"></div>
			</div>
			
			<div class="bg-white p-4 rounded-lg border">
				<h4 class="text-sm font-medium text-gray-700 mb-2">🇮🇳 India</h4>
				<div data-hijri-widget data-country="IN" data-lang="en"></div>
			</div>
			
			<div class="bg-white p-4 rounded-lg border">
				<h4 class="text-sm font-medium text-gray-700 mb-2">🇲🇾 Malaysia</h4>
				<div data-hijri-widget data-country="MY" data-lang="en"></div>
			</div>
		</div>
	</section>

	<!-- Responsive Tests -->
	<section class="mb-8">
		<h2 class="text-2xl font-semibold text-gray-900 mb-6">Responsive Tests</h2>
		
		<div class="space-y-6">
			<!-- Full Width -->
			<div class="bg-white p-6 rounded-lg border">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Full Width Container</h3>
				<div class="w-full">
					<div data-hijri-widget data-lang="en" style="max-width: 100%;"></div>
				</div>
			</div>

			<!-- Small Container -->
			<div class="bg-white p-6 rounded-lg border">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Small Container (200px)</h3>
				<div style="width: 200px;">
					<div data-hijri-widget data-lang="en" data-theme="compact"></div>
				</div>
			</div>

			<!-- Mobile Simulation -->
			<div class="bg-white p-6 rounded-lg border">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Mobile Simulation (320px)</h3>
				<div style="width: 320px;">
					<div data-hijri-widget data-lang="ar" data-theme="light"></div>
				</div>
			</div>
		</div>
	</section>

	<!-- Error Handling Tests -->
	<section class="mb-8">
		<h2 class="text-2xl font-semibold text-gray-900 mb-6">Error Handling Tests</h2>
		
		<div class="grid md:grid-cols-2 gap-6">
			<!-- Invalid Country -->
			<div class="bg-white p-6 rounded-lg border">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Invalid Country Code</h3>
				<div data-hijri-widget data-country="XX" data-lang="en"></div>
			</div>

			<!-- Invalid Language -->
			<div class="bg-white p-6 rounded-lg border">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Invalid Language</h3>
				<div data-hijri-widget data-lang="fr" data-country="SA"></div>
			</div>
		</div>
	</section>

	<!-- Performance Tests -->
	<section class="mb-8">
		<h2 class="text-2xl font-semibold text-gray-900 mb-6">Performance Tests</h2>
		
		<div class="bg-white p-6 rounded-lg border">
			<h3 class="text-lg font-medium text-gray-900 mb-4">Multiple Widgets (Load Test)</h3>
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each Array(12) as _, i}
					<div class="bg-gray-50 p-2 rounded">
						<div class="text-xs text-gray-600 mb-1">Widget {i + 1}</div>
						<div data-hijri-widget data-lang="en" data-theme="compact"></div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Back to Documentation -->
	<section class="text-center">
		<a href="/widget" class="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
			← Back to Widget Documentation
		</a>
	</section>
</div>

<style>
	/* Additional test-specific styles */
	.container {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
</style>