import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../styles/tokens.css';

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

export const spinner = style({
  width: '2rem',
  height: '2rem',
  border: `4px solid ${vars.color.border}`,
  borderTop: `4px solid ${vars.color.accent}`,
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
  margin: '2rem auto',
  display: 'block',
});
