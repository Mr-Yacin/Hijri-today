import { dev } from '$app/environment';

export const ANALYTICS_CONFIG = {
	measurementId: 'G-9PC2FMTY8Q', // Google Analytics 4 Measurement ID - Production Ready
	enabled: !dev // Disable in development, enable in production
} as const;