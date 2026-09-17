/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			fontFamily: {
				// Font Option 1 (Active): Fira Code - Modern developer monospace with rich programming ligatures
				sans: ["Fira Code", "JetBrains Mono", "ui-monospace", "monospace"],
				mono: ["Fira Code", "JetBrains Mono", "ui-monospace", "monospace"],

				// Font Option 2 (Alternative): Plus Jakarta Sans - Sleek, modern technical UI sans-serif
				// sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
				// mono: ["Fira Code", "monospace"],

				// Font Option 3 (Alternative): Space Mono - Distinctive retro-futuristic hacker monospace
				// sans: ["Space Mono", "monospace"],
				// mono: ["Space Mono", "monospace"],

				// Font Option 4 (Original): JetBrains Mono
				// sans: ["JetBrains Mono", "ui-monospace", "monospace"],
				// mono: ["JetBrains Mono", "ui-monospace", "monospace"],
			},
			colors: {
				terminal: {
					bg: "#141816",
					fg: "#d9dcd6",
					accent: "#3dd68c",
					muted: "#8a9089",
					border: "#262c28",
					forest: "#2a4a3a",
				},
			},
			maxWidth: {
				measure: "52rem",
			},
		},
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
	daisyui: {
		themes: [
			{
				terminal: {
					primary: "#3dd68c",
					"primary-content": "#141816",

					// Secondary Color Option 1 (Active): Electric Cyan / Sky Blue - High-contrast vibrant tech accent
					secondary: "#38bdf8",
					"secondary-content": "#0f172a",

					// Secondary Color Option 2 (Alternative): Synthwave Violet - Rich neon purple accent
					// secondary: "#c084fc",
					// "secondary-content": "#1e1b4b",

					// Secondary Color Option 3 (Alternative): Solar Amber / Copper Flame - Warm industrial orange accent
					// secondary: "#fb923c",
					// "secondary-content": "#451a03",

					// Secondary Color Option 4 (Original): Forest Teal
					// secondary: "#5eead4",
					// "secondary-content": "#134e4a",

					accent: "#3dd68c",
					"accent-content": "#141816",
					neutral: "#1c211e",
					"neutral-content": "#d9dcd6",
					"base-100": "#141816",
					"base-200": "#1c211e",
					"base-300": "#262c28",
					"base-content": "#d9dcd6",
					info: "#5b8fd9",
					success: "#3dd68c",
					warning: "#d9dcd6",
					error: "#ff6b6b",
				},
			},
			{
				"terminal-light": {
					primary: "#2a8f5c",
					"primary-content": "#e6e4dc",

					// Secondary Color Option 1 (Active): Electric Cyan / Sky Blue (Light Mode - Deep Sky Blue)
					secondary: "#0284c7",
					"secondary-content": "#ffffff",

					// Secondary Color Option 2 (Alternative): Synthwave Violet (Light Mode - Deep Royal Purple)
					// secondary: "#7e22ce",
					// "secondary-content": "#ffffff",

					// Secondary Color Option 3 (Alternative): Solar Amber / Copper Flame (Light Mode - Rich Terracotta)
					// secondary: "#c2410c",
					// "secondary-content": "#ffffff",

					// Secondary Color Option 4 (Original): Deep Teal (Light Mode)
					// secondary: "#0f766e",
					// "secondary-content": "#ffffff",

					accent: "#2a8f5c",
					"accent-content": "#e6e4dc",
					neutral: "#ccc8bd",
					"neutral-content": "#1c1c1a",
					"base-100": "#F0F8FF",
					"base-200": "#e0eef9",
					"base-300": "#c8dff0",
					"base-content": "#1c1c1a",
					info: "#3d6fa8",
					success: "#2a8f5c",
					warning: "#1c1c1a",
					error: "#a93226",
				},
			},
		],
	},
};
