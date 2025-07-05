// CONTEXT: One-Off Moment Manager
// RESPONSIBILITY: Handle dramatic one-time narrative moments

import type { OneOffMomentType, OneOffMomentContext } from '../types/NarrativeTypes';
import { StateTracker } from './StateTracker';
import { PoolManager } from './pools/PoolManager';

/**
 * @description Manages dramatic one-off narrative moments
 */
export class OneOffMomentManager {
  private stateTracker: StateTracker;
  private poolManager: PoolManager;

  constructor(stateTracker: StateTracker, poolManager: PoolManager) {
    this.stateTracker = stateTracker;
    this.poolManager = poolManager;
  }

  /**
   * @description Check for and generate one-off moments
   */
  checkForOneOffMoment(
    characterName: string, 
    context: OneOffMomentContext
  ): string | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { turnNumber, health, maxHealth, chi, isCritical, damage } = context;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const healthPercentage = (health / maxHealth) * 100;

    // Check for first blood (first significant damage)
    if (this.shouldTriggerFirstBlood(characterName, context)) {
      this.stateTracker.trackOneOffMoment(characterName, 'first_blood', turnNumber);
      return this.poolManager.getOneOffMomentNarrative('first_blood');
    }

    // Check for critical hit moment
    if (this.shouldTriggerCriticalHit(characterName, context)) {
      this.stateTracker.trackOneOffMoment(characterName, 'critical_hit', turnNumber);
      return this.poolManager.getOneOffMomentNarrative('critical_hit');
    }

    // Check for desperation trigger
    if (this.shouldTriggerDesperation(characterName, context)) {
      this.stateTracker.trackOneOffMoment(characterName, 'desperation_trigger', turnNumber);
      return this.poolManager.getOneOffMomentNarrative('desperation_trigger');
    }

    // Check for escalation trigger
    if (this.shouldTriggerEscalation(characterName, context)) {
      this.stateTracker.trackOneOffMoment(characterName, 'escalation_trigger', turnNumber);
      return this.poolManager.getOneOffMomentNarrative('escalation_trigger');
    }

    // Check for pattern break
    if (this.shouldTriggerPatternBreak(characterName, context)) {
      this.stateTracker.trackOneOffMoment(characterName, 'pattern_break', turnNumber);
      return this.poolManager.getOneOffMomentNarrative('pattern_break');
    }

    // Check for final gambit
    if (this.shouldTriggerFinalGambit(characterName, context)) {
      this.stateTracker.trackOneOffMoment(characterName, 'final_gambit', turnNumber);
      return this.poolManager.getOneOffMomentNarrative('final_gambit');
    }

    return null;
  }

  /**
   * @description Check if first blood should trigger
   */
  private shouldTriggerFirstBlood(characterName: string, context: OneOffMomentContext): boolean {
    if (!this.stateTracker.isOneOffMomentAvailable(characterName, 'first_blood')) {
      return false;
    }

    // First blood triggers on first significant damage (damage > 5)
    return context.damage > 5 && context.turnNumber <= 3;
  }

  /**
   * @description Check if critical hit moment should trigger
   */
  private shouldTriggerCriticalHit(characterName: string, context: OneOffMomentContext): boolean {
    if (!this.stateTracker.isOneOffMomentAvailable(characterName, 'critical_hit')) {
      return false;
    }

    // Critical hit moment triggers on high damage critical hits
    return context.isCritical && context.damage > 15;
  }

  /**
   * @description Check if desperation trigger should activate
   */
  private shouldTriggerDesperation(characterName: string, context: OneOffMomentContext): boolean {
    if (!this.stateTracker.isOneOffMomentAvailable(characterName, 'desperation_trigger')) {
      return false;
    }

    const healthPercentage = (context.health / context.maxHealth) * 100;
    
    // Desperation triggers when health drops below 25% for the first time
    return healthPercentage <= 25 && (context.isDesperation ?? false);
  }

  /**
   * @description Check if escalation trigger should activate
   */
  private shouldTriggerEscalation(characterName: string, context: OneOffMomentContext): boolean {
    if (!this.stateTracker.isOneOffMomentAvailable(characterName, 'escalation_trigger')) {
      return false;
    }

    // Escalation triggers when escalation state is first activated
    return context.isEscalation ?? false;
  }

  /**
   * @description Check if pattern break should trigger
   */
  private shouldTriggerPatternBreak(characterName: string, context: OneOffMomentContext): boolean {
    if (!this.stateTracker.isOneOffMomentAvailable(characterName, 'pattern_break')) {
      return false;
    }

    // Pattern break triggers when pattern breaking is first detected
    return context.isPatternBreak ?? false;
  }

  /**
   * @description Check if final gambit should trigger
   */
  private shouldTriggerFinalGambit(characterName: string, context: OneOffMomentContext): boolean {
    if (!this.stateTracker.isOneOffMomentAvailable(characterName, 'final_gambit')) {
      return false;
    }

    const healthPercentage = (context.health / context.maxHealth) * 100;
    
    // Final gambit triggers when health is critically low and chi is depleted
    return healthPercentage <= 10 && context.chi <= 1;
  }

  /**
   * @description Generate victory moment narrative
   */
  generateVictoryMoment(characterName: string, turnNumber: number): string {
    this.stateTracker.trackOneOffMoment(characterName, 'victory_moment', turnNumber);
    return this.poolManager.getOneOffMomentNarrative('victory_moment');
  }

  /**
   * @description Generate defeat moment narrative
   */
  generateDefeatMoment(characterName: string, turnNumber: number): string {
    this.stateTracker.trackOneOffMoment(characterName, 'defeat_moment', turnNumber);
    return this.poolManager.getOneOffMomentNarrative('defeat_moment');
  }

  /**
   * @description Check if any one-off moment is available for character
   */
  hasAvailableMoments(characterName: string): boolean {
    const momentTypes: OneOffMomentType[] = [
      'first_blood',
      'critical_hit', 
      'desperation_trigger',
      'escalation_trigger',
      'pattern_break',
      'final_gambit'
    ];

    return momentTypes.some(momentType => 
      this.stateTracker.isOneOffMomentAvailable(characterName, momentType)
    );
  }

  /**
   * @description Get available moment types for character
   */
  getAvailableMoments(characterName: string): OneOffMomentType[] {
    const momentTypes: OneOffMomentType[] = [
      'first_blood',
      'critical_hit',
      'desperation_trigger', 
      'escalation_trigger',
      'pattern_break',
      'final_gambit'
    ];

    return momentTypes.filter(momentType =>
      this.stateTracker.isOneOffMomentAvailable(characterName, momentType)
    );
  }

  /**
   * @description Reset one-off moments for new battle
   */
  resetForNewBattle(characterName: string): void {
    this.stateTracker.resetOneOffMoments(characterName);
  }
} 