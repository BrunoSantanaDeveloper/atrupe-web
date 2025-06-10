import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        gray: {
          25: '#FCFCFD',
          50: '#F9FAFB',
          100: '#F2F4F7',
          200: '#EAECF0',
          300: '#D0D5DD',
          400: '#98A2B3',
          DEFAULT: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1D2939',
          900: '#101828',
        },
        brand: {
          25: '#ECFDF4',
          50: '#D2F9E3',
          100: '#A9F1CC',
          200: '#71E4AF',
          300: '#38CF8F',
          400: '#14B375',
          DEFAULT: '#099260',
          600: '#077550',
          700: '#085D40',
          800: '#084C36',
          900: '#032B1F',
        },
        error: {
          25: '#FFFBFA',
          50: '#FFF3F2',
          100: '#FEE4E2',
          200: '#FECDCA',
          300: '#FDA29B',
          400: '#F97066',
          DEFAULT: '#F04438',
          600: '#D92D20',
          700: '#B42318',
          800: '#912018',
          900: '#7A271A',
        },
        warning: {
          25: '#FFFCF5',
          50: '#FFFAEB',
          100: '#FEF0C7',
          200: '#FEDF89',
          300: '#FEC84B',
          400: '#FDB022',
          DEFAULT: '#F79009',
          600: '#DC6803',
          700: '#B54708',
          800: '#93370D',
          900: '#7A2E0E',
        },
        success: {
          25: '#F6FEF9',
          50: '#ECFDF3',
          100: '#D1FADF',
          200: '#A6F4C5',
          300: '#6CE9A6',
          400: '#32D583',
          DEFAULT: '#12B76A',
          600: '#039855',
          700: '#027A48',
          800: '#05603A',
          900: '#054F31',
        },
        blue: {
          50: '#EFF8FF',
          300: '#84CAFF',
          DEFAULT: '#2E90FA',
          700: '#175CD3',
          gray: {
            DEFAULT: '#4E5BA6',
          },
          light: {
            25: '#F5FBFF',
            50: '#F0F9FF',
            100: '#E0F2FE',
            200: '#B9E6FE',
            300: '#7CD4FD',
            400: '#36BFFA',
            DEFAULT: '#0BA5EC',
            600: '#0086C9',
            700: '#026AA2',
            800: '#065986',
            900: '#0B4A6F',
          },
          green: {
            50: '#E0F7F7', // Um tom bem claro
            300: '#66D4D4', // Um tom intermediário
            DEFAULT: '#119FA8', // Tom padrão
            700: '#007B7B', // Um tom mais escuro
          },
        },
        indigo: {
          DEFAULT: '#6172F3',
        },
        purple: {
          50: '#F4F3FF',
          300: '#BDB4FE',
          DEFAULT: '#7A5AF8',
          700: '#5925DC',
        },
        pink: {
          50: '#FDF2FA',
          300: '#FAA7E0',
          DEFAULT: '#EE46BC',
          600: '#DD2590',
          700: '#C11574',
        },
        rose: {
          DEFAULT: '#F63D68',
        },
        orange: {
          DEFAULT: '#FB6514',
        },
        logo: {
          DEFAULT: '#EF4123',
        },
      },
      /* borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      }, */
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
