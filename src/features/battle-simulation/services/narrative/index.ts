// CONTEXT: Narrative System, // FOCUS: Main Service API
export * from './types';
export * from './contextBuilder';
export * from './characterHooks';
export * from './narratorHooks';
export * from './narrativeEngine';

import type { BattleCharacter, BattleLogEntry } from '../../types';
import type { Ability } from '@/common/types';
import type { BattleContext, TriggeredNarrative, NarrativeSystemConfig } from './types';
import { buildBattleContext } from './contextBuilder';
import { 
  evaluateNarrativeHooks, 
  updateUsedHooks, 
  createUsedHooksTracker,
  createNarrativeConfig,
  debugNarrativeEvaluation
} from './narrativeEngine';

/**
 * @description Main narrative service for battle integration
 */
export class NarrativeService {
  private config: NarrativeSystemConfig;
  private usedHooks: ReturnType<typeof createUsedHooksTracker>;
  private lastSpoken: Record<string, string> = {};
  private phaseFlags: Record<string, boolean> = {};

  constructor(config?: Partial<NarrativeSystemConfig>) {
    this.config = createNarrativeConfig(config);
    this.usedHooks = createUsedHooksTracker();
    this.lastSpoken = {};
    this.phaseFlags = {};
  }

  /**
   * @description Resets the service for a new battle
   */
  reset(): void {
    this.usedHooks = createUsedHooksTracker();
    this.lastSpoken = {};
    this.phaseFlags = {};
  }

  /**
   * @description Generates narrative hooks for a battle event
   * @param actor - The acting character
   * @param target - The target character
   * @param move - The move being used
   * @param turnIndex - Current turn number
   * @param battleLog - Full battle log
   * @param location - Battle location
   * @param isCritical - Whether this is a critical hit
   * @param isDesperation - Whether this is a desperation move
   * @param damage - Damage dealt (if any)
   * @returns Array of triggered narratives
   */
  generateNarratives(
    actor: BattleCharacter,
    target: BattleCharacter,
    move: Ability,
    turnIndex: number,
    battleLog: BattleLogEntry[],
    location: string,
    isCritical?: boolean,
    isDesperation?: boolean,
    damage?: number
  ): TriggeredNarrative[] {
    // Build battle context
    const ctx = buildBattleContext(
      actor,
      target,
      move,
      turnIndex,
      battleLog,
      location,
      isCritical,
      isDesperation,
      damage
    );

    // Evaluate narrative hooks (strict deduplication)
    const narratives = evaluateNarrativeHooks(ctx, this.config, this.usedHooks, this.lastSpoken, this.phaseFlags);

    // Update used hooks tracker and lastSpoken
    this.usedHooks = updateUsedHooks(narratives, this.usedHooks);
    narratives.forEach(narrative => {
      this.lastSpoken[narrative.speaker] = `${narrative.speaker}_${narrative.text}`;
    });

    // Debug logging
    debugNarrativeEvaluation(ctx, narratives, this.config);

    return narratives;
  }

  /**
   * @description Updates the narrative system configuration
   * @param newConfig - New configuration overrides
   */
  updateConfig(newConfig: Partial<NarrativeSystemConfig>): void {
    this.config = createNarrativeConfig(newConfig);
  }

  /**
   * @description Gets the current configuration
   * @returns Current narrative system configuration
   */
  getConfig(): NarrativeSystemConfig {
    return { ...this.config };
  }

  /**
   * @description Enables or disables the narrative system
   * @param enabled - Whether to enable the system
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * @description Checks if the narrative system is enabled
   * @returns True if enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

/**
 * @description Creates a new narrative service instance
 * @param config - Optional configuration overrides
 * @returns New narrative service
 */
export function createNarrativeService(config?: Partial<NarrativeSystemConfig>): NarrativeService {
  return new NarrativeService(config);
}

/**
 * @description Default narrative service instance
 */
export const defaultNarrativeService = createNarrativeService(); 