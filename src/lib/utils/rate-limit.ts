/**
 * Simple in-memory rate limiting for API endpoints
 * In production, this should be replaced with Redis or similar persistent storage
 */

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

interface RateLimitResult {
	allowed: boolean;
	remaining?: number;
	retryAfter?: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configurations
const RATE_LIMITS = {
	'api-conversion': {
		maxRequests: 100, // 100 requests per window
		windowMs: 60 * 1000, // 1 minute window
	},
	'api-today': {
		maxRequests: 200, // 200 requests per window (more lenient)
		windowMs: 60 * 1000, // 1 minute window
	},
	'api-ics': {
		maxRequests: 20, // 20 requests per window (more restrictive for file generation)
		windowMs: 60 * 1000, // 1 minute window
	},
	'api-widget': {
		maxRequests: 300, // 300 requests per window (most lenient for widget usage)
		windowMs: 60 * 1000, // 1 minute window
	}
};

/**
 * Apply rate limiting to a client IP for a specific endpoint type
 * @param clientIP - Client IP address
 * @param endpointType - Type of endpoint (api-conversion, api-today, api-ics, api-widget)
 * @returns RateLimitResult - Whether the request is allowed and remaining quota
 */
export async function rateLimit(clientIP: string, endpointType: keyof typeof RATE_LIMITS): Promise<RateLimitResult> {
	const config = RATE_LIMITS[endpointType];
	if (!config) {
		// If no config found, allow the request
		return { allowed: true };
	}

	const key = `${clientIP}:${endpointType}`;
	const now = Date.now();
	const windowStart = now - config.windowMs;

	// Clean up expired entries periodically
	if (Math.random() < 0.01) { // 1% chance to clean up
		cleanupExpiredEntries(windowStart);
	}

	const entry = rateLimitStore.get(key);

	if (!entry || entry.resetTime <= windowStart) {
		// No entry or entry is expired, create new one
		rateLimitStore.set(key, {
			count: 1,
			resetTime: now + config.windowMs
		});

		return {
			allowed: true,
			remaining: config.maxRequests - 1
		};
	}

	if (entry.count >= config.maxRequests) {
		// Rate limit exceeded
		const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
		return {
			allowed: false,
			remaining: 0,
			retryAfter
		};
	}

	// Increment count
	entry.count++;
	rateLimitStore.set(key, entry);

	return {
		allowed: true,
		remaining: config.maxRequests - entry.count
	};
}

/**
 * Clean up expired rate limit entries
 * @param cutoffTime - Entries older than this time will be removed
 */
function cleanupExpiredEntries(cutoffTime: number): void {
	for (const [key, entry] of rateLimitStore.entries()) {
		if (entry.resetTime <= cutoffTime) {
			rateLimitStore.delete(key);
		}
	}
}

/**
 * Get current rate limit status for a client
 * @param clientIP - Client IP address
 * @param endpointType - Type of endpoint
 * @returns Current rate limit status
 */
export function getRateLimitStatus(clientIP: string, endpointType: keyof typeof RATE_LIMITS): {
	remaining: number;
	resetTime: number;
} {
	const config = RATE_LIMITS[endpointType];
	if (!config) {
		return { remaining: Infinity, resetTime: 0 };
	}

	const key = `${clientIP}:${endpointType}`;
	const entry = rateLimitStore.get(key);

	if (!entry) {
		return { remaining: config.maxRequests, resetTime: 0 };
	}

	return {
		remaining: Math.max(0, config.maxRequests - entry.count),
		resetTime: entry.resetTime
	};
}

/**
 * Reset rate limit for a specific client and endpoint (for testing or admin purposes)
 * @param clientIP - Client IP address
 * @param endpointType - Type of endpoint
 */
export function resetRateLimit(clientIP: string, endpointType: keyof typeof RATE_LIMITS): void {
	const key = `${clientIP}:${endpointType}`;
	rateLimitStore.delete(key);
}

/**
 * Get all rate limit configurations
 * @returns Rate limit configurations
 */
export function getRateLimitConfigs() {
	return RATE_LIMITS;
}