import type { CollectionEntry } from "astro:content";
import { trimExcerpt } from "@/lib/utils";
import { template } from "@/settings";

export type ArticlePreview = {
	title: string;
	date: string;
	tags: string[];
	excerpt: string;
	slug: string;
};

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
	};
}

export function sortPostsByDate<T extends { date: string }>(
	posts: T[],
): T[] {
	return posts.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
}
