import { BattleCharacter, BattleState, BattleLogEntry } from '../../types';
import { Character } from '@/common/types';
import { ALL_BEHAVIORAL_TRAITS } from '../../../character-selection/data/traits';
import { ActiveFlag } from '../../types/behavioral.types';
import { generateUniqueLogId } from '../ai/logQueries';
import { createMechanicLogEntry } from '../utils/mechanicLogUtils';

/**
 * Helper function to tick down flag durations and remove expired ones.
 */
function tickDownFlags(character: BattleCharacter): BattleLogEntry[] {
  const expiredLogs: BattleLogEntry[] = [];
  const expiredFlags: string[] = [];
  
  // Ensure activeFlags is a Map
  if (!(character.activeFlags instanceof Map)) {
    character.activeFlags = new Map(Object.entries(character.activeFlags || {}));
  }
  
  for (const [flag, data] of character.activeFlags.entries()) {
    data.duration--;
    if (data.duration <= 0) {
      expiredFlags.push(flag);
      expiredLogs.push({
        id: generateUniqueLogId('flag_expired'),
        turn: 0, // Will be set by caller
        actor: character.name,
        type: 'INFO',
        action: 'flag_expired',
        result: `${character.name} is no longer ${flag}.`,
        timestamp: Date.now()
      });
    }
  }
  
  // Remove expired flags
  expiredFlags.forEach(flag => character.activeFlags.delete(flag));
  
  return expiredLogs;
}

/**
 * Helper function for edge-case removal of flags based on state changes.
 */
function clearFlagsOnStateChange(character: BattleCharacter, state: BattleState): BattleLogEntry[] {
  const clearedLogs: BattleLogEntry[] = [];
  const lastTurnLogs = state.battleLog.filter(l => l.turn === state.turn - 1);
  const damageTaken = lastTurnLogs.find(l => l.target === character.name)?.damage ?? 0;

  // Ensure activeFlags is a Map
  if (!(character.activeFlags instanceof Map)) {
    character.activeFlags = new Map(Object.entries(character.activeFlags || {}));
  }

  // Overconfidence breaks when taking significant damage
  if (character.activeFlags.has('overconfidenceActive') && damageTaken > 20) {
    character.activeFlags.delete('overconfidenceActive');
    clearedLogs.push({
      id: generateUniqueLogId('overconfidence_broken'),
      turn: state.turn,
      actor: character.name,
      type: 'INFO',
      action: 'overconfidence_broken',
      result: `A sharp blow snaps ${character.name} out of their arrogance!`,
      timestamp: Date.now()
    });
  }

  // Manipulation breaks when stunned
  if (character.activeFlags.has('isManipulated') && character.flags.stunned) {
    character.activeFlags.delete('isManipulated');
    clearedLogs.push({
      id: generateUniqueLogId('manipulation_broken'),
      turn: state.turn,
      actor: character.name,
      type: 'INFO',
      action: 'manipulation_broken',
      result: `The jarring blow snaps ${character.name} out of their confusion!`,
      timestamp: Date.now()
    });
  }
  
  return clearedLogs;
}

/**
 * Processes the entire behavioral system for a character's turn.
 * This is the main function to integrate into the battle loop.
 */
export function processBehavioralSystemForTurn(
  self: BattleCharacter,
  opponent: BattleCharacter,
  state: BattleState
): { updatedSelf: BattleCharacter; updatedOpponent: BattleCharacter; logEntries: BattleLogEntry[] } {
  // 1. Tick down and clear any existing flags on both characters
  const selfExpiredLogs = tickDownFlags(self);
  const opponentExpiredLogs = tickDownFlags(opponent);
  const selfClearedLogs = clearFlagsOnStateChange(self, state);
  const opponentClearedLogs = clearFlagsOnStateChange(opponent, state);
  
  // Set the correct turn numbers for expired logs
  selfExpiredLogs.forEach(log => log.turn = state.turn);
  opponentExpiredLogs.forEach(log => log.turn = state.turn);
  
  // 2. Attempt to trigger a new behavioral trait for the active character (self)
  let behavioralLogEntry: BattleLogEntry | null = null;
  for (const traitInstance of self.behavioralTraits) {
    const trait = ALL_BEHAVIORAL_TRAITS[traitInstance.traitId];
    if (!trait) continue;

    const isOnCooldown = (state.turn - traitInstance.lastTriggeredTurn) <= trait.cooldown;
    if (isOnCooldown) continue;
    
    const context = { self, opponent, state, traitInstance };
    if (trait.isActive(context)) {
      const result = trait.onTrigger(context);
      
      // Create main log entry
      behavioralLogEntry = {
        id: generateUniqueLogId('behavioral'),
        turn: state.turn,
        actor: self.name,
        type: 'NARRATIVE',
        action: trait.id,
        result: result.log,
        timestamp: Date.now()
      };
      
      traitInstance.lastTriggeredTurn = state.turn;
      
      // Apply mechanical effects
      result.effects.forEach((effect) => {
        const target = effect.target === 'self' ? self : opponent;
        if (effect.type === 'apply_flag' && effect.flag && effect.duration) {
          // Ensure target's activeFlags is a Map
          if (!(target.activeFlags instanceof Map)) {
            target.activeFlags = new Map(Object.entries(target.activeFlags || {}));
          }
          target.activeFlags.set(effect.flag, { 
            duration: effect.duration, 
            source: trait.name,
            appliedTurn: state.turn
          });
          const logEntry = createMechanicLogEntry({
            turn: state.turn,
            actor: self.name,
            mechanic: 'Trait Effect',
            effect: 'Flag Applied',
            reason: 'traitEffect',
            meta: {
              flag: effect.flag,
              target: effect.target,
              duration: effect.duration
            }
          });
          // TODO: Add logEntry to log system
        }
      });
      
      break; // Character performs only one behavioral action per turn
    }
  }

  const allLogEntries: BattleLogEntry[] = [
    ...selfExpiredLogs, 
    ...opponentExpiredLogs, 
    ...selfClearedLogs, 
    ...opponentClearedLogs,
    ...(behavioralLogEntry ? [behavioralLogEntry] : [])
  ];

  return { updatedSelf: self, updatedOpponent: opponent, logEntries: allLogEntries };
}

/**
 * Initialize behavioral system for a character
 */
export function initializeBehavioralSystem(character: Character): BattleCharacter['behavioralTraits'] {
  return character.behavioralTraits?.map(trait => ({
    traitId: trait.traitId,
    lastTriggeredTurn: -99 // Start with long cooldown
  })) || [];
}

/**
 * Initialize active flags for a character
 */
export function initializeActiveFlags(): Map<string, ActiveFlag> {
  return new Map();
} 