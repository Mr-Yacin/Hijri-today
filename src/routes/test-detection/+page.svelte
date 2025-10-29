<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let detectionResults: any = null;
	let loading = true;
	let error = '';
	
	async function testAllDetectionMethods() {
		if (!browser) return;
		
		loading = true;
		error = '';
		
		try {
			// Test the debug endpoint
			const response = await fetch('/api/debug/location?bust=1', {
				cache: 'no-cache'
			});
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			
			detectionResults = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to test detection';
		} finally {
			loading = false;
		}
	}
	
	onMount(() => {
		testAllDetectionMethods();
	});
</script>

<svelte:head>
	<title>Detection Test - Hijri Date Platform</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Detection Methods Test</h1>
			<p class="text-gray-600">Testing improved country detection methods</p>
		</div>
		
		<div class="mb-6 text-center">
			<button
				class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
				disabled={loading}
				on:click={testAllDetectionMethods}
			>
				{loading ? 'Testing...' : 'Test Detection Methods'}
			</button>
		</div>
		
		{#if error}
			<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
				<div class="text-red-800">
					<strong>Error:</strong> {error}
				</div>
			</div>
		{/if}
		
		{#if detectionResults}
			<div class="space-y-6">
				<!-- Detection Priority Explanation -->
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
					<h2 class="text-xl font-semibold mb-4 text-blue-900">New Detection Priority Order</h2>
					<ol class="list-decimal list-inside space-y-2 text-blue-800">
						<li><strong>User Override</strong> - Cookies (hijri-country, hijri-method)</li>
						<li><strong>Cloudflare CF-IPCountry</strong> - Most reliable IP geolocation</li>
						<li><strong>Timezone Detection</strong> - Based on browser/system timezone</li>
						<li><strong>Geolocation API</strong> - External service (ip-api.com, ipinfo.io)</li>
						<li><strong>IP Range Mapping</strong> - Fallback with expanded ranges</li>
						<li><strong>Default Profile</strong> - Last resort</li>
					</ol>
				</div>
				
				<!-- Current Detection Result -->
				<div class="bg-white border rounded-lg p-6">
					<h2 class="text-xl font-semibold mb-4 text-gray-900">Current Detection Result</h2>
					<div class="grid md:grid-cols-2 gap-4">
						<div>
							<span class="font-medium">Detected Country:</span>
							<span class="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded text-lg font-mono">
								{detectionResults.detectedLocation.country}
							</span>
						</div>
						<div>
							<span class="font-medium">Method:</span>
							<span class="ml-2">{detectionResults.detectedLocation.method}</span>
						</div>
						<div class="md:col-span-2">
							<span class="font-medium">Display Name:</span>
							<span class="ml-2">{detectionResults.detectedLocation.displayName.en}</span>
						</div>
					</div>
				</div>
				
				<!-- Detection Sources -->
				<div class="bg-white border rounded-lg p-6">
					<h2 class="text-xl font-semibold mb-4 text-gray-900">Available Detection Sources</h2>
					<div class="space-y-3">
						<!-- Cloudflare Country -->
						<div class="flex justify-between items-center p-3 rounded" 
							 class:bg-green-50={detectionResults.headers.cfCountry}
							 class:bg-gray-50={!detectionResults.headers.cfCountry}>
							<div>
								<span class="font-medium">Cloudflare CF-IPCountry:</span>
								<span class="text-sm text-gray-600 block">Most reliable IP-based detection</span>
							</div>
							<div class="text-right">
								{#if detectionResults.headers.cfCountry}
									<span class="px-2 py-1 bg-green-100 text-green-800 rounded font-mono">
										{detectionResults.headers.cfCountry}
									</span>
								{:else}
									<span class="text-gray-500">Not available</span>
								{/if}
							</div>
						</div>
						
						<!-- Timezone -->
						<div class="flex justify-between items-center p-3 rounded"
							 class:bg-blue-50={detectionResults.headers.cfTimezone}
							 class:bg-gray-50={!detectionResults.headers.cfTimezone}>
							<div>
								<span class="font-medium">Timezone:</span>
								<span class="text-sm text-gray-600 block">System/browser timezone</span>
							</div>
							<div class="text-right">
								{#if detectionResults.headers.cfTimezone}
									<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">
										{detectionResults.headers.cfTimezone}
									</span>
								{:else}
									<span class="text-gray-500">Not available</span>
								{/if}
							</div>
						</div>
						
						<!-- IP Address -->
						<div class="flex justify-between items-center p-3 bg-yellow-50 rounded">
							<div>
								<span class="font-medium">IP Address:</span>
								<span class="text-sm text-gray-600 block">Fallback with expanded ranges</span>
							</div>
							<div class="text-right">
								<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-mono">
									{detectionResults.ipInformation.detectedIp}
								</span>
							</div>
						</div>
						
						<!-- Language (Disabled) -->
						<div class="flex justify-between items-center p-3 bg-red-50 rounded opacity-60">
							<div>
								<span class="font-medium">Accept-Language:</span>
								<span class="text-sm text-red-600 block">Disabled (user preference, not location)</span>
							</div>
							<div class="text-right">
								<span class="text-gray-500 line-through">
									{detectionResults.headers.acceptLanguage || 'Not available'}
								</span>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Recommendations -->
				<div class="bg-green-50 border border-green-200 rounded-lg p-6">
					<h2 class="text-xl font-semibold mb-4 text-green-900">Improvements Made</h2>
					<ul class="space-y-2 text-green-800">
						<li>✅ <strong>Cloudflare CF-IPCountry</strong> - Most accurate IP geolocation</li>
						<li>✅ <strong>Timezone Priority</strong> - More reliable than language headers</li>
						<li>✅ <strong>Expanded IP Ranges</strong> - Added more Morocco IP ranges (41.*, 42.*, 160.*, etc.)</li>
						<li>✅ <strong>Geolocation API Fallback</strong> - External services for unknown IPs</li>
						<li>✅ <strong>Disabled Language Detection</strong> - Removed unreliable language-based detection</li>
						<li>✅ <strong>Better Caching</strong> - 24-hour cache for geolocation API results</li>
					</ul>
				</div>
			</div>
		{:else if loading}
			<div class="text-center py-8">
				<div class="text-gray-500">Testing detection methods...</div>
			</div>
		{/if}
	</div>
</div>