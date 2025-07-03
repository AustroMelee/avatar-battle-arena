// CONTEXT: BattleSimulation, // FOCUS: StateManagement
import { useState } from 'react';
import { runTurnBasedSimulation } from '../services/battleSimulator.service';
import { BattleState, SimulateBattleParams } from '../types';

/**
 * @description A hook to manage the state and logic for running a turn-based battle simulation.
 * @returns {{
 *   battleState: BattleState | null;
 *   isSimulating: boolean;
 *   runSimulation: (params: SimulateBattleParams) => void;
 *   resetBattle: () => void;
 * }}
 */
export function useBattleSimulator() {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  /**
   * @description Executes the battle simulation and updates state via callbacks.
   * @param {SimulateBattleParams} params - The parameters for the battle.
   */
  const runSimulation = (params: SimulateBattleParams) => {
    setIsSimulating(true);
    setBattleState(null); // Clear previous results

    // The service will call setBattleState after each turn
    runTurnBasedSimulation(params, (newState) => {
      setBattleState(newState);
      if (newState.isFinished) {
        setIsSimulating(false);
      }
    });
  };

  // Add this function to allow external reset
  const resetBattle = () => setBattleState(null);

  return { battleState, isSimulating, runSimulation, resetBattle };
} 