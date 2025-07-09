// CONTEXT: Battle Simulator Controller Hook
// RESPONSIBILITY: Manage battle simulation state and provide battle data to components

import { useState, useRef, useCallback } from 'react';
import { BattleState, BattleLogEntry } from '../types';
import { SimulateBattleParams } from '../types';
import type { BattleMetrics, CharacterMetrics, AIMetrics } from '../services/battle/analytics';
import { createInitialBattleState, cloneBattleState } from '../services/battle/state';
import { processTurn } from '../services/battle/processTurn';

/**
 * @description Custom hook for managing battle simulation state.
 * @returns {Object} Battle simulation state and control functions.
 */
export function useBattleSimulator() {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [narratives, setNarratives] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<{
    battleMetrics: BattleMetrics;
    characterMetrics: CharacterMetrics[];
    aiMetrics: AIMetrics;
  } | null>(null);
  const displayedNarrativeIds = useRef<Set<string>>(new Set());

  /**
   * @description Starts a new battle simulation.
   * @param {SimulateBattleParams} params - The battle parameters.
   */
  const startBattle = useCallback(async (params: SimulateBattleParams) => {
    setIsRunning(true);
    setBattleState(null);
    setBattleLog([]);
    setNarratives([]);
    setAnalytics(null);
    displayedNarrativeIds.current.clear();

    let currentState = createInitialBattleState(params);
    const maxTurns = 50;
    let turn = 0;

    while (!currentState.isFinished && turn < maxTurns) {
      // Process a chunk of 3 turns per tick
      for (let j = 0; j < 3 && !currentState.isFinished && turn < maxTurns; j++, turn++) {
        currentState = await processTurn(currentState);
        setBattleState(cloneBattleState(currentState));
        setBattleLog([...currentState.battleLog]);
        // Optionally update narratives/analytics here
      }
      // Yield to the browser/UI
      await new Promise(r => setTimeout(r, 16));
    }

    // Final state update
    setBattleState(cloneBattleState(currentState));
    setBattleLog([...currentState.battleLog]);
    // Optionally update narratives/analytics here
    setIsRunning(false);
  }, []);

  /**
   * @description Resets the battle simulation state.
   */
  const resetBattle = useCallback(() => {
    setBattleState(null);
    setBattleLog([]);
    setNarratives([]);
    setAnalytics(null);
    setIsRunning(false);
    displayedNarrativeIds.current.clear();
  }, []);

  return {
    battleState,
    isRunning,
    battleLog,
    narratives,
    analytics,
    startBattle,
    resetBattle
  };
} 