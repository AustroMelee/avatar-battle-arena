// Used via dynamic registry in Narrative engine. See SYSTEM ARCHITECTURE.MD for flow.
// @docs
// @description: Enhanced narrative engine for Avatar Battle Arena. All narrative logic is registry/data-driven and plug-and-play. No hard-coded content. Extensible via data/registries only. SRP-compliant. See SYSTEM ARCHITECTURE.MD for integration points.
// @criticality: 🌀 Narrative
// @owner: AustroMelee
// @tags: narrative, context, SRP, registry, plug-and-play, extensibility
//
// This file should never reference character, move, or narrative content directly. All extensibility is via data/registries.
//
// Updated for 2025 registry-driven architecture overhaul.
// CONTEXT: Enhanced Narrative System
// RESPONSIBILITY: Main entry point for the narrative system with backward compatibility

import type { 
  NarrativeContext, 
  DamageOutcome, 
  StateAnnouncementType,
  NarrativeRequest
} from './types/NarrativeTypes';

// Type for the dynamically imported coordinator
interface NarrativeCoordinatorInstance {
  initializeBattle(player1Name: string, player2Name: string): void;
  generateMoveNarrative(request: NarrativeRequest): string[];
  generateEscalationNarrative(characterName: string, context: NarrativeContext): string;
  generateDesperationNarrative(characterName: string, context: NarrativeContext): string;
  generateVictoryNarrative(winnerName: string, loserName: string): string;
  getNarrativeVariant(type: string): string;
  checkOneOffMoment(characterName: string, context: NarrativeContext): string | null;
  getBattleStateSummary(): Record<string, unknown>;
}

/**
 * @description Enhanced narrative system with dynamic coordinator loading
 */
export class EnhancedNarrativeSystem {
  private coordinator: NarrativeCoordinatorInstance | null = null;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializationPromise = this.initializeCoordinator();
  }

  private async initializeCoordinator(): Promise<void> {
    const { NarrativeCoordinator } = await import('./core/NarrativeCoordinator') as { NarrativeCoordinator: new () => NarrativeCoordinatorInstance };
    this.coordinator = new NarrativeCoordinator();
  }

  /**
   * @description Initialize character for narrative tracking
   */
  async initializeCharacter(characterName: string): Promise<void> {
    await this.initializationPromise;
    if (this.coordinator) {
      this.coordinator.initializeBattle(characterName, 'opponent');
    }
  }

  /**
   * @description Generate narrative for a move execution (multi-part output)
   * @returns Array of narrative lines (e.g., [intention, action, reaction])
   */
  async generateMoveNarrative(
    moveName: string,
    context: NarrativeContext,
    damageOutcome: DamageOutcome
  ): Promise<string[]> {
    await this.initializationPromise;
    if (!this.coordinator) {
      throw new Error('Narrative coordinator not initialized');
    }
    const request: NarrativeRequest = {
      characterName: 'character', // Provide a dummy value to satisfy the type
      moveName,
      damageOutcome,
      context
    };
    return this.coordinator.generateMoveNarrative(request);
  }

  /**
   * @description Generate narrative (backward compatibility method, now multi-part)
   * @returns Array of narrative lines (e.g., [intention, action, reaction])
   */
  async generateNarrative(
    context: Record<string, unknown>,
    damageOutcome: DamageOutcome,
    moveName?: string
  ): Promise<string[]> {
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
    return await this.generateMoveNarrative(moveName || '', narrativeContext, damageOutcome);
  }

  /**
   * @description Generate state announcement narrative
   */
  async generateStateAnnouncement(stateType: StateAnnouncementType, turnNumber: number): Promise<string> {
    await this.initializationPromise;
    if (!this.coordinator) {
      throw new Error('Narrative coordinator not initialized');
    }
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
  async generateVictoryNarrative(characterName: string): Promise<string> {
    await this.initializationPromise;
    return this.coordinator ? this.coordinator.generateVictoryNarrative(characterName, 'opponent') : '';
  }

  /**
   * @description Generate defeat narrative with character-specific ending
   */
  async generateDefeatNarrative(): Promise<string> {
    await this.initializationPromise;
    return this.coordinator ? this.coordinator.generateVictoryNarrative('opponent', 'opponent') : '';
  }

  /**
   * @description Get current narrative state for character
   */
  async getNarrativeState(): Promise<string> {
    await this.initializationPromise;
    // const _summary = this.coordinator ? this.coordinator.getBattleStateSummary() : {};
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
    return this.coordinator ? this.coordinator.checkOneOffMoment(characterName, context) !== null : false;
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
  async resetCharacterTracking(): Promise<void> {
    // Reinitialize the coordinator to reset tracking
    this.initializationPromise = this.initializeCoordinator();
    await this.initializationPromise;
  }

  /**
   * @description Add custom narrative pool
   */
  addCustomPool(): void {
    // Stub for backward compatibility
  }

  /**
   * @description Get custom narrative pool
   */
  getCustomPool(): string[] {
    // Stub for backward compatibility
    return [];
  }

  /**
   * @description Get narrative tier for character
   */
  getNarrativeTier(): string {
    return 'early';
  }

  // Backward compatibility methods
  updateTurn(): void {
    // Stub for backward compatibility
  }

  updateHealth(): void {
    // Stub for backward compatibility
  }

  updateChi(): void {
    // Stub for backward compatibility
  }

  updateDamage(): void {
    // Stub for backward compatibility
  }

  updateCritical(): void {
    // Stub for backward compatibility
  }

  updateEscalation(): void {
    // Stub for backward compatibility
  }

  updatePatternBreak(): void {
    // Stub for backward compatibility
  }

  /**
   * @description Should announce state (backward compatibility method)
   */
  shouldAnnounceState(): boolean {
    // Always allow state announcements for now
    return true;
  }

  /**
   * @description Get state announcement (backward compatibility method)
   */
  async getStateAnnouncement(): Promise<string> {
    const turnNumber = 1; // Default turn number
    return await this.generateStateAnnouncement('escalation' as StateAnnouncementType, turnNumber);
  }

  /**
   * @description Record state announcement (backward compatibility method)
   */
  recordStateAnnouncement(): void {
    // Stub for backward compatibility
  }

  /**
   * @description Determine narrative state (backward compatibility method)
   */
  determineNarrativeState(): void {
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
      return this.generateVictoryNarrative(character);
    } else if (type === 'defeat') {
      return this.generateDefeatNarrative();
    } else {
      const lines = await this.generateMoveNarrative('', narrativeContext, 'hit');
      return lines[0];
    }
  }

  /**
   * @description Get usage stats (backward compatibility method)
   */
  async getUsageStats(): Promise<Record<string, unknown>> {
    await this.initializationPromise;
    return this.coordinator ? this.coordinator.getBattleStateSummary() : {};
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
      coordinator: this.coordinator ? this.coordinator.getBattleStateSummary() : {}
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

// Export types for external use
export type { 
  NarrativeContext, 
  DamageOutcome, 
  StateAnnouncementType 
} from './types/NarrativeTypes';