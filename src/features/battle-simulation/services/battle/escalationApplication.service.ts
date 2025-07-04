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
    case 'damage':
      narrative = `The arena trembles with anticipation! ${attacker.name} feels the pressure mounting - it's time to escalate!`;
      forcedState = 'berserk';
      // Force aggressive positioning and damage boost
      newState.participants[attackerIndex].position = 'aggressive';
      newState.participants[attackerIndex].flags = {
        ...newState.participants[attackerIndex].flags,
        forcedEscalation: 'true',
        damageMultiplier: '2.0'
      };
      break;
      
    case 'repetition': {
      // Add variety to pattern breaking narratives
      const patternNarratives = [
        `The crowd grows restless! ${attacker.name} breaks free from their predictable pattern!`,
        `${attacker.name} realizes they've become predictable and shifts tactics dramatically!`,
        `The repetitive rhythm shatters as ${attacker.name} adapts their fighting style!`,
        `${attacker.name} snaps out of their pattern, their movements becoming unpredictable!`,
        `The predictable exchanges end as ${attacker.name} changes their approach completely!`,
        `${attacker.name} recognizes the pattern and deliberately breaks free from it!`,
        `The battle tempo shifts as ${attacker.name} abandons their predictable attacks!`,
        `${attacker.name} feels the pattern and consciously chooses to disrupt it!`
      ];
      narrative = patternNarratives[Math.floor(Math.random() * patternNarratives.length)];
      forcedState = 'pattern_break';
      // Disable the repetitive move temporarily
      const lastMove = attacker.moveHistory?.[attacker.moveHistory.length - 1];
      if (lastMove) {
        newState.participants[attackerIndex].cooldowns = {
          ...newState.participants[attackerIndex].cooldowns,
          [lastMove]: 3 // Disable for 3 turns
        };
      }
      // Reset pattern tracking to prevent immediate re-triggering
      newState.participants[attackerIndex].moveHistory = [];
      newState.participants[attackerIndex].lastMove = '';
      break;
    }
      
    case 'reposition':
      narrative = `The arena constricts! ${attacker.name} is forced into close combat - no more running!`;
      forcedState = 'close_combat';
      // Disable repositioning for 3 turns
      newState.participants[attackerIndex].flags = {
        ...newState.participants[attackerIndex].flags,
        repositionDisabled: '3'
      };
      break;
      
    case 'stalemate':
      narrative = `The battle reaches a breaking point! Both fighters are forced to escalate or face defeat!`;
      forcedState = 'climax';
      // Force both participants into aggressive states
      newState.participants.forEach((participant, index) => {
        participant.position = 'aggressive';
        participant.flags = {
          ...participant.flags,
          forcedEscalation: 'true',
          damageMultiplier: '1.5'
        };
      });
      break;
      
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
    result: `Forced into ${forcedState} state`,
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