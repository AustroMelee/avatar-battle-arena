import { createThemeContract } from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: {
    bg: '#f7f7fa',
    fg: '#18181a',
    accent: '#0094ff',
    border: '#ddd',
    danger: '#e53935',
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
  },
  radius: {
    sm: '6px',
    md: '12px',
    lg: '2rem',
  },
});
