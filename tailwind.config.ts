import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Casual cursive accent font (Caveat, loaded in app/layout.tsx) — reserved for
        // small signature-style flourishes, not body/heading copy.
        script: ['var(--font-caveat)', 'cursive'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 27, 36, 0.04), 0 4px 16px -4px rgba(15, 27, 36, 0.08)',
        lift: '0 2px 4px rgba(15, 27, 36, 0.04), 0 18px 40px -12px rgba(21, 152, 149, 0.28)',
        glow: '0 0 0 4px rgba(21, 152, 149, 0.15)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '4xl': '2rem',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Gamana Brand Colors
        gamana: {
          primary: '#1A5F7A',
          secondary: '#57C5B6',
          tertiary: '#159895',
          accent: '#FFB100',
          alert: '#E76161',
        },
        // 2026 design tokens. Opt-in only: shadcn `primary` stays untouched so Explore,
        // Blog and Cities keep rendering exactly as before.
        brand: {
          50: '#F0FBFA',
          100: '#D7F3EF',
          200: '#AEE6DF',
          300: '#7DD4CA',
          400: '#57C5B6',
          500: '#26AFA4',
          600: '#159895',
          700: '#0F7C78',
          800: '#1A5F7A',
          900: '#164E63',
          950: '#0B3A4A',
        },
        forest: '#0B6E4F',
        sunset: {
          100: '#FFEBD6',
          300: '#FFC35C',
          400: '#F4A100',
          500: '#E85D04',
          600: '#B84A03',
          700: '#7A1F1F',
        },
        sand: {
          50: '#FBF8F3',
          100: '#F5EFE6',
          200: '#EADFCF',
          700: '#7C5420',
        },
        // Icon-tile pastels (Toggl-style): soft tint background, deep glyph on top.
        lilac: {
          100: '#EEE7FF',
          700: '#5B3FA8',
        },
        mint: {
          100: '#DDF4E6',
          700: '#1D6B44',
        },
        ink: {
          DEFAULT: '#0F1B24',
          soft: '#3B4A55',
          muted: '#5F6E7A',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
        pop: {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '60%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
        wave: 'wave 1s ease-in-out infinite',
        pop: 'pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
