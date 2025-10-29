<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let ipInfo: any = null;
	let loading = true;
	let error = '';
	
	async function fetchMyIP() {
		if (!browser) return;
		
		loading = true;
		error = '';
		
		try {
			const response = await fetch('/api/my-ip', {
				cache: 'no-cache'
			});
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			
			ipInfo = await response.json();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch IP';
		} finally {
			loading = false;
		}
	}
	
	function copyIP() {
		if (ipInfo && browser) {
			navigator.clipboard.writeText(ipInfo.ip).catch(console.error);
		}
	}
	
	onMount(() => {
		fetchMyIP();
	});
</script>

<svelte:head>
	<title>My IP Address - Hijri Date Platform</title>
	<meta name="description" content="Check your current IP address and location" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">🌐 My IP Address</h1>
			<p class="text-gray-600">Check your current IP address and detected location</p>
		</div>
		
		{#if loading}
			<div class="text-center py-12">
				<div class="text-xl text-gray-500">Loading your IP address...</div>
			</div>
		{:else if error}
			<div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
				<div class="text-red-800 text-lg">
					<strong>Error:</strong> {error}
				</div>
				<button 
					class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
					on:click={fetchMyIP}
				>
					Try Again
				</button>
			</div>
		{:else if ipInfo}
			<div class="space-y-6">
				<!-- Main IP Display -->
				<div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-8 text-center">
					<div class="text-lg font-medium mb-2">Your IP Address</div>
					<div class="text-4xl font-mono font-bold mb-4">
						{ipInfo.ip}
					</div>
					<div class="flex gap-4 justify-center">
						<button 
							class="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
							on:click={copyIP}
						>
							📋 Copy IP
						</button>
						<button 
							class="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
							on:click={fetchMyIP}
						>
							🔄 Refresh
						</button>
					</div>
				</div>
				
				<!-- Country Detection -->
				{#if ipInfo.country && ipInfo.country !== 'Unknown'}
					<div class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
						<div class="text-green-800">
							<div class="text-lg font-semibold mb-2">Detected Country</div>
							<div class="text-2xl font-bold">
								{ipInfo.country}
							</div>
							<div class="text-sm mt-2 opacity-75">
								Based on Cloudflare's IP geolocation
							</div>
						</div>
					</div>
				{/if}
				
				<!-- Technical Details -->
				<div class="bg-white border rounded-lg p-6">
					<h2 class="text-xl font-semibold mb-4 text-gray-900">Technical Details</h2>
					<div class="space-y-3 text-sm">
						{#each Object.entries(ipInfo.headers) as [header, value]}
							{#if value}
								<div class="flex justify-between items-center p-2 bg-gray-50 rounded">
									<span class="font-medium text-gray-700">{header}:</span>
									<span class="font-mono text-gray-900">{value}</span>
								</div>
							{/if}
						{/each}
						<div class="flex justify-between items-center p-2 bg-gray-50 rounded">
							<span class="font-medium text-gray-700">Timestamp:</span>
							<span class="text-gray-600">{new Date(ipInfo.timestamp).toLocaleString()}</span>
						</div>
					</div>
				</div>
				
				<!-- Quick Actions -->
				<div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
					<h3 class="font-semibold text-blue-900 mb-3">Quick Actions</h3>
					<div class="flex flex-wrap gap-3">
						<a 
							href="/debug/location" 
							class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							🔍 Full Location Debug
						</a>
						<a 
							href="/clear-cache" 
							class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
						>
							🗑️ Clear Cache
						</a>
						<a 
							href="/test-detection" 
							class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
						>
							🧪 Test Detection
						</a>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>