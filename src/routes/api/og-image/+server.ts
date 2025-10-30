import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const text = url.searchParams.get('text') || 'Hijri Date';
		const locale = (url.searchParams.get('locale') as 'ar' | 'en') || 'en';
		const width = parseInt(url.searchParams.get('width') || '1200');
		const height = parseInt(url.searchParams.get('height') || '630');

		// Create SVG image with gradient background and Islamic design elements
		const svg = `
			<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:${locale === 'ar' ? '#1a202c' : '#2b6cb0'};stop-opacity:1" />
						<stop offset="100%" style="stop-color:${locale === 'ar' ? '#2d3748' : '#3182ce'};stop-opacity:1" />
					</linearGradient>
					<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="3" result="coloredBlur"/>
						<feMerge> 
							<feMergeNode in="coloredBlur"/>
							<feMergeNode in="SourceGraphic"/>
						</feMerge>
					</filter>
				</defs>
				
				<!-- Background -->
				<rect width="100%" height="100%" fill="url(#bgGradient)"/>
				
				<!-- Decorative Islamic geometric pattern -->
				<g opacity="0.1" stroke="white" stroke-width="2" fill="none">
					${Array.from({ length: 8 }, (_, i) => {
						const angle = (i * 45) * (Math.PI / 180);
						const x = width * 0.85 + Math.cos(angle) * 50;
						const y = height * 0.15 + Math.sin(angle) * 50;
						return `<circle cx="${x}" cy="${y}" r="${20 + i * 10}" transform="rotate(${i * 45} ${x} ${y})"/>`;
					}).join('')}
				</g>
				
				<!-- Title -->
				<text x="50%" y="${height * 0.25}" 
					text-anchor="middle" 
					fill="white" 
					font-size="${Math.floor(width * 0.06)}" 
					font-family="Arial, sans-serif" 
					font-weight="bold"
					filter="url(#glow)">
					${locale === 'ar' ? 'التاريخ الهجري اليوم' : "Today's Hijri Date"}
				</text>
				
				<!-- Main date text with word wrapping -->
				<g>
					${generateWrappedText(text, width, height, locale)}
				</g>
				
				<!-- Footer -->
				<text x="50%" y="${height * 0.9}" 
					text-anchor="middle" 
					fill="rgba(255,255,255,0.8)" 
					font-size="${Math.floor(width * 0.03)}" 
					font-family="Arial, sans-serif">
					${locale === 'ar' ? 'موقع التحويل الهجري' : 'Hijri Converter'}
				</text>
				
				<!-- Decorative crescent moon and star -->
				<g transform="translate(${width * 0.1}, ${height * 0.1})" opacity="0.3">
					<path d="M 0,-15 A 15,15 0 1,0 0,15 A 12,12 0 1,1 0,-15 Z" fill="white"/>
					<polygon points="0,-5 1.5,-1.5 5,0 1.5,1.5 0,5 -1.5,1.5 -5,0 -1.5,-1.5" fill="white"/>
				</g>
			</svg>
		`;

		// Convert to buffer
		const encoder = new TextEncoder();
		const buffer = encoder.encode(svg);

		return new Response(buffer, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
				'Content-Length': buffer.length.toString()
			}
		});

	} catch (error) {
		console.error('Error generating OG image:', error);
		return new Response('Error generating image', { status: 500 });
	}
};

function generateWrappedText(text: string, width: number, height: number, locale: 'ar' | 'en'): string {
	const maxWidth = width * 0.8;
	const words = text.split(' ');
	const lines: string[] = [];
	let currentLine = '';
	
	// Simple word wrapping algorithm
	for (const word of words) {
		const testLine = currentLine + (currentLine ? ' ' : '') + word;
		// Estimate text width (this is simplified)
		const estimatedWidth = testLine.length * (width * 0.02);
		
		if (estimatedWidth > maxWidth && currentLine) {
			lines.push(currentLine);
			currentLine = word;
		} else {
			currentLine = testLine;
		}
	}
	if (currentLine) lines.push(currentLine);
	
	return lines.map((line, index) => {
		const y = height * 0.55 + (index * height * 0.1);
		return `<text x="50%" y="${y}" 
			text-anchor="middle" 
			fill="white" 
			font-size="${Math.floor(width * 0.08)}" 
			font-family="Arial, sans-serif" 
			font-weight="bold"
			filter="url(#glow)">
			${line}
		</text>`;
	}).join('');
}
