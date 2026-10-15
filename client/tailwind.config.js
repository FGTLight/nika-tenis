/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Cores do tema: definidas como variáveis CSS em src/index.css
      // (modo claro = branco + rosa da marca; modo escuro = [data-theme="dark"]).
      colors: {
        ink: 'rgb(var(--c-ink) / <alpha-value>)', // fundo da página
        coal: 'rgb(var(--c-coal) / <alpha-value>)', // superfícies (cards, seções)
        media: 'rgb(var(--c-media) / <alpha-value>)', // fundo das fotos/ilustrações
        line: 'rgb(var(--c-line) / <alpha-value>)', // bordas
        bone: 'rgb(var(--c-bone) / <alpha-value>)', // texto principal
        mute: 'rgb(var(--c-mute) / <alpha-value>)', // texto secundário
        brand: 'rgb(var(--c-brand) / <alpha-value>)', // rosa da marca (acento)
        danger: 'rgb(var(--c-danger) / <alpha-value>)', // erros e exclusões
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Anton', 'Impact', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Títulos gigantes e fluidos
        mega: ['clamp(4.25rem, min(10.5vw, 17vh), 11rem)', { lineHeight: '0.85', letterSpacing: '-0.01em' }],
        huge: ['clamp(3rem, 9vw, 8rem)', { lineHeight: '0.9' }],
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.6)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'pulse-ring': 'pulseRing 1.8s cubic-bezier(0.2, 0.6, 0.3, 1) infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
