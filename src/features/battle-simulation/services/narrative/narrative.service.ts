/**
 * @fileoverview The main narrative service orchestrating line generation.
 * @description This service coordinates pools, anti-repetition, and fallback generation
 * to produce dynamic, character-driven battle narratives.
 */

import { CharacterName, CombatMechanic, NarrativeContext } from './narrative.types';
import { narrativePools } from './pools/narrative.pools';
import { AntiRepetitionUtility } from './utils/antiRepetition.utility';
import { generateFallbackLine } from './utils/fallbackGenerator.utility';

export class NarrativeService {
  private antiRepetition: AntiRepetitionUtility;

  constructor() {
    this.antiRepetition = new AntiRepetitionUtility();
  }

  /**
   * Retrieves a unique, context-aware narrative line for a given battle event.
   *
   * @param characterName - The name of the character performing the action.
   * @param mechanic - The ID of the combat mechanic being used.
   * @param context - The specific context of the mechanic (e.g., 'hit', 'miss').
   * @returns A string containing the generated narrative line.
   */
  public getNarrativeLine(
    characterName: CharacterName,
    mechanic: CombatMechanic,
    context: NarrativeContext
  ): string {
    // 1. Attempt to find the specific narrative pool.
    const linePool = narrativePools[characterName]?.[mechanic]?.[context];

    // 2. If a valid pool is found, get a fresh line from it.
    if (linePool && linePool.length > 0) {
      const key = `${characterName}-${mechanic}-${context}`;
      const freshLine = this.antiRepetition.getFreshLine(key, linePool);
      if (freshLine) {
        return freshLine;
      }
    }
    
    // 3. If no line is found, generate a high-quality fallback.
    // This ensures the system is robust and never fails to produce a narrative.
    console.warn(
      `Narrative line not found for ${characterName}/${mechanic}/${context}. Using fallback.`
    );
    return generateFallbackLine(characterName, mechanic, context);
  }

  /**
   * Resets the anti-repetition tracker. This should be called at the start of each new battle
   * to ensure narrative variety is fresh for each encounter.
   */
  public reset(): void {
    this.antiRepetition.reset();
  }
}
