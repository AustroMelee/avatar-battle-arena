import { style } from '@vanilla-extract/css';
import { vars } from '../styles/tokens.css';

export const noResults = style({
  textAlign: 'center',
  color: vars.color.fg,
  fontSize: '1.2rem',
  marginTop: vars.spacing.lg,
});
