import { style } from '@vanilla-extract/css';
import { vars } from '../styles/themes/lightTheme.css';

export const navbar = style({
  display: 'flex',
  alignItems: 'center',
  background: vars.colors.primary,
  color: vars.colors.onPrimary,
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  borderBottom: `1px solid ${vars.colors.border}`,
  gap: vars.spacing.lg,
  fontFamily: vars.fonts.heading,
});

export const logo = style({
  fontWeight: 700,
  fontSize: '1.4rem',
  marginRight: vars.spacing.lg,
  letterSpacing: '.02em',
});

export const navLink = style({
  color: 'inherit',
  textDecoration: 'none',
  fontWeight: 500,
  padding: `0 ${vars.spacing.md}`,
  borderRadius: vars.radius.sm,
  selectors: {
    '&:hover, &:focus': {
      background: vars.colors.primarySoft,
      color: vars.colors.accent,
    },
  },
});
