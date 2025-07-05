// CONTEXT: Emotion Tracker
// RESPONSIBILITY: Track emotional states only

import type { EmotionalState, CharacterEmotion } from '../../types/NarrativeTypes';

/**
 * @description Service for tracking emotional states only
 */
export class EmotionTracker {
  private characterEmotions: Map<string, EmotionalState> = new Map();
  private emotionHistory: Map<string, CharacterEmotion[]> = new Map();

  /**
   * @description Initialize character emotion tracking
   */
  initializeCharacter(characterName: string): void {
    this.characterEmotions.set(characterName, {
      primary: 'neutral',
      intensity: 0.5,
      confidence: 0.5,
      fear: 0.0,
      anger: 0.0,
      determination: 0.5
    });

    this.emotionHistory.set(characterName, []);
  }

  /**
   * @description Update character's emotional state
   */
  updateEmotion(characterName: string, emotion: Partial<EmotionalState>): void {
    const current = this.characterEmotions.get(characterName);
    if (!current) {
      this.initializeCharacter(characterName);
    }

    const updated = { ...this.characterEmotions.get(characterName)!, ...emotion };
    this.characterEmotions.set(characterName, updated);

    // Record in history
    const history = this.emotionHistory.get(characterName) || [];
    history.push({
      characterName,
      emotion: updated,
      timestamp: Date.now()
    });
    this.emotionHistory.set(characterName, history);
  }

  /**
   * @description Get current emotional state
   */
  getCurrentEmotion(characterName: string): EmotionalState | null {
    return this.characterEmotions.get(characterName) || null;
  }

  /**
   * @description Get emotion history
   */
  getEmotionHistory(characterName: string): CharacterEmotion[] {
    return this.emotionHistory.get(characterName) || [];
  }

  /**
   * @description Get emotional intensity
   */
  getEmotionalIntensity(characterName: string): number {
    const emotion = this.characterEmotions.get(characterName);
    return emotion ? emotion.intensity : 0.5;
  }

  /**
   * @description Get primary emotion
   */
  getPrimaryEmotion(characterName: string): string {
    const emotion = this.characterEmotions.get(characterName);
    return emotion ? emotion.primary : 'neutral';
  }

  /**
   * @description Check if character is in a specific emotional state
   */
  isInEmotionalState(characterName: string, state: string): boolean {
    const emotion = this.characterEmotions.get(characterName);
    return emotion ? emotion.primary === state : false;
  }

  /**
   * @description Get emotional trend (improving/worsening)
   */
  getEmotionalTrend(characterName: string): 'improving' | 'worsening' | 'stable' {
    const history = this.getEmotionHistory(characterName);
    if (history.length < 2) return 'stable';

    const recent = history.slice(-3);
    const avgRecent = recent.reduce((sum, h) => sum + h.emotion.intensity, 0) / recent.length;
    const avgOlder = history.slice(-6, -3).reduce((sum, h) => sum + h.emotion.intensity, 0) / 3;

    if (avgRecent > avgOlder + 0.1) return 'improving';
    if (avgRecent < avgOlder - 0.1) return 'worsening';
    return 'stable';
  }
} 