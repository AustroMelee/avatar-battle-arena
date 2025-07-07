import { generateUniqueLogId } from '../ai/logQueries';
import type { BattleState } from '../../types';
import { declareWinner } from './state';

const DECISIVE_WIN_HEALTH_DIFFERENCE = 60; // A 60 HP lead can trigger a decisive win

export function validateBattleEndPhase(state: BattleState): BattleState {
  const newState = { ...state };
  const [p1, p2] = newState.participants;

  // --- NEW: Decisive Win Check ---
  if (p1.currentHealth - p2.currentHealth >= DECISIVE_WIN_HEALTH_DIFFERENCE) {
    newState.isFinished = true;
    newState.winner = p1;
    newState.log.push(`${p1.name} has overwhelmed ${p2.name}. A decisive victory!`);
    newState.battleLog.push({
      id: generateUniqueLogId('victory'),
      turn: newState.turn,
      actor: 'System',
      type: 'VICTORY',
      action: 'Decisive Win',
      result: `${p1.name} wins by overwhelming force!`,
      narrative: `The gap in power is too great. ${p2.name} is thoroughly defeated.`,
      timestamp: Date.now(),
      meta: { resolution: 'decisive' }
    });
    return declareWinner(newState, p1);
  }
  if (p2.currentHealth - p1.currentHealth >= DECISIVE_WIN_HEALTH_DIFFERENCE) {
    newState.isFinished = true;
    newState.winner = p2;
    newState.log.push(`${p2.name} has overwhelmed ${p1.name}. A decisive victory!`);
    newState.battleLog.push({
      id: generateUniqueLogId('victory'),
      turn: newState.turn,
      actor: 'System',
      type: 'VICTORY',
      action: 'Decisive Win',
      result: `${p2.name} wins by overwhelming force!`,
      narrative: `The gap in power is too great. ${p1.name} is thoroughly defeated.`,
      timestamp: Date.now(),
      meta: { resolution: 'decisive' }
    });
    return declareWinner(newState, p2);
  }
  // If no decisive win, return the state unchanged
  return newState;
} 