import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin;
	const currentDate = new Date().toISOString();
	
	// Define different sitemaps
	const sitemaps = [
		{
			loc: `${baseUrl}/sitemap.xml`,
			lastmod: currentDate,
			description: 'Main sitemap with all pages'
		}
		// Future sitemaps can be added here:
		// {
		//   loc: `${baseUrl}/sitemap-calendar.xml`,
		//   lastmod: currentDate,
		//   description: 'Calendar-specific sitemap'
		// },
		// {
		//   loc: `${baseUrl}/sitemap-conversions.xml`,
		//   lastmod: currentDate,
		//   description: 'Popular conversion results'
		// }
	];
	
	const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

	return new Response(sitemapIndex, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600',
			'X-Generated-At': currentDate
		}
	});
};