// CONTEXT: Emotional Narration Policy
// RESPONSIBILITY: Determine when and how to narrate emotional states

import type { NarrativeContext, DamageOutcome } from '../types/NarrativeTypes';

/**
 * @description Service responsible for emotional narration policy and state tracking
 */
export class EmotionalNarrationPolicy {
  // Emotional state tracking to prevent repetition
  private characterEmotionalStates: Map<string, {
    currentState: string;
    lastNarratedState: string;
    lastStateChangeTurn: number;
  }> = new Map();

  /**
   * @description Initialize character emotional state tracking
   */
  initializeCharacter(characterName: string): void {
    this.characterEmotionalStates.set(characterName, {
      currentState: 'calm',
      lastNarratedState: 'calm',
      lastStateChangeTurn: 0
    });
  }

  /**
   * @description Determine emotional state based on context with more granular tracking
   */
  determineEmotionalState(_context: NarrativeContext, damageOutcome: DamageOutcome): string {
    const healthPercentage = (_context.health / _context.maxHealth) * 100;
    const turnNumber = _context.turnNumber;
    
    // More granular emotional states to prevent repetition
    if (healthPercentage <= 15) return 'desperate';
    if (healthPercentage <= 30) return 'pressed';
    if (healthPercentage <= 50) return 'focused';
    if (_context.damage >= 25) return 'surprised';
    if (_context.damage >= 15) return 'alert';
    if (_context.isCritical) return 'intense';
    if (turnNumber >= 20) return 'determined';
    if (turnNumber >= 15) return 'steady';
    if (damageOutcome === 'miss') return 'frustrated';
    if (damageOutcome === 'hit') return 'confident';
    
    return 'calm';
  }

  /**
   * @description Check if emotional state should be narrated with stricter rules
   */
  shouldNarrateEmotionalState(characterName: string, newState: string, turnNumber: number): boolean {
    const state = this.characterEmotionalStates.get(characterName);
    if (!state) return false;
    
    // Only narrate if state actually changed AND we haven't narrated it recently
    // AND the change is significant enough
    const significantStates = ['desperate', 'surprised', 'intense'];
    const isSignificant = significantStates.includes(newState);
    
    return newState !== state.lastNarratedState && 
           turnNumber - state.lastStateChangeTurn >= 3 &&
           (isSignificant || turnNumber - state.lastStateChangeTurn >= 5);
  }

  /**
   * @description Update emotional state tracking
   */
  updateEmotionalStateTracking(characterName: string, newState: string, turnNumber: number): void {
    const state = this.characterEmotionalStates.get(characterName);
    if (state) {
      state.currentState = newState;
      state.lastNarratedState = newState;
      state.lastStateChangeTurn = turnNumber;
    }
  }

  /**
   * @description Get current emotional state for a character
   */
  getCurrentEmotionalState(characterName: string): string | undefined {
    const state = this.characterEmotionalStates.get(characterName);
    return state?.currentState;
  }

  /**
   * @description Get last narrated emotional state for a character
   */
  getLastNarratedEmotionalState(characterName: string): string | undefined {
    const state = this.characterEmotionalStates.get(characterName);
    return state?.lastNarratedState;
  }

  /**
   * @description Get last state change turn for a character
   */
  getLastStateChangeTurn(characterName: string): number | undefined {
    const state = this.characterEmotionalStates.get(characterName);
    return state?.lastStateChangeTurn;
  }
} 