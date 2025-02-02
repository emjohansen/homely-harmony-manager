import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		// Override the default colors to only allow our specific colors
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			'forest': '#1e251c',
			'sage': '#9dbc98',
			'cream': '#efffed',
			'mint': '#e0f0dd',
		},
		extend: {}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;