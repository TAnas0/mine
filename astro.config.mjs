// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import { template } from "./src/settings";

import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), sitemap(), mdx()],
    site: template.website_url,
    base: template.base,
});