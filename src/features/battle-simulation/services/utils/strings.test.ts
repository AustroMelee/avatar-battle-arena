/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { ensureNonEmpty } from '../utils/strings';

describe('ensureNonEmpty', () => {
  it('returns the string if non-empty', () => {
    expect(ensureNonEmpty('hello')).toBe('hello');
  });

  it('throws on empty string in dev/test', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    expect(() => ensureNonEmpty('')).toThrow();
    process.env.NODE_ENV = originalEnv;
  });

  it('does not throw on empty string in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    expect(() => ensureNonEmpty('')).not.toThrow();
    process.env.NODE_ENV = originalEnv;
  });
}); 