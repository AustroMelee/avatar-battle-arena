// CONTEXT: Emotional State Manager
// RESPONSIBILITY: Coordinate focused emotion services only

import { EmotionTracker } from './EmotionTracker';
import { EmotionModifier } from './EmotionModifier';

/**
 * @description Simplified emotional state manager that coordinates focused emotion services
 */
export class EmotionalStateManager {
  private emotionTracker: EmotionTracker;
  private emotionModifier: EmotionModifier;

  constructor() {
    this.emotionTracker = new EmotionTracker();
    this.emotionModifier = new EmotionModifier();
  }

  /**
   * @description Initialize character emotion tracking
   */
  initializeCharacter(characterName: string): void {
    this.emotionTracker.initializeCharacter(characterName);
  }

  /**
   * @description Update character's emotional state
   */
  updateEmotion(characterName: string, emotion: any): void {
    this.emotionTracker.updateEmotion(characterName, emotion);
  }

  /**
   * @description Get current emotional state
   */
  getCurrentEmotion(characterName: string): any {
    return this.emotionTracker.getCurrentEmotion(characterName);
  }

  /**
   * @description Get emotion modifier for narrative
   */
  getEmotionModifier(emotion: string): string {
    return this.emotionModifier.getEmotionModifier(emotion);
  }

  /**
   * @description Get emotion enhancement for narrative with turn-based cycling
   */
  getEmotionEnhancement(emotion: string, intensity: number, turnNumber: number): string {
    return this.emotionModifier.getEmotionEnhancement(emotion, intensity, turnNumber);
  }

  /**
   * @description Get character-specific emotional response
   */
  getCharacterEmotionalResponse(characterName: string, emotion: string, turnNumber: number): string {
    return this.emotionModifier.getCharacterEmotionalResponse(characterName, emotion, turnNumber);
  }

  /**
   * @description Get emotional intensity
   */
  getEmotionalIntensity(characterName: string): number {
    return this.emotionTracker.getEmotionalIntensity(characterName);
  }

  /**
   * @description Get primary emotion
   */
  getPrimaryEmotion(characterName: string): string {
    return this.emotionTracker.getPrimaryEmotion(characterName);
  }

  /**
   * @description Check if character is in a specific emotional state
   */
  isInEmotionalState(characterName: string, state: string): boolean {
    return this.emotionTracker.isInEmotionalState(characterName, state);
  }

  /**
   * @description Get emotional trend
   */
  getEmotionalTrend(characterName: string): 'improving' | 'worsening' | 'stable' {
    return this.emotionTracker.getEmotionalTrend(characterName);
  }

  /**
   * @description Get available emotions
   */
  getAvailableEmotions(): string[] {
    return this.emotionModifier.getAvailableEmotions();
  }

  /**
   * @description Get emotional beat for narrative enhancement
   */
  getEmotionalBeat(emotion: string): string {
    return this.emotionModifier.getEmotionalBeat(emotion);
  }
} 