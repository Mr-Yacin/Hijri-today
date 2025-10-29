import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const baseUrl = url.origin;
	
	// Dynamic robots.txt content
	const robotsContent = `# Hijri Date Platform - Dynamic Robots.txt
# Generated at: ${new Date().toISOString()}
# Domain: ${baseUrl}

# Allow crawling everything by default
User-agent: *

# Disallow API endpoints and utility pages
Disallow: /api/
Disallow: /debug/
Disallow: /test-detection/
Disallow: /clear-cache/
Disallow: /my-ip/

# Allow specific API endpoints that might be useful for crawlers
Allow: /api/today
Allow: /api/widget

# Crawl delay (be nice to the server)
Crawl-delay: 1

# Sitemap location (dynamic based on current domain)
Sitemap: ${baseUrl}/sitemap.xml

# Additional sitemaps for different content types
# Sitemap: ${baseUrl}/sitemap-calendar.xml
# Sitemap: ${baseUrl}/sitemap-conversions.xml

# Specific rules for different bots
User-agent: Googlebot
Disallow: /debug/
Disallow: /test-detection/
Allow: /

User-agent: Bingbot
Disallow: /debug/
Disallow: /test-detection/
Allow: /

# Social media bots (for Open Graph)
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# Archive bots
User-agent: ia_archiver
Allow: /

# Block aggressive crawlers if needed
# User-agent: AhrefsBot
# Crawl-delay: 10

# User-agent: SemrushBot
# Crawl-delay: 10
`;

	return new Response(robotsContent, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
		}
	});
};