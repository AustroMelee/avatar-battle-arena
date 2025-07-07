// CONTEXT: Escalation Application Service
// RESPONSIBILITY: Apply escalation effects to battle state

import { BattleState, BattleCharacter, BattleLogEntry } from '../../types';
import { createEventId } from '../ai/logQueries';

/**
 * @description Forces pattern-breaking escalation
 */
export function forcePatternEscalation(
  state: BattleState, 
  attacker: BattleCharacter, 
  escalationType: string,
  reason: string
): { newState: BattleState; logEntry: BattleLogEntry } {
  const newState = { ...state };
  const attackerIndex = newState.participants.findIndex(p => p.name === attacker.name);
  
  if (attackerIndex === -1) return { newState, logEntry: {} as BattleLogEntry };
  
  let narrative = '';
  let forcedState = '';
  
  switch (escalationType) {
    case 'reposition':
      narrative = `The arena constricts! ${attacker.name} is forced into close combat - no more running!`;
      forcedState = 'close_combat';
      // Disable repositioning for 3 turns for BOTH players to force engagement
      newState.participants.forEach(p => {
        p.flags = {
          ...p.flags,
          repositionDisabled: '3'
        };
      });
      break;
      
    case 'stalemate':
      narrative = `The battle has become a war of attrition! The fighters are forced into an all-out attack!`;
      forcedState = 'climax';
      // Force both participants into an aggressive state with a large damage multiplier
      newState.participants.forEach((participant) => {
        participant.flags = {
          ...participant.flags,
          forcedEscalation: 'true',
          damageMultiplier: '2.0', // MODIFIED: Increased multiplier for more decisive action
          escalationTurns: state.turn.toString(),
          escalationDuration: '3' // MODIFIED: Longer duration to ensure the stalemate breaks
        };
      });
      break;
      
    case 'damage':
      narrative = `The arena trembles with anticipation! ${attacker.name} feels the pressure mounting - it's time to escalate!`;
      forcedState = 'berserk';
      newState.participants[attackerIndex].flags = {
        ...newState.participants[attackerIndex].flags,
        forcedEscalation: 'true',
        damageMultiplier: '1.5', // Standard damage boost
        escalationTurns: state.turn.toString(),
        escalationDuration: '2'
      };
      break;
      
    case 'repetition': {
      const patternNarratives = [
        `${attacker.name} breaks free from their predictable pattern!`,
        `${attacker.name} realizes they've become predictable and shifts tactics dramatically!`,
      ];
      narrative = patternNarratives[Math.floor(Math.random() * patternNarratives.length)];
      forcedState = 'pattern_break';
      const lastMove = attacker.moveHistory?.[attacker.moveHistory.length - 1];
      if (lastMove) {
        newState.participants[attackerIndex].cooldowns = {
          ...newState.participants[attackerIndex].cooldowns,
          [lastMove]: 2
        };
      }
      break;
    }

    default:
      narrative = `${attacker.name} feels the battle intensifying!`;
      forcedState = 'escalation';
      break;
  }
  
  const logEntry: BattleLogEntry = {
    id: createEventId(),
    turn: state.turn,
    actor: attacker.name,
    type: 'ESCALATION',
    action: 'Forced Escalation',
    target: 'Battle',
    result: `Forced into ${forcedState} state due to ${reason}`,
    narrative,
    timestamp: Date.now(),
    meta: {
      escalationType,
      reason,
      forcedState
    }
  };
  
  return { newState, logEntry };
} 