// NarrativeMemoryManager.ts
// Handles all phrase memory, cooldown, and anti-repetition logic for narrative system

export class NarrativeMemoryManager {
  private phraseMemory: Map<string, Map<string, number>> = new Map();
  private battlePhraseMemory: Set<string> = new Set();
  private battlePhraseCooldown: number = 8; // Reduced from 12 for more variety
  private battlePhraseHistory: Map<string, number> = new Map();
  private turnNumber: number = 0;
  
  // Enhanced tracking for different narrative types
  private emotionalPhraseMemory: Map<string, Set<string>> = new Map();
  private technicalPhraseMemory: Map<string, Set<string>> = new Map();
  private environmentalPhraseMemory: Map<string, Set<string>> = new Map();

  setTurn(turn: number) {
    this.turnNumber = turn;
  }

  reset() {
    this.phraseMemory.clear();
    this.battlePhraseMemory.clear();
    this.battlePhraseHistory.clear();
    this.turnNumber = 0;
    this.emotionalPhraseMemory.clear();
    this.technicalPhraseMemory.clear();
    this.environmentalPhraseMemory.clear();
  }

  initializeCharacter(characterName: string) {
    this.phraseMemory.set(characterName, new Map());
    this.emotionalPhraseMemory.set(characterName, new Set());
    this.technicalPhraseMemory.set(characterName, new Set());
    this.environmentalPhraseMemory.set(characterName, new Set());
  }

  canUsePhrase(characterName: string, phrase: string, cooldown: number = 3): boolean {
    const characterMemory = this.phraseMemory.get(characterName);
    if (!characterMemory) return true;
    const lastUsed = characterMemory.get(phrase);
    return !lastUsed || this.turnNumber - lastUsed > cooldown;
  }

  usePhrase(characterName: string, phrase: string) {
    let characterMemory = this.phraseMemory.get(characterName);
    if (!characterMemory) {
      characterMemory = new Map();
      this.phraseMemory.set(characterName, characterMemory);
    }
    characterMemory.set(phrase, this.turnNumber);
  }

  canUseBattlePhrase(phrase: string): boolean {
    return !this.battlePhraseMemory.has(phrase);
  }

  useBattlePhrase(phrase: string) {
    this.battlePhraseMemory.add(phrase);
  }

  getAvailablePhrase(pool: string[], characterName: string): string {
    // First try to get a phrase that hasn't been used in this battle
    const unusedPhrases = pool.filter(phrase => !this.battlePhraseMemory.has(phrase));
    if (unusedPhrases.length > 0) {
      const chosen = unusedPhrases[Math.floor(Math.random() * unusedPhrases.length)];
      this.battlePhraseMemory.add(chosen);
      this.usePhrase(characterName, chosen);
      return chosen;
    }
    
    // If all phrases have been used, check battle-wide cooldown
    const now = this.turnNumber;
    const availableByCooldown = pool.filter(phrase => {
      const lastUsed = this.battlePhraseHistory.get(phrase) || 0;
      return now - lastUsed >= this.battlePhraseCooldown;
    });
    
    if (availableByCooldown.length > 0) {
      const chosen = availableByCooldown[Math.floor(Math.random() * availableByCooldown.length)];
      this.battlePhraseHistory.set(chosen, now);
      this.usePhrase(characterName, chosen);
      return chosen;
    }
    
    // If all are on cooldown, pick the least recently used
    let oldest = pool[0];
    let oldestTurn = this.battlePhraseHistory.get(oldest) || 0;
    for (const phrase of pool) {
      const lastUsed = this.battlePhraseHistory.get(phrase) || 0;
      if (lastUsed < oldestTurn) {
        oldest = phrase;
        oldestTurn = lastUsed;
      }
    }
    this.battlePhraseHistory.set(oldest, now);
    this.usePhrase(characterName, oldest);
    return oldest;
  }

  /**
   * @description Get available phrase with enhanced anti-repetition for specific narrative types
   */
  getAvailablePhraseByType(pool: string[], characterName: string, type: 'emotional' | 'technical' | 'environmental'): string {
    const typeMemory = this.getTypeMemory(type);
    const characterTypeMemory = typeMemory.get(characterName) || new Set();
    
    // First try to get a phrase that hasn't been used for this type
    const unusedPhrases = pool.filter(phrase => !characterTypeMemory.has(phrase));
    if (unusedPhrases.length > 0) {
      const chosen = unusedPhrases[Math.floor(Math.random() * unusedPhrases.length)];
      characterTypeMemory.add(chosen);
      typeMemory.set(characterName, characterTypeMemory);
      this.usePhrase(characterName, chosen);
      return chosen;
    }
    
    // If all phrases have been used for this type, fall back to general anti-repetition
    return this.getAvailablePhrase(pool, characterName);
  }

  /**
   * @description Get the appropriate type memory map
   */
  private getTypeMemory(type: 'emotional' | 'technical' | 'environmental'): Map<string, Set<string>> {
    switch (type) {
      case 'emotional':
        return this.emotionalPhraseMemory;
      case 'technical':
        return this.technicalPhraseMemory;
      case 'environmental':
        return this.environmentalPhraseMemory;
      default:
        return this.emotionalPhraseMemory;
    }
  }

  /**
   * @description Check if a phrase is available for a specific type
   */
  canUsePhraseByType(characterName: string, phrase: string, type: 'emotional' | 'technical' | 'environmental'): boolean {
    const typeMemory = this.getTypeMemory(type);
    const characterTypeMemory = typeMemory.get(characterName);
    return !characterTypeMemory || !characterTypeMemory.has(phrase);
  }
} 