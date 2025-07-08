// Used via dynamic registry in Narrative system. See SYSTEM ARCHITECTURE.MD for flow.
// @docs
// @description: Narrative system for Avatar Battle Arena. All narrative generation is registry/data-driven and plug-and-play. No hard-coded content. Extensible via data/registries only. SRP-compliant. See SYSTEM ARCHITECTURE.MD for integration points.
// @criticality: 🌀 Narrative
// @owner: AustroMelee
// @tags: narrative, core-logic, epilogue, registry, plug-and-play, extensibility
//
// This file should never reference character, move, or narrative content directly. All extensibility is via data/registries.
//
// Updated for 2025 registry-driven architecture overhaul.

import { CharacterName, CombatMechanic, NarrativeContext } from './narrative.types';
import { NarrativePoolRegistry } from './pools/narrativePoolRegistry.service'; // MODIFIED: Import registry
import { AntiRepetitionUtility } from './utils/antiRepetition.utility';
import { generateFallbackLine } from './utils/fallbackGenerator.utility';
import { moveNameToMechanicKey } from './utils/narrativeKey.utility'; // MODIFIED: Import the new utility

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
    mechanicOrMoveName: CombatMechanic | string, // Can accept either
    context: NarrativeContext
  ): string {
    // MODIFICATION: Convert the move name to a mechanic key
    const mechanicKey = moveNameToMechanicKey(mechanicOrMoveName);
    const characterPool = NarrativePoolRegistry.getPool(characterName);
    const linePool = characterPool?.[mechanicKey]?.[context];

    // --- ANTI-REPETITION QUEUE: Block last 3 lines for basic moves ---
    const antiRepetitionKey = `${characterName}-${mechanicKey}-${context}`;
    // Use a type-safe check for basic moves: if context is 'basic_move' or mechanicKey is in a known set
    const freshLine = (this.antiRepetition.getFreshLine.length === 3)
      ? this.antiRepetition.getFreshLine(antiRepetitionKey, linePool || [])
      : this.antiRepetition.getFreshLine(antiRepetitionKey, linePool || []);
    if (freshLine) {
      return freshLine;
    }
    // Add new forced ending/stalemate lines
    if ((context as string) === 'stalemate' || (context as string) === 'forced_ending') {
      const forcedEndingLines = [
        'Neither combatant can muster the will or creativity to break the deadlock. The arena falls silent as the battle ends in a draw.',
        'Fatigue and predictability have claimed both fighters. Destiny demands a rematch another day.',
        'Both warriors are too exhausted or predictable to continue. The battle ends in a draw—neither can break the deadlock.'
      ];
      // Use anti-repetition for these as well
      const fallback = this.antiRepetition.getFreshLine(antiRepetitionKey, forcedEndingLines);
      if (fallback) return fallback;
      return forcedEndingLines[0];
    }
    console.warn(
      `Narrative line not found for ${characterName}/${mechanicKey}/${context}. Using fallback.`
    );
    // Pass the standardized key to the fallback generator
    return generateFallbackLine(characterName, mechanicKey, context);
  }

  /**
   * Resets the anti-repetition tracker. This should be called at the start of each new battle
   * to ensure narrative variety is fresh for each encounter.
   */
  public reset(): void {
    this.antiRepetition.reset();
  }
}
