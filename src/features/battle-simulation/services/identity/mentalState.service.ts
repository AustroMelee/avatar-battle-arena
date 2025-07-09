import { BattleCharacter, BattleLogEntry } from '../../types';
import { MentalState } from '../../types/identity.types';
import { IDENTITY_PROFILES } from '../../data/identities';

/**
 * Creates a default mental state for a character at the start of battle.
 * @returns Initial mental state with full stability and pride
 */
export function initializeMentalState(): MentalState {
  return {
    stability: 100,
    pride: 100,
    activeStates: ['focused'],
  };
}

/**
 * Updates a character's mental state based on the events of the last turn.
 * @param character The character whose state is being updated
 * @param logEntries The log entries from the last turn
 * @returns The new MentalState
 */
export function updateMentalState(
  character: BattleCharacter,
  logEntries: BattleLogEntry[]
): MentalState {
  const profile = IDENTITY_PROFILES[character.name];
  if (!profile) {
    // Fallback to default state if no profile exists
    return character.mentalState;
  }

  let { stability, pride, activeStates } = character.mentalState;

  // Process each log entry to update mental state
  logEntries.forEach((entry) => {
    // Did we get hit?
    if (entry.target === character.name && entry.damage && entry.damage > 0) {
      const prideHit = Math.min(20, entry.damage); // Bigger hits hurt pride more
      pride = Math.max(0, pride - prideHit);
      stability = Math.max(0, stability - (prideHit / 2));
    }

    // Did we miss a critical move?
    if (
      entry.actor === character.name &&
      entry.meta?.isFinisher &&
      entry.result.includes('miss')
    ) {
      pride = Math.max(0, pride - 30);
      stability = Math.max(0, stability - 25);
    }

    // Did we successfully land a powerful move?
    if (
      entry.actor === character.name &&
      entry.damage &&
      entry.damage > 15 &&
      !entry.result.includes('miss')
    ) {
      pride = Math.min(100, pride + 10);
      stability = Math.min(100, stability + 5);
    }

    // Did we get stunned or interrupted?
    if (
      entry.target === character.name &&
      (entry.meta?.interrupt)
    ) {
      pride = Math.max(0, pride - 15);
      stability = Math.max(0, stability - 20);
    }
  });

  // --- NEW: Check and set irreversible thresholds ---
  if (stability < 50 && !character.mentalThresholdsCrossed.unhinged) {
    character.mentalThresholdsCrossed.unhinged = true;
    // This could trigger a one-time narrative event!
  }
  if (stability < 20 && !character.mentalThresholdsCrossed.broken) {
    character.mentalThresholdsCrossed.broken = true;
  }
  // ---

  // Determine active state for THIS turn
  activeStates = [];
  if (character.mentalThresholdsCrossed.broken) {
    activeStates.push('broken');
  } else if (character.mentalThresholdsCrossed.unhinged) {
    activeStates.push('unhinged');
  } else if (stability < 75) {
    activeStates.push('enraged');
  } else {
    activeStates.push('focused');
  }

  return { stability, pride, activeStates };
}

/**
 * Resets a character's mental state to initial values.
 * @param character The character to reset
 * @returns The reset mental state
 */
export function resetMentalState(_character: BattleCharacter): MentalState {
  return initializeMentalState();
} 