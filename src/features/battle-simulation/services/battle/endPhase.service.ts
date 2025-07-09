// Used via dynamic registry in battle engine. See SYSTEM ARCHITECTURE.MD for flow.
import type { BattleState } from '../../types';
import { declareWinner } from './state';
import { logMechanics } from '../utils/mechanicLogUtils';

const DECISIVE_WIN_HEALTH_DIFFERENCE = 60; // A 60 HP lead can trigger a decisive win

export function validateBattleEndPhase(state: BattleState): BattleState {
  const newState = { ...state };
  const [p1, p2] = newState.participants;

  // --- NEW: Decisive Win Check ---
  if (p1.currentHealth - p2.currentHealth >= DECISIVE_WIN_HEALTH_DIFFERENCE) {
    newState.isFinished = true;
    newState.winner = p1;
    newState.log.push(`${p1.name} has overwhelmed ${p2.name}. A decisive victory!`);
    const techLog1 = logMechanics({
      turn: newState.turn,
      text: `System: ${p1.name} has overwhelmed ${p2.name}. A decisive victory!`
    });
    if (techLog1) newState.battleLog.push(techLog1);
    return declareWinner(newState, p1);
  }
  if (p2.currentHealth - p1.currentHealth >= DECISIVE_WIN_HEALTH_DIFFERENCE) {
    newState.isFinished = true;
    newState.winner = p2;
    newState.log.push(`${p2.name} has overwhelmed ${p1.name}. A decisive victory!`);
    const techLog2 = logMechanics({
      turn: newState.turn,
      text: `System: ${p2.name} has overwhelmed ${p1.name}. A decisive victory!`
    });
    if (techLog2) newState.battleLog.push(techLog2);
    return declareWinner(newState, p2);
  }
  // If no decisive win, return the state unchanged
  return newState;
} 