# Files Not Related to Hijri (Islamic) Calendar Platform

Based on my analysis of the project, here are the files that are **NOT specifically related** to the Hijri (Islamic) calendar platform functionality:

## 1. Generic Project Setup Files

### README.md
- **Status**: Generic boilerplate content
- **Issue**: Contains standard "sv" template text, not specific to Hijri calendar platform
- **Content**: Standard Svelte project creation instructions
- **Recommendation**: Should be replaced with proper documentation for the Hijri calendar platform

## 2. Standard Configuration Files

### svelte.config.js
- **Status**: Generic SvelteKit configuration
- **Content**: Standard adapter setup and preprocessing
- **Note**: While generic, it's necessary for the project to function

### vite.config.ts
- **Status**: Standard Vite configuration
- **Content**: Generic build tool setup
- **Note**: Contains standard SvelteKit Vite plugin configuration

### tsconfig.json
- **Status**: Standard TypeScript configuration
- **Content**: Generic TypeScript compiler settings
- **Note**: Standard configuration for SvelteKit projects

### postcss.config.js
- **Status**: Standard PostCSS configuration
- **Content**: Tailwind CSS and autoprefixer setup
- **Note**: Required for CSS processing

### .npmrc
- **Status**: Generic npm configuration
- **Content**: Standard npm settings
- **Note**: Development configuration file

### .gitignore
- **Status**: Generic git ignore file
- **Content**: Standard ignore patterns
- **Note**: Development configuration file

## 3. Generic Static Assets

### static/favicon.png
- **Status**: Generic favicon
- **Content**: Standard favicon icon
- **Note**: Not specifically designed for Islamic calendar platform

## 4. Template Files (Potentially Unused)

### src/routes/+page.svelte
- **Status**: Generic placeholder homepage
- **Content**: Temporary page with basic platform introduction
- **Note**: Appears to be a development placeholder, not final implementation

## Files That ARE Related to Hijri Calendar Platform

### Core Calendar Files (✓ Related)
- `src/lib/hijri/*` - Core Hijri calendar engine
- `src/lib/hijri/umm_al_qura.json` - Official calendar data
- `src/lib/hijri/ummalqura-calendar.csv` - Calendar data
- `src/lib/hijri/engine.ts` - Conversion algorithms
- `src/lib/hijri/types.ts` - Calendar type definitions
- `src/lib/hijri/validation.ts` - Date validation

### Internationalization Files (✓ Related)
- `src/lib/i18n/*` - Arabic and English translations
- `src/lib/i18n/locales/ar.json` - Arabic language support
- `src/lib/i18n/locales/en.json` - English language support
- `tailwind.config.js` - Islamic-inspired color palette and Arabic fonts

### API Endpoints (✓ Related)
- `src/routes/api/gToH/*` - Gregorian to Hijri conversion API
- `src/routes/api/hToG/*` - Hijri to Gregorian conversion API
- `src/routes/api/today/*` - Today's date API
- `src/routes/api/ics/*` - Calendar export functionality

### Language-Specific Routes (✓ Related)
- `src/routes/[lang]/*` - Dynamic routing for Arabic/English
- All localized pages and components

### Utility Files (✓ Related)
- `src/lib/utils/ics-generator.ts` - Calendar export functionality
- `src/lib/utils/seo.ts` - SEO for Islamic calendar content
- `src/lib/profiles/*` - Country-specific calculation profiles

## Summary

**Files NOT related to Hijri calendar platform:**
1. **README.md** - Should be updated with proper documentation
2. Generic configuration files (svelte.config.js, vite.config.ts, etc.) - Standard boilerplate
3. Template files (src/routes/+page.svelte) - Development placeholder
4. static/favicon.png - Generic icon

**Key Finding:** The vast majority of files ARE specifically related to the Hijri calendar platform. The only truly "unrelated" files are generic project setup files and documentation that should be customized for this specific project.
