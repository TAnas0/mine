// 1. Import utilities from `astro:content`
import { defineCollection, z } from "astro:content";

// 2. Import loader(s)
import { glob } from "astro/loaders";

// 3. Define your collection(s)
const blog = defineCollection({
    loader: glob({
        pattern: "**/*.{md,mdx}",
        base: "./src/content/BlogPosts",
    }),
    schema: z.object({
        title: z.string(),
        date: z.string(),
        excerpt: z.string(),
        tags: z.array(z.string()).optional(),
        draft: z.boolean().default(false),
        subtitle: z.string().optional(),
        category: z.string().optional(),
        status: z.string().optional(),
        target_audience: z.string().optional(),
    }).passthrough(),
});
// 4. Export a single `collections` object to register your collection(s)
export const collections = { blog };
