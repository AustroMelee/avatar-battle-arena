import { style } from '@vanilla-extract/css';
import { vars } from '../styles/tokens.css';

export const tag = style({
  display: 'inline-block',
  padding: `0 ${vars.spacing.sm}`,
  borderRadius: vars.radius.sm,
  background: vars.color.accent,
  color: 'white',
  fontWeight: 600,
  fontSize: '0.9rem',
  marginRight: vars.spacing.sm,
  marginBottom: vars.spacing.sm,
});
