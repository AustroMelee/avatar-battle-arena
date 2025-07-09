// Used via dynamic registry in Narrative system. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Enhanced Template Generator
// FOCUS: Advanced narrative generation with anti-repetition, state management, and pool integration

import type { NarrativeMechanic } from './types';
import type { NarrativeContext } from './contextualNarrativeMapper';
import { EnhancedRepetitionManager } from './enhancedRepetitionManager';
import { StateAnnouncementManager } from './stateAnnouncementManager';
import { NarrativePoolManager } from './narrativePoolManager';
import { 
  getBreakingPointNarratives, 
  getEscalationNarratives, 
  getDesperationNarratives,
  getTacticalResponseNarratives,
  getLateGameNarratives,
  // getContextualMoveEscalation
} from './enhancedStateNarratives';
import { ensureNonEmpty } from '../utils/strings';
// import {
//   getContextualMoveDescription,
//   getStateTransitionDescription
// } from './contextualNarrativeMapper';

/**
 * @description Enhanced template generator with advanced anti-repetition and state management
 */
export class EnhancedTemplateGenerator {
  private repetitionManager: EnhancedRepetitionManager;
  private stateAnnouncementManager: StateAnnouncementManager;
  private narrativePoolManager: NarrativePoolManager;
  private currentTurn: number = 0;

  constructor() {
    this.repetitionManager = new EnhancedRepetitionManager();
    this.stateAnnouncementManager = new StateAnnouncementManager();
    this.narrativePoolManager = new NarrativePoolManager();
  }

  /**
   * @description Updates the current turn for all managers
   */
  updateTurn(turnNumber: number): void {
    this.currentTurn = turnNumber;
    this.repetitionManager.updateTurn(turnNumber);
    this.stateAnnouncementManager.updateTurn(turnNumber);
  }

  /**
   * @description Generates a contextual narrative line with pool management and anti-repetition
   */
  generateContextualNarrative(
    character: string,
    context: NarrativeContext,
    mechanic: NarrativeMechanic,
    _baseMove: string
  ): string {
    // Determine the narrative state based on context
    // const narrativeState = this.narrativePoolManager.determineNarrativeState(character, {
    //   isPatternBreak: context.isPatternBreak,
    //   isEscalation: context.isEscalation,
    //   isDesperation: false, // Will be determined by character state
    //   turnNumber: context.turnNumber,
    //   characterState: context.characterState
    // });

    // TODO: Restore dynamic state handling. For now, use 'normal' to guarantee type safety.
    const narrative = this.narrativePoolManager.getNarrative(character, 'normal', this.currentTurn);

    // Record the used token for anti-repetition tracking
    this.repetitionManager.recordToken(
      narrative,
      character,
      mechanic,
      this.currentTurn,
      this.getIntensityFromContext(context)
    );

    return ensureNonEmpty(narrative);
  }

  /**
   * @description Generates state announcement with throttling and variety
   */
  generateStateAnnouncement(
    character: string,
    stateType: 'breaking_point' | 'escalation' | 'desperation',
    _context: NarrativeContext
  ): string | null {
    switch (stateType) {
      case 'breaking_point': {
        if (!this.stateAnnouncementManager.shouldAnnounceBreakingPoint()) {
          return null;
        }
        const breakingPointLines = getBreakingPointNarratives();
        const breakingPointLine = breakingPointLines[this.stateAnnouncementManager.getEscalationCount() % breakingPointLines.length];
        this.stateAnnouncementManager.recordBreakingPoint();
        return ensureNonEmpty(breakingPointLine);
      }

      case 'escalation': {
        if (!this.stateAnnouncementManager.shouldAnnounceEscalation()) {
          return null;
        }
        const escalationLines = getEscalationNarratives(character);
        const escalationLine = escalationLines[this.stateAnnouncementManager.getEscalationCount() % escalationLines.length];
        this.stateAnnouncementManager.recordEscalation();
        return ensureNonEmpty(escalationLine);
      }

      case 'desperation': {
        if (!this.stateAnnouncementManager.shouldAnnounceDesperation()) {
          return null;
        }
        const desperationLines = getDesperationNarratives(character);
        const desperationLine = desperationLines[this.stateAnnouncementManager.getDesperationCount() % desperationLines.length];
        this.stateAnnouncementManager.recordDesperation();
        return ensureNonEmpty(desperationLine);
      }

      default:
        return null;
    }
  }

  /**
   * @description Generates tactical response narrative based on context
   */
  generateTacticalResponse(
    character: string,
    context: NarrativeContext,
    mechanic: string
  ): string | null {
    const tacticalResponses = getTacticalResponseNarratives(character, context, mechanic);
    if (tacticalResponses.length === 0) {
      return null;
    }

    // Use repetition manager to avoid repeating tactical responses
    const selectedResponse = this.repetitionManager.getStateAppropriateLine(
      tacticalResponses,
      character,
      'pattern_break' as NarrativeMechanic
    );

    this.repetitionManager.recordToken(
      selectedResponse,
      character,
      'pattern_break' as NarrativeMechanic,
      this.currentTurn,
      'medium'
    );

    return ensureNonEmpty(selectedResponse);
  }

  /**
   * @description Generates late-game intensity narrative
   */
  generateLateGameNarrative(character: string): string | null {
    const lateGameLines = getLateGameNarratives(character, this.currentTurn);
    if (lateGameLines.length === 0) {
      return null;
    }

    // Use repetition manager to avoid repeating late-game narratives
    const selectedLine = this.repetitionManager.getStateAppropriateLine(
      lateGameLines,
      character,
      'climax' as NarrativeMechanic
    );

    this.repetitionManager.recordToken(
      selectedLine,
      character,
      'climax' as NarrativeMechanic,
      this.currentTurn,
      'high'
    );

    return ensureNonEmpty(selectedLine);
  }

  /**
   * @description Gets intensity from narrative context
   */
  private getIntensityFromContext(context: NarrativeContext): 'low' | 'medium' | 'high' {
    const damagePercentage = (context.damage / context.maxHealth) * 100;
    
    if (damagePercentage < 10) return 'low';
    if (damagePercentage < 25) return 'medium';
    return 'high';
  }

  /**
   * @description Resets the generator for a new battle
   */
  reset(): void {
    this.repetitionManager.reset();
    this.stateAnnouncementManager.reset();
    this.narrativePoolManager.reset();
    this.currentTurn = 0;
  }

  /**
   * @description Gets the current state for debugging
   * @returns {Record<string, unknown>} Current state
   */
  getState(): Record<string, unknown> {
    return {
      currentTurn: this.currentTurn,
      repetitionManager: this.repetitionManager.getState(),
      stateAnnouncementManager: this.stateAnnouncementManager.getState(),
      narrativePoolManager: this.narrativePoolManager.getState()
    };
  }
} 