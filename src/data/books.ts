export type Book = {
	title: string;
	author: string;
	year: number;
	category: BookCategory;
	description: string;
	/** Why I recommend it / personal note */
	note?: string;
	/** Reading status */
	status: "read" | "reading" | "to-read";
	/** Optional link to more info */
	url?: string;
	/** Optional star rating 1-5 */
	rating?: number;
	/** Real cover image path (relative to /public) — add later */
	coverImage?: string;
	/** HSL accent color used for placeholder cover */
	coverColor?: string;
};

export type BookCategory =
	| "craft"
	| "architecture"
	| "sociotechnical"
	| "algorithms"
	| "security"
	| "philosophy";

export const CATEGORY_LABELS: Record<BookCategory, string> = {
	craft: "Code Craftsmanship",
	architecture: "System Design & Architecture",
	sociotechnical: "The Human Side",
	algorithms: "Algorithms & Theory",
	security: "Security",
	philosophy: "Philosophy of Engineering",
};

export const CATEGORY_DESCRIPTIONS: Record<BookCategory, string> = {
	craft: "How to write code that endures",
	architecture: "How to build systems that scale",
	sociotechnical: "How to work with people and teams",
	algorithms: "The mathematical foundations",
	security: "Attack, defence, and trust",
	philosophy: "Mental models for the long game",
};

/** Palette of cover accent colors per category */
export const CATEGORY_COLORS: Record<BookCategory, string[]> = {
	craft:         ["#1a6b4a", "#2d5a3d", "#0d4f35", "#1c5c3f", "#3a7a52"],
	architecture:  ["#2b4a8c", "#1e3a7a", "#16306e", "#253f7e", "#3355a0"],
	sociotechnical:["#7a3a1c", "#6b2d10", "#5c2008", "#8a4a25", "#963d18"],
	algorithms:    ["#4a2d8c", "#3a1e7a", "#2f166e", "#5535a0", "#3d2080"],
	security:      ["#1a5a6b", "#104e5c", "#084459", "#1c6378", "#0e5468"],
	philosophy:    ["#5a5a1a", "#4e4e10", "#424208", "#636314", "#585818"],
};

export const books: Book[] = [
	// ── Code Craftsmanship ──────────────────────────────────────────
	{
		title: "The Pragmatic Programmer",
		author: "David Thomas & Andrew Hunt",
		year: 1999,
		category: "craft",
		description:
			"Timeless tips for writing adaptable, well-crafted software. Every chapter is a standalone lesson in professional discipline.",
		note: "Re-read once a year. Each read reveals something new.",
		status: "read",
		rating: 5,
		url: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
		coverColor: "#1a6b4a",
	},
	{
		title: "Refactoring",
		author: "Martin Fowler",
		year: 1999,
		category: "craft",
		description:
			"The definitive catalogue of code smells and the refactoring moves to cure them.",
		note: "The vocabulary alone — extract method, replace conditional with polymorphism — is worth the read.",
		status: "read",
		rating: 5,
		coverColor: "#2d5a3d",
	},
	{
		title: "Clean Code",
		author: "Robert C. Martin",
		year: 2008,
		category: "craft",
		description:
			"A guide to writing readable, maintainable code. Best taken as a starting point for discussion, not dogma.",
		status: "read",
		rating: 4,
		coverColor: "#0d4f35",
	},
	{
		title: "A Philosophy of Software Design",
		author: "John Ousterhout",
		year: 2018,
		category: "craft",
		description:
			"A concise manifesto against complexity. The primary goal of software design is to reduce cognitive load.",
		note: "The best short bridge between clean code and system design. Highly underrated.",
		status: "read",
		rating: 5,
		coverColor: "#1c5c3f",
	},
	{
		title: "Working Effectively with Legacy Code",
		author: "Michael C. Feathers",
		year: 2004,
		category: "craft",
		description:
			"The practical guide to making changes to large, scary codebases safely. Defines legacy code as 'code without tests'.",
		status: "to-read",
		coverColor: "#3a7a52",
	},
	{
		title: "The Art of Readable Code",
		author: "Dustin Boswell & Trevor Foucher",
		year: 2011,
		category: "craft",
		description:
			"Code should be written to minimize the time it takes for someone else to understand it. A focused, practical complement to Clean Code.",
		status: "to-read",
		coverColor: "#2d6647",
	},

	// ── System Design & Architecture ────────────────────────────────
	{
		title: "Designing Data-Intensive Applications",
		author: "Martin Kleppmann",
		year: 2017,
		category: "architecture",
		description:
			"The definitive reference for distributed systems, storage engines, replication, and stream processing. Dense, rigorous, indispensable.",
		note: "The book that made distributed systems click for me. Return to it whenever I touch a new system.",
		status: "read",
		rating: 5,
		url: "https://dataintensive.net/",
		coverColor: "#2b4a8c",
	},
	{
		title: "Design Patterns",
		author: "Gang of Four",
		year: 1994,
		category: "architecture",
		description:
			"The original patterns catalogue. The vocabulary and habit of pattern-thinking matter more than any individual pattern.",
		status: "read",
		rating: 4,
		coverColor: "#1e3a7a",
	},
	{
		title: "Release It!",
		author: "Michael T. Nygard",
		year: 2007,
		category: "architecture",
		description:
			"Stability patterns and anti-patterns for production systems — circuit breakers, bulkheads, timeouts.",
		note: "Should be mandatory reading before shipping anything to production.",
		status: "read",
		rating: 5,
		coverColor: "#16306e",
	},
	{
		title: "Software Architecture: The Hard Parts",
		author: "Ford, Richards, Sadalage & Dehghani",
		year: 2021,
		category: "architecture",
		description:
			"Trade-off analysis for distributed architectures. When there are no best practices, only trade-offs.",
		status: "to-read",
		coverColor: "#253f7e",
	},
	{
		title: "Fundamentals of Software Architecture",
		author: "Mark Richards & Neal Ford",
		year: 2020,
		category: "architecture",
		description:
			"A comprehensive overview of architectural styles, characteristics, and the role of the architect.",
		status: "to-read",
		coverColor: "#3355a0",
	},
	{
		title: "Building Microservices",
		author: "Sam Newman",
		year: 2015,
		category: "architecture",
		description:
			"The canonical guide to microservices — decomposition, communication, deployment, and the organizational implications.",
		status: "to-read",
		coverColor: "#1a2e6e",
	},

	// ── The Human Side ──────────────────────────────────────────────
	{
		title: "The Mythical Man-Month",
		author: "Frederick P. Brooks Jr.",
		year: 1975,
		category: "sociotechnical",
		description:
			"Still the clearest account of why software is hard: adding people to a late project makes it later.",
		note: "\"There is no silver bullet\" is still true. Sobering and liberating at the same time.",
		status: "read",
		rating: 5,
		coverColor: "#7a3a1c",
	},
	{
		title: "Peopleware",
		author: "Tom DeMarco & Timothy Lister",
		year: 1987,
		category: "sociotechnical",
		description:
			"The data-driven case that the biggest challenge in software is sociological, not technical — flow, space, team dynamics.",
		status: "read",
		rating: 5,
		coverColor: "#6b2d10",
	},
	{
		title: "Team Topologies",
		author: "Matthew Skelton & Manuel Pais",
		year: 2019,
		category: "sociotechnical",
		description:
			"A modern framework for organising teams around fast flow of change. Conway's Law applied deliberately.",
		status: "read",
		rating: 4,
		coverColor: "#5c2008",
	},
	{
		title: "An Elegant Puzzle",
		author: "Will Larson",
		year: 2019,
		category: "sociotechnical",
		description:
			"Systems thinking applied to engineering management — org design, succession, and how to ship sustainably.",
		status: "to-read",
		coverColor: "#8a4a25",
	},
	{
		title: "The Manager's Path",
		author: "Camille Fournier",
		year: 2017,
		category: "sociotechnical",
		description:
			"A guide through the engineering management track, from tech lead to CTO. Practical and honest.",
		status: "to-read",
		coverColor: "#963d18",
	},

	// ── Algorithms & Theory ─────────────────────────────────────────
	{
		title: "Introduction to Algorithms",
		author: "Cormen, Leiserson, Rivest & Stein",
		year: 1990,
		category: "algorithms",
		description:
			"The bible of algorithms. Dense and rigorous — use it as a reference, not a linear read.",
		status: "read",
		rating: 4,
		coverColor: "#4a2d8c",
	},
	{
		title: "The Algorithm Design Manual",
		author: "Steven Skiena",
		year: 1997,
		category: "algorithms",
		description:
			"More accessible than CLRS, with war stories from real problems. The 'hitchhiker's guide' to algorithms.",
		status: "to-read",
		coverColor: "#3a1e7a",
	},
	{
		title: "Grokking Algorithms",
		author: "Aditya Bhargava",
		year: 2016,
		category: "algorithms",
		description:
			"Illustrated and approachable — the best first book on algorithms before CLRS.",
		status: "to-read",
		coverColor: "#5535a0",
	},

	// ── Security ────────────────────────────────────────────────────
	{
		title: "The Web Application Hacker's Handbook",
		author: "Stuttard & Pinto",
		year: 2007,
		category: "security",
		description:
			"Comprehensive tour of web vulnerabilities from an attacker's perspective. Essential for anyone building web-facing systems.",
		status: "read",
		rating: 4,
		coverColor: "#1a5a6b",
	},
	{
		title: "The Tangled Web",
		author: "Michal Zalewski",
		year: 2011,
		category: "security",
		description:
			"A deep exploration of browser security mechanics. Explains the weird, historical quirks that make the web insecure.",
		status: "to-read",
		coverColor: "#104e5c",
	},
	{
		title: "Threat Modeling",
		author: "Adam Shostack",
		year: 2014,
		category: "security",
		description:
			"The standard reference for structured thinking about what could go wrong and how to prevent it.",
		status: "to-read",
		coverColor: "#0e5468",
	},

	// ── Philosophy of Engineering ────────────────────────────────────
	{
		title: "The Cathedral and the Bazaar",
		author: "Eric S. Raymond",
		year: 1999,
		category: "philosophy",
		description:
			"The seminal essay collection on open source development, its social dynamics, and why it works.",
		status: "read",
		rating: 4,
		coverColor: "#5a5a1a",
	},
	{
		title: "Hackers & Painters",
		author: "Paul Graham",
		year: 2004,
		category: "philosophy",
		description:
			"Essays on the nature of programming, startups, and creativity. Lisp evangelism aside, the ideas are rich.",
		note: "Best read as a provocation, not a manual.",
		status: "read",
		rating: 4,
		coverColor: "#4e4e10",
	},
	{
		title: "Out of the Tar Pit",
		author: "Ben Moseley & Peter Marks",
		year: 2006,
		category: "philosophy",
		description:
			"The landmark paper arguing that complexity — especially accidental complexity — is the root cause of software failures.",
		status: "to-read",
		coverColor: "#585818",
	},
];
