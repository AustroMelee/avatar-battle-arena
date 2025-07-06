import { BattleCharacter } from '../../types';
import { Move } from '../../types/move.types';
import { getMentalStateNarrative } from './tacticalPersonality.engine';

/**
 * Generates a move description that incorporates the character's current mental state.
 * @param character The character performing the move
 * @param move The move being performed
 * @returns A narrative description of the move with mental state context
 */
export function generateMentalStateMoveDescription(
  character: BattleCharacter,
  move: Move
): string {
  const mentalState = character.mentalState;
  const profile = character.name; // We'll use the name to determine character personality

  // Base move description
  let description = `${character.name} uses ${move.name}`;

  // Add mental state context
  if (mentalState.activeStates.includes('unhinged')) {
    if (move.baseDamage > 10) {
      description = `With wild, uncontrolled fury, ${character.name} recklessly unleashes ${move.name}!`;
    } else {
      description = `In a state of complete chaos, ${character.name} desperately attempts ${move.name}!`;
    }
  } else if (mentalState.activeStates.includes('enraged')) {
    if (move.baseDamage > 5) {
      description = `Consumed by rage, ${character.name} viciously strikes with ${move.name}!`;
    } else {
      description = `Anger fuels ${character.name}'s ${move.name}!`;
    }
  } else if (mentalState.activeStates.includes('fearful')) {
    if (move.name.includes('Shield') || move.name.includes('Glide')) {
      description = `Trembling with fear, ${character.name} desperately raises ${move.name} for protection!`;
    } else {
      description = `Fearfully, ${character.name} attempts ${move.name}!`;
    }
  } else if (mentalState.pride < 30) {
    description = `With wounded pride, ${character.name} struggles to execute ${move.name}!`;
  }

  return description;
}

/**
 * Generates a comprehensive battle state narrative incorporating mental states.
 * @param character The character to describe
 * @returns A narrative description of their current battle state
 */
export function generateBattleStateNarrative(character: BattleCharacter): string {
  const mentalState = character.mentalState;
  const healthPercentage = (character.currentHealth / 100) * 100;

  let narrative = `${character.name} `;

  // Health-based context
  if (healthPercentage < 20) {
    narrative += "is critically wounded and ";
  } else if (healthPercentage < 50) {
    narrative += "is showing signs of fatigue and ";
  } else {
    narrative += "appears to be ";
  }

  // Mental state context
  if (mentalState.activeStates.includes('unhinged')) {
    narrative += "has completely lost control of their emotions. ";
  } else if (mentalState.activeStates.includes('enraged')) {
    narrative += "is consumed by anger and frustration. ";
  } else if (mentalState.activeStates.includes('fearful')) {
    narrative += "is clearly afraid and on the defensive. ";
  } else if (mentalState.pride < 30) {
    narrative += "has had their confidence shaken. ";
  } else {
    narrative += "remains focused and determined. ";
  }

  // Add tactical context
  if (character.position === 'defensive') {
    narrative += "They are taking a defensive stance. ";
  } else if (character.position === 'aggressive') {
    narrative += "They are pressing the attack aggressively. ";
  } else if (character.isCharging) {
    narrative += "They are gathering power for a devastating attack. ";
  }

  return narrative;
}

/**
 * Generates a move outcome description based on mental state.
 * @param character The character who performed the move
 * @param move The move that was performed
 * @param wasSuccessful Whether the move was successful
 * @param damage The damage dealt (if any)
 * @returns A narrative description of the move outcome
 */
export function generateMoveOutcomeNarrative(
  character: BattleCharacter,
  move: Move,
  wasSuccessful: boolean,
  damage?: number
): string {
  const mentalState = character.mentalState;

  if (wasSuccessful) {
    if (mentalState.activeStates.includes('unhinged')) {
      return `${character.name}'s wild attack connects with devastating force!`;
    } else if (mentalState.activeStates.includes('enraged')) {
      return `${character.name}'s rage-fueled ${move.name} strikes true!`;
    } else if (mentalState.activeStates.includes('fearful')) {
      return `Despite their fear, ${character.name}'s ${move.name} finds its mark!`;
    } else {
      return `${character.name}'s ${move.name} is successful!`;
    }
  } else {
    if (mentalState.activeStates.includes('unhinged')) {
      return `${character.name}'s uncontrolled attack misses wildly!`;
    } else if (mentalState.activeStates.includes('enraged')) {
      return `${character.name}'s anger clouds their judgment, causing ${move.name} to miss!`;
    } else if (mentalState.activeStates.includes('fearful')) {
      return `${character.name}'s fear causes ${move.name} to falter!`;
    } else {
      return `${character.name}'s ${move.name} misses!`;
    }
  }
} 