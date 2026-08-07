import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        'on-primary': '#FFFFFF',
        secondary: '#334155',
        accent: '#0369A1',
        background: '#F8FAFC',
        foreground: '#020617',
        muted: '#E8ECF1',
        border: '#E2E8F0',
        destructive: '#DC2626',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        'heading': ['Fira Code', 'monospace'],
        'body': ['Fira Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
