import { IdentityProfile } from '../types/identity.types';

/**
 * Aang's identity profile - Balance, pacifism, and survival instincts
 */
export const AANG_IDENTITY: IdentityProfile = {
  characterName: 'Aang',
  coreValues: ['balance', 'pacifism', 'survival'],
  tacticalTendencies: ['prefers_evasion', 'escalates_under_pressure'],
  moralBoundaries: 'non-lethal',
  prideTolerance: 80, // High tolerance; he's humble and doesn't get offended easily
  retreatPenalty: 0,  // No penalty for being defensive; it's his style
};

/**
 * Azula's identity profile - Control, dominance, and lethal precision
 */
export const AZULA_IDENTITY: IdentityProfile = {
  characterName: 'Azula',
  coreValues: ['control', 'dominance'],
  tacticalTendencies: ['prefers_precision', 'avoids_retreat'],
  moralBoundaries: 'lethal',
  prideTolerance: 25, // Very low tolerance; her pride is easily wounded
  retreatPenalty: 15, // High penalty; she sees retreating as a sign of weakness
};

/**
 * Registry of all character identity profiles
 */
export const IDENTITY_PROFILES: Record<string, IdentityProfile> = {
  Aang: AANG_IDENTITY,
  Azula: AZULA_IDENTITY,
};

/**
 * Default opponent perception values for new characters
 */
export const DEFAULT_OPPONENT_PERCEPTION = {
  aggressionLevel: 50,
  predictability: 50,
  respect: 50,
} as const; 