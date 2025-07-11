import { style } from '@vanilla-extract/css';
import { vars } from '../styles/tokens.css';

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: vars.spacing.lg,
  marginTop: vars.spacing.lg,
});
