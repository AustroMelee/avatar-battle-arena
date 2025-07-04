// CONTEXT: Enhanced Narrative System
// RESPONSIBILITY: Main entry point for the narrative system with backward compatibility

import { NarrativeOrchestrator } from './core/NarrativeOrchestrator';
import type { 
  NarrativeContext, 
  DamageOutcome, 
  StateAnnouncementType 
} from './types/NarrativeTypes';

/**
 * @description Enhanced narrative system with modular architecture
 */
class EnhancedNarrativeSystem {
  private orchestrator: NarrativeOrchestrator;

  constructor() {
    this.orchestrator = new NarrativeOrchestrator();
  }

  /**
   * @description Initialize character for narrative tracking
   */
  initializeCharacter(characterName: string): void {
    this.orchestrator.initializeCharacter(characterName);
  }

  /**
   * @description Generate narrative for a move execution
   */
  generateMoveNarrative(
    characterName: string,
    moveName: string,
    context: NarrativeContext,
    damageOutcome: DamageOutcome
  ): string {
    return this.orchestrator.generateMoveNarrative(characterName, moveName, context, damageOutcome);
  }

  /**
   * @description Generate state announcement with anti-repetition
   */
  generateStateAnnouncement(stateType: StateAnnouncementType, turnNumber: number): string {
    return this.orchestrator.generateStateAnnouncement(stateType, turnNumber);
  }

  /**
   * @description Generate victory narrative with character-specific ending
   */
  generateVictoryNarrative(characterName: string, turnNumber: number): string {
    return this.orchestrator.generateVictoryNarrative(characterName, turnNumber);
  }

  /**
   * @description Generate defeat narrative with character-specific ending
   */
  generateDefeatNarrative(characterName: string, turnNumber: number): string {
    return this.orchestrator.generateDefeatNarrative(characterName, turnNumber);
  }

  /**
   * @description Get current narrative state for character
   */
  getNarrativeState(characterName: string): string {
    return this.orchestrator.getNarrativeState(characterName);
  }

  /**
   * @description Check if character has available one-off moments
   */
  hasAvailableMoments(characterName: string): boolean {
    return this.orchestrator.hasAvailableMoments(characterName);
  }

  /**
   * @description Reset all tracking for new battle
   */
  resetForNewBattle(): void {
    this.orchestrator.resetForNewBattle();
  }

  /**
   * @description Reset tracking for specific character
   */
  resetCharacterTracking(characterName: string): void {
    this.orchestrator.resetCharacterTracking(characterName);
  }

  /**
   * @description Add custom narrative pool
   */
  addCustomPool(poolName: string, lines: string[]): void {
    this.orchestrator.addCustomPool(poolName, lines);
  }

  /**
   * @description Get custom narrative pool
   */
  getCustomPool(poolName: string): string[] {
    return this.orchestrator.getCustomPool(poolName);
  }

  /**
   * @description Get narrative tier for character
   */
  getNarrativeTier(characterName: string, turnNumber: number, healthPercentage: number): string {
    return this.orchestrator.getNarrativeTier(characterName, turnNumber, healthPercentage);
  }

  // Backward compatibility methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateTurn(characterName: string, turnNumber: number): void {
    // Stub for backward compatibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHealth(characterName: string, health: number, maxHealth: number): void {
    // Stub for backward compatibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateChi(characterName: string, chi: number): void {
    // Stub for backward compatibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateDamage(characterName: string, damage: number): void {
    // Stub for backward compatibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateCritical(characterName: string, isCritical: boolean): void {
    // Stub for backward compatibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateEscalation(characterName: string, isEscalation: boolean): void {
    // Stub for backward compatibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updatePatternBreak(characterName: string, isPatternBreak: boolean): void {
    // Stub for backward compatibility
  }
}

// Export singleton instance
export const enhancedNarrativeSystem = new EnhancedNarrativeSystem();

// Export types for external use
export type { 
  NarrativeContext, 
  DamageOutcome, 
  StateAnnouncementType 
} from './types/NarrativeTypes';