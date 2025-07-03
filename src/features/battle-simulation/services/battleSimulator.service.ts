// CONTEXT: Battle Simulation Orchestrator
// RESPONSIBILITY: Orchestrate the battle simulation using modular services
import { SimulateBattleParams, BattleState, BattleLogEntry } from '../types';
import { createInitialBattleState } from './battle/state';
import { processTurn } from './battle/processTurn';

/**
 * @description Runs a full battle simulation with proper state management.
 * @param {SimulateBattleParams} params - The setup for the battle.
 * @param {(state: BattleState) => void} onTurnEnd - Callback function to report state after each turn.
 */
export function runTurnBasedSimulation(
  params: SimulateBattleParams,
  onTurnEnd: (state: BattleState) => void
): void {
  let battleState = createInitialBattleState(params);
  const maxTurns = 50; // Prevent infinite battles
  onTurnEnd(battleState);

  // Process turns with proper state management to prevent infinite loops
  const processNextTurn = () => {
    if (!battleState.isFinished && battleState.turn <= maxTurns) {
      battleState = processTurn(battleState);
      onTurnEnd(battleState);
      
      // Use setTimeout to allow React to process state updates
      setTimeout(processNextTurn, 0);
    } else if (battleState.turn > maxTurns) {
      // Force end battle if max turns reached
      battleState.isFinished = true;
      battleState.winner = battleState.participants[0]; // Default winner
      const timeoutLogEntry: BattleLogEntry = {
        turn: battleState.turn,
        actor: 'System',
        action: 'Timeout',
        result: 'Battle ended due to maximum turns reached.',
        narrative: 'The battle drags on too long and is called a draw.',
        timestamp: Date.now()
      };
      battleState.log.push(timeoutLogEntry.result);
      battleState.battleLog.push(timeoutLogEntry);
      onTurnEnd(battleState);
    }
  };

  // Start processing turns
  processNextTurn();
} 