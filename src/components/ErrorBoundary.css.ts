import { style } from '@vanilla-extract/css';
import { vars } from '../styles/tokens.css';

export const errorBox = style({
  background: vars.color.danger,
  color: 'white',
  padding: vars.spacing.md,
  borderRadius: vars.radius.md,
  textAlign: 'center',
  margin: vars.spacing.lg,
});
