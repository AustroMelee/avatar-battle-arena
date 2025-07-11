import { style } from '@vanilla-extract/css';
import { vars } from '../styles/tokens.css';

export const searchBar = style({
  display: 'flex',
  alignItems: 'center',
  padding: vars.spacing.sm,
  background: vars.color.bg,
  borderRadius: vars.radius.md,
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  gap: vars.spacing.sm,
});
export const input = style({
  flex: 1,
  padding: vars.spacing.sm,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  fontSize: '1rem',
  outline: 'none',
});
export const button = style({
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  border: 0,
  borderRadius: vars.radius.sm,
  background: vars.color.accent,
  color: 'white',
  fontWeight: 600,
  cursor: 'pointer',
});
