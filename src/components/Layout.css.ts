import { style } from '@vanilla-extract/css';
import { vars } from '../styles/tokens.css';

export const layout = style({
  minHeight: '100vh',
  background: vars.color.bg,
  display: 'flex',
  flexDirection: 'column',
});
export const main = style({
  flex: 1,
  maxWidth: '900px',
  margin: '0 auto',
  padding: vars.spacing.lg,
});
