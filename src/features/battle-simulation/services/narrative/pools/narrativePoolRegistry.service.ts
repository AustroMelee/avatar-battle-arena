// @docs
// @description: SINGLE SOURCE OF TRUTH for all narrative pools in Avatar Battle Arena. Registry/data-driven, plug-and-play architecture. No hard-coded logic. Extensible via data/registries only. SRP-compliant. See SYSTEM ARCHITECTURE.MD for integration points.
// @criticality: 🌀 Narrative
// @owner: AustroMelee
// @tags: narrative, registry, plug-and-play, extensibility, SRP
//
// All narrative pools must be registered here. No engine changes required for new narrative content.
//
// Updated for 2025 registry-driven architecture overhaul.
// @file narrativePoolRegistry.service.ts
// @description SINGLE SOURCE OF TRUTH for narrative content. This registry loads all
// character-specific narrative pools and provides them on demand. This decouples
// the narrative engine from specific character implementations.

import { CharacterNarrativePool, CharacterName } from '../narrative.types';
import { aangNarrativePool } from './aang.narrative';
import { azulaNarrativePool } from './azula.narrative';

class NarrativePoolRegistryService {
  private pools: Map<string, CharacterNarrativePool>;

  constructor() {
    this.pools = new Map();
    // Register pools using a consistent key (lowercase character name)
    this.register('aang', aangNarrativePool);
    this.register('azula', azulaNarrativePool);
    // To add a new character's narrative, simply add a new line here:
    // this.register('zuko', zukoNarrativePool);
  }

  /**
   * Registers a narrative pool, ensuring the key is lowercase.
   */
  public register(characterId: string, pool: CharacterNarrativePool): void {
    if (!characterId) return;
    this.pools.set(characterId.toLowerCase(), pool); // ENFORCE LOWERCASE
  }

  /**
   * Retrieves a narrative pool using a lowercase key.
   */
  public getPool(characterId: CharacterName | string): CharacterNarrativePool {
    if (!characterId) return {};
    const pool = this.pools.get(characterId.toLowerCase()); // ENFORCE LOWERCASE
    if (!pool) {
      console.warn(`[Narrative] No narrative pool found for character ID "${characterId}".`);
      return {};
    }
    return pool;
  }
}

// Export a singleton instance of the registry
export const NarrativePoolRegistry = new NarrativePoolRegistryService();

export const systemNarrativePool = {
  escalation: [
    "The tension in the arena is palpable—something is about to break.",
    "A sudden shift in the air signals the battle’s escalation.",
    "Both fighters dig deep, unleashing new levels of power.",
    "The crowd senses a turning point as the pace intensifies.",
    "A surge of energy crackles between the combatants—escalation is inevitable.",
    "The battle enters a new phase—no one can hold back now.",
    "Every move is sharper, every risk greater as escalation takes hold.",
    "The arena trembles as the fight escalates to new heights.",
    "Neither side will yield—escalation is the only path forward.",
    "A hush falls as the next exchange promises to change everything."
  ],
  climax: [
    "The battle reaches its zenith—every ounce of strength is spent in this final clash.",
    "A blinding exchange of power marks the climax—victory hangs by a thread.",
    "Both fighters unleash their ultimate techniques in a breathtaking finale.",
    "The arena is transformed by the fury of the climax—no one will forget this moment.",
    "A storm of energy and willpower collides—this is the battle’s true peak.",
    "The climax arrives: a crescendo of fury, skill, and heart.",
    "Every spectator is on their feet as the duel reaches its most dramatic moment.",
    "The final moves are made—history is written in the heat of the climax.",
    "The world seems to hold its breath as the last attacks are exchanged.",
    "The climax is not just a fight—it’s a legend in the making."
  ],
  forcedEnding: [
    "Both fighters have exhausted every tactic—there is nothing left to give.",
    "The battle ends not with a victor, but with mutual respect and exhaustion.",
    "A deadlock is declared—neither side could break the other’s will.",
    "The arena falls silent as the duel ends in a dramatic stalemate.",
    "No winner emerges, but the legend of this battle will endure.",
    "The final exchange leaves both combatants spent, the outcome unresolved.",
    "A forced ending is called—sometimes, the greatest battles have no clear victor.",
    "The story ends not with triumph, but with awe at the warriors’ resolve.",
    "The duel concludes in a draw, but the memory will echo for ages.",
    "Even without a winner, the battle’s climax is unforgettable."
  ]
}; 