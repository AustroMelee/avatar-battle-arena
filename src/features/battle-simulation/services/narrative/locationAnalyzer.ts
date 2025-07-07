// CONTEXT: Narrative System, // FOCUS: Location Analysis
// import type { BattleCharacter } from '../../types';

/**
 * @description Calculate collateral tolerance for a player based on location and character
 * @param location - The battle location
 * @param actor - The acting character
 * @param target - The target character
 * @param player - The player name to calculate tolerance for
 * @returns Collateral tolerance value (0-1)
 */
export function calcCollateralTolerance(
  location: string,
  // actor: BattleCharacter,
  // target: BattleCharacter,
  player: string
): number {
  if (location === 'Fire Nation Capital') {
    if (player.toLowerCase() === 'azula') return 0.2;
    if (player.toLowerCase() === 'aang') return 0.7;
  }
  return 0.5;
} 