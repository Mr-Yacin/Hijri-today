<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	
	let clearingCache = false;
	let clearResult = '';
	
	function clearAllCaches() {
		if (!browser) return;
		
		clearingCache = true;
		clearResult = '';
		
		try {
			// Clear specific hijri-related cookies
			const cookiesToClear = [
				'hijri-country',
				'hijri-method', 
				'hijri-language',
				'country',
				'method',
				'language',
				'timezone'
			];
			
			let clearedCookies: string[] = [];
			
			// Clear each cookie with different path variations
			cookiesToClear.forEach(name => {
				// Check if cookie exists first
				const cookieValue = getCookie(name);
				if (cookieValue) {
					clearedCookies.push(`${name}=${cookieValue}`);
				}
				
				// Clear with different path combinations
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
			});
			
			// Clear localStorage and sessionStorage
			let storageCleared = false;
			try {
				const localStorageKeys = Object.keys(localStorage);
				const sessionStorageKeys = Object.keys(sessionStorage);
				
				localStorage.clear();
				sessionStorage.clear();
				
				if (localStorageKeys.length > 0 || sessionStorageKeys.length > 0) {
					storageCleared = true;
				}
			} catch (e) {
				console.warn('Could not clear storage:', e);
			}
			
			// Build result message
			let resultParts = [];
			if (clearedCookies.length > 0) {
				resultParts.push(`Cleared ${clearedCookies.length} cookies: ${clearedCookies.join(', ')}`);
			} else {
				resultParts.push('No hijri-related cookies found to clear');
			}
			
			if (storageCleared) {
				resultParts.push('Cleared localStorage and sessionStorage');
			}
			
			clearResult = resultParts.join('\n');
			
			// Auto-redirect after 3 seconds
			setTimeout(() => {
				window.location.reload();
			}, 3000);
			
		} catch (error) {
			clearResult = `Error clearing cache: ${error instanceof Error ? error.message : 'Unknown error'}`;
		} finally {
			clearingCache = false;
		}
	}
	
	function getCookie(name: string): string | null {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) {
			const cookieValue = parts.pop()?.split(';').shift();
			return cookieValue || null;
		}
		return null;
	}
	
	function listCurrentCookies(): string[] {
		if (!browser) return [];
		
		const cookies = document.cookie.split(';');
		return cookies
			.map(cookie => cookie.trim())
			.filter(cookie => cookie.length > 0)
			.filter(cookie => {
				const name = cookie.split('=')[0];
				return name.includes('hijri') || 
				       name.includes('country') || 
				       name.includes('method') || 
				       name.includes('language') ||
				       name.includes('timezone');
			});
	}
	
	function goToDebugPage() {
		goto('/debug/location');
	}
	
	function goHome() {
		goto('/en'); // Go to English homepage
	}
</script>

<svelte:head>
	<title>Clear Cache - Hijri Date Platform</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Clear Cache & Cookies</h1>
			<p class="text-gray-600">Clear cached location data to allow fresh IP detection</p>
		</div>
		
		<!-- Current Cookies Display -->
		{#if browser}
			<div class="bg-white border rounded-lg p-6 mb-6">
				<h2 class="text-xl font-semibold mb-4 text-gray-900">Current Relevant Cookies</h2>
				{#each listCurrentCookies() as cookie}
					<div class="font-mono text-sm bg-gray-100 p-2 rounded mb-2">
						{cookie}
					</div>
				{:else}
					<p class="text-gray-500 italic">No relevant cookies found</p>
				{/each}
			</div>
		{/if}
		
		<!-- Clear Cache Button -->
		<div class="text-center mb-6">
			<button
				class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={clearingCache}
				on:click={clearAllCaches}
			>
				{clearingCache ? 'Clearing...' : 'Clear All Cache & Cookies'}
			</button>
		</div>
		
		<!-- Result Display -->
		{#if clearResult}
			<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
				<h3 class="font-semibold text-green-800 mb-2">Cache Cleared Successfully!</h3>
				<pre class="text-sm text-green-700 whitespace-pre-wrap">{clearResult}</pre>
				<p class="text-sm text-green-600 mt-2">
					Page will reload automatically in 3 seconds to apply changes...
				</p>
			</div>
		{/if}
		
		<!-- Action Buttons -->
		<div class="flex gap-4 justify-center">
			<button
				class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				on:click={goToDebugPage}
			>
				Check Location Debug
			</button>
			
			<button
				class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
				on:click={goHome}
			>
				Go to Homepage
			</button>
		</div>
		
		<!-- Instructions -->
		<div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
			<h3 class="font-semibold text-blue-800 mb-2">What this does:</h3>
			<ul class="text-sm text-blue-700 space-y-1">
				<li>• Clears cookies: hijri-country, hijri-method, hijri-language</li>
				<li>• Clears localStorage and sessionStorage</li>
				<li>• Forces fresh IP-based location detection</li>
				<li>• Reloads the page to apply changes</li>
			</ul>
		</div>
		
		<!-- Alternative Methods -->
		<div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
			<h3 class="font-semibold text-yellow-800 mb-2">Alternative methods:</h3>
			<ul class="text-sm text-yellow-700 space-y-1">
				<li>• Press <kbd class="bg-yellow-200 px-1 rounded">Ctrl+Shift+R</kbd> for hard refresh</li>
				<li>• Open Developer Tools → Application → Clear Storage</li>
				<li>• Use incognito/private browsing mode</li>
			</ul>
		</div>
	</div>
</div>

<style>
	kbd {
		font-family: monospace;
		font-size: 0.9em;
		padding: 2px 4px;
		border-radius: 3px;
	}
</style>