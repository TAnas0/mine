import type { APIRoute } from 'astro';
import { template } from '@/settings';

const getRobotsTxt = (sitemapURL: string) => `
# Basic robots.txt placeholder
User-agent: *
Allow: /

# Sitemap location
Sitemap: ${sitemapURL}
`.trim();

export const GET: APIRoute = ({ site }) => {
	const siteUrl = site ? site.href : template.website_url;
	const base = template.base ? (template.base.startsWith('/') ? template.base : '/' + template.base) : '';
	const sitemapURL = new URL(`${base}/sitemap-index.xml`.replace(/\/+/g, '/'), siteUrl).href;

	return new Response(getRobotsTxt(sitemapURL), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
