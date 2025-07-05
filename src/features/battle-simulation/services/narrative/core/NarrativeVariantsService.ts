// CONTEXT: Narrative Variants Service
// RESPONSIBILITY: Manage micro-variations and reduce repetition in narrative lines

import type { DamageOutcome } from '../types/NarrativeTypes';

/**
 * @description Service for managing narrative variants and reducing repetition
 */
export class NarrativeVariantsService {
  private turnCounters: Map<string, number> = new Map();
  private recentlyUsed: Map<string, string[]> = new Map();
  private lastEscalationTurn: Map<string, number> = new Map();
  private emotionalStates: Map<string, { resolve: number; composure: number }> = new Map();

  // Aang defense line variants with emotional subtext
  private aangDefenseLines = [
    "Aang's airbending flows like water, testing their defenses.",
    "The wind bends to Aang's will, searching for an opening.",
    "A gentle current deflects the blow, calm and unyielding.",
    "Air currents swirl around him, deflecting the attack harmlessly.",
    "His movements are a dance of evasion and redirection.",
    "The wind itself seems to protect the young monk.",
    "Aang's defensive technique is poetry in motion.",
    "The Avatar's defensive stance is unyielding yet gentle.",
    "His training with the monks guides his defensive stance.",
    "The Avatar's calm is tested by the storm within.",
    "He hesitates—then commits with surprising force.",
    "Aang's pacifist nature gives way to determination."
  ];

  // Aang attack aftermath variants with emotional progression
  private aangAttackAftermath = [
    "The airbender's movements are fluid, controlled.",
    "His staff flickers, air rippling around the opponent.",
    "A gentle breeze carries Aang's strike to its target.",
    "The Avatar's training shows in his precise execution.",
    "Aang's airbending mastery is evident.",
    "The young monk's technique is flawless.",
    "His staff strikes with the wisdom of his masters, finding its mark.",
    "Aang's determination fuels his attack.",
    "The Avatar's gentle spirit holds back his fury.",
    "His pacifist nature gives way to determination.",
    "Aang's hope hardens into resolve.",
    "The young monk's movements betray his fatigue."
  ];

  // Azula attack aftermath variants with emotional unraveling
  private azulaAttackAftermath = [
    "Her fire strikes with controlled precision.",
    "The blue flames test their opponent's resolve.",
    "Azula's calculated fury is a weapon in itself.",
    "Her flames dance with deadly grace.",
    "The princess's firebending is poetry of destruction.",
    "Blue fire licks at the opponent's defenses.",
    "Her flames engulf the opponent, searing through their defenses.",
    "Azula's precision is devastating.",
    "Her perfect facade remains unbroken.",
    "Azula's control slips—her fury disrupts her precision.",
    "The princess's composure cracks only for an instant.",
    "Her calculated approach gives way to raw power."
  ];

  // Miss outcome variants
  private missOutcomes = [
    "Aang's attack whips by, stirring only dust.",
    "Azula sidesteps, a ghost in blue fire.",
    "The strike finds only empty air.",
    "The attack is evaded with practiced skill.",
    "The move is anticipated and neutralized.",
    "The opponent reads the attack and counters.",
    "The strike is dodged with effortless precision.",
    "The attack slips past harmlessly.",
    "The strike lacks its usual precision.",
    "The attack is well-executed but anticipated.",
    "The timing is wrong, the strike misses.",
    "The opponent's guard is still up, focus unbroken."
  ];

  // Graze outcome variants
  private grazeOutcomes = [
    "The attack grazes the opponent.",
    "The strike finds purchase but weakly.",
    "The move connects but is quickly recovered from.",
    "The attack lands but fails to penetrate.",
    "The strike connects but is easily blocked.",
    "The move lands but without force.",
    "The attack hits but is partially absorbed.",
    "The strike lands but fails to penetrate.",
    "The blow glances off their defenses.",
    "The attack connects but lacks impact.",
    "The strike finds its mark but weakly.",
    "The move lands but without conviction."
  ];

  // Block outcome variants (fixed duplicate)
  private blockOutcomes = [
    "The attack is blocked at the last moment.",
    "The opponent's guard is still up, focus unbroken.",
    "The strike is parried with expert timing.",
    "The attack is countered with perfect timing.",
    "The move is anticipated and avoided.",
    "The strike is well-executed but anticipated.",
    "The attack is well-executed but anticipated.",
    "The defense holds firm against the assault.",
    "The opponent's reflexes save them.",
    "The attack is deflected with practiced skill.",
    "The strike is neutralized by expert defense.",
    "The move is countered with perfect precision."
  ];

  // Escalation variants with anti-repetition
  private escalationVariants = [
    "The battle escalates with renewed intensity!",
    "The throne room shakes as the benders push past their limits!",
    "The ancient stones bear witness to this escalating conflict!",
    "The air crackles with building tension!",
    "The palace floor trembles with each impact!",
    "The throne room echoes with the sounds of escalating battle!",
    "The very air seems to burn with their fury!",
    "Ancient power resonates through the stones!",
    "The palace walls absorb the intensity of the conflict!",
    "The throne room becomes a crucible of destiny!",
    "The battle reaches new heights of intensity!",
    "The conflict escalates beyond all expectations!"
  ];

  /**
   * @description Initialize character emotional state
   */
  initializeCharacter(characterName: string): void {
    this.emotionalStates.set(characterName, { resolve: 5, composure: 5 });
    this.lastEscalationTurn.set(characterName, -3);
    this.recentlyUsed.set(characterName, []);
  }

  /**
   * @description Update emotional state based on battle events
   */
  updateEmotionalState(characterName: string, event: string): void {
    const state = this.emotionalStates.get(characterName);
    if (!state) return;

    if (event === 'miss' && characterName.toLowerCase().includes('aang')) {
      state.resolve -= 1;
    } else if (event === 'high_damage_taken' && characterName.toLowerCase().includes('azula')) {
      state.composure -= 2;
    } else if (event === 'hit' && characterName.toLowerCase().includes('aang')) {
      state.resolve += 1;
    } else if (event === 'critical' && characterName.toLowerCase().includes('azula')) {
      state.composure -= 1;
    }

    // Clamp values
    state.resolve = Math.max(-5, Math.min(5, state.resolve));
    state.composure = Math.max(-5, Math.min(5, state.composure));
  }

  /**
   * @description Get cycled variant with anti-repetition
   */
  private getCycledVariant(pool: string[], characterName: string, turnNumber: number): string {
    const recentlyUsed = this.recentlyUsed.get(characterName) || [];
    const availableLines = pool.filter(line => !recentlyUsed.includes(line));
    
    if (availableLines.length === 0) {
      // Reset if all lines have been used
      this.recentlyUsed.set(characterName, []);
      return pool[turnNumber % pool.length];
    }
    
    const selectedLine = availableLines[turnNumber % availableLines.length];
    recentlyUsed.push(selectedLine);
    
    // Keep only last 5 used lines
    if (recentlyUsed.length > 5) {
      recentlyUsed.shift();
    }
    
    this.recentlyUsed.set(characterName, recentlyUsed);
    return selectedLine;
  }

  /**
   * @description Get cycled variant for Aang defense with emotional state
   */
  getAangDefenseLine(characterName: string, turnNumber: number): string {
    const state = this.emotionalStates.get(characterName);
    const baseLine = this.getCycledVariant(this.aangDefenseLines, characterName, turnNumber);
    
    if (state && state.resolve <= 0) {
      return `${baseLine} His movements betray his fatigue.`;
    } else if (state && state.resolve >= 3) {
      return `${baseLine} His determination is unshakeable.`;
    }
    
    return baseLine;
  }

  /**
   * @description Get cycled variant for Aang attack aftermath with emotional state
   */
  getAangAttackAftermath(characterName: string, turnNumber: number): string {
    const state = this.emotionalStates.get(characterName);
    const baseLine = this.getCycledVariant(this.aangAttackAftermath, characterName, turnNumber);
    
    if (state && state.resolve <= -3) {
      return `${baseLine} His pacifist nature struggles against the conflict.`;
    } else if (state && state.resolve >= 3) {
      return `${baseLine} His resolve hardens with each strike.`;
    }
    
    return baseLine;
  }

  /**
   * @description Get cycled variant for Azula attack aftermath with emotional state
   */
  getAzulaAttackAftermath(characterName: string, turnNumber: number): string {
    const state = this.emotionalStates.get(characterName);
    const baseLine = this.getCycledVariant(this.azulaAttackAftermath, characterName, turnNumber);
    
    if (state && state.composure <= -3) {
      return `${baseLine} Her perfect facade begins to crack.`;
    } else if (state && state.composure >= 3) {
      return `${baseLine} Her control remains absolute.`;
    }
    
    return baseLine;
  }

  /**
   * @description Get miss outcome variant
   */
  getMissOutcome(): string {
    return this.missOutcomes[Math.floor(Math.random() * this.missOutcomes.length)];
  }

  /**
   * @description Get graze outcome variant
   */
  getGrazeOutcome(): string {
    return this.grazeOutcomes[Math.floor(Math.random() * this.grazeOutcomes.length)];
  }

  /**
   * @description Get block outcome variant
   */
  getBlockOutcome(): string {
    return this.blockOutcomes[Math.floor(Math.random() * this.blockOutcomes.length)];
  }

  /**
   * @description Get escalation variant with anti-repetition
   */
  getEscalationVariant(characterName: string, turnNumber: number, damage: number): string | null {
    const lastTurn = this.lastEscalationTurn.get(characterName) || -3;
    
    // Only escalate if enough turns have passed and damage threshold is met
    if (turnNumber - lastTurn > 2 && damage > 10) {
      this.lastEscalationTurn.set(characterName, turnNumber);
      return this.escalationVariants[Math.floor(Math.random() * this.escalationVariants.length)];
    }
    
    return null;
  }

  /**
   * @description Get character-specific attack aftermath based on turn and emotional state
   */
  getCharacterAttackAftermath(characterName: string, turnNumber: number): string {
    if (characterName.toLowerCase().includes('aang')) {
      return this.getAangAttackAftermath(characterName, turnNumber);
    } else if (characterName.toLowerCase().includes('azula')) {
      return this.getAzulaAttackAftermath(characterName, turnNumber);
    }
    return "The attack connects with solid force.";
  }

  /**
   * @description Get damage outcome variant
   */
  getDamageOutcomeVariant(damageOutcome: DamageOutcome): string {
    switch (damageOutcome) {
      case 'miss':
        return this.getMissOutcome();
      case 'glance':
        return this.getGrazeOutcome();
      case 'hit':
        return this.getBlockOutcome();
      default:
        return "The attack connects with solid force.";
    }
  }

  /**
   * @description Reset all tracking for new battle
   */
  resetCounters(): void {
    this.turnCounters.clear();
    this.recentlyUsed.clear();
    this.lastEscalationTurn.clear();
    this.emotionalStates.clear();
  }

  /**
   * @description Get emotional state summary
   */
  getEmotionalState(characterName: string): { resolve: number; composure: number } | null {
    return this.emotionalStates.get(characterName) || null;
  }

  public getEnvironmentalContext(turnNumber: number): string {
    const contexts = [
      'The ancient stones bear witness to this clash.',
      'Shadows dance across the throne room walls.',
      'The air crackles with elemental energy.',
      'The palace floor trembles with each impact.',
      'The throne room echoes with the sounds of battle.',
      'Flames illuminate the chamber with flickering light.',
      'The very air seems to burn with their fury.',
      'Ancient power resonates through the stones.',
      'The palace walls absorb the intensity of the conflict.',
      'The throne room becomes a crucible of destiny.'
    ];
    return contexts[turnNumber % contexts.length];
  }

  public getVictoryEnvironmentalContext(): string {
    const contexts = [
      'The throne room falls silent, the echoes of battle fading.',
      'The palace itself seems to acknowledge the victor.',
      'The ancient stones bear witness to this outcome.',
      'The throne room becomes a monument to the victor\'s will.',
      'The palace walls seem to bow to the victor\'s power.',
      'The very foundation of the Fire Nation Capital resonates.',
      'The throne room becomes a testament to the victor\'s strength.',
      'The palace itself seems to celebrate the victor\'s triumph.',
      'The ancient power of the Fire Nation acknowledges the victor.',
      'The throne room becomes a stage for this moment of destiny.'
    ];
    return contexts[Math.floor(Math.random() * contexts.length)];
  }
} 