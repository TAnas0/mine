/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["JetBrains Mono", "ui-monospace", "monospace"],
				mono: ["JetBrains Mono", "ui-monospace", "monospace"],
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
					secondary: "#2a4a3a",
					"secondary-content": "#d9dcd6",
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
					secondary: "#1f4034",
					"secondary-content": "#e6e4dc",
					accent: "#2a8f5c",
					"accent-content": "#e6e4dc",
					neutral: "#ccc8bd",
					"neutral-content": "#1c1c1a",
					"base-100": "#e6e4dc",
					"base-200": "#dcd9d0",
					"base-300": "#ccc8bd",
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
