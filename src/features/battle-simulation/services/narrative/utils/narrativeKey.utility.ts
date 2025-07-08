// Used via dynamic registry in Narrative engine. See SYSTEM ARCHITECTURE.MD for flow.
// @file narrativeKey.utility.ts
// @description Provides a utility function to convert human-readable move names
// into the PascalCase format used as keys for narrative and mechanic lookups.

import { CombatMechanic } from '../narrative.types';

/**
 * Converts a human-readable move name into a PascalCase CombatMechanic key.
 * This is the single source of truth for mapping move names to mechanic IDs.
 * Example: "Fire Whip" -> "FireWhip"
 *          "charged air tornado" -> "ChargedAirTornado"
 * @param moveName The name of the move.
 * @returns A string formatted as a CombatMechanic key.
 */
export function moveNameToMechanicKey(moveName: string): CombatMechanic {
  if (!moveName || typeof moveName !== 'string') {
    return 'DefaultMechanic' as any; // Fallback for safety
  }

  const mechanicKey = moveName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  // The 'as any' cast is a pragmatic choice. We assume any move name
  // can be a valid mechanic key. A more advanced system might validate
  // this against the CombatMechanic type, but this is robust for now.
  return mechanicKey as any;
} 