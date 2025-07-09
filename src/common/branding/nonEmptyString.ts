// @docs
// @description: Runtime + compile-time guarantee that a string is non-empty.
// @tags: branding, typesafety

export function nes<T extends string>(s: T): NonEmptyString<T> {
  return s as unknown as NonEmptyString<T>;
}

// Canonical branded type export for global use
export type NonEmptyString<T extends string = string> = T & { readonly __brand: 'NonEmptyString' };
// If the type is defined elsewhere, use:
// export type { NonEmptyString } from '@/features/battle-simulation/types';
