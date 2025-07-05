// CONTEXT: Narrative System
// FOCUS: Main narrative service with enhanced systems integration

import type { BattleCharacter, BattleLogEntry, BattleState } from '../../types';
import type { TriggeredNarrative } from './types';
import { BattleEndHandler } from './battleEndHandler';
import { StateDrivenNarrativePool } from './stateDrivenNarrativePool';
import { getContextualMoveDescription } from './contextualNarrativeMapper';
import { StateAnnouncementManager } from './stateAnnouncementManager';
import { getEnhancedNarrativeSystem, EnhancedNarrativeSystem } from './enhancedNarrativeSystem';

// Core engine and orchestration
export { evaluateNarrativeHooks } from './narrativeEngine';
export type { UsedHooksTracker } from './narrativeEngine';

// Configuration management
export { createNarrativeConfig, getDefaultConfig } from './configManager';

// Utility management
export { createUsedHooksTracker, updateUsedHooks, debugNarrativeEvaluation } from './utilityManager';

// Context building
export { buildBattleContext } from './contextBuilder';

// Mechanical state extraction
export { extractMechanicalState, isComebackSequence, isRallySequence } from './mechanicalStateExtractor';

// Battle phase analysis
export { determineBattlePhase, isFirstBlood } from './battlePhaseAnalyzer';

// Narrative tone analysis
export { determineNarrativeTone, determineNarrativeIntensity, determineNarrativeFocus } from './narrativeToneAnalyzer';

// Status analysis
export { getHealthStatus, getChiStatus } from './statusAnalyzer';

// Location analysis
export { calcCollateralTolerance } from './locationAnalyzer';

// Template-based narrative generation
export { generateTemplateBasedNarratives, generateFallbackNarrative, determineMoodFromTone } from './templateNarrativeGenerator';

// Hook-based narrative generation
export { generateHookBasedNarratives } from './hookNarrativeGenerator';

// Template system
export { selectNarrativeTemplate, generateNarrativeText, generateNarratorCommentary } from './narrativeTemplates';

// Character and narrator hooks
export { characterNarratives } from './characterHooks';
export { narratorHooks } from './narratorHooks';

// Type definitions
export type {
  BattleContext,
  MechanicalState,
  NarrativeHook,
  TriggeredNarrative,
  NarrativeSystemConfig,
  CharacterMood,
  CharacterNarratives
} from './types';

// Lazy singleton instance
let narrativeServiceInstance: NarrativeService | null = null;

/**
 * @description Creates a narrative service with enhanced configuration (lazy singleton)
 */
export function createNarrativeService(): NarrativeService {
  if (!narrativeServiceInstance) {
    narrativeServiceInstance = new NarrativeService();
  }
  return narrativeServiceInstance;
}

/**
 * @description Main narrative service that coordinates all narrative generation with enhanced state management
 */
export class NarrativeService {
  private stateAnnouncementManager: StateAnnouncementManager;
  private battleEndHandler: BattleEndHandler;
  private enhancedSystem: EnhancedNarrativeSystem;
  private stateManager: StateDrivenNarrativePool;
  private currentTurn: number = 0;

  constructor() {
    this.stateAnnouncementManager = new StateAnnouncementManager();
    this.battleEndHandler = new BattleEndHandler();
    this.enhancedSystem = getEnhancedNarrativeSystem();
    this.stateManager = new StateDrivenNarrativePool();
  }

  /**
   * @description Updates the current turn for all narrative systems
   */
  updateTurn(turnNumber: number): void {
    this.currentTurn = turnNumber;
    // Update turn for all characters (backward compatibility)
    this.enhancedSystem.updateTurn('Aang', turnNumber);
    this.enhancedSystem.updateTurn('Azula', turnNumber);
  }

  /**
   * @description Generates a narrative line for a move with enhanced state management and anti-repetition
   */
  async generateNarrative(
    characterName: string,
    context: {
      damage: number;
      maxHealth: number;
      isMiss: boolean;
      isCritical: boolean;
      isPatternBreak: boolean;
      isEscalation: boolean;
      consecutiveHits: number;
      consecutiveMisses: number;
      turnNumber: number;
      characterState: 'fresh' | 'wounded' | 'exhausted' | 'desperate';
    },
    damageOutcome: 'miss' | 'glance' | 'hit' | 'devastating' | 'overwhelming',
    moveName?: string
  ): Promise<string> {
    // Update turn number for state tracking
    this.updateTurn(context.turnNumber);

    // Generate enhanced narrative with anti-repetition
    const narrative = await this.enhancedSystem.generateNarrative(
      characterName,
      context,
      damageOutcome,
      moveName
    );

    // Add contextual move description if available
    const moveDescription = moveName ? getContextualMoveDescription(characterName, context, moveName) : null;
    
    if (moveDescription && narrative !== moveDescription) {
      return `${narrative} ${moveDescription}`;
    }

    return narrative;
  }

  /**
   * @description Generates state announcement with enhanced tracking
   */
  async generateStateAnnouncement(
    character: string,
    stateType: 'breaking_point' | 'escalation' | 'desperation' | 'pattern_break',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: {
      turnNumber: number;
      escalationCount: number;
      desperationCount: number;
    }
  ): Promise<string | null> {
    // Check if state should be announced using enhanced system
    if (!this.enhancedSystem.shouldAnnounceState(stateType)) {
      return null;
    }

    // Get state announcement from enhanced system
    const announcement = await this.enhancedSystem.getStateAnnouncement(stateType, character);
    
    // Record the announcement to prevent repetition
    this.enhancedSystem.recordStateAnnouncement(stateType);
    
    return announcement;
  }

  /**
   * @description Generates tactical response narrative with enhanced context awareness
   */
  async generateTacticalResponse(
    character: string,
    context: {
      damage: number;
      maxHealth: number;
      isMiss: boolean;
      isCritical: boolean;
      isPatternBreak: boolean;
      isEscalation: boolean;
      consecutiveHits: number;
      consecutiveMisses: number;
      turnNumber: number;
      characterState: 'fresh' | 'wounded' | 'exhausted' | 'desperate';
      chi?: number;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mechanic: string
  ): Promise<string | null> {
    // Use enhanced system for tactical responses
    this.enhancedSystem.determineNarrativeState(character, {
      isPatternBreak: context.isPatternBreak,
      isEscalation: context.isEscalation,
      isDesperation: context.characterState === 'desperate',
      turnNumber: context.turnNumber,
      characterState: context.characterState,
      health: context.maxHealth - context.damage,
      maxHealth: context.maxHealth,
      chi: context.chi || 0,
      isCritical: context.isCritical,
      damage: context.damage
    });

    // Generate tactical response using enhanced system
    return await this.enhancedSystem.getNarrative(character, 'pattern_break', {
      turnNumber: context.turnNumber,
      health: context.maxHealth - context.damage,
      maxHealth: context.maxHealth,
      chi: context.chi || 0,
      isCritical: context.isCritical,
      damage: context.damage
    });
  }

  /**
   * @description Generates late game narrative with enhanced progression tracking
   */
  async generateLateGameNarrative(character: string, context?: {
    turnNumber: number;
    health: number;
    maxHealth: number;
    chi: number;
    isCritical: boolean;
    damage: number;
  }): Promise<string | null> {
    if (!context) {
      return null;
    }

    // Use enhanced system for late game narratives
    return await this.enhancedSystem.getNarrative(character, 'late_game', context);
  }

  /**
   * @description Records battle end and generates victory narratives
   */
  recordBattleEnd(state: BattleState): TriggeredNarrative[] {
    const victoryNarratives = this.battleEndHandler.recordBattleEnd(state);
    return victoryNarratives;
  }

  /**
   * @description Checks if a character can generate narratives
   */
  async canCharacterGenerateNarrative(characterName: string): Promise<boolean> {
    const stats = await this.enhancedSystem.getUsageStats();
    return stats[characterName] !== undefined;
  }

  /**
   * @description Generates narratives for a move with enhanced state management
   */
  async generateNarratives(
    actor: BattleCharacter,
    target: BattleCharacter,
    move: Record<string, unknown>,
    turnNumber: number,
    _battleLog: BattleLogEntry[],
    _location: string,
    isCritical: boolean,
    isDesperation: boolean,
    damage: number
  ): Promise<string[]> {
    const narratives: string[] = [];

    // Update turn for all systems
    this.updateTurn(turnNumber);

    // Calculate max health from stats
    const targetMaxHealth = target.stats.power + target.stats.defense + target.stats.agility + target.stats.intelligence;
    const actorMaxHealth = actor.stats.power + actor.stats.defense + actor.stats.agility + actor.stats.intelligence;

    // Generate actor narrative
    const actorContext = {
      damage,
      maxHealth: targetMaxHealth,
      isMiss: damage === 0,
      isCritical,
      isPatternBreak: false, // Will be determined by enhanced system
      isEscalation: false, // Will be determined by enhanced system
      consecutiveHits: 0, // Will be tracked by enhanced system
      consecutiveMisses: 0, // Will be tracked by enhanced system
      turnNumber,
      characterState: this.determineCharacterState(actor.currentHealth, actorMaxHealth)
    };

    const damageOutcome = this.determineDamageOutcome(damage, targetMaxHealth);
    const actorNarrative = await this.generateNarrative(
      actor.name,
      actorContext,
      damageOutcome,
      move.name as string
    );

    if (actorNarrative) {
      narratives.push(actorNarrative);
    }

    // Generate target response if appropriate
    if (damage > 0 && !isDesperation) {
      const targetContext = {
        damage,
        maxHealth: targetMaxHealth,
        isMiss: false,
        isCritical,
        isPatternBreak: false,
        isEscalation: false,
        consecutiveHits: 0,
        consecutiveMisses: 0,
        turnNumber,
        characterState: this.determineCharacterState(target.currentHealth, targetMaxHealth)
      };

      const targetResponse = await this.generateTacticalResponse(
        target.name,
        targetContext,
        'damage_received'
      );

      if (targetResponse) {
        narratives.push(targetResponse);
      }
    }

    return narratives;
  }

  /**
   * @description Determines character state based on health
   */
  private determineCharacterState(currentHealth: number, maxHealth: number): 'fresh' | 'wounded' | 'exhausted' | 'desperate' {
    const healthPercentage = (currentHealth / maxHealth) * 100;
    
    if (healthPercentage > 75) return 'fresh';
    if (healthPercentage > 50) return 'wounded';
    if (healthPercentage > 25) return 'exhausted';
    return 'desperate';
  }

  /**
   * @description Determines damage outcome based on damage and target health
   */
  private determineDamageOutcome(damage: number, maxHealth: number): 'miss' | 'glance' | 'hit' | 'devastating' | 'overwhelming' {
    if (damage === 0) return 'miss';
    const damagePercentage = (damage / maxHealth) * 100;
    if (damagePercentage < 5) return 'glance';
    if (damagePercentage < 15) return 'hit';
    if (damagePercentage < 25) return 'devastating';
    return 'overwhelming';
  }

  /**
   * @description Resets all narrative systems
   */
  reset(): void {
    this.currentTurn = 0;
    this.enhancedSystem.reset();
    this.stateManager.reset();
    this.stateAnnouncementManager.reset();
    this.battleEndHandler.reset();
  }

  /**
   * @description Gets the current state of all narrative systems
   */
  getState(): Record<string, unknown> {
    return {
      currentTurn: this.currentTurn,
      enhancedSystemState: this.enhancedSystem.getState(),
      stateManagerState: this.stateManager.getState(),
      announcementManagerState: this.stateAnnouncementManager.getState()
    };
  }
}

 