import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin;
	const supportedLocales = ['en', 'ar'];
	const currentDate = new Date();
	const currentDateString = currentDate.toISOString().split('T')[0];
	
	// Static pages with their properties
	const staticPages = [
		{ path: '', priority: '1.0', changefreq: 'daily' },
		{ path: '/today', priority: '0.9', changefreq: 'daily' },
		{ path: '/convert', priority: '0.8', changefreq: 'weekly' },
		{ path: '/calendar', priority: '0.8', changefreq: 'weekly' }
	];
	
	// Generate calendar pages dynamically
	const currentYear = currentDate.getFullYear();
	const currentHijriYear = Math.floor(currentYear - 579); // More accurate approximation
	const calendarPages: Array<{ path: string; priority: string; changefreq: string }> = [];
	
	// Generate calendar pages for current year and next 2 years
	for (let yearOffset = 0; yearOffset <= 2; yearOffset++) {
		const hijriYear = currentHijriYear + yearOffset;
		for (let month = 1; month <= 12; month++) {
			// Higher priority for current month
			const isCurrentMonth = yearOffset === 0 && month === (currentDate.getMonth() + 1);
			const priority = isCurrentMonth ? '0.8' : '0.7';
			const changefreq = isCurrentMonth ? 'daily' : 'monthly';
			
			calendarPages.push({
				path: `/calendar/${hijriYear}/${month}`,
				priority,
				changefreq
			});
		}
	}
	
	// Generate sitemap entries
	const sitemapEntries: string[] = [];
	
	// Add hreflang support for static pages
	for (const page of staticPages) {
		for (const locale of supportedLocales) {
			const pageUrl = `${baseUrl}/${locale}${page.path}`;
			
			// Generate hreflang links
			const hreflangLinks = supportedLocales
				.map(lang => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/${lang}${page.path}" />`)
				.join('\n');
			
			sitemapEntries.push(`
  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${currentDateString}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${hreflangLinks}
  </url>`);
		}
	}
	
	// Add calendar pages with hreflang
	for (const calendarPage of calendarPages) {
		for (const locale of supportedLocales) {
			const pageUrl = `${baseUrl}/${locale}${calendarPage.path}`;
			
			// Generate hreflang links for calendar pages
			const hreflangLinks = supportedLocales
				.map(lang => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/${lang}${calendarPage.path}" />`)
				.join('\n');
			
			sitemapEntries.push(`
  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${currentDateString}</lastmod>
    <changefreq>${calendarPage.changefreq}</changefreq>
    <priority>${calendarPage.priority}</priority>
${hreflangLinks}
  </url>`);
		}
	}
	
	// Add widget page (no locale, no hreflang)
	sitemapEntries.push(`
  <url>
    <loc>${baseUrl}/widget</loc>
    <lastmod>${currentDateString}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
	
	// Add robots.txt reference
	sitemapEntries.push(`
  <url>
    <loc>${baseUrl}/robots.txt</loc>
    <lastmod>${currentDateString}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.1</priority>
  </url>`);
	
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.join('')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
			'X-Generated-At': currentDate.toISOString(),
			'X-Total-URLs': sitemapEntries.length.toString()
		}
	});
};