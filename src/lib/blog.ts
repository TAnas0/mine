import type { CollectionEntry } from "astro:content";
import { trimExcerpt } from "@/lib/utils";
import { template } from "@/settings";

export type ArticlePreview = {
	title: string;
	date: string;
	tags: string[];
	excerpt: string;
	slug: string;
	draft?: boolean;
	readingTime: string;
};

export function calculateReadingTime(content?: string): string {
	if (!content) return "1 min read";
	const wordsPerMinute = 150;
	const words = content.trim().split(/\s+/).length;
	const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
	return `${minutes} min read`;
}

export function blogSlugFromId(id: string): string {
	return `${template.base}/blog/${id.replace(/\.[^/.]+$/, "")}`;
}

export function blogPostToPreview(
	post: CollectionEntry<"blog">,
): ArticlePreview {
	return {
		title: post.data.title,
		date: post.data.date,
		tags: post.data.tags ?? [],
		excerpt: trimExcerpt(post.data.excerpt),
		slug: blogSlugFromId(post.id),
		draft: post.data.draft ?? false,
		readingTime: calculateReadingTime(post.body),
	};
}

export function filterPublishedPosts(
	posts: CollectionEntry<"blog">[],
): CollectionEntry<"blog">[] {
	if (import.meta.env.DEV) {
		return posts;
	}
	return posts.filter((post) => !post.data.draft);
}

export function sortPostsByDate<T extends { date: string }>(
	posts: T[],
): T[] {
	return [...posts].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
}
