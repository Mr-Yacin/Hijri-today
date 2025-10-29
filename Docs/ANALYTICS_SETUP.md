# Google Analytics Setup

## Configuration

1. **Get your Google Analytics 4 Measurement ID:**
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new GA4 property or use an existing one
   - Copy your Measurement ID (format: `G-XXXXXXXXXX`)

2. **Update the configuration:**
   - Open `src/lib/config/analytics.ts`
   - Replace `G-XXXXXXXXXX` with your actual Measurement ID

```typescript
export const ANALYTICS_CONFIG = {
	measurementId: 'G-YOUR-ACTUAL-ID', // Replace with your GA4 Measurement ID
	enabled: !dev // Disabled in development, enabled in production
} as const;
```

## Features Included

### Automatic Tracking
- **Page Views**: Automatically tracks all page navigation
- **Performance Metrics**: Core Web Vitals (LCP, FID, CLS)
- **Load Times**: Page load performance
- **Enhanced Measurements**: Scrolls, outbound clicks, file downloads

### Custom Event Tracking
The platform includes pre-built event tracking for:
- Date conversions between calendars
- Calculation method selections
- Language changes
- Widget usage
- Calendar exports
- Error tracking

### Usage Examples

```typescript
import { trackDateConversion, trackLanguageChange } from '$lib/analytics';

// Track when user converts a date
trackDateConversion('gregorian', 'hijri', 'umm-al-qura');

// Track language changes
trackLanguageChange('ar');
```

## Privacy & Performance

- **Development Mode**: Analytics is disabled during development
- **Performance Optimized**: Scripts load asynchronously
- **Core Web Vitals**: Automatic performance monitoring
- **Privacy Friendly**: Only tracks page views and custom events, no personal data

## Verification

After deployment:
1. Visit your live site
2. Check Google Analytics Real-time reports
3. Verify page views are being tracked
4. Test custom events (date conversions, etc.)

## Environment Variables (Optional)

For more control, you can use environment variables:

```bash
# .env
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
PUBLIC_ANALYTICS_ENABLED=true
```

Then update the config:

```typescript
import { PUBLIC_GA_MEASUREMENT_ID, PUBLIC_ANALYTICS_ENABLED } from '$env/static/public';

export const ANALYTICS_CONFIG = {
	measurementId: PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
	enabled: PUBLIC_ANALYTICS_ENABLED === 'true' && !dev
} as const;
```