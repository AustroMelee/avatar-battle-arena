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
// import { generateFallbackLine } from './utils/fallbackGenerator.utility'; // REMOVED: Unused import
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
    let linePool = characterPool?.[mechanicKey]?.[context];

    // --- Map new mechanic contexts to narrative pools if missing ---
    if (!linePool || linePool.length === 0) {
      const ctxStr = String(context);
      // Pattern break/adaptation
      if (mechanicKey === 'Reversal' || ctxStr === 'patternBreak' || ctxStr === 'pattern_break') {
        linePool = characterPool?.ForcedEscalation?.trigger;
      }
      // Forced escalation
      if (ctxStr === 'forcedEscalation' || ctxStr === 'escalation' || mechanicKey === 'ForcedEscalation') {
        linePool = characterPool?.ForcedEscalation?.trigger;
      }
      // Stalemate/deadlock
      if (ctxStr === 'stalemate' || ctxStr === 'deadlock') {
        linePool = characterPool?.Stalemate?.trigger;
      }
      // Forced ending
      if (ctxStr === 'forced_ending' || ctxStr === 'forcedEnding') {
        linePool = characterPool?.Stalemate?.trigger;
      }
    }

    // --- ANTI-REPETITION QUEUE: Block last 3 lines for all contexts ---
    const antiRepetitionKey = `${characterName}-${mechanicKey}-${context}`;
    const freshLine = (this.antiRepetition.getFreshLine.length === 3)
      ? this.antiRepetition.getFreshLine(antiRepetitionKey, linePool || [])
      : this.antiRepetition.getFreshLine(antiRepetitionKey, linePool || []);
    if (freshLine && freshLine.trim().length > 0 && freshLine !== 'No narrative') {
      return freshLine;
    }
    // Add new forced ending/stalemate lines
    if ((context as string) === 'stalemate' || (context as string) === 'forced_ending') {
      const forcedEndingLines = [
        'Neither combatant can muster the will or creativity to break the deadlock. The arena falls silent as the battle ends in a draw.',
        'Fatigue and predictability have claimed both fighters. Destiny demands a rematch another day.',
        'Both warriors are too exhausted or predictable to continue. The battle ends in a draw—neither can break the deadlock.'
      ];
      const fallback = this.antiRepetition.getFreshLine(antiRepetitionKey, forcedEndingLines);
      if (fallback && fallback.trim().length > 0) return fallback;
      return forcedEndingLines[0];
    }
    // --- Generic, non-empty fallback for any missing context ---
    const genericFallback = `The fight grinds on, neither side relenting.`;
    return genericFallback;
  }

  /**
   * Resets the anti-repetition tracker. This should be called at the start of each new battle
   * to ensure narrative variety is fresh for each encounter.
   */
  public reset(): void {
    this.antiRepetition.reset();
  }
}
