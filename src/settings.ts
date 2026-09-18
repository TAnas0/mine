export const profile = {
	fullName: 'A. Lexian',
	title: 'Systems Engineer & DevOps',
	institute: '',
	author_name: '', // Author name to be highlighted in the papers section
	research_areas: [
		// { title: 'Physics', description: 'Brief description of the research interest', field: 'physics' },
	],
}

// Set equal to an empty string to hide the icon that you don't want to display
export const social = {
	email: '',
	linkedin: '',
	x: '',
	github: '',
	gitlab: '',
	calendly: 'https://calendly.com/your-username',
	scholar: '',
	inspire: '',
	arxiv: '',
}

export const template = {
	website_url: 'https://tanas0.github.io/mine', // Deployed GitHub Pages URL
	menu_left: false,
	transitions: false,
	lightTheme: 'terminal-light',
	darkTheme: 'terminal',
	excerptLength: 200,
	postPerPage: 5,
    base: '/mine' // Repository name — required for GitHub Pages sub-path deployment
}

export const seo = {
	default_title: 'A. Lexian · Systems Engineering & DevOps',
	default_description: 'Engineering blog covering backend systems, DevOps, security, and developer tooling — written by a practitioner, for practitioners.',
	default_image: '/images/og-default.png',
}
