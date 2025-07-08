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