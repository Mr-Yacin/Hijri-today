<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	
	let widgetScript: HTMLScriptElement;
	let codeExamples = {
		basic: `<!-- Basic widget -->
<div data-hijri-widget></div>
<script src="${$page.url.origin}/hijri-widget.js"></script>`,
		
		arabic: `<!-- Arabic widget -->
<div data-hijri-widget 
     data-lang="ar" 
     data-theme="light">
</div>
<script src="${$page.url.origin}/hijri-widget.js"></script>`,
		
		customCountry: `<!-- Custom country widget -->
<div data-hijri-widget 
     data-lang="en" 
     data-country="MA" 
     data-theme="dark">
</div>
<script src="${$page.url.origin}/hijri-widget.js"></script>`,
		
		multiple: `<!-- Multiple widgets -->
<div data-hijri-widget data-lang="en" data-country="SA"></div>
<div data-hijri-widget data-lang="ar" data-country="EG"></div>
<div data-hijri-widget data-lang="en" data-country="TR"></div>
<script src="${$page.url.origin}/hijri-widget.js"></script>`
	};

	onMount(() => {
		// Load widget script dynamically
		widgetScript = document.createElement('script');
		widgetScript.src = '/hijri-widget.js';
		widgetScript.async = true;
		document.head.appendChild(widgetScript);

		return () => {
			if (widgetScript) {
				document.head.removeChild(widgetScript);
			}
		};
	});

	function copyCode(code: string) {
		navigator.clipboard.writeText(code).then(() => {
			// Could show a toast notification here
			console.log('Code copied to clipboard');
		});
	}
</script>

<svelte:head>
	<title>Hijri Date Widget - Embeddable Islamic Calendar</title>
	<meta name="description" content="Embed accurate Hijri dates on your website with our lightweight, customizable Islamic calendar widget." />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<header class="text-center mb-12">
		<h1 class="text-4xl font-bold text-gray-900 mb-4">Hijri Date Widget</h1>
		<p class="text-xl text-gray-600 max-w-2xl mx-auto">
			Embed accurate Islamic calendar dates on your website with our lightweight, 
			customizable widget that supports Arabic and English languages.
		</p>
	</header>

	<!-- Live Demo Section -->
	<section class="mb-12">
		<h2 class="text-2xl font-semibold text-gray-900 mb-6">Live Demo</h2>
		
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
			<!-- Basic Widget -->
			<div class="bg-gray-50 p-6 rounded-lg">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Basic Widget</h3>
				<div data-hijri-widget></div>
			</div>

			<!-- Arabic Widget -->
			<div class="bg-gray-50 p-6 rounded-lg">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Arabic Widget</h3>
				<div data-hijri-widget data-lang="ar" data-theme="light"></div>
			</div>

			<!-- Dark Theme Widget -->
			<div class="bg-gray-900 p-6 rounded-lg">
				<h3 class="text-lg font-medium text-white mb-4">Dark Theme</h3>
				<div data-hijri-widget data-lang="en" data-theme="dark"></div>
			</div>

			<!-- Compact Theme Widget -->
			<div class="bg-gray-50 p-6 rounded-lg">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Compact Theme</h3>
				<div data-hijri-widget data-lang="en" data-theme="compact"></div>
			</div>

			<!-- Minimal Theme Widget -->
			<div class="bg-gray-50 p-6 rounded-lg">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Minimal Theme</h3>
				<div data-hijri-widget data-lang="en" data-theme="minimal"></div>
			</div>

			<!-- Auto Theme Widget -->
			<div class="bg-gray-50 p-6 rounded-lg">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Auto Theme</h3>
				<div data-hijri-widget data-lang="en" data-theme="auto"></div>
			</div>
		</div>

		<!-- Country-specific widgets -->
		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-gray-50 p-4 rounded-lg">
				<h4 class="text-sm font-medium text-gray-700 mb-2">Saudi Arabia</h4>
				<div data-hijri-widget data-country="SA" data-lang="en"></div>
			</div>
			
			<div class="bg-gray-50 p-4 rounded-lg">
				<h4 class="text-sm font-medium text-gray-700 mb-2">Morocco</h4>
				<div data-hijri-widget data-country="MA" data-lang="en"></div>
			</div>
			
			<div class="bg-gray-50 p-4 rounded-lg">
				<h4 class="text-sm font-medium text-gray-700 mb-2">Turkey</h4>
				<div data-hijri-widget data-country="TR" data-lang="en"></div>
			</div>
			
			<div class="bg-gray-50 p-4 rounded-lg">
				<h4 class="text-sm font-medium text-gray-700 mb-2">Egypt</h4>
				<div data-hijri-widget data-country="EG" data-lang="en"></div>
			</div>
		</div>
	</section>

	<!-- Usage Section -->
	<section class="mb-12">
		<h2 class="text-2xl font-semibold text-gray-900 mb-6">How to Use</h2>
		
		<div class="space-y-8">
			<!-- Basic Usage -->
			<div class="bg-white border border-gray-200 rounded-lg p-6">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Basic Usage</h3>
				<p class="text-gray-600 mb-4">
					Add the widget to your page with minimal configuration:
				</p>
				<div class="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
					<pre><code>{codeExamples.basic}</code></pre>
					<button 
						on:click={() => copyCode(codeExamples.basic)}
						class="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
					>
						Copy
					</button>
				</div>
			</div>

			<!-- Arabic Configuration -->
			<div class="bg-white border border-gray-200 rounded-lg p-6">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Arabic Language</h3>
				<p class="text-gray-600 mb-4">
					Display the widget in Arabic with RTL support:
				</p>
				<div class="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
					<pre><code>{codeExamples.arabic}</code></pre>
					<button 
						on:click={() => copyCode(codeExamples.arabic)}
						class="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
					>
						Copy
					</button>
				</div>
			</div>

			<!-- Custom Country -->
			<div class="bg-white border border-gray-200 rounded-lg p-6">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Custom Country</h3>
				<p class="text-gray-600 mb-4">
					Specify a country for region-specific calculation methods:
				</p>
				<div class="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
					<pre><code>{codeExamples.customCountry}</code></pre>
					<button 
						on:click={() => copyCode(codeExamples.customCountry)}
						class="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
					>
						Copy
					</button>
				</div>
			</div>

			<!-- Multiple Widgets -->
			<div class="bg-white border border-gray-200 rounded-lg p-6">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Multiple Widgets</h3>
				<p class="text-gray-600 mb-4">
					Use multiple widgets with different configurations:
				</p>
				<div class="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
					<pre><code>{codeExamples.multiple}</code></pre>
					<button 
						on:click={() => copyCode(codeExamples.multiple)}
						class="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
					>
						Copy
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Configuration Options -->
	<section class="mb-12">
		<h2 class="text-2xl font-semibold text-gray-900 mb-6">Configuration Options</h2>
		
		<div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
			<table class="w-full">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attribute</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Values</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					<tr>
						<td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">data-lang</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ar, en</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">en</td>
						<td class="px-6 py-4 text-sm text-gray-500">Display language and text direction</td>
					</tr>
					<tr>
						<td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">data-country</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">SA, MA, TR, EG, etc.</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">auto-detect</td>
						<td class="px-6 py-4 text-sm text-gray-500">Country code for calculation method</td>
					</tr>
					<tr>
						<td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">data-theme</td>
						<td class="px-6 py-4 text-sm text-gray-500">light, dark, auto, compact, minimal</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">light</td>
						<td class="px-6 py-4 text-sm text-gray-500">Visual theme and size variant for the widget</td>
					</tr>
					<tr>
						<td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">data-method</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ummalqura, moonsighting_national, diyanet</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">country default</td>
						<td class="px-6 py-4 text-sm text-gray-500">Override calculation method</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- Supported Countries -->
	<section class="mb-12">
		<h2 class="text-2xl font-semibold text-gray-900 mb-6">Supported Countries</h2>
		
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
			<div class="bg-white border border-gray-200 rounded-lg p-4">
				<h3 class="font-medium text-gray-900 mb-2">Gulf Countries</h3>
				<ul class="text-sm text-gray-600 space-y-1">
					<li>🇸🇦 Saudi Arabia (SA)</li>
					<li>🇦🇪 UAE (AE)</li>
					<li>🇰🇼 Kuwait (KW)</li>
					<li>🇶🇦 Qatar (QA)</li>
					<li>🇧🇭 Bahrain (BH)</li>
					<li>🇴🇲 Oman (OM)</li>
				</ul>
			</div>
			
			<div class="bg-white border border-gray-200 rounded-lg p-4">
				<h3 class="font-medium text-gray-900 mb-2">Middle East</h3>
				<ul class="text-sm text-gray-600 space-y-1">
					<li>🇪🇬 Egypt (EG)</li>
					<li>🇯🇴 Jordan (JO)</li>
					<li>🇱🇧 Lebanon (LB)</li>
					<li>🇸🇾 Syria (SY)</li>
					<li>🇮🇶 Iraq (IQ)</li>
					<li>🇮🇷 Iran (IR)</li>
				</ul>
			</div>
			
			<div class="bg-white border border-gray-200 rounded-lg p-4">
				<h3 class="font-medium text-gray-900 mb-2">Other Regions</h3>
				<ul class="text-sm text-gray-600 space-y-1">
					<li>🇲🇦 Morocco (MA)</li>
					<li>🇹🇷 Turkey (TR)</li>
					<li>🇵🇰 Pakistan (PK)</li>
					<li>🇮🇳 India (IN)</li>
					<li>🇧🇩 Bangladesh (BD)</li>
					<li>🇲🇾 Malaysia (MY)</li>
					<li>🇮🇩 Indonesia (ID)</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- JavaScript API -->
	<section class="mb-12">
		<h2 class="text-2xl font-semibold text-gray-900 mb-6">JavaScript API</h2>
		
		<div class="space-y-6">
			<div class="bg-white border border-gray-200 rounded-lg p-6">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Global Methods</h3>
				<div class="space-y-4">
					<div>
						<code class="text-sm bg-gray-100 px-2 py-1 rounded">HijriWidget.refresh()</code>
						<p class="text-sm text-gray-600 mt-1">Refresh all widgets on the page</p>
					</div>
					<div>
						<code class="text-sm bg-gray-100 px-2 py-1 rounded">HijriWidget.getInstance(element)</code>
						<p class="text-sm text-gray-600 mt-1">Get widget instance for programmatic control</p>
					</div>
					<div>
						<code class="text-sm bg-gray-100 px-2 py-1 rounded">HijriWidget.getStats()</code>
						<p class="text-sm text-gray-600 mt-1">Get statistics about loaded widgets</p>
					</div>
				</div>
			</div>

			<div class="bg-white border border-gray-200 rounded-lg p-6">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Example Usage</h3>
				<div class="bg-gray-900 text-gray-100 p-4 rounded-lg">
					<pre><code>{`// Refresh all widgets
HijriWidget.refresh();

// Get widget instance and update configuration
const widget = HijriWidget.getInstance('my-widget-element');
if (widget) {
    widget.updateConfig({
        lang: 'ar',
        country: 'EG',
        theme: 'dark'
    });
}

// Get widget statistics
const stats = HijriWidget.getStats();
console.log('Total widgets:', stats.totalWidgets);`}</code></pre>
				</div>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section class="mb-12">
		<h2 class="text-2xl font-semibold text-gray-900 mb-6">Features</h2>
		
		<div class="grid md:grid-cols-2 gap-6">
			<div class="space-y-4">
				<div class="flex items-start space-x-3">
					<div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
						<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-sm font-medium text-gray-900">Lightweight & Fast</h3>
						<p class="text-sm text-gray-500">Minimal JavaScript footprint with sub-100ms API responses</p>
					</div>
				</div>
				
				<div class="flex items-start space-x-3">
					<div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
						<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-sm font-medium text-gray-900">Accurate Calculations</h3>
						<p class="text-sm text-gray-500">Based on official Umm al-Qura calendar tables</p>
					</div>
				</div>
				
				<div class="flex items-start space-x-3">
					<div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
						<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-sm font-medium text-gray-900">Multi-language Support</h3>
						<p class="text-sm text-gray-500">Arabic with RTL support and English</p>
					</div>
				</div>
				
				<div class="flex items-start space-x-3">
					<div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
						<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-sm font-medium text-gray-900">Regional Methods</h3>
						<p class="text-sm text-gray-500">Country-specific calculation methods and offsets</p>
					</div>
				</div>
			</div>
			
			<div class="space-y-4">
				<div class="flex items-start space-x-3">
					<div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
						<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-sm font-medium text-gray-900">Responsive Design</h3>
						<p class="text-sm text-gray-500">Works on all screen sizes and devices</p>
					</div>
				</div>
				
				<div class="flex items-start space-x-3">
					<div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
						<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-sm font-medium text-gray-900">Copy Functionality</h3>
						<p class="text-sm text-gray-500">One-click copying of dates to clipboard</p>
					</div>
				</div>
				
				<div class="flex items-start space-x-3">
					<div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
						<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-sm font-medium text-gray-900">Auto-detection</h3>
						<p class="text-sm text-gray-500">Automatically detects user's country and preferences</p>
					</div>
				</div>
				
				<div class="flex items-start space-x-3">
					<div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
						<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-sm font-medium text-gray-900">No Dependencies</h3>
						<p class="text-sm text-gray-500">Pure JavaScript with no external dependencies</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Support -->
	<section class="text-center">
		<h2 class="text-2xl font-semibold text-gray-900 mb-4">Need Help?</h2>
		<p class="text-gray-600 mb-6">
			If you encounter any issues or need assistance with the widget integration, 
			please check our documentation or contact support.
		</p>
		<div class="space-x-4">
			<a href="/api" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
				API Documentation
			</a>
			<a href="/" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
				Back to Main Site
			</a>
		</div>
	</section>
</div>

<style>
	pre {
		overflow-x: auto;
		white-space: pre-wrap;
		word-wrap: break-word;
	}
	
	code {
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>