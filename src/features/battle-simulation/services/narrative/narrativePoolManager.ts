// CONTEXT: Narrative System, // FOCUS: Narrative Pool Management
import type { NarrativeContext } from './contextualNarrativeMapper';

/**
 * @description Narrative pool configuration for each character and state
 */
export type NarrativePoolConfig = {
  normal: string[];
  patternBreak: string[];
  escalation: string[];
  desperation: string[];
  lateGame: string[];
};

interface NarrativePoolState {
  recentLines: string[];
  maxRecentLines: number;
  tierUsageCounts: Record<string, number>;
  lastUsedLine: string | null;
}

/**
 * @description Manages narrative pools with rotation and shuffling
 */
export class NarrativePoolManager {
  private pools: Record<string, NarrativePoolConfig> = {};
  private currentIndices: Record<string, Record<string, number>> = {};
  private usedNarratives: Record<string, Record<string, string[]>> = {};
  private state: NarrativePoolState = {
    recentLines: [],
    maxRecentLines: 5, // Prevent same line within 5 turns
    tierUsageCounts: {},
    lastUsedLine: null
  };
  private characterStates: Record<string, NarrativePoolState> = {};

  constructor() {
    this.initializePools();
  }

  /**
   * @description Initializes narrative pools for all characters
   */
  private initializePools(): void {
    this.pools = {
      Aang: {
        normal: [
          "A gentle breeze carries Aang's strike to its target",
          "Aang's staff blurs through the air, quick as thought",
          "Aang circles, feet barely touching the ground, looking for an opening",
          "The airbender's movements are fluid, controlled",
          "Aang's airbending flows like water, testing their defenses",
          "His staff flickers, air rippling around the opponent",
          "Aang's strike glances off their guard, his hesitation showing as exhaustion creeps in",
          "The gentle airbender's movements are precise and calculated"
        ],
        patternBreak: [
          "Aang snaps out of his routine, launching a sudden burst of movement",
          "With a twist, Aang shifts his style—Azula is momentarily off-balance",
          "The Avatar's training takes over—his tactics change in an instant",
          "Aang's movements become fluid and unpredictable—he adapts to the changing battle",
          "The predictable exchanges end as Aang changes their approach completely!",
          "Aang snaps out of their pattern, their movements becoming unpredictable!",
          "Aang senses the pattern and consciously chooses to disrupt it!",
          "The airbender's tactics shift—his opponent's predictability becomes his advantage!"
        ],
        escalation: [
          "Aang's strikes become wild, reckless—he's pushing past his limits",
          "With a shout, Aang unleashes his power, no more holding back",
          "Wind whips around the arena as Aang fights for survival",
          "Aang draws upon every lesson of his masters—his power surges forward!",
          "The airbender's movements become more fluid, more unpredictable!",
          "Aang senses the turning tide—his next attack will be his most devastating yet!",
          "The Avatar's training takes over—his airbending reaches new heights of precision!",
          "Aang's stance widens, every muscle quivering with ready energy!"
        ],
        desperation: [
          "Aang fights like a cornered animal—desperate, ferocious!",
          "The gentle airbender's movements become wild, unpredictable—he's fighting for survival!",
          "Aang's staff lashes out, seeking the tiniest weakness—he's beyond technique now!",
          "The Avatar's normally fluid movements become jerky, desperate—he's running on pure instinct!",
          "Aang's airbending becomes chaotic, powerful but uncontrolled—he's fighting like a wounded beast!",
          "Blood on his lip, Aang bares his teeth and charges, heedless of risk!",
          "The airbender fights like a wounded predator—dangerous, but vulnerable!",
          "Aang's normally perfect form falters—he's fighting for survival now!"
        ],
        lateGame: [
          "Aang channels the fury of the storm—his power is unstoppable!",
          "The airbender's movements become pure air—fluid, formless, impossible to pin down!",
          "Aang's staff strikes with the wisdom of his masters—every blow is devastating!",
          "The Avatar's power reaches its peak—his opponent is caught in a whirlwind!",
          "Aang's mastery of airbending is absolute—the arena itself seems to hold its breath!"
        ]
      },
      Azula: {
        normal: [
          "The blue flames test their opponent's resolve",
          "Her fire strikes with controlled precision",
          "Azula's flames dance across their guard",
          "Blue fire licks at the opponent's defenses",
          "Azula's calculated strike finds its mark with devastating effect",
          "The princess's blue fire strikes with deadly accuracy!",
          "Her flames engulf the opponent, searing through their defenses",
          "Blue fire blazes forth, the heat intense and unrelenting"
        ],
        patternBreak: [
          "Azula grows wary of Aang's repeated tactics—she adapts her approach!",
          "The princess recognizes the pattern and consciously disrupts it!",
          "Azula's movements become unpredictable, serpentine—she abandons her old rhythm!",
          "Azula feels the pattern and consciously chooses to disrupt it!",
          "The repetitive rhythm shatters as Azula adapts their fighting style!",
          "Azula's tactics shift—her opponent's predictability becomes her advantage!",
          "The firebender's movements turn unpredictable, serpentine—she abandons her old rhythm!",
          "Azula's focus narrows as she consciously disrupts the established pattern!"
        ],
        escalation: [
          "Azula's eyes flash with renewed determination—her flames burn brighter than ever!",
          "The princess's blue fire intensifies, her normally calculated precision giving way to raw power!",
          "Azula can feel the turning tide—her next attack will be her most devastating yet!",
          "The firebender's movements become more aggressive, her blue flames lashing out with increasing ferocity!",
          "Azula's focus narrows to a razor's edge—she's done playing games!",
          "The arena trembles with anticipation! Azula feels the pressure mounting - it's time to escalate!",
          "Azula's blue fire becomes a storm of destruction!",
          "The princess's flames engulf everything in their path!"
        ],
        desperation: [
          "Blood on her lip, Azula bares her teeth and charges, heedless of risk!",
          "The princess's normally perfect form falters—she's fighting like a cornered animal!",
          "Azula's blue fire sputters and flares unpredictably—she's pushing beyond her limits!",
          "The firebender's movements become reckless, desperate—she has nothing left to lose!",
          "Azula fights like a wounded predator—dangerous, but vulnerable!",
          "The princess fights like a wounded predator—dangerous, but vulnerable!",
          "Azula's normally perfect form falters—she's fighting for survival now!",
          "The firebender's blue fire becomes erratic, powerful but uncontrolled!"
        ],
        lateGame: [
          "Azula's focus narrows to a razor's edge—she's done playing games!",
          "The princess's blue fire becomes a storm of destruction!",
          "Azula's movements are pure precision—every strike calculated to end this!",
          "The firebender's power reaches its peak—her opponent is caught in an inferno!",
          "Azula's mastery of firebending is absolute—the arena itself seems to burn!"
        ]
      }
    };

    // Initialize indices and used narratives for each character
    Object.keys(this.pools).forEach(character => {
      this.currentIndices[character] = {
        normal: 0,
        patternBreak: 0,
        escalation: 0,
        desperation: 0,
        lateGame: 0
      };
      this.usedNarratives[character] = {
        normal: [],
        patternBreak: [],
        escalation: [],
        desperation: [],
        lateGame: []
      };
    });
  }

  /**
   * @description Gets the next narrative from the appropriate pool with improved rotation
   */
  getNarrative(
    character: string,
    state: 'normal' | 'patternBreak' | 'escalation' | 'desperation' | 'lateGame',
    turnNumber: number
  ): string {
    const pool = this.pools[character];
    if (!pool) {
      return `${character} performs their move with determination!`;
    }

    const narratives = pool[state];
    if (!narratives || narratives.length === 0) {
      return `${character} performs their move with determination!`;
    }

    // Check if we need to reset the pool (all narratives used)
    if (this.usedNarratives[character][state].length >= narratives.length) {
      this.resetPool(character, state);
    }

    // Get the next narrative with turn-based variety
    const index = this.currentIndices[character][state];
    let narrative = narratives[index];

    // Add turn-based variety to prevent exact repetition
    if (turnNumber > 10 && Math.random() < 0.3) {
      // 30% chance to add a small variation after turn 10
      const variations = [
        ` ${character} continues their assault.`,
        ` The battle rages on.`,
        ` Their opponent struggles to keep up.`,
        ` The intensity never wanes.`
      ];
      const variation = variations[turnNumber % variations.length];
      narrative += variation;
    }

    // Mark as used and advance index
    this.usedNarratives[character][state].push(narrative);
    this.currentIndices[character][state] = (index + 1) % narratives.length;

    return narrative;
  }

  /**
   * @description Resets a narrative pool (shuffles and clears used list)
   */
  private resetPool(character: string, state: string): void {
    const pool = this.pools[character];
    if (!pool) return;

    const narratives = pool[state as keyof NarrativePoolConfig];
    if (!narratives) return;

    // Shuffle the narratives
    const shuffled = [...narratives].sort(() => Math.random() - 0.5);
    this.pools[character][state as keyof NarrativePoolConfig] = shuffled;

    // Reset index and clear used list
    this.currentIndices[character][state] = 0;
    this.usedNarratives[character][state] = [];
  }

  /**
   * @description Determines the appropriate state for narrative selection
   */
  determineNarrativeState(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _character: string,
    context: {
      isPatternBreak: boolean;
      isEscalation: boolean;
      isDesperation: boolean;
      turnNumber: number;
      characterState: string;
    }
  ): 'normal' | 'patternBreak' | 'escalation' | 'desperation' | 'lateGame' {
    // Late game takes priority (turns 15+)
    if (context.turnNumber >= 15) {
      return 'lateGame';
    }

    // Desperation takes priority
    if (context.isDesperation || context.characterState === 'desperate') {
      return 'desperation';
    }

    // Escalation
    if (context.isEscalation) {
      return 'escalation';
    }

    // Pattern break
    if (context.isPatternBreak) {
      return 'patternBreak';
    }

    // Normal state
    return 'normal';
  }

  /**
   * @description Resets all pools for a new battle
   */
  reset(): void {
    this.initializePools();
  }

  /**
   * @description Gets the current state for debugging
   */
  getState(): Record<string, unknown> {
    return {
      pools: Object.keys(this.pools),
      currentIndices: this.currentIndices,
      usedNarratives: this.usedNarratives
    };
  }

  /**
   * Get a narrative line with anti-repetition logic
   */
  getNarrativeLine(
    characterName: string,
    pool: string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: NarrativeContext,
    tier: number = 1
  ): string {
    // Initialize character state if not exists
    if (!this.characterStates[characterName]) {
      this.characterStates[characterName] = {
        recentLines: [],
        maxRecentLines: 5,
        tierUsageCounts: {},
        lastUsedLine: null
      };
    }

    const characterState = this.characterStates[characterName];
    const tierKey = `${characterName}_tier_${tier}`;
    
    // Filter out recently used lines
    const availableLines = pool.filter(line => 
      !characterState.recentLines.includes(line) &&
      line !== characterState.lastUsedLine
    );

    // If no available lines, expand the search
    const fallbackLines = availableLines.length === 0 ? pool : availableLines;
    
    // Select line with weighted randomness (prefer less used lines)
    const selectedLine = this.selectWeightedLine(fallbackLines, characterState);
    
    // Update state
    characterState.recentLines.push(selectedLine);
    characterState.lastUsedLine = selectedLine;
    characterState.tierUsageCounts[tierKey] = (characterState.tierUsageCounts[tierKey] || 0) + 1;
    
    // Maintain recent lines window
    if (characterState.recentLines.length > characterState.maxRecentLines) {
      characterState.recentLines.shift();
    }

    console.log(`DEBUG: Narrative pool for ${characterName} (tier ${tier}): selected "${selectedLine}" (recent: ${characterState.recentLines.length}/${characterState.maxRecentLines})`);
    
    return selectedLine;
  }

  /**
   * Select line with weighted randomness to prefer less used lines
   */
  private selectWeightedLine(lines: string[], characterState: NarrativePoolState): string {
    if (lines.length === 0) return '';
    
    // Calculate weights (inverse of usage count)
    const weights = lines.map(line => {
      const usageCount = characterState.tierUsageCounts[line] || 0;
      return Math.max(1, 10 - usageCount); // Higher weight for less used lines
    });
    
    // Weighted random selection
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < lines.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return lines[i];
      }
    }
    
    return lines[lines.length - 1];
  }

  /**
   * Reset state for a new battle
   */
  resetForNewBattle(): void {
    this.characterStates = {};
    this.state = {
      recentLines: [],
      maxRecentLines: 5,
      tierUsageCounts: {},
      lastUsedLine: null
    };
    console.log('DEBUG: Narrative pool manager reset for new battle');
  }

  /**
   * Get usage statistics for debugging
   */
  getUsageStats(): Record<string, unknown> {
    const stats: Record<string, unknown> = {};
    
    Object.entries(this.characterStates).forEach(([character, state]) => {
      stats[character] = {
        recentLinesCount: state.recentLines.length,
        tierUsageCounts: state.tierUsageCounts,
        lastUsedLine: state.lastUsedLine
      };
    });
    
    return stats;
  }
}

export const narrativePoolManager = new NarrativePoolManager(); 