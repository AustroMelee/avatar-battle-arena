import { createTheme } from '@vanilla-extract/css';

export const [lightThemeClass, vars] = createTheme({
  colors: {
    primary: '#1e293b',
    primarySoft: '#f3f4f6',
    accent: '#fbbf24',
    border: '#e5e7eb',
    heading: '#18181b',
    text: '#222',
    onPrimary: '#fff',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2.5rem',
  },
  radius: {
    sm: '8px',
    md: '18px',
    lg: '36px',
  },
  fonts: {
    heading: `'Segoe UI', 'Inter', sans-serif`,
    body: `'Segoe UI', 'Inter', sans-serif`,
  },
});
