// CONTEXT: Narrative Orchestrator
// RESPONSIBILITY: Main orchestrator that composes all narrative modules

import type { 
  NarrativeContext, 
  DamageOutcome, 
  OneOffMomentContext,
  StateAnnouncementType 
} from '../types/NarrativeTypes';
import { StateTracker } from './StateTracker';
import { PoolManager } from './PoolManager';
import { OneOffMomentManager } from './OneOffMomentManager';
import { NarrativeEscalationService } from './NarrativeEscalationService';
import { CharacterNarrativeService } from './CharacterNarrativeService';

/**
 * @description Main orchestrator for the narrative system
 */
export class NarrativeOrchestrator {
  private stateTracker: StateTracker;
  private poolManager: PoolManager;
  private oneOffMomentManager: OneOffMomentManager;
  private escalationService: NarrativeEscalationService;
  private characterService: CharacterNarrativeService;

  constructor() {
    this.stateTracker = new StateTracker();
    this.poolManager = new PoolManager();
    this.oneOffMomentManager = new OneOffMomentManager(this.stateTracker, this.poolManager);
    this.escalationService = new NarrativeEscalationService();
    this.characterService = new CharacterNarrativeService();
  }

  /**
   * @description Initialize character for narrative tracking
   */
  initializeCharacter(characterName: string): void {
    this.stateTracker.initializeCharacter(characterName);
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
    // Update narrative state
    this.stateTracker.updateNarrativeState(characterName, context);

    // Check for one-off moments first
    const oneOffContext: OneOffMomentContext = {
      turnNumber: context.turnNumber,
      health: context.health,
      maxHealth: context.maxHealth,
      chi: context.chi,
      isCritical: context.isCritical,
      damage: context.damage,
      isDesperation: context.health / context.maxHealth <= 0.25,
      isEscalation: context.isEscalation,
      isPatternBreak: context.isPatternBreak
    };

    const oneOffMoment = this.oneOffMomentManager.checkForOneOffMoment(characterName, oneOffContext);
    if (oneOffMoment) {
      this.stateTracker.trackUsage(characterName, 'one_off_moment', oneOffMoment);
      return `${moveName} ${oneOffMoment}`;
    }

    // Generate standard narrative with character-specific flavor
    const damageNarrative = this.poolManager.getDamageOutcomeNarrative(damageOutcome);
    let characterFlavor = '';

    // Add character-specific emotional response based on outcome
    if (damageOutcome === 'miss') {
      characterFlavor = this.characterService.getMissLine(characterName, context);
    } else if (damageOutcome === 'hit' || damageOutcome === 'devastating' || damageOutcome === 'overwhelming') {
      characterFlavor = this.characterService.getHitLine(characterName, context);
    }

    const fullNarrative = characterFlavor ? `${moveName} ${damageNarrative} ${characterFlavor}` : `${moveName} ${damageNarrative}`;

    // Track usage for anti-repetition
    this.stateTracker.trackUsage(characterName, 'move_narrative', fullNarrative);

    return fullNarrative;
  }

  /**
   * @description Generate state announcement with anti-repetition
   */
  generateStateAnnouncement(stateType: StateAnnouncementType, turnNumber: number): string {
    if (stateType === 'escalation') {
      return this.escalationService.getEscalationLine(turnNumber);
    }
    return this.poolManager.getStateAnnouncementNarrative(stateType);
  }

  /**
   * @description Generate victory narrative with character-specific ending
   */
  generateVictoryNarrative(characterName: string, turnNumber: number): string {
    const context: NarrativeContext = {
      turnNumber,
      health: 100,
      maxHealth: 100,
      chi: 10,
      isCritical: false,
      damage: 0,
      characterState: 'victorious',
      isEscalation: false,
      isPatternBreak: false
    };
    return this.characterService.getVictoryLine(characterName, context);
  }

  /**
   * @description Generate defeat narrative with character-specific ending
   */
  generateDefeatNarrative(characterName: string, turnNumber: number): string {
    const context: NarrativeContext = {
      turnNumber,
      health: 0,
      maxHealth: 100,
      chi: 0,
      isCritical: false,
      damage: 0,
      characterState: 'defeated',
      isEscalation: false,
      isPatternBreak: false
    };
    return this.characterService.getDefeatLine(characterName, context);
  }

  /**
   * @description Get current narrative state for character
   */
  getNarrativeState(characterName: string): string {
    return this.stateTracker.getNarrativeState(characterName);
  }

  /**
   * @description Check if character has available one-off moments
   */
  hasAvailableMoments(characterName: string): boolean {
    return this.oneOffMomentManager.hasAvailableMoments(characterName);
  }

  /**
   * @description Reset all tracking for new battle
   */
  resetForNewBattle(): void {
    this.stateTracker.resetAllTracking();
    this.escalationService.reset();
  }

  /**
   * @description Reset tracking for specific character
   */
  resetCharacterTracking(characterName: string): void {
    this.stateTracker.resetUsageTracking(characterName, 0);
    this.oneOffMomentManager.resetForNewBattle(characterName);
  }

  /**
   * @description Add custom narrative pool
   */
  addCustomPool(poolName: string, lines: string[]): void {
    this.poolManager.addCustomPool(poolName, lines);
  }

  /**
   * @description Get custom narrative pool
   */
  getCustomPool(poolName: string): string[] {
    return this.poolManager.getCustomPool(poolName);
  }

  /**
   * @description Get narrative tier for character
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getNarrativeTier(characterName: string, turnNumber: number, healthPercentage: number): string {
    return this.poolManager.getNarrativeTier(turnNumber, healthPercentage);
  }
} 