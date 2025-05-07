import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'haft': {
          100: '#DEBDA5',
          200: '#AAA9C7',
          300: '#5252A2',
          400: '#3B3881',
          500: '#2B286A',
        }
      },
      fontFamily: {
        'yekan': ['YekanBakh', 'sans-serif'],
      },
      fontSize: {
        'yekan-xs': ['0.75rem', { lineHeight: '1rem', fontFamily: 'YekanBakh' }],
        'yekan-sm': ['0.875rem', { lineHeight: '1.25rem', fontFamily: 'YekanBakh' }],
        'yekan-base': ['1rem', { lineHeight: '1.5rem', fontFamily: 'YekanBakh' }],
        'yekan-lg': ['1.125rem', { lineHeight: '1.75rem', fontFamily: 'YekanBakh' }],
        'yekan-xl': ['1.25rem', { lineHeight: '1.75rem', fontFamily: 'YekanBakh' }],
      },
    },
  },
  plugins: [],
}
export default config 