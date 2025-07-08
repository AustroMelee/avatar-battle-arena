// @file aiRuleRegistry.service.ts
// @description SINGLE SOURCE OF TRUTH for AI behavior. This registry loads all
// character-specific AI rule sets and provides them to the AI engine on demand.
// This decouples the AI engine from specific character implementations.

import { AIRule } from '../types/AIBehavior';
import { aangAIRules } from './aangRules';
import { azulaAIRules } from './azulaRules';

class AIRuleRegistryService {
  private ruleSets: Map<string, AIRule[]>;

  constructor() {
    this.ruleSets = new Map();
    this.register('aang', aangAIRules);
    this.register('azula', azulaAIRules);
    // To add a new character's AI, simply add a new line here:
    // this.register('zuko', zukoAIRules);
  }

  /**
   * Registers an AI rule set, ensuring the key is lowercase.
   */
  public register(characterId: string, rules: AIRule[]): void {
    if (!characterId) return;
    this.ruleSets.set(characterId.toLowerCase(), rules); // ENFORCE LOWERCASE
  }

  /**
   * Retrieves an AI rule set using a lowercase key.
   */
  public getRules(characterId: string): AIRule[] {
    if (!characterId) return this.ruleSets.get('azula') || [];
    const rules = this.ruleSets.get(characterId.toLowerCase()); // ENFORCE LOWERCASE
    if (!rules) {
      console.warn(`[AI] No rule set found for character ID "${characterId}". Using default (Azula).`);
      // Fallback to a default rule set to prevent crashes.
      return this.ruleSets.get('azula') || [];
    }
    return rules;
  }
}

// Export a singleton instance of the registry
export const AIRuleRegistry = new AIRuleRegistryService(); 