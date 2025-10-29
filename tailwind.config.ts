import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // <-- Add this line
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}', // <-- Made this more robust
    './pages/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'radial-ellipse-top-left': 'radial-gradient(ellipse at top left, var(--tw-gradient-stops))',
      },
    },
  },
  safelist: [
    'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))]',
  ],
  plugins: [],
};

export default config;