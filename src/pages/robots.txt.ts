import type { APIRoute } from 'astro';
import { template } from '@/settings';

const getRobotsTxt = (sitemapURL: string) => `
# -----------------------------------------------
# Legitimate search engine crawlers — fully allowed
# -----------------------------------------------
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /

# -----------------------------------------------
# AI training & LLM data-harvesting crawlers — blocked
# Sources: ai.robots.txt community list (https://github.com/ai-robots-txt/ai.robots.txt)
# -----------------------------------------------

# OpenAI
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: OAI-SearchBot
Disallow: /

# Anthropic
User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: ClaudeBot
Disallow: /

# Google AI (Bard/Gemini training — separate from Googlebot)
User-agent: Google-Extended
Disallow: /

# Meta AI
User-agent: FacebookBot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

User-agent: Meta-ExternalFetcher
Disallow: /

# Cohere
User-agent: cohere-ai
Disallow: /

# Perplexity
User-agent: PerplexityBot
Disallow: /

# ByteDance / TikTok
User-agent: Bytespider
Disallow: /

# Common Crawl (used by many LLM training datasets)
User-agent: CCBot
Disallow: /

# Amazon Alexa / AI
User-agent: Amazonbot
Disallow: /

# Apple
User-agent: Applebot-Extended
Disallow: /

# Diffbot
User-agent: Diffbot
Disallow: /

# ImagesiftBot
User-agent: ImagesiftBot
Disallow: /

# Omgili / Webz.io
User-agent: omgili
Disallow: /

User-agent: omgilibot
Disallow: /

# Huawei
User-agent: PetalBot
Disallow: /

# Scrapy (generic scraping framework)
User-agent: Scrapy
Disallow: /

# DataForSEO
User-agent: DataForSeoBot
Disallow: /

# Timpibot
User-agent: Timpibot
Disallow: /

# YouBot (You.com AI)
User-agent: YouBot
Disallow: /

# -----------------------------------------------
# All other crawlers — allowed (search engines not listed above)
# -----------------------------------------------
User-agent: *
Allow: /

# Sitemap
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
