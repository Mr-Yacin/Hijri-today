<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let debugInfo: any = null;
	let loading = true;
	let error = '';
	
	async function fetchLocationDebug(bustCache = false) {
		if (!browser) return;
		
		loading = true;
		error = '';
		
		try {
			const url = bustCache ? '/api/debug/location?bust=1' : '/api/debug/location';
			const response = await fetch(url, {
				cache: 'no-cache',
				headers: {
					'Cache-Control': 'no-cache'
				}
			});
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			
			debugInfo = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch debug info';
			console.error('Debug fetch error:', err);
		} finally {
			loading = false;
		}
	}
	
	function clearAllCaches() {
		if (!browser) return;
		
		// Clear cookies
		const cookies = ['hijri-country', 'country', 'hijri-method', 'method', 'timezone'];
		cookies.forEach(name => {
			document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		});
		
		// Clear localStorage if any
		try {
			localStorage.clear();
			sessionStorage.clear();
		} catch (e) {
			console.warn('Could not clear storage:', e);
		}
		
		// Refresh with cache bust
		fetchLocationDebug(true);
	}
	
	onMount(() => {
		fetchLocationDebug();
	});
</script>

<svelte:head>
	<title>Location Debug - Hijri Date Platform</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Location Detection Debug</h1>
			<p class="text-gray-600">Debug information for IP-based location detection</p>
		</div>
		
		<div class="flex gap-4 mb-6 justify-center">
			<button
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
				disabled={loading}
				on:click={() => fetchLocationDebug(true)}
			>
				{loading ? 'Loading...' : 'Refresh (Bust Cache)'}
			</button>
			
			<button
				class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
				on:click={clearAllCaches}
			>
				Clear All Caches
			</button>
		</div>
		
		{#if error}
			<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
				<div class="text-red-800">
					<strong>Error:</strong> {error}
				</div>
			</div>
		{/if}
		
		{#if debugInfo}
			<div class="space-y-6">
				<!-- Detected Location -->
				<div class="bg-white border rounded-lg p-6">
					<h2 class="text-xl font-semibold mb-4 text-gray-900">Detected Location</h2>
					<div class="grid md:grid-cols-2 gap-4">
						<div>
							<span class="font-medium">Country:</span>
							<span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
								{debugInfo.detectedLocation.country}
							</span>
						</div>
						<div>
							<span class="font-medium">Method:</span>
							<span class="ml-2">{debugInfo.detectedLocation.method}</span>
						</div>
						<div class="md:col-span-2">
							<span class="font-medium">Display Name:</span>
							<span class="ml-2">{debugInfo.detectedLocation.displayName.en}</span>
							{#if debugInfo.detectedLocation.displayName.ar}
								<span class="ml-2 text-gray-600">({debugInfo.detectedLocation.displayName.ar})</span>
							{/if}
						</div>
						{#if debugInfo.detectedLocation.offset !== 0}
							<div>
								<span class="font-medium">Offset:</span>
								<span class="ml-2">{debugInfo.detectedLocation.offset > 0 ? '+' : ''}{debugInfo.detectedLocation.offset} days</span>
							</div>
						{/if}
					</div>
				</div>
				
				<!-- IP Information -->
				<div class="bg-white border rounded-lg p-6">
					<h2 class="text-xl font-semibold mb-4 text-gray-900">🌐 Your IP Information</h2>
					
					<!-- Primary IP Display -->
					<div class="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
						<div class="text-lg font-semibold text-blue-900 mb-2">Your Current IP Address:</div>
						<div class="text-2xl font-mono font-bold text-blue-800">
							{debugInfo.ipInformation.detectedIp}
						</div>
						<div class="text-sm text-blue-600 mt-1">
							This is the IP address being used for location detection
						</div>
					</div>
					
					<!-- All IP Headers -->
					<div class="space-y-3">
						<h3 class="font-medium text-gray-700 mb-2">All IP Headers:</h3>
						
						<div class="grid gap-3">
							<div class="flex justify-between items-center p-3 bg-gray-50 rounded">
								<div>
									<span class="font-medium text-gray-700">Detected IP:</span>
									<div class="text-xs text-gray-500">Primary IP used for detection</div>
								</div>
								<span class="font-mono text-lg font-semibold text-gray-900">
									{debugInfo.ipInformation.detectedIp}
								</span>
							</div>
							
							{#if debugInfo.ipInformation.xForwardedFor}
								<div class="flex justify-between items-center p-3 bg-gray-50 rounded">
									<div>
										<span class="font-medium text-gray-700">X-Forwarded-For:</span>
										<div class="text-xs text-gray-500">Original client IP chain</div>
									</div>
									<span class="font-mono text-sm text-gray-700">
										{debugInfo.ipInformation.xForwardedFor}
									</span>
								</div>
							{/if}
							
							{#if debugInfo.ipInformation.xRealIp}
								<div class="flex justify-between items-center p-3 bg-gray-50 rounded">
									<div>
										<span class="font-medium text-gray-700">X-Real-IP:</span>
										<div class="text-xs text-gray-500">Real client IP header</div>
									</div>
									<span class="font-mono text-sm text-gray-700">
										{debugInfo.ipInformation.xRealIp}
									</span>
								</div>
							{/if}
							
							{#if debugInfo.ipInformation.cfConnectingIp}
								<div class="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
									<div>
										<span class="font-medium text-green-700">CF-Connecting-IP:</span>
										<div class="text-xs text-green-600">Cloudflare's detected client IP</div>
									</div>
									<span class="font-mono text-sm font-semibold text-green-800">
										{debugInfo.ipInformation.cfConnectingIp}
									</span>
								</div>
							{/if}
						</div>
					</div>
				</div>
				
				<!-- Headers -->
				<div class="bg-white border rounded-lg p-6">
					<h2 class="text-xl font-semibold mb-4 text-gray-900">Request Headers</h2>
					<div class="space-y-2 text-sm">
						{#if debugInfo.headers.acceptLanguage}
							<div>
								<span class="font-medium">Accept-Language:</span>
								<span class="ml-2">{debugInfo.headers.acceptLanguage}</span>
							</div>
						{/if}
						{#if debugInfo.headers.cfTimezone}
							<div>
								<span class="font-medium">CF-Timezone:</span>
								<span class="ml-2">{debugInfo.headers.cfTimezone}</span>
							</div>
						{/if}
						{#if debugInfo.headers.cfCountry}
							<div>
								<span class="font-medium">CF-IPCountry:</span>
								<span class="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">{debugInfo.headers.cfCountry}</span>
							</div>
						{/if}
						{#if debugInfo.headers.userAgent}
							<div>
								<span class="font-medium">User-Agent:</span>
								<span class="ml-2 text-gray-600 break-all">{debugInfo.headers.userAgent}</span>
							</div>
						{/if}
					</div>
				</div>
				
				<!-- Request Info -->
				<div class="bg-white border rounded-lg p-6">
					<h2 class="text-xl font-semibold mb-4 text-gray-900">Request Information</h2>
					<div class="space-y-2 text-sm">
						<div>
							<span class="font-medium">Timestamp:</span>
							<span class="ml-2">{new Date(debugInfo.timestamp).toLocaleString()}</span>
						</div>
						<div>
							<span class="font-medium">Cache Busted:</span>
							<span class="ml-2">{debugInfo.requestInfo.cacheBusted ? 'Yes' : 'No'}</span>
						</div>
					</div>
				</div>
			</div>
		{:else if loading}
			<div class="text-center py-8">
				<div class="text-gray-500">Loading debug information...</div>
			</div>
		{/if}
		
		<div class="mt-8 text-center">
			<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
				<p class="text-sm text-yellow-800">
					<strong>Note:</strong> This debug page shows how your location is currently being detected.
					If you've changed your IP but still see the old location, try clearing caches or using incognito mode.
				</p>
			</div>
		</div>
	</div>
</div>