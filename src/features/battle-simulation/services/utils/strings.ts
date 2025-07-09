import { NonEmptyString } from '../../types';

export function ensureNonEmpty<T extends string = string>(str: T): NonEmptyString<T> {
  if (process.env.NODE_ENV !== 'production' && str.trim().length === 0) {
    throw new Error('Empty string violates NonEmptyString contract.');
  }
  return str as NonEmptyString<T>;
} 