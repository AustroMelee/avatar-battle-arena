// CONTEXT: Aang Character Narrative Service
// RESPONSIBILITY: Generate character-specific narrative for Aang

import type { NarrativeContext } from '../../types/NarrativeTypes';

/**
 * @description Service for generating Aang-specific narrative lines
 */
export class AangNarrativeService {
  private recentlyUsed: Map<string, string[]> = new Map();
  private emotionalState: { resolve: number; determination: number } = { resolve: 5, determination: 5 };

  // Aang-specific miss lines with emotional progression
  private missLines = [
    "Aang's attack whips by, stirring only dust.",
    "The young monk's strike finds only empty air.",
    "His staff flickers but misses its mark.",
    "The Avatar's gentle approach leaves an opening.",
    "Aang hesitates—the moment passes.",
    "His pacifist nature holds back the strike.",
    "The airbender's attack is too gentle.",
    "His training emphasizes restraint over force.",
    "The young monk's hesitation costs him.",
    "Aang's strike lacks conviction.",
    "His movements betray his inner conflict.",
    "The Avatar's attack is too controlled."
  ];

  // Aang-specific hit lines with emotional depth
  private hitLines = [
    "Aang flows like water, staff flickering—his strike snaps across their shoulder, stinging pride and skin alike.",
    "The Avatar's training shows in his precise execution—the blow lands with controlled force.",
    "His staff strikes with the wisdom of his masters, finding its mark with gentle precision.",
    "Aang's airbending mastery is evident—the attack connects with fluid grace.",
    "The young monk's technique is flawless—his strike finds its target.",
    "His determination fuels his attack—the blow lands with surprising force.",
    "Aang's movements are poetry in motion—the strike connects with elegant precision.",
    "The Avatar's resolve hardens—his attack strikes true.",
    "His pacifist nature gives way to determination—the blow lands with controlled fury.",
    "Aang's hope hardens into resolve—his strike finds its mark.",
    "The young monk's movements betray his fatigue—yet the attack still connects.",
    "His gentle spirit holds back his fury—but the strike still lands."
  ];

  // Aang-specific escalation lines
  private escalationLines = [
    "The Avatar's gentle spirit holds back his fury... pacifist nature gives way to determination.",
    "Aang's training with the monks guides his hand, but the conflict tests his resolve.",
    "The young monk's movements betray his fatigue—the strike lacks its usual precision.",
    "His pacifist nature struggles against the conflict, yet he fights on.",
    "The Avatar's calm is tested by the storm within.",
    "Aang's hope hardens into resolve with each passing moment.",
    "The young monk's hesitation gives way to determination.",
    "His gentle approach is tempered by the urgency of battle.",
    "The Avatar's movements become more focused, more determined.",
    "Aang's pacifist nature gives way to the necessity of action.",
    "The young monk's resolve strengthens with each exchange.",
    "His gentle spirit is tested by the intensity of the conflict."
  ];

  // Aang-specific desperation lines
  private desperationLines = [
    "Aang's movements betray his exhaustion—yet he fights on.",
    "The Avatar's gentle spirit is pushed to its limits.",
    "His pacifist nature struggles against the desperate need to survive.",
    "The young monk's fatigue shows in every movement.",
    "Aang's hope flickers but refuses to die.",
    "His determination is tested by the overwhelming odds.",
    "The Avatar's resolve is pushed to the breaking point.",
    "Aang's gentle nature is forced to embrace the fight.",
    "The young monk's movements become desperate, yet controlled.",
    "His pacifist heart is tested by the brutal reality of battle.",
    "Aang's hope hardens into desperate determination.",
    "The Avatar's gentle spirit is forced to become fierce."
  ];

  // Aang-specific victory lines
  private victoryLines = [
    "Aang's gentle spirit triumphs over violence.",
    "The Avatar's pacifist nature proves its strength.",
    "His hope and determination carry him to victory.",
    "The young monk's training serves him well.",
    "Aang's gentle approach proves effective.",
    "The Avatar's resolve leads to triumph.",
    "His pacifist heart guides him to success.",
    "The young monk's determination pays off.",
    "Aang's hope and courage bring victory.",
    "The Avatar's gentle strength prevails.",
    "His pacifist nature proves its worth.",
    "The young monk's resolve leads to triumph."
  ];

  // Aang-specific defeat lines
  private defeatLines = [
    "Aang's gentle spirit is overwhelmed by the conflict.",
    "The Avatar's pacifist nature proves his undoing.",
    "His hope flickers and dies in the face of defeat.",
    "The young monk's gentle approach fails him.",
    "Aang's pacifist heart cannot overcome the odds.",
    "The Avatar's gentle nature leads to his downfall.",
    "His hope and determination are not enough.",
    "The young monk's resolve is broken.",
    "Aang's gentle spirit is crushed by defeat.",
    "The Avatar's pacifist nature proves insufficient.",
    "His hope is extinguished by the harsh reality.",
    "The young monk's gentle heart cannot prevail."
  ];

  // Expanded move-specific flavor pools
  private moveFlavors: Record<string, string[]> = {
    'Air Glide': [
      "Aang spins low, wind snaking between Azula's feet.",
      "He leaps, gliding just out of reach.",
      "Aang's airbending lets him float above the fray.",
      "A gentle breeze carries Aang's strike to its target.",
      "His staff flickers, air rippling around the opponent.",
      "Aang flows like water, staff flickering—his strike snaps across their shoulder, stinging pride and skin alike."
    ],
    'Wind Slice': [
      "A sharp current rips through the throne room, cutting with a surgeon's precision.",
      "Aang whips his staff, sending a blade of air at Azula.",
      "The air shreds forward, slicing through the tension.",
      "A razor-thin blast tears the dust from the throne room floor.",
      "Aang's hands whip the air into a shimmering blade.",
      "The wind becomes a weapon in Aang's skilled hands."
    ],
    'Air Blast': [
      "Aang channels the wind into a focused blast.",
      "The air itself becomes his weapon.",
      "A concentrated gust strikes with precision.",
      "The wind responds to Aang's gentle command.",
      "Air ripples outward from Aang's staff.",
      "The breeze becomes a battering ram."
    ],
    'Staff Strike': [
      "Aang's staff finds its mark with monk precision.",
      "The wooden staff strikes with controlled force.",
      "His training shows in every staff movement.",
      "The staff becomes an extension of Aang's will.",
      "Monk discipline guides the staff's path.",
      "The staff strikes with the wisdom of his masters."
    ]
  };

  /**
   * @description Initialize Aang's narrative state
   */
  initialize(): void {
    this.recentlyUsed.clear();
    this.emotionalState = { resolve: 5, determination: 5 };
  }

  /**
   * @description Update emotional state based on battle events
   */
  updateEmotionalState(event: string, _damage: number): void {
    if (event === 'miss') {
      this.emotionalState.resolve -= 1;
      this.emotionalState.determination -= 1;
    } else if (event === 'hit') {
      this.emotionalState.resolve += 1;
      this.emotionalState.determination += 1;
    } else if (event === 'high_damage_taken') {
      this.emotionalState.resolve -= 2;
      this.emotionalState.determination += 2; // Becomes more determined
    }

    // Clamp values
    this.emotionalState.resolve = Math.max(-5, Math.min(5, this.emotionalState.resolve));
    this.emotionalState.determination = Math.max(-5, Math.min(5, this.emotionalState.determination));
  }

  /**
   * @description Get cycled variant with aggressive anti-repetition
   */
  private getCycledVariant(pool: string[], category: string): string {
    const recentlyUsed = this.recentlyUsed.get(category) || [];
    const availableLines = pool.filter(line => !recentlyUsed.includes(line));
    
    if (availableLines.length === 0) {
      // Reset if all lines have been used
      this.recentlyUsed.set(category, []);
      return pool[Math.floor(Math.random() * pool.length)];
    }
    
    const selectedLine = availableLines[Math.floor(Math.random() * availableLines.length)];
    recentlyUsed.push(selectedLine);
    
    // Keep only last 3 used lines (reduced from 5)
    if (recentlyUsed.length > 3) {
      recentlyUsed.shift();
    }
    
    this.recentlyUsed.set(category, recentlyUsed);
    return selectedLine;
  }

  /**
   * @description Get miss line with emotional state (simplified)
   */
  getMissLine(): string {
    const emotionalState = this.getEmotionalState();
    
    // Use emotional state to select appropriate miss line
    if (emotionalState.resolve <= 2) {
      // Low resolve - more hesitant, conflicted lines
      const lowResolveLines = [
        "Aang hesitates—the moment passes.",
        "His pacifist nature holds back the strike.",
        "The young monk's hesitation costs him.",
        "Aang's strike lacks conviction.",
        "His movements betray his inner conflict."
      ];
      return this.getCycledVariant(lowResolveLines, 'miss_low_resolve');
    } else if (emotionalState.determination >= 3) {
      // High determination - more focused, controlled lines
      const highDeterminationLines = [
        "Aang's attack whips by, stirring only dust.",
        "The young monk's strike finds only empty air.",
        "His staff flickers but misses its mark.",
        "The Avatar's gentle approach leaves an opening.",
        "The airbender's attack is too gentle."
      ];
      return this.getCycledVariant(highDeterminationLines, 'miss_high_determination');
    } else {
      // Balanced state - standard miss lines
      return this.getCycledVariant(this.missLines, 'miss');
    }
  }

  /**
   * @description Get hit line with emotional state
   */
  getHitLine(): string {
    const emotionalState = this.getEmotionalState();
    
    // Use emotional state to select appropriate hit line
    if (emotionalState.determination >= 4) {
      // High determination - more forceful, resolved lines
      const highDeterminationLines = [
        "Aang's determination fuels his attack—the blow lands with surprising force.",
        "His pacifist nature gives way to determination—the blow lands with controlled fury.",
        "Aang's hope hardens into resolve—his strike finds its mark.",
        "The Avatar's resolve hardens—his attack strikes true.",
        "His gentle spirit holds back his fury—but the strike still lands."
      ];
      return this.getCycledVariant(highDeterminationLines, 'hit_high_determination');
    } else if (emotionalState.resolve <= 2) {
      // Low resolve - more gentle, controlled lines
      const lowResolveLines = [
        "Aang flows like water, staff flickering—his strike snaps across their shoulder, stinging pride and skin alike.",
        "The Avatar's training shows in his precise execution—the blow lands with controlled force.",
        "His staff strikes with the wisdom of his masters, finding its mark with gentle precision.",
        "Aang's airbending mastery is evident—the attack connects with fluid grace.",
        "The young monk's technique is flawless—his strike finds its target."
      ];
      return this.getCycledVariant(lowResolveLines, 'hit_low_resolve');
    } else {
      // Balanced state - standard hit lines
      return this.getCycledVariant(this.hitLines, 'hit');
    }
  }

  /**
   * @description Get escalation line with emotional state
   */
  getEscalationLine(_context: NarrativeContext): string {
    const emotionalState = this.getEmotionalState();
    
    // Use emotional state to select appropriate escalation line
    if (emotionalState.determination >= 4) {
      // High determination - more resolved escalation
      const highDeterminationLines = [
        "Aang's hope hardens into resolve with each passing moment.",
        "The young monk's hesitation gives way to determination.",
        "His gentle approach is tempered by the urgency of battle.",
        "The Avatar's movements become more focused, more determined.",
        "Aang's pacifist nature gives way to the necessity of action."
      ];
      return this.getCycledVariant(highDeterminationLines, 'escalation_high_determination');
    } else if (emotionalState.resolve <= 2) {
      // Low resolve - more conflicted escalation
      const lowResolveLines = [
        "The Avatar's gentle spirit holds back his fury... pacifist nature gives way to determination.",
        "Aang's training with the monks guides his hand, but the conflict tests his resolve.",
        "The young monk's movements betray his fatigue—the strike lacks its usual precision.",
        "His pacifist nature struggles against the conflict, yet he fights on.",
        "The Avatar's calm is tested by the storm within."
      ];
      return this.getCycledVariant(lowResolveLines, 'escalation_low_resolve');
    } else {
      // Balanced state - standard escalation lines
      return this.getCycledVariant(this.escalationLines, 'escalation');
    }
  }

  /**
   * @description Get desperation line with emotional state
   */
  getDesperationLine(): string {
    const emotionalState = this.getEmotionalState();
    
    // Use emotional state to select appropriate desperation line
    if (emotionalState.determination >= 3) {
      // High determination - more resolved desperation
      const highDeterminationLines = [
        "Aang's hope flickers but refuses to die.",
        "His determination is tested by the overwhelming odds.",
        "The Avatar's resolve is pushed to the breaking point.",
        "Aang's gentle nature is forced to embrace the fight.",
        "The young monk's movements become desperate, yet controlled."
      ];
      return this.getCycledVariant(highDeterminationLines, 'desperation_high_determination');
    } else {
      // Low determination - more broken desperation
      const lowDeterminationLines = [
        "Aang's movements betray his exhaustion—yet he fights on.",
        "The Avatar's gentle spirit is pushed to its limits.",
        "His pacifist nature struggles against the desperate need to survive.",
        "The young monk's fatigue shows in every movement.",
        "Aang's pacifist heart is tested by the brutal reality of battle."
      ];
      return this.getCycledVariant(lowDeterminationLines, 'desperation_low_determination');
    }
  }

  /**
   * @description Get victory line with emotional state
   */
  getVictoryLine(): string {
    const baseLine = this.getCycledVariant(this.victoryLines, 'victory');
    
    if (this.emotionalState.resolve <= -3) {
      return `${baseLine} His gentle spirit triumphs despite the conflict.`;
    } else if (this.emotionalState.determination >= 3) {
      return `${baseLine} His determined resolve leads to victory.`;
    }
    
    return baseLine;
  }

  /**
   * @description Get defeat line with emotional state
   */
  getDefeatLine(): string {
    const baseLine = this.getCycledVariant(this.defeatLines, 'defeat');
    
    if (this.emotionalState.resolve <= -3) {
      return `${baseLine} His gentle spirit is overwhelmed by the conflict.`;
    } else if (this.emotionalState.determination >= 3) {
      return `${baseLine} Even his determination cannot overcome the odds.`;
    }
    
    return baseLine;
  }

  /**
   * @description Get emotional state summary
   */
  getEmotionalState(): { resolve: number; determination: number } {
    return { ...this.emotionalState };
  }

  /**
   * @description Get move-specific flavor for Aang
   */
  getMoveFlavor(moveName: string, _damageOutcome: string): string | null {
    const pool = this.moveFlavors[moveName];
    if (!pool) return null;
    
    // Get a random line from the move-specific pool
    const selectedLine = pool[Math.floor(Math.random() * pool.length)];
    
    // Add emotional state modifier if applicable
    if (this.emotionalState.resolve <= -3) {
      return `${selectedLine} His movements betray his inner conflict.`;
    } else if (this.emotionalState.determination >= 3) {
      return `${selectedLine} His determination remains unshakeable.`;
    }
    
    return selectedLine;
  }
} 