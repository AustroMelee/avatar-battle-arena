import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/themes/lightTheme.css';

export const searchBar = style({
  display: 'flex',
  alignItems: 'center',
  background: vars.color.surface,
  padding: vars.spacing.sm,
  borderRadius: '8px',
  boxShadow: '0 1px 2px rgba(0,0,0,0.07)',
});
