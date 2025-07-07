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
    ...[
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
    ],
    // Premium-grade additions (Low Control)
    "Azula hurls fire with fury—wild, imprecise, unbecoming.",
    "The flame escapes her hand like a scream—aimless, loud, wrong.",
    "She fires too fast. Too much. Not enough direction. Just rage.",
    "The air crackles with intent, but her aim dies in chaos.",
    "Her fury lights the room, but not the target.",
    // Premium-grade additions (High Composure)
    "Azula exhales through her nose, unfazed by the near miss.",
    "A narrow miscalculation—not a failure, a recalibration.",
    "Her eyes narrow. The next strike will not miss.",
    "Blue flame veers harmlessly past—her face doesn't change.",
    "A miss, yes. But one she allowed."
  ];

  // Azula-specific hit lines with emotional depth
  private hitLines = [
    ...[
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
    ],
    // Premium-grade additions (High Control)
    "Azula strikes with surgical efficiency. No wasted motion.",
    "The fire curves as commanded—like it knows to obey.",
    "Her breath syncs with the strike. Measured. Fatal.",
    "Control hums in her bones—the hit lands without flair, only certainty.",
    "She calculates the opponent's breath—and strikes between heartbeats.",
    // Premium-grade additions (Low Composure)
    "The fire lashes out before her words can—pure venom, uncontrolled.",
    "Azula snarls. The blast is messier than she wanted. But it lands.",
    "Every crack in her mind feeds the fire that hits.",
    "She burns them for noticing the tremor in her voice.",
    "It's not elegance. It's impact. It's enough."
  ];

  // Azula-specific escalation lines
  private escalationLines = [
    ...[
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
    ],
    // Premium-grade additions (Low Composure)
    "The cracks in her mask widen—fire bursts through.",
    "She stops breathing between strikes. There's only fire now.",
    "Azula's elegance frays into something primal.",
    "Each missed strike frays the silk of her composure.",
    "What begins as strategy unravels into obsession.",
    // Premium-grade additions (High Control)
    "Chaos builds, but her technique holds like glass under pressure.",
    "Azula tightens her control, turns tension into heat.",
    "With each attack, her precision sharpens—distilled, not diluted.",
    "Pressure refines her—like coal into diamond.",
    "She channels the rising chaos into absolute focus."
  ];

  // Azula-specific victory lines
  private victoryLines = [
    ...[
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
    ],
    // Premium-grade additions (Low Composure)
    "Her breath is ragged, her smile cracked—but she won.",
    "Victory comes drenched in sweat and self-loathing.",
    "She stands over them—trembling, grinning, furious she needed effort.",
    "Azula wins, but not without shedding parts of herself.",
    "Even victory tastes bitter when your mask slips.",
    // Premium-grade additions (High Control)
    "Azula doesn't gloat—she simply knows the outcome was inevitable.",
    "She walks away before the fire fades. Precision leaves no need for celebration.",
    "Her heart rate never spiked. Her technique never broke.",
    "Victory is a consequence, not an achievement.",
    "She doesn't smirk—just notes the data."
  ];

  // Azula-specific defeat lines
  private defeatLines = [
    ...[
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
    ],
    // Premium-grade additions (Low Composure)
    "Azula stares at her trembling hands, like they betrayed her.",
    "There's no scream. Just silence. And then the flames die.",
    "She collapses before the blow lands—beaten by herself.",
    "Her fire gutters out with a sound like choking.",
    "The porcelain mask finally shatters.",
    // Premium-grade additions (High Control)
    "She fought to the end—unflinching, even in ruin.",
    "Defeat stings, but her form never broke. Her posture remains.",
    "Even broken, she watches with calculating eyes.",
    "She falls like a blade—not flailing, but sharp to the last.",
    "Control wasn't enough. But it was never lost."
  ];

  // Expanded move-specific flavor pools
  private moveFlavors: Record<string, string[]> = {
    'Blue Fire': [
      ...[
        "Azula conjures blue fire, her signature attack blazing across the throne room.",
        "A torrent of blue flame surges from Azula's fingertips.",
        "Her blue fire crackles, burning with unnatural intensity.",
        "Blue fire licks at the opponent's defenses.",
        "The blue flames test their opponent's resolve.",
        "Azula's blue fire strikes with controlled precision."
      ],
      // Premium-grade additions
      "Azula paints the air with fury—precision in every swirl.",
      "Blue flame coils like a serpent, striking with intent.",
      "The heat is not warmth. It is command.",
      "Her signature fire surges forward, royal and wrathful."
    ],
    'Lightning Arc': [
      ...[
        "Azula channels lightning, the air humming with raw power.",
        "A jagged bolt of lightning leaps from Azula's hand.",
        "She unleashes a precise arc of lightning at her foe.",
        "Lightning crackles around Azula's fingertips.",
        "The air itself seems to burn with their fury.",
        "Electricity dances at Azula's command."
      ],
      // Premium-grade additions
      "She splits the sky with thought alone.",
      "Azula's fingers snap—a line of death dances from them.",
      "Lightning obeys her like a loyal blade.",
      "No shout. No stance. Just intention—and light."
    ],
    'Fire Blast': [
      ...[
        "Azula's fire strikes with controlled precision.",
        "The princess's calculated fury is precise.",
        "Her fire strikes with controlled precision.",
        "Azula's control remains unshakeable.",
        "The Fire Nation heir's control is absolute.",
        "Her calculated approach shows mastery."
      ],
      // Premium-grade additions
      "A pillar of flame roars from her stance—unapologetic and pure.",
      "Azula's blast doesn't roar. It announces.",
      "She ignites from stillness—pure economy of power."
    ],
    'Precision Strike': [
      ...[
        "Azula's calculated strike finds only empty air.",
        "Her perfect timing is off—the attack goes astray.",
        "The princess's precision fails her for once.",
        "Her calculated approach fails to find its target.",
        "The perfect facade cracks—the strike goes wide.",
        "The princess's composure wavers—the attack misses."
      ],
      // Premium-grade additions
      "She moves in angles—measured like calligraphy, brutal as execution.",
      "Every motion balanced, weighted—then released like a blade.",
      "Azula's flame trims the fat from combat. Only consequence remains."
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