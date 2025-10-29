# Hijri Date Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)](https://kit.svelte.dev/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

A sophisticated **Hijri (Islamic) calendar platform** built with SvelteKit, providing fast and accurate Islamic calendar conversion services with comprehensive internationalization support for Arabic and English-speaking users.

## 🌟 Features

### 🗓️ **Core Calendar Functionality**
- **Accurate Hijri-Gregorian Date Conversion** using official Umm al-Qura calendar data
- **Multiple Calculation Methods** supporting different countries and regions:
  - Saudi Arabia (Umm al-Qura)
  - Egypt (Egyptian General Authority)
  - Morocco (Moroccan Ministry)
  - Turkey (Diyanet)
  - Kuwait, Qatar, UAE, and more
- **Binary Search Optimization** for O(log n) date lookups
- **Country Profile System** with regional offset adjustments
- **Date Range Validation** with comprehensive error handling

### 🌍 **Internationalization (i18n)**
- **Full RTL (Right-to-Left) Support** for Arabic
- **Dynamic Language Switching** between Arabic and English
- **Arabic-Indic Numerals** for authentic Arabic display
- **Automatic Locale Detection** from browser and URL
- **Font Optimization** with Noto Sans Arabic and Inter font families

### 🌐 **RESTful API**
- **Conversion Endpoints**: `/api/gToH` and `/api/hToG`
- **Current Date API**: `/api/today` with automatic profile detection
- **Calendar Export**: `/api/ics/[country]/[year]` and monthly exports
- **Geolocation Services**: `/api/my-ip` for user location detection
- **Rate Limiting** and comprehensive error handling
- **Input Validation** using Zod schemas

### 📱 **User Experience**
- **Mobile-First Responsive Design** with touch-friendly interface
- **Progressive Web App** features for mobile installation
- **Accessibility Compliance** with ARIA attributes and keyboard navigation
- **Performance Optimization** with SSR support and caching
- **Analytics Integration** with Google Analytics 4

### 🛡️ **Enterprise Features**
- **Production-Ready Security** with input validation and rate limiting
- **Scalable Architecture** designed for high-volume usage
- **Comprehensive Monitoring** with error tracking and performance metrics
- **TypeScript Strict Mode** for type safety
- **SEO Optimization** with proper meta tags and structured data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mr-Yacin/Hijri-today.git
   cd Hijri-today
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## 📖 Usage Examples

### Web Interface
Access the web interface at `http://localhost:5173` to:
- Convert dates between Hijri and Gregorian calendars
- View today's date in multiple formats
- Browse interactive calendar views
- Export calendar events to your personal calendar

### API Integration

#### Convert Gregorian to Hijri
```bash
# GET request
curl "http://localhost:5173/api/gToH?date=2024-01-15&country=sa"

# POST request
curl -X POST "http://localhost:5173/api/gToH" \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15", "country": "sa"}'
```

#### Convert Hijri to Gregorian
```bash
curl "http://localhost:5173/api/hToG?year=1445&month=7&day=15&country=sa"
```

#### Get Today's Hijri Date
```bash
curl "http://localhost:5173/api/today?country=auto"
```

#### Export Calendar
```bash
# Annual calendar
curl "http://localhost:5173/api/ics/sa/2024" -o "hijri_2024.ics"

# Monthly calendar
curl "http://localhost:5173/api/ics/sa/2024/7" -o "ramadan_2024.ics"
```

### JavaScript Integration
```typescript
// Convert a Gregorian date to Hijri
const response = await fetch('/api/gToH?date=2024-01-15&country=sa');
const hijriDate = await response.json();

console.log(hijriDate);
// {
//   "success": true,
//   "data": {
//     "hijri": { "year": 1445, "month": 7, "day": 3 },
//     "gregorian": { "year": 2024, "month": 1, "day": 15 },
//     "method": "ummalqura",
//     "country": "Saudi Arabia"
//   }
// }
```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: SvelteKit 2.48.2 with SSR
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS 4.1.16
- **i18n**: svelte-i18n with dynamic locale detection
- **Date Handling**: Luxon for date manipulation
- **Validation**: Zod for runtime type checking
- **Calendar Export**: ICS generator
- **Deployment**: Vercel adapter ready

### Project Structure
```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   ├── hijri/              # Core calendar engine
│   │   ├── engine.ts       # Conversion algorithms
│   │   ├── data.ts         # Calendar data
│   │   ├── types.ts        # Type definitions
│   │   ├── validation.ts   # Date validation
│   │   └── umm_al_qura.json # Official calendar data
│   ├── i18n/               # Internationalization
│   │   ├── locales/
│   │   │   ├── ar.json     # Arabic translations
│   │   │   └── en.json     # English translations
│   │   └── config.ts       # i18n configuration
│   ├── profiles/           # Country/region profiles
│   │   ├── data.json       # Country configurations
│   │   ├── detector.ts     # Geolocation detection
│   │   └── types.ts        # Profile type definitions
│   └── utils/              # Utility functions
├── routes/
│   ├── [lang]/             # Dynamic locale routing
│   ├── api/                # REST API endpoints
│   │   ├── gToH/           # Gregorian to Hijri
│   │   ├── hToG/           # Hijri to Gregorian
│   │   ├── today/          # Current date
│   │   └── ics/            # Calendar export
│   └── ...
└── ...
```

## 📚 API Reference

### Conversion Endpoints

#### GET/POST `/api/gToH`
Convert Gregorian date to Hijri

**Parameters:**
- `date` (required): Gregorian date in YYYY-MM-DD format
- `country` (optional): Country code (sa, eg, ma, tr, etc.) or 'auto'

**Response:**
```json
{
  "success": true,
  "data": {
    "hijri": { "year": 1445, "month": 7, "day": 3 },
    "gregorian": { "year": 2024, "month": 1, "day": 15 },
    "method": "ummalqura",
    "country": "Saudi Arabia"
  }
}
```

#### GET/POST `/api/hToG`
Convert Hijri date to Gregorian

**Parameters:**
- `year`, `month`, `day` (required): Hijri date components
- `country` (optional): Country code or 'auto'

**Response:**
```json
{
  "success": true,
  "data": {
    "hijri": { "year": 1445, "month": 7, "day": 3 },
    "gregorian": { "year": 2024, "month": 1, "day": 15 },
    "method": "ummalqura",
    "country": "Saudi Arabia"
  }
}
```

### Utility Endpoints

#### GET `/api/today`
Get current Hijri date with automatic profile detection

**Parameters:**
- `country` (optional): Override auto-detection

#### GET `/api/my-ip`
Get user location information for profile detection

#### GET `/api/ics/[country]/[year]/[month].ics`
Export monthly calendar as ICS file

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Deploy automatically on push to main branch
3. Environment variables are automatically configured

### Manual Deployment
```bash
npm run build
# Deploy the 'build' directory to your hosting provider
```

### Environment Variables
- `NODE_ENV`: production/development
- `VERCEL_URL`: Vercel deployment URL (automatic)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm run test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Follow TypeScript strict mode guidelines
- Use Prettier for code formatting
- Follow the existing component architecture
- Write comprehensive tests for new features

## 📊 Analytics & Monitoring

### Built-in Analytics
- **Google Analytics 4** integration for user behavior tracking
- **Custom Events** for conversion usage analytics
- **Performance Monitoring** with Core Web Vitals
- **Error Tracking** for production issue detection

### Monitoring Capabilities
- API response time tracking
- Error rate monitoring with alerting
- User geographic distribution analysis
- Feature usage analytics

## 🛡️ Security

- **Input Validation**: All API inputs validated with Zod schemas
- **Rate Limiting**: IP-based throttling to prevent abuse
- **Error Sanitization**: Prevents information leakage in error responses
- **CSRF Protection**: Built-in SvelteKit security features

## 🌍 Supported Countries

| Country | Method | Code |
|---------|--------|------|
| Saudi Arabia | Umm al-Qura | `sa` |
| Egypt | Egyptian General Authority | `eg` |
| Morocco | Moroccan Ministry | `ma` |
| Turkey | Diyanet | `tr` |
| Kuwait | Kuwait Calendar | `kw` |
| Qatar | Qatar Calendar | `qa` |
| UAE | UAE Calendar | `ae` |

*More countries coming soon!*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Umm al-Qura Committee** for providing official calendar data
- **Islamic calendar calculation methods** from various scholarly sources
- **SvelteKit team** for the excellent web framework
- **Open source community** for the amazing tools and libraries

## 📞 Support

- **Documentation**: [Wiki](https://github.com/Mr-Yacin/Hijri-today/wiki)
- **Issues**: [GitHub Issues](https://github.com/Mr-Yacin/Hijri-today/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Mr-Yacin/Hijri-today/discussions)
- **Email**:[Support](support@hjr.today) 

## 🚀 Roadmap

### Phase 1 (Current)
- ✅ Core conversion engine
- ✅ Arabic/English internationalization
- ✅ API endpoints
- ✅ Calendar export functionality

### Phase 2 (Coming Soon)
- 🔄 Additional language support (Urdu, Persian, Turkish)
- 🔄 Extended country profile support
- 🔄 Prayer times integration
- 🔄 Islamic holidays database

### Phase 3 (Future)
- 📅 Mobile application (React Native/Flutter)
- 📅 Advanced calendar views
- 📅 Community features
- 📅 Offline support with service workers

---

**Made with ❤️ for the Islamic community worldwide**
