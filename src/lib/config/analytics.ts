import { dev } from '$app/environment';

export const ANALYTICS_CONFIG = {
	measurementId: 'G-9PC2FMTY8Q', // Replace with your actual Google Analytics 4 Measurement ID
	enabled: !dev // Disable in development, enable in production
} as const;