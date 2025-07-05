// CONTEXT: Azula Character Narrative Service
// RESPONSIBILITY: Generate character-specific narrative for Azula

import type { NarrativeContext } from '../../types/NarrativeTypes';

/**
 * @description Service for generating Azula-specific narrative lines
 */
export class AzulaNarrativeService {
  private recentlyUsed: Map<string, string[]> = new Map();
  private emotionalState: { composure: number; control: number } = { composure: 5, control: 5 };

  // Azula-specific miss lines with emotional unraveling
  private missLines = [
    "Azula sidesteps, a ghost in blue fire.",
    "Her calculated strike finds only empty air.",
    "The princess's precision fails her for once.",
    "Her blue flames dance but miss their mark.",
    "Azula's control slips—her fury disrupts her precision.",
    "The perfect facade cracks—the strike goes wide.",
    "Her calculated approach fails to find its target.",
    "The princess's composure wavers—the attack misses.",
    "Azula's control is tested—the strike lacks precision.",
    "Her perfect timing is off—the attack goes astray.",
    "The princess's fury disrupts her calculated strike.",
    "Her control slips—the attack finds only air."
  ];

  // Azula-specific hit lines with emotional depth
  private hitLines = [
    "Azula's blue fire strikes with controlled precision.",
    "Her flames dance with deadly grace, finding their mark.",
    "The princess's calculated fury is a weapon in itself.",
    "Her blue flames test their opponent's resolve.",
    "Azula's firebending is poetry of destruction.",
    "Her flames engulf the opponent, searing through their defenses.",
    "The princess's precision is devastating.",
    "Her control remains absolute—the strike lands perfectly.",
    "Azula's perfect facade remains unbroken—the attack connects.",
    "Her calculated approach proves effective.",
    "The princess's composure serves her well.",
    "Her control is tested but remains firm."
  ];

  // Azula-specific escalation lines
  private escalationLines = [
    "Azula's control slips—her fury disrupts her precision.",
    "The princess's perfect facade cracks only for an instant.",
    "Her calculated approach gives way to raw power.",
    "Azula's composure is tested by the escalating conflict.",
    "The princess's control remains absolute despite the chaos.",
    "Her perfect facade begins to show cracks.",
    "Azula's fury threatens to burn away discipline.",
    "The princess's composure is pushed to its limits.",
    "Her calculated nature is tested by the intensity.",
    "Azula's control is challenged by the escalating battle.",
    "The princess's perfect facade is tested by the conflict.",
    "Her composure remains unshakeable despite the chaos."
  ];

  // Azula-specific desperation lines
  private desperationLines = [
    "Azula's perfect facade finally cracks under pressure.",
    "The princess's control slips—her fury takes over.",
    "Her calculated approach gives way to desperation.",
    "Azula's composure is shattered by the overwhelming odds.",
    "The princess's perfect facade is broken.",
    "Her control is lost to the desperate need to survive.",
    "Azula's fury becomes her only weapon.",
    "The princess's composure is overwhelmed by desperation.",
    "Her calculated nature is forced to embrace chaos.",
    "Azula's perfect facade is destroyed by the conflict.",
    "The princess's control is broken by desperation.",
    "Her composure is shattered by the brutal reality."
  ];

  // Azula-specific victory lines
  private victoryLines = [
    "Azula's perfect facade remains unbroken in victory.",
    "The princess's control proves its worth.",
    "Her calculated approach leads to triumph.",
    "Azula's composure serves her well.",
    "The princess's precision brings victory.",
    "Her control remains absolute.",
    "Azula's perfect facade is vindicated.",
    "The princess's calculated nature prevails.",
    "Her composure leads to success.",
    "Azula's control proves superior.",
    "The princess's precision triumphs.",
    "Her perfect facade is justified."
  ];

  // Azula-specific defeat lines
  private defeatLines = [
    "Azula's perfect facade is finally shattered.",
    "The princess's control proves insufficient.",
    "Her calculated approach fails her.",
    "Azula's composure is broken by defeat.",
    "The princess's precision is not enough.",
    "Her control is overwhelmed by the odds.",
    "Azula's perfect facade is destroyed.",
    "The princess's calculated nature fails.",
    "Her composure is shattered by defeat.",
    "Azula's control proves inadequate.",
    "The princess's precision is overcome.",
    "Her perfect facade is finally broken."
  ];

  // Expanded move-specific flavor pools
  private moveFlavors: Record<string, string[]> = {
    'Blue Fire': [
      "Azula conjures blue fire, her signature attack blazing across the throne room.",
      "A torrent of blue flame surges from Azula's fingertips.",
      "Her blue fire crackles, burning with unnatural intensity.",
      "Blue fire licks at the opponent's defenses.",
      "The blue flames test their opponent's resolve.",
      "Azula's blue fire strikes with controlled precision."
    ],
    'Lightning Arc': [
      "Azula channels lightning, the air humming with raw power.",
      "A jagged bolt of lightning leaps from Azula's hand.",
      "She unleashes a precise arc of lightning at her foe.",
      "Lightning crackles around Azula's fingertips.",
      "The air itself seems to burn with their fury.",
      "Electricity dances at Azula's command."
    ],
    'Fire Blast': [
      "Azula's fire strikes with controlled precision.",
      "The princess's calculated fury is precise.",
      "Her fire strikes with controlled precision.",
      "Azula's control remains unshakeable.",
      "The Fire Nation heir's control is absolute.",
      "Her calculated approach shows mastery."
    ],
    'Precision Strike': [
      "Azula's calculated strike finds only empty air.",
      "Her perfect timing is off—the attack goes astray.",
      "The princess's precision fails her for once.",
      "Her calculated approach fails to find its target.",
      "The perfect facade cracks—the strike goes wide.",
      "The princess's composure wavers—the attack misses."
    ]
  };

  /**
   * @description Initialize Azula's narrative state
   */
  initialize(): void {
    this.recentlyUsed.clear();
    this.emotionalState = { composure: 5, control: 5 };
  }

  /**
   * @description Update emotional state based on battle events
   */
  updateEmotionalState(event: string): void {
    if (event === 'miss') {
      this.emotionalState.composure -= 1;
      this.emotionalState.control -= 1;
    } else if (event === 'hit') {
      this.emotionalState.composure += 1;
      this.emotionalState.control += 1;
    } else if (event === 'high_damage_taken') {
      this.emotionalState.composure -= 2;
      this.emotionalState.control -= 2;
    } else if (event === 'critical') {
      this.emotionalState.composure -= 1;
      this.emotionalState.control -= 1;
    }

    // Clamp values
    this.emotionalState.composure = Math.max(-5, Math.min(5, this.emotionalState.composure));
    this.emotionalState.control = Math.max(-5, Math.min(5, this.emotionalState.control));
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
   * @description Get miss line with emotional state
   */
  getMissLine(): string {
    const emotionalState = this.getEmotionalState();
    
    // Use emotional state to select appropriate miss line
    if (emotionalState.control <= 2) {
      // Low control - more uncontrolled, furious lines
      const lowControlLines = [
        "Azula's control slips—her fury disrupts her precision.",
        "The perfect facade cracks—the strike goes wide.",
        "The princess's fury disrupts her calculated strike.",
        "Her control slips—the attack finds only air.",
        "Azula's control is tested—the strike lacks precision."
      ];
      return this.getCycledVariant(lowControlLines, 'miss_low_control');
    } else if (emotionalState.composure >= 3) {
      // High composure - more controlled, calculated lines
      const highComposureLines = [
        "Azula sidesteps, a ghost in blue fire.",
        "Her calculated strike finds only empty air.",
        "The princess's precision fails her for once.",
        "Her blue flames dance but miss their mark.",
        "Her calculated approach fails to find its target."
      ];
      return this.getCycledVariant(highComposureLines, 'miss_high_composure');
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
    if (emotionalState.control >= 4) {
      // High control - more precise, calculated lines
      const highControlLines = [
        "Azula's blue fire strikes with controlled precision.",
        "Her control remains absolute—the strike lands perfectly.",
        "Azula's perfect facade remains unbroken—the attack connects.",
        "Her calculated approach proves effective.",
        "The princess's precision is devastating."
      ];
      return this.getCycledVariant(highControlLines, 'hit_high_control');
    } else if (emotionalState.composure <= 2) {
      // Low composure - more furious, intense lines
      const lowComposureLines = [
        "Her flames dance with deadly grace, finding their mark.",
        "The princess's calculated fury is a weapon in itself.",
        "Her blue flames test their opponent's resolve.",
        "Azula's firebending is poetry of destruction.",
        "Her flames engulf the opponent, searing through their defenses."
      ];
      return this.getCycledVariant(lowComposureLines, 'hit_low_composure');
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
    if (emotionalState.control >= 4) {
      // High control - more controlled escalation
      const highControlLines = [
        "The princess's control remains absolute despite the chaos.",
        "Her calculated approach gives way to raw power.",
        "Azula's composure is tested by the escalating conflict.",
        "The princess's perfect facade begins to show cracks.",
        "Her calculated nature is tested by the intensity."
      ];
      return this.getCycledVariant(highControlLines, 'escalation_high_control');
    } else if (emotionalState.composure <= 2) {
      // Low composure - more uncontrolled escalation
      const lowComposureLines = [
        "Azula's control slips—her fury disrupts her precision.",
        "The princess's perfect facade cracks only for an instant.",
        "Azula's fury threatens to burn away discipline.",
        "The princess's composure is pushed to its limits.",
        "Azula's control is challenged by the escalating battle."
      ];
      return this.getCycledVariant(lowComposureLines, 'escalation_low_composure');
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
    if (emotionalState.control >= 3) {
      // High control - more controlled desperation
      const highControlLines = [
        "Azula's perfect facade finally cracks under pressure.",
        "The princess's control slips—her fury takes over.",
        "Her calculated approach gives way to desperation.",
        "Azula's composure is shattered by the overwhelming odds.",
        "The princess's perfect facade is broken."
      ];
      return this.getCycledVariant(highControlLines, 'desperation_high_control');
    } else {
      // Low control - more uncontrolled desperation
      const lowControlLines = [
        "Azula's fury becomes her only weapon.",
        "The princess's composure is overwhelmed by desperation.",
        "Her calculated nature is forced to embrace chaos.",
        "Azula's perfect facade is destroyed by the conflict.",
        "The princess's control is broken by desperation."
      ];
      return this.getCycledVariant(lowControlLines, 'desperation_low_control');
    }
  }

  /**
   * @description Get victory line with emotional state
   */
  getVictoryLine(): string {
    const baseLine = this.getCycledVariant(this.victoryLines, 'victory');
    
    if (this.emotionalState.composure <= -3) {
      return `${baseLine} Her perfect facade triumphs despite the cracks.`;
    } else if (this.emotionalState.control >= 3) {
      return `${baseLine} Her controlled approach leads to victory.`;
    }
    
    return baseLine;
  }

  /**
   * @description Get defeat line with emotional state
   */
  getDefeatLine(): string {
    const baseLine = this.getCycledVariant(this.defeatLines, 'defeat');
    
    if (this.emotionalState.composure <= -3) {
      return `${baseLine} Her perfect facade is finally destroyed.`;
    } else if (this.emotionalState.control >= 3) {
      return `${baseLine} Even her control cannot overcome the odds.`;
    }
    
    return baseLine;
  }

  /**
   * @description Get emotional state summary
   */
  getEmotionalState(): { composure: number; control: number } {
    return { ...this.emotionalState };
  }

  /**
   * @description Get move-specific flavor for Azula
   */
  getMoveFlavor(moveName: string): string | null {
    const pool = this.moveFlavors[moveName];
    if (!pool) return null;
    
    // Get a random line from the move-specific pool
    const selectedLine = pool[Math.floor(Math.random() * pool.length)];
    
    // Add emotional state modifier if applicable
    if (this.emotionalState.composure <= -3) {
      return `${selectedLine} Her perfect facade begins to crack.`;
    } else if (this.emotionalState.control >= 3) {
      return `${selectedLine} Her control remains absolute.`;
    }
    
    return selectedLine;
  }
} 