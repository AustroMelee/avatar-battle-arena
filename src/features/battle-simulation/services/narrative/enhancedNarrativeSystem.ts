// CONTEXT: Enhanced Narrative System
// RESPONSIBILITY: Main entry point for the narrative system with backward compatibility

import { NarrativeCoordinator } from './core/NarrativeCoordinator';
import type { 
  NarrativeContext, 
  DamageOutcome, 
  StateAnnouncementType,
  NarrativeRequest
} from './types/NarrativeTypes';

/**
 * @description Enhanced narrative system with dynamic coordinator loading
 */
export class EnhancedNarrativeSystem {
  private coordinator: unknown; // Will be NarrativeCoordinator after dynamic import
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializationPromise = this.initializeCoordinator();
  }

  private async initializeCoordinator(): Promise<void> {
    const { NarrativeCoordinator } = await import('./core/NarrativeCoordinator');
    this.coordinator = new NarrativeCoordinator();
  }

  /**
   * @description Initialize character for narrative tracking
   */
  async initializeCharacter(characterName: string): Promise<void> {
    await this.initializationPromise;
    (this.coordinator as NarrativeCoordinator).initializeBattle(characterName, 'opponent');
  }

  /**
   * @description Generate narrative for a move execution
   */
  async generateMoveNarrative(
    characterName: string,
    moveName: string,
    context: NarrativeContext,
    damageOutcome: DamageOutcome
  ): Promise<string> {
    await this.initializationPromise;
    const request: NarrativeRequest = {
      characterName,
      moveName,
      damageOutcome,
      context
    };
    return (this.coordinator as NarrativeCoordinator).generateMoveNarrative(request);
  }

  /**
   * @description Generate narrative (backward compatibility method)
   */
  async generateNarrative(
    characterName: string,
    context: Record<string, unknown>,
    damageOutcome: DamageOutcome,
    moveName?: string
  ): Promise<string> {
    // Convert legacy context to new format
    const narrativeContext: NarrativeContext = {
      turnNumber: (context.turnNumber as number) || 0,
      health: ((context.maxHealth as number) - (context.damage as number)) || 100,
      maxHealth: (context.maxHealth as number) || 100,
      chi: (context.chi as number) || 10,
      isCritical: (context.isCritical as boolean) || false,
      damage: (context.damage as number) || 0,
      characterState: (context.characterState as string) || 'fresh',
      isEscalation: (context.isEscalation as boolean) || false,
      isPatternBreak: (context.isPatternBreak as boolean) || false
    };

    return await this.generateMoveNarrative(characterName, moveName || '', narrativeContext, damageOutcome);
  }

  /**
   * @description Generate state announcement narrative
   */
  async generateStateAnnouncement(stateType: StateAnnouncementType, turnNumber: number): Promise<string> {
    await this.initializationPromise;
    const context: NarrativeContext = {
      turnNumber,
      health: 100,
      maxHealth: 100,
      chi: 10,
      isCritical: false,
      damage: 0,
      characterState: 'fresh',
      isEscalation: false,
      isPatternBreak: false
    };

    if (stateType === 'escalation') {
      return this.coordinator.generateEscalationNarrative('character', context);
    } else if (stateType === 'desperation') {
      return this.coordinator.generateDesperationNarrative('character', context);
    }
    
    return this.coordinator.getNarrativeVariant(stateType);
  }

  /**
   * @description Generate victory narrative with character-specific ending
   */
  async generateVictoryNarrative(characterName: string, turnNumber: number): Promise<string> {
    await this.initializationPromise;
    return this.coordinator.generateVictoryNarrative(characterName, 'opponent');
  }

  /**
   * @description Generate defeat narrative with character-specific ending
   */
  async generateDefeatNarrative(characterName: string, turnNumber: number): Promise<string> {
    await this.initializationPromise;
    return this.coordinator.generateVictoryNarrative('opponent', characterName);
  }

  /**
   * @description Get current narrative state for character
   */
  async getNarrativeState(characterName: string): Promise<string> {
    await this.initializationPromise;
    const summary = this.coordinator.getBattleStateSummary();
    return 'normal'; // Default state
  }

  /**
   * @description Check if character has available one-off moments
   */
  async hasAvailableMoments(characterName: string): Promise<boolean> {
    await this.initializationPromise;
    const context: NarrativeContext = {
      turnNumber: 1,
      health: 100,
      maxHealth: 100,
      chi: 10,
      isCritical: false,
      damage: 0,
      characterState: 'fresh',
      isEscalation: false,
      isPatternBreak: false
    };
    return this.coordinator.checkOneOffMoment(characterName, context) !== null;
  }

  /**
   * @description Reset all tracking for new battle
   */
  async resetForNewBattle(): Promise<void> {
    this.initializationPromise = this.initializeCoordinator();
    await this.initializationPromise;
  }

  /**
   * @description Reset tracking for specific character
   */
  async resetCharacterTracking(characterName: string): Promise<void> {
    // Reinitialize the coordinator to reset tracking
    this.initializationPromise = this.initializeCoordinator();
    await this.initializationPromise;
  }

  /**
   * @description Add custom narrative pool
   */
  addCustomPool(poolName: string, lines: string[]): void {
    // Stub for backward compatibility
  }

  /**
   * @description Get custom narrative pool
   */
  getCustomPool(poolName: string): string[] {
    // Stub for backward compatibility
    return [];
  }

  /**
   * @description Get narrative tier for character
   */
  getNarrativeTier(characterName: string, turnNumber: number, healthPercentage: number): string {
    if (healthPercentage <= 25) return 'exhausted';
    if (healthPercentage <= 50) return 'late';
    if (turnNumber >= 10) return 'mid';
    return 'early';
  }

  // Backward compatibility methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateTurn(_characterName: string, _turnNumber: number): void {
    // Stub for backward compatibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHealth(_characterName: string, _health: number, _maxHealth: number): void {
    // Stub for backward compatibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateChi(_characterName: string, _chi: number): void {
    // Stub for backward compatibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateDamage(_characterName: string, _damage: number): void {
    // Stub for backward compatibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateCritical(_characterName: string, _isCritical: boolean): void {
    // Stub for backward compatibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateEscalation(_characterName: string, _isEscalation: boolean): void {
    // Stub for backward compatibility
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updatePatternBreak(_characterName: string, _isPatternBreak: boolean): void {
    // Stub for backward compatibility
  }

  /**
   * @description Should announce state (backward compatibility method)
   */
  shouldAnnounceState(stateType: string): boolean {
    // Always allow state announcements for now
    return true;
  }

  /**
   * @description Get state announcement (backward compatibility method)
   */
  async getStateAnnouncement(stateType: string, character?: string): Promise<string> {
    const turnNumber = 1; // Default turn number
    return await this.generateStateAnnouncement(stateType as StateAnnouncementType, turnNumber);
  }

  /**
   * @description Record state announcement (backward compatibility method)
   */
  recordStateAnnouncement(stateType: string): void {
    // Stub for backward compatibility
  }

  /**
   * @description Determine narrative state (backward compatibility method)
   */
  determineNarrativeState(character: string, context: Record<string, unknown>): void {
    // Stub for backward compatibility
  }

  /**
   * @description Get narrative (backward compatibility method)
   */
  async getNarrative(character: string, type: string, context: Record<string, unknown>): Promise<string> {
    const narrativeContext: NarrativeContext = {
      turnNumber: (context.turnNumber as number) || 0,
      health: (context.health as number) || 100,
      maxHealth: (context.maxHealth as number) || 100,
      chi: (context.chi as number) || 10,
      isCritical: (context.isCritical as boolean) || false,
      damage: (context.damage as number) || 0,
      characterState: (context.characterState as string) || 'fresh',
      isEscalation: (context.isEscalation as boolean) || false,
      isPatternBreak: (context.isPatternBreak as boolean) || false
    };

    if (type === 'victory') {
      return this.generateVictoryNarrative(character, narrativeContext.turnNumber);
    } else if (type === 'defeat') {
      return this.generateDefeatNarrative(character, narrativeContext.turnNumber);
    } else {
      return await this.generateMoveNarrative(character, '', narrativeContext, 'hit');
    }
  }

  /**
   * @description Get usage stats (backward compatibility method)
   */
  async getUsageStats(): Promise<Record<string, unknown>> {
    await this.initializationPromise;
    return this.coordinator.getBattleStateSummary();
  }

  /**
   * @description Reset all narrative systems
   */
  async reset(): Promise<void> {
    this.initializationPromise = this.initializeCoordinator();
    await this.initializationPromise;
  }

  /**
   * @description Get the current state of all narrative systems
   */
  async getState(): Promise<Record<string, unknown>> {
    await this.initializationPromise;
    return {
      coordinator: this.coordinator.getBattleStateSummary()
    };
  }
}

// Lazy initialization to break circular dependencies
let enhancedNarrativeSystemInstance: EnhancedNarrativeSystem | null = null;

/**
 * @description Gets the singleton instance of the EnhancedNarrativeSystem, creating it if it doesn't exist.
 * @returns {EnhancedNarrativeSystem} The singleton instance.
 */
export function getEnhancedNarrativeSystem(): EnhancedNarrativeSystem {
  if (!enhancedNarrativeSystemInstance) {
    enhancedNarrativeSystemInstance = new EnhancedNarrativeSystem();
  }
  return enhancedNarrativeSystemInstance;
}

// Export class for testing
export { EnhancedNarrativeSystem };

// Export types for external use
export type { 
  NarrativeContext, 
  DamageOutcome, 
  StateAnnouncementType 
} from './types/NarrativeTypes';