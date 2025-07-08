// CONTEXT: Narrative Coordinator
// RESPONSIBILITY: Coordinate all focused narrative services only

import { CharacterNarrativeRouter } from './CharacterNarrativeRouter';
import { PoolManager } from './pools/PoolManager';
import { EmotionalStateManager } from './emotions/EmotionalStateManager';
import { NarrativeVariantsService } from './NarrativeVariantsService';
import { OneOffMomentManager } from './OneOffMomentManager';
import { StateTracker } from './StateTracker';
import { BattleNarrationStrategyService } from './BattleNarrationStrategyService';
import { EmotionalNarrationPolicy } from './EmotionalNarrationPolicy';
import { NarrativeComposer } from './NarrativeComposer';
import type { NarrativeContext, NarrativeRequest, DamageOutcome } from '../types/NarrativeTypes';

/**
 * @description Simplified narrative coordinator that coordinates all focused services
 */
export class NarrativeCoordinator {
  private characterRouter: CharacterNarrativeRouter;
  private poolManager: PoolManager;
  private emotionManager: EmotionalStateManager;
  private variantsService: NarrativeVariantsService;
  private oneOffManager: OneOffMomentManager;
  private stateTracker: StateTracker;
  private strategyService: BattleNarrationStrategyService;
  private emotionPolicy: EmotionalNarrationPolicy;
  private composer: NarrativeComposer;
  
  // Turn tracking for escalation/desperation
  private lastEscalationTurn: number = -3;
  private lastDesperationTurn: number = -3;
  
  // Enhanced tracking for anti-repetition
  private lastEmotionalNarrativeTurn: Map<string, number> = new Map();
  private lastTechnicalNarrativeTurn: Map<string, number> = new Map();
  private lastEnvironmentalNarrativeTurn: Map<string, number> = new Map();

  constructor() {
    this.characterRouter = new CharacterNarrativeRouter();
    this.poolManager = new PoolManager();
    this.emotionManager = new EmotionalStateManager();
    this.variantsService = new NarrativeVariantsService();
    this.stateTracker = new StateTracker();
    this.oneOffManager = new OneOffMomentManager(this.stateTracker, this.poolManager);
    
    // Initialize new SRP-focused services
    this.strategyService = new BattleNarrationStrategyService();
    this.emotionPolicy = new EmotionalNarrationPolicy();
    this.composer = new NarrativeComposer(this.characterRouter, this.variantsService, this.poolManager);
  }

  /**
   * @description Initialize narrative system for a battle
   */
  initializeBattle(player1Name: string, player2Name: string): void {
    this.emotionManager.initializeCharacter(player1Name);
    this.emotionManager.initializeCharacter(player2Name);
    this.stateTracker.initializeCharacter(player1Name);
    this.stateTracker.initializeCharacter(player2Name);
    this.variantsService.initializeCharacter(player1Name);
    this.variantsService.initializeCharacter(player2Name);
    this.characterRouter.initializeCharacter(player1Name);
    this.characterRouter.initializeCharacter(player2Name);
    
    // Initialize emotional policy tracking
    this.emotionPolicy.initializeCharacter(player1Name);
    this.emotionPolicy.initializeCharacter(player2Name);
    
    this.lastEscalationTurn = -3;
    this.lastDesperationTurn = -3;
    
    // Reset narrative turn tracking
    this.lastEmotionalNarrativeTurn.clear();
    this.lastTechnicalNarrativeTurn.clear();
    this.lastEnvironmentalNarrativeTurn.clear();
  }

  /**
   * @description Generate narrative for a move execution with aggressive anti-repetition. Now supports multi-part output.
   * @returns Array of narrative lines (e.g., [intention, action, reaction])
   */
  generateMoveNarrative(request: NarrativeRequest): string[] {
    const { characterName, moveName, damageOutcome, context } = request;
    const turnNumber = context.turnNumber;

    // Update turn number in router
    this.characterRouter.updateTurn(turnNumber);

    // Update emotional state based on outcome
    this.characterRouter.updateEmotionalState(characterName, damageOutcome, context.damage, (context.health / context.maxHealth) * 100);

    // Choose narrative track using strategy service
    const narrativeTrack = this.strategyService.getNarrativeTrack(context);
    
    // NEW: Retrieve recent memory for the acting character
    const memory = this.stateTracker.getMemory(characterName);
    
    let narrative: string | string[] = '';
    
    // Generate narrative line(s) based on track using composer with anti-repetition
    switch (narrativeTrack) {
      case 'technical':
        if (this.shouldUseNarrativeTrack(characterName, 'technical', turnNumber)) {
          narrative = this.composer.composeTechnicalNarrative(characterName, damageOutcome, context, moveName, memory);
          this.lastTechnicalNarrativeTurn.set(characterName, turnNumber);
        } else {
          narrative = this.composer.composeEmotionalNarrative(
            characterName, 
            damageOutcome, 
            context, 
            moveName,
            this.getCurrentEmotionalState(characterName, context),
            true,
            this.composer.getEmotionalStateDescription(characterName, this.getCurrentEmotionalState(characterName, context)),
            memory
          );
          this.lastEmotionalNarrativeTurn.set(characterName, turnNumber);
        }
        break;
      case 'emotional': {
        const emotionalState = this.getCurrentEmotionalState(characterName, context);
        const shouldNarrateEmotion = this.emotionPolicy.shouldNarrateEmotionalState(characterName, emotionalState, turnNumber);
        const emotionalEnhancement = this.composer.getEmotionalStateDescription(characterName, emotionalState);
        if (shouldNarrateEmotion) {
          this.emotionPolicy.updateEmotionalStateTracking(characterName, emotionalState, turnNumber);
        }
        narrative = this.composer.composeEmotionalNarrative(
          characterName, 
          damageOutcome, 
          context, 
          moveName,
          emotionalState,
          shouldNarrateEmotion,
          emotionalEnhancement,
          memory
        );
        this.lastEmotionalNarrativeTurn.set(characterName, turnNumber);
        break;
      }
      case 'environmental':
        if (this.shouldUseNarrativeTrack(characterName, 'environmental', turnNumber)) {
          narrative = this.composer.composeEnvironmentalNarrative(characterName, damageOutcome, context, moveName, memory);
          this.lastEnvironmentalNarrativeTurn.set(characterName, turnNumber);
        } else {
          const emotionalState = this.getCurrentEmotionalState(characterName, context);
          narrative = this.composer.composeEmotionalNarrative(
            characterName, 
            damageOutcome, 
            context, 
            moveName,
            emotionalState,
            true,
            this.composer.getEmotionalStateDescription(characterName, emotionalState),
            memory
          );
          this.lastEmotionalNarrativeTurn.set(characterName, turnNumber);
        }
        break;
    }

    // Add escalation if appropriate using strategy service
    if (this.strategyService.shouldIncludeEscalation(context, this.lastEscalationTurn)) {
      const escalationVariant = this.composer.composeEscalationNarrative(characterName, context);
      if (escalationVariant) {
        if (Array.isArray(narrative)) {
          narrative.push(escalationVariant);
        } else {
          narrative = [narrative, escalationVariant];
        }
        this.lastEscalationTurn = turnNumber;
      }
    }

    // Always return an array of lines
    return Array.isArray(narrative) ? narrative : [narrative];
  }

  /**
   * @description Check if we should use a specific narrative track (anti-repetition)
   */
  private shouldUseNarrativeTrack(characterName: string, track: string, turnNumber: number): boolean {
    const lastUsed = this.getLastNarrativeTurn(characterName, track);
    const cooldown = 3; // Minimum turns between same track usage
    return !lastUsed || turnNumber - lastUsed >= cooldown;
  }

  /**
   * @description Get the last turn a narrative track was used
   */
  private getLastNarrativeTurn(characterName: string, track: string): number {
    switch (track) {
      case 'emotional':
        return this.lastEmotionalNarrativeTurn.get(characterName) || 0;
      case 'technical':
        return this.lastTechnicalNarrativeTurn.get(characterName) || 0;
      case 'environmental':
        return this.lastEnvironmentalNarrativeTurn.get(characterName) || 0;
      default:
        return 0;
    }
  }

  /**
   * @description Get current emotional state for character
   */
  private getCurrentEmotionalState(characterName: string, context: NarrativeContext): string {
    const healthPercentage = (context.health / context.maxHealth) * 100;
    const arc = this.characterRouter.getCharacterArc(characterName);
    
    if (arc) {
      return arc.currentPhase;
    }
    
    // Fallback emotional state based on health and context
    if (healthPercentage <= 15) return 'desperate';
    if (healthPercentage <= 30) return 'pressed';
    if (context.isCritical) return 'surprised';
    if (context.isPatternBreak) return 'alert';
    if (context.turnNumber <= 3) return 'focused';
    if (context.turnNumber >= 15) return 'intense';
    
    return 'steady';
  }

  /**
   * @description Generate escalation narrative with strict anti-repetition
   */
  generateEscalationNarrative(characterName: string, context: NarrativeContext): string {
    return this.composer.composeEscalationNarrative(characterName, context);
  }

  /**
   * @description Generate desperation narrative with anti-repetition
   */
  generateDesperationNarrative(characterName: string, context: NarrativeContext): string {
    const turnNumber = context.turnNumber;
    
    // Check if desperation should be included using strategy service
    if (!this.strategyService.shouldIncludeDesperation(context, this.lastDesperationTurn)) {
      return this.characterRouter.getDefeatLine(characterName);
    }
    
    this.lastDesperationTurn = turnNumber;
    return this.composer.composeDesperationNarrative(characterName, context);
  }

  /**
   * @description Generate victory narrative with enhanced variety
   */
  generateVictoryNarrative(winnerName: string, loserName: string): string {
    return this.composer.composeVictoryNarrative(winnerName, loserName);
  }

  /**
   * @description Update emotional state based on battle events
   */
  updateEmotionalState(characterName: string, event: string, _context: NarrativeContext): void {
    // Enhanced emotion updates based on events
    if (event === 'hit') {
      this.emotionManager.updateEmotion(characterName, {
        type: 'generic',
        intensity: 0.6,
        duration: 1,
        timestamp: Date.now(),
      });
    } else if (event === 'miss') {
      this.emotionManager.updateEmotion(characterName, {
        type: 'generic',
        intensity: 0.8,
        duration: 1,
        timestamp: Date.now(),
      });
    } else if (event === 'damage') {
      this.emotionManager.updateEmotion(characterName, {
        type: 'generic',
        intensity: 0.9,
        duration: 1,
        timestamp: Date.now(),
      });
    } else if (event === 'critical') {
      this.emotionManager.updateEmotion(characterName, {
        type: 'generic',
        intensity: 0.9,
        duration: 1,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * @description Get narrative variant
   */
  getNarrativeVariant(type: string): string {
    return this.variantsService.getDamageOutcomeVariant(type as DamageOutcome);
  }

  /**
   * @description Check for one-off moment
   */
  checkOneOffMoment(characterName: string, context: NarrativeContext): string | null {
    return this.oneOffManager.checkForOneOffMoment(characterName, {
      turnNumber: context.turnNumber,
      health: context.health,
      maxHealth: context.maxHealth,
      chi: context.chi,
      isCritical: context.isCritical,
      damage: context.damage,
      isEscalation: context.isEscalation,
      isPatternBreak: context.isPatternBreak
    });
  }

  /**
   * @description Get battle state summary
   */
  getBattleStateSummary(): Record<string, unknown> {
    return {
      emotionalStates: this.emotionManager.getCurrentEmotion('Aang') && this.emotionManager.getCurrentEmotion('Azula'),
      stateTracker: this.stateTracker.getNarrativeState('Aang') && this.stateTracker.getNarrativeState('Azula'),
      characterArcs: this.characterRouter.getCharacterArc('Aang') && this.characterRouter.getCharacterArc('Azula')
    };
  }
} 