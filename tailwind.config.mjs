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
					bg: "#0a0a0a",
					fg: "#e8e8e3",
					accent: "#3dd68c",
					muted: "#8a8a85",
					border: "#2a2a2a",
				},
			},
		},
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
	daisyui: {
		themes: [
			{
				terminal: {
					primary: "#3dd68c",
					"primary-content": "#0a0a0a",
					secondary: "#5b8fd9",
					"secondary-content": "#0a0a0a",
					accent: "#3dd68c",
					"accent-content": "#0a0a0a",
					neutral: "#1a1a1a",
					"neutral-content": "#e8e8e3",
					"base-100": "#0a0a0a",
					"base-200": "#141414",
					"base-300": "#1f1f1f",
					"base-content": "#e8e8e3",
					info: "#5b8fd9",
					success: "#3dd68c",
					warning: "#e8e8e3",
					error: "#ff6b6b",
				},
			},
			{
				"terminal-light": {
					primary: "#2a9d6a",
					"primary-content": "#f5f5f0",
					secondary: "#3d6fa8",
					"secondary-content": "#f5f5f0",
					accent: "#2a9d6a",
					"accent-content": "#f5f5f0",
					neutral: "#d4d4cf",
					"neutral-content": "#0a0a0a",
					"base-100": "#f5f5f0",
					"base-200": "#ebebe6",
					"base-300": "#d4d4cf",
					"base-content": "#0a0a0a",
					info: "#3d6fa8",
					success: "#2a9d6a",
					warning: "#0a0a0a",
					error: "#c0392b",
				},
			},
		],
	},
};
