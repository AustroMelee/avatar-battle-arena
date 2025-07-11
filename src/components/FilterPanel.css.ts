import { style } from '@vanilla-extract/css';
import { vars } from '../styles/tokens.css';

export const panel = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.sm,
  marginBottom: vars.spacing.md,
});
