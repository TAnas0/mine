export type Book = {
	title: string;
	author: string;
	year: number;
	category: BookCategory;
	/** Reading status */
	status: "read" | "reading" | "to-read";
	/** Optional link to more info */
	url?: string;
	/** Optional star rating 1-5 */
	rating?: number;
	/** Real cover image path (relative to /public) — add later */
	coverImage?: string;
};

export type BookCategory =
	| "craft"
	| "architecture"
	| "sociotechnical"
	| "algorithms"
	| "systems"
	| "security"
	| "philosophy"
	| "productivity";

export const CATEGORY_LABELS: Record<BookCategory, string> = {
	craft: "Code Craftsmanship",
	architecture: "System Design & Architecture",
	sociotechnical: "The Human Side",
	algorithms: "Algorithms & Theory",
	systems: "How Computers Work",
	security: "Security",
	philosophy: "Philosophy of Engineering",
	productivity: "Thinking & Productivity",
};

export const CATEGORY_DESCRIPTIONS: Record<BookCategory, string> = {
	craft: "How to write code that endures",
	architecture: "How to build systems that scale",
	sociotechnical: "How to work with people and teams",
	algorithms: "The mathematical foundations",
	systems: "Hardware, memory, and the machine beneath the code",
	security: "Attack, defence, and trust",
	philosophy: "Mental models for the long game",
	productivity: "Clear thinking, clear writing, clear work",
};

/** Fallback color for books without a cover image */
export const DEFAULT_COVER_COLOR = "#2a2a3a";

export const books: Book[] = [
	// ── Code Craftsmanship ──────────────────────────────────────────
	{
		title: "The Pragmatic Programmer",
		author: "David Thomas & Andrew Hunt",
		year: 1999,
		category: "craft",
		status: "read",
		rating: 5,
		url: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
		coverImage: "/images/books/the-pragmatic-programmer.jpg",
	},
	{
		title: "Refactoring",
		author: "Martin Fowler, Kent Beck",
		year: 1999,
		category: "craft",
		status: "read",
		rating: 5,
		coverImage: "/images/books/refactoring.jpg",
	},
	{
		title: "Clean Code",
		author: "Robert C. Martin",
		year: 2008,
		category: "craft",
		status: "read",
		rating: 4,
		coverImage: "/images/books/clean-code.jpg",
	},
	{
		title: "A Philosophy of Software Design",
		author: "John Ousterhout",
		year: 2018,
		category: "craft",
		status: "to-read",
		rating: 5,
		coverImage: "/images/books/a-philosophy-of-software-design.webp",
	},
	{
		title: "Working Effectively with Legacy Code",
		author: "Michael C. Feathers",
		year: 2004,
		category: "craft",
		status: "to-read",
		coverImage: "/images/books/working-effectively-with-legacy-code.jpg",
	},
	{
		title: "The Art of Readable Code",
		author: "Dustin Boswell & Trevor Foucher",
		year: 2011,
		category: "craft",
		status: "to-read",
		coverImage: "/images/books/the-art-of-readable-code.jpg",
	},

	// ── System Design & Architecture ────────────────────────────────
	{
		title: "Designing Data-Intensive Applications",
		author: "Martin Kleppmann",
		year: 2017,
		category: "architecture",
		status: "read",
		rating: 5,
		url: "https://dataintensive.net/",
	},
	{
		title: "Design Patterns",
		author: "Gang of Four",
		year: 1994,
		category: "architecture",
		status: "read",
		rating: 4,
	},
	{
		title: "Fundamentals of Software Architecture",
		author: "Mark Richards & Neal Ford",
		year: 2020,
		category: "architecture",
		status: "to-read",
		coverImage: "/images/books/fundamentals of software architecture.jpg",
	},
	{
		title: "Building Microservices",
		author: "Sam Newman",
		year: 2015,
		category: "architecture",
		status: "to-read",
		coverImage: "/images/books/building microservices.webp",
	},

	// ── The Human Side ──────────────────────────────────────────────
	{
		title: "The Mythical Man-Month",
		author: "Frederick P. Brooks Jr.",
		year: 1975,
		category: "sociotechnical",
		status: "read",
		rating: 5,
		coverImage: "/images/books/the mythical man month.jpg",
	},
	{
		title: "Peopleware",
		author: "Tom DeMarco & Timothy Lister",
		year: 1987,
		category: "sociotechnical",
		status: "read",
		rating: 5,
		coverImage: "/images/books/peopleware.jpg",
	},
	{
		title: "Team Topologies",
		author: "Matthew Skelton & Manuel Pais",
		year: 2019,
		category: "sociotechnical",
		status: "to-read",
		rating: 4,
		coverImage: "/images/books/team-topologies.webp",
	},

	// ── Algorithms & Theory ─────────────────────────────────────────
	{
		title: "Introduction to Algorithms",
		author: "Cormen, Leiserson, Rivest & Stein",
		year: 1990,
		category: "algorithms",
		status: "read",
		rating: 4,
		coverImage: "/images/books/introduction-to-algorithms.jpg",
	},
	{
		title: "The Algorithm Design Manual",
		author: "Steven Skiena",
		year: 1997,
		category: "algorithms",
		status: "to-read",
	},
	{
		title: "Grokking Algorithms",
		author: "Aditya Bhargava",
		year: 2016,
		category: "algorithms",
		status: "to-read",
	},
	{
		title: "Structure and Interpretation of Computer Programs",
		author: "Abelson & Sussman",
		year: 1996,
		category: "algorithms",
		status: "read",
	},

	// ── How Computers Work ──────────────────────────────────────────
	{
		title: "What Every Programmer Should Know About Memory",
		author: "Ulrich Drepper",
		year: 2007,
		category: "systems",
		status: "read",
	},
	{
		title: "Computer Systems: A Programmer's Perspective",
		author: "Bryant & O'Hallaron",
		year: 2003,
		category: "systems",
		status: "read",
	},
	{
		title: "Practical Electronics for Inventors",
		author: "Paul Scherz & Simon Monk",
		year: 2006,
		category: "systems",
		status: "read",
	},
	{
		title: "Network Science",
		author: "Albert-László Barabási",
		year: 2016,
		category: "systems",
		status: "read",
		url: "http://networksciencebook.com/",
	},

	// ── Security ────────────────────────────────────────────────────
	{
		title: "The Web Application Hacker's Handbook",
		author: "Stuttard & Pinto",
		year: 2007,
		category: "security",
		status: "read",
		rating: 4,
		coverImage: "/images/books/the web application hacker handbook .jpg",
	},
	{
		title: "The Tangled Web",
		author: "Michal Zalewski",
		year: 2011,
		category: "security",
		status: "to-read",
	},
	{
		title: "Threat Modeling",
		author: "Adam Shostack",
		year: 2014,
		category: "security",
		status: "to-read",
	},

	// ── Philosophy of Engineering ────────────────────────────────────
	{
		title: "The Cathedral and the Bazaar",
		author: "Eric S. Raymond",
		year: 1999,
		category: "philosophy",
		status: "read",
		rating: 4,
	},
	{
		title: "Out of the Tar Pit",
		author: "Ben Moseley & Peter Marks",
		year: 2006,
		category: "philosophy",
		status: "to-read",
	},
	{
		title: "The Enigma of Reason",
		author: "Hugo Mercier & Dan Sperber",
		year: 2017,
		category: "philosophy",
		status: "read",
	},

	// ── Thinking & Productivity ──────────────────────────────────────
	{
		title: "The Lean Startup",
		author: "Eric Ries",
		year: 2011,
		category: "productivity",
		status: "read",
	},
	{
		title: "Building a Second Brain",
		author: "Tiago Forte",
		year: 2022,
		category: "productivity",
		status: "read",
	},
	{
		title: "Very Good Copy",
		author: "Eddie Shleyner",
		year: 2023,
		category: "productivity",
		status: "read",
	},
];
