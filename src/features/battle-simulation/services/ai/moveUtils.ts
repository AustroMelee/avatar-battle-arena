import { IDENTITY_PROFILES } from '../../data/identities';
import type { BattleCharacter } from '../../types';
import { MetaState } from '../ai/metaState';
import type { Ability, Location } from '@/common/types';
import { createMechanicLogEntry } from '../../services/utils/mechanicLogUtils';

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
 * @description Gets available moves for a character, now with risk-taking logic.
 * @param {BattleCharacter} character - The character.
 * @param {MetaState} meta - The current meta-state.
 * @param {Location} location - The battle location.
 * @param {number} turn - The current turn number.
 * @param {number} riskTolerance - The AI's willingness to take risks.
 * @returns {Ability[]} The available moves.
 */
export function getAvailableMoves(
  character: BattleCharacter,
  meta: MetaState,
  location: Location,
  turn: number,
  riskTolerance: number = 0 // NEW: Add riskTolerance parameter
): Ability[] {
  const currentTolerance = getDynamicCollateralTolerance(character, location, riskTolerance);
  let moves = character.abilities.filter(ability => {
    // ... (keep existing cooldown, uses, and resource checks)
    if (character.cooldowns[ability.name] && character.cooldowns[ability.name] > 0) return false;
    const usesLeft = character.usesLeft[ability.name] ?? (ability.maxUses || Infinity);
    if (ability.maxUses && usesLeft <= 0) return false;
    const chiCost = ability.chiCost || 0;
    if (character.resources.chi < chiCost) return false;

    // --- MODIFIED: Collateral Damage Check with Risk Tolerance ---
    if (ability.collateralDamage && ability.collateralDamage > currentTolerance) {
      // Log the standard filter reason
      console.log(`DEBUG: T${turn} ${character.name} filtered out ${ability.name} due to Collateral damage ${ability.collateralDamage} > tolerance ${currentTolerance}`);
      
      // If risk tolerance is high, we might ignore this. For now, we just log.
      // The tactical AI will use this info to decide if it should force a risky move.
      // This implementation allows the AI to *know* why a move was filtered, which is key.
      return false; 
    }
    
    return true;
  });
  
  // ... (keep all HARD GATING logic for meta state)
  if (meta.stuckLoop && moves.length > 1) {
    const lastMove = character.moveHistory[character.moveHistory.length - 1];
    moves = moves.filter(m => m.name !== lastMove);
    console.log(`HARD PATTERN BREAK: Removed ${lastMove} from available moves`);
  }
  
  // ... (and so on)

  // --- NEW: Overload path for desperation ---
  // If no moves are available and risk tolerance is high, reconsider the filtered moves.
  if (moves.length === 0 && riskTolerance > 1) {
    console.log(`AI DESPERATION: ${character.name} has no safe moves and is taking a risk!`);
    // Return all moves that are only blocked by collateral damage
    const riskyMoves = character.abilities.filter(ability => {
      const isCollateralBlocked = ability.collateralDamage && ability.collateralDamage > getDynamicCollateralTolerance(character, location, 0);
      const isOtherwiseUsable = !(character.cooldowns[ability.name] && character.cooldowns[ability.name] > 0) &&
                                hasEnoughResources(ability, character);
      return isCollateralBlocked && isOtherwiseUsable;
    });

    if (riskyMoves.length > 0) {
      // Add a log entry here for clarity in the battle log
      createMechanicLogEntry({
          turn,
          actor: character.name,
          mechanic: 'Desperate Gamble',
          effect: `Ignoring collateral damage risks to break the stalemate!`,
          reason: 'AI desperation protocol activated.',
      });
      return riskyMoves;
    }
  }

  // Fallback: If we filtered too aggressively, allow some moves back
  if (moves.length === 0) {
    console.log(`HARD GATING: Too restrictive, allowing fallback moves`);
    moves = character.abilities.filter(ability => hasEnoughResources(ability, character));
  }
  
  return moves;
}

// ... (keep the rest of the file, like isMoveOnCooldown and hasEnoughResources)
export function isMoveOnCooldown(moveName: string, character: BattleCharacter): boolean {
  return !!(character.cooldowns[moveName] && character.cooldowns[moveName] > 0);
}
export function hasEnoughResources(ability: Ability, character: BattleCharacter): boolean {
  const chiCost = ability.chiCost || 0;
  return character.resources.chi >= chiCost;
} 