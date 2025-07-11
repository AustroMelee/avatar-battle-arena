import { createTheme } from '@vanilla-extract/css';
import { vars } from './lightTheme.css';

export const darkTheme = createTheme(vars, {
  color: {
    primary: '#2563eb',
    secondary: '#f43f5e',
    background: '#18181b',
    surface: '#27272a',
    text: '#fafafa',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '40px',
  },
});
