import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/themes/lightTheme.css';

export const button = style({
  background: vars.color.primary,
  color: vars.color.surface,
  border: 'none',
  borderRadius: '8px',
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s',
  selectors: {
    '&:hover': {
      background: vars.color.secondary,
    },
    '&:active': {
      background: '#2563eb',
    },
  },
});
