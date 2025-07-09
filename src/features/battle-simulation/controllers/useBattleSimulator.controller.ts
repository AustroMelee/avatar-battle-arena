// CONTEXT: Battle Simulator Controller Hook
// RESPONSIBILITY: Manage battle simulation state and provide battle data to components

import { useState, useRef, useCallback } from 'react';
import { BattleState, BattleLogEntry } from '../types';
import { simulateBattle } from '../services/battleSimulator.service';
import { SimulateBattleParams } from '../types';
import type { BattleMetrics, CharacterMetrics, AIMetrics } from '../services/battle/analytics';

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

    try {
      const result = await simulateBattle(params);
      
      setBattleState(result.finalState);
      setBattleLog(result.battleLog);
      setAnalytics(result.analytics);
      
      // Extract narratives from battle log
      const newNarratives = result.battleLog
        .filter((entry: BattleLogEntry) => entry.type === 'narrative' && !displayedNarrativeIds.current.has(entry.id))
        .map((entry: BattleLogEntry) => ({
          id: entry.id,
          text: entry.narrative || entry.result,
          turn: entry.turn
        }));

      newNarratives.forEach((n: { id: string; text: string | string[]; turn: number }) => displayedNarrativeIds.current.add(n.id));
      setNarratives(prev => [...prev, ...newNarratives.map((n: { id: string; text: string | string[]; turn: number }) => typeof n.text === 'string' ? n.text : n.text.join(' '))]);
      
    } catch (error) {
      console.error('Battle simulation failed:', error);
    } finally {
      setIsRunning(false);
    }
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