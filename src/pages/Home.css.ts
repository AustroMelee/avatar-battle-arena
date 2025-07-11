import { style } from '@vanilla-extract/css';
import { vars } from '../styles/themes/lightTheme.css';

export const container = style({
  maxWidth: '900px',
  margin: '0 auto',
  padding: vars.spacing.xl,
  textAlign: 'center',
});

export const title = style({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: vars.spacing.md,
  color: vars.colors.heading,
  fontFamily: vars.fonts.heading,
});

export const subtitle = style({
  fontSize: '1.25rem',
  marginBottom: vars.spacing.lg,
  color: vars.colors.text,
  fontFamily: vars.fonts.body,
});

export const linkGrid = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: vars.spacing.lg,
  marginTop: vars.spacing.lg,
});

export const pageLink = style({
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
  background: vars.colors.primarySoft,
  color: vars.colors.primary,
  borderRadius: vars.radius.sm,
  fontWeight: 600,
  textDecoration: 'none',
  fontSize: '1.1rem',
  selectors: {
    '&:hover, &:focus': {
      background: vars.colors.accent,
      color: vars.colors.primary,
      outline: 'none',
    },
  },
});
