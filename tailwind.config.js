module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#005EB8',
        secondary: '#FFD23F',
        accent: '#E03A3E',
        'neutral-100': '#F5F5F5',
        'neutral-900': '#1A1A1A',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      spacing: {
        '4.5': '1.125rem',
        '7': '1.75rem',
        '9': '2.25rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
      },
    },
  },
};
