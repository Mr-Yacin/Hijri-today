/**
 * External geolocation services for IP-based country detection
 * These are fallback options when Cloudflare headers are not available
 */

export interface GeolocationResult {
	country: string;
	countryCode: string;
	region?: string;
	city?: string;
	timezone?: string;
	source: string;
}

/**
 * Detect country using ip-api.com (free, no API key required)
 * Rate limit: 45 requests per minute
 * @param ip - IP address to lookup
 * @returns Promise<GeolocationResult | null>
 */
export async function detectCountryFromIPAPI(ip: string): Promise<GeolocationResult | null> {
	if (!ip || ip === '127.0.0.1' || ip === '::1') {
		return null;
	}

	try {
		const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,timezone`, {
			headers: {
				'User-Agent': 'HijriDatePlatform/1.0'
			},
			// Add timeout
			signal: AbortSignal.timeout(5000) // 5 second timeout
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();

		if (data.status === 'success' && data.countryCode) {
			return {
				country: data.country,
				countryCode: data.countryCode.toUpperCase(),
				region: data.regionName,
				city: data.city,
				timezone: data.timezone,
				source: 'ip-api.com'
			};
		}

		return null;
	} catch (error) {
		console.warn('IP-API geolocation failed:', error);
		return null;
	}
}

/**
 * Detect country using ipinfo.io (free tier: 50k requests/month)
 * @param ip - IP address to lookup
 * @param token - Optional API token for higher limits
 * @returns Promise<GeolocationResult | null>
 */
export async function detectCountryFromIPInfo(ip: string, token?: string): Promise<GeolocationResult | null> {
	if (!ip || ip === '127.0.0.1' || ip === '::1') {
		return null;
	}

	try {
		const url = token 
			? `https://ipinfo.io/${ip}?token=${token}`
			: `https://ipinfo.io/${ip}/json`;

		const response = await fetch(url, {
			headers: {
				'User-Agent': 'HijriDatePlatform/1.0'
			},
			signal: AbortSignal.timeout(5000)
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();

		if (data.country) {
			return {
				country: data.country_name || data.country,
				countryCode: data.country.toUpperCase(),
				region: data.region,
				city: data.city,
				timezone: data.timezone,
				source: 'ipinfo.io'
			};
		}

		return null;
	} catch (error) {
		console.warn('IPInfo geolocation failed:', error);
		return null;
	}
}

/**
 * Detect country using multiple geolocation services with fallback
 * @param ip - IP address to lookup
 * @param options - Configuration options
 * @returns Promise<GeolocationResult | null>
 */
export async function detectCountryFromGeolocation(
	ip: string, 
	options: {
		ipinfoToken?: string;
		preferredService?: 'ip-api' | 'ipinfo';
		timeout?: number;
	} = {}
): Promise<GeolocationResult | null> {
	const { preferredService = 'ip-api', ipinfoToken } = options;

	// Try preferred service first
	if (preferredService === 'ip-api') {
		const result = await detectCountryFromIPAPI(ip);
		if (result) return result;

		// Fallback to ipinfo
		return detectCountryFromIPInfo(ip, ipinfoToken);
	} else {
		const result = await detectCountryFromIPInfo(ip, ipinfoToken);
		if (result) return result;

		// Fallback to ip-api
		return detectCountryFromIPAPI(ip);
	}
}

/**
 * Cache for geolocation results to avoid repeated API calls
 */
const geolocationCache = new Map<string, { result: GeolocationResult | null; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Cached geolocation lookup
 * @param ip - IP address to lookup
 * @param options - Configuration options
 * @returns Promise<GeolocationResult | null>
 */
export async function getCachedGeolocation(
	ip: string,
	options: Parameters<typeof detectCountryFromGeolocation>[1] = {}
): Promise<GeolocationResult | null> {
	// Check cache first
	const cached = geolocationCache.get(ip);
	if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
		return cached.result;
	}

	// Fetch new result
	const result = await detectCountryFromGeolocation(ip, options);
	
	// Cache the result
	geolocationCache.set(ip, {
		result,
		timestamp: Date.now()
	});

	return result;
}