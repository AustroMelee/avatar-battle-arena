import { IDENTITY_PROFILES } from '../../data/identities';
import type { BattleCharacter } from '../../types';
import type { Move } from '../../types/move.types';
import { MetaState } from '../ai/metaState';
import type { Location } from '@/common/types';
// import { createMechanicLogEntry } from '../../services/utils/mechanicLogUtils';

const STUCK_AI_THRESHOLD = 2; // AI will take a risk after being stuck for this many turns

/**
 * @description Gets the dynamic collateral tolerance for a character.
 * @param {BattleCharacter} character - The character.
 * @param {Location} location - The battle location.
 * @param {number} riskTolerance - The AI's current willingness to take risks.
 * @returns {number} The dynamic tolerance level (0-3).
 */
function getDynamicCollateralTolerance(character: BattleCharacter, location: Location, riskTolerance: number): number {
  const stuckMoveCounter = character.flags?.stuckMoveCounter || 0;
  // --- NEW: Deadlock Breaker ---
  if (stuckMoveCounter >= STUCK_AI_THRESHOLD) {
    console.log(`AI OVERLOAD: ${character.name} is stuck and is now ignoring collateral damage!`);
    return 100; // Return a huge number to allow any move
  }
  const profile = IDENTITY_PROFILES[character.name];
  const baseTolerance = location.collateralTolerance || 2;

  // --- AANG'S LOGIC ---
  if (profile?.moralBoundaries === 'non-lethal') {
    // Aang becomes more willing to risk collateral damage when desperate.
    const desperationBonus = riskTolerance > 1 ? 1 : 0; // If risk is high, increase tolerance.
    return Math.min(3, baseTolerance + desperationBonus);
  }

  // --- AZULA'S LOGIC (IRREVERSIBLE) ---
  if (character.name === 'Azula') {
    if (character.mentalThresholdsCrossed.broken) return 3;
    if (character.mentalThresholdsCrossed.unhinged) return 2;
  }

  return baseTolerance + riskTolerance; // General risk increase
}

/**
 * @description Gets available moves for a character, enforcing all constraints. This is the single source of truth for what an AI can do.
 * @param {BattleCharacter} character - The character.
 * @param {MetaState} meta - The current meta-state.
 * @param {Location} location - The battle location.
 * @param {number} _turn - The current turn number.
 * @param {number} riskTolerance - The AI's willingness to take risks.
 * @returns {Move[]} The available moves.
 */
export function getAvailableMoves(
  character: BattleCharacter,
  meta: MetaState,
  location: Location,
  _turn: number,
  riskTolerance: number = 0
): Move[] {
  const currentTolerance = getDynamicCollateralTolerance(character, location, riskTolerance);

  // --- REFINED: Hard-gating move availability ---
  let moves = character.abilities.filter((ability: Move) => {
    // 1. Check Chi Cost
    const chiCost = ability.chiCost || 0;
    if (character.resources.chi < chiCost) {
      return false;
    }
    // 2. Check Cooldown
    if (character.cooldowns[ability.name] && character.cooldowns[ability.name] > 0) {
      return false;
    }
    // 3. Check Uses Remaining
    const usesLeft = character.usesLeft[ability.name] ?? (ability.maxUses || Infinity);
    if (ability.maxUses && usesLeft <= 0) {
      return false;
    }
    // 4. Check Collateral Damage
    if (ability.collateralDamage && ability.collateralDamage > currentTolerance) {
      return false;
    }
    return true;
  }) as Move[];
  if (meta.stuckLoop && moves.length > 1) {
    const lastMove = character.moveHistory[character.moveHistory.length - 1];
    moves = moves.filter(m => m.name !== lastMove);
  }
  // Fallback: If ALL moves are filtered, ensure Basic Strike is an option if affordable.
  if (moves.length === 0) {
    const basicAttack = (character.abilities as Move[]).find(a => a.name === "Basic Strike");
    if (basicAttack && hasEnoughResources(basicAttack, character)) {
      return [basicAttack];
    }
  }
  return moves;
}

// ... (keep the rest of the file, like isMoveOnCooldown and hasEnoughResources)
export function isMoveOnCooldown(moveName: string, character: BattleCharacter): boolean {
  return !!(character.cooldowns[moveName] && character.cooldowns[moveName] > 0);
}
export function hasEnoughResources(ability: Move, character: BattleCharacter): boolean {
  const chiCost = ability.chiCost || 0;
  return character.resources.chi >= chiCost;
} 