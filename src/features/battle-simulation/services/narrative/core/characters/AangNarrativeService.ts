// CONTEXT: Aang Character Narrative Service
// RESPONSIBILITY: Generate character-specific narrative for Aang

const AangNarrativePool = {
  escalation: [
    "Aang’s eyes narrow—he senses the rising danger.",
    "The wind answers as Aang steels himself for what’s next.",
    "With each attack, Aang’s movements sharpen, urgency mounting.",
    "Aang’s calm is replaced by unwavering focus.",
    "He reads his opponent, adapting on the fly.",
    "Aang glides into action, shifting tactics midair.",
    "Determination flashes in Aang’s eyes as the battle intensifies.",
    "He pivots, using momentum to press forward.",
    "The arena’s tension grows—Aang matches it beat for beat.",
    "Aang leans into the storm, refusing to back down."
  ],
  desperation: [
    "Aang steadies his breath, eyes glowing with resolve.",
    "With every ounce of strength, Aang refuses to yield.",
    "The air crackles as Aang channels his last reserves.",
    "Desperation fuels Aang’s next move—he will not fall.",
    "Aang’s spirit blazes, undaunted by the odds.",
    "He draws on memories of his friends, refusing defeat.",
    "Aang’s stance shifts—he’s ready for one final stand.",
    "The arena trembles as Aang unleashes his will.",
    "Even cornered, Aang’s hope never fades.",
    "Aang’s determination becomes a force of nature."
  ],
  climax: [
    "Aang summons the full force of his training.",
    "Every element answers his call—this is the turning point.",
    "Aang’s energy peaks, the air charged with possibility.",
    "His movements flow like water, unstoppable and clear.",
    "With a decisive leap, Aang seizes the initiative.",
    "The world quiets—Aang stands at the center of the storm.",
    "He channels the Avatar State, power coursing through him.",
    "Aang’s resolve crystallizes, nothing left to chance.",
    "He brings harmony to chaos, bending fate itself.",
    "Aang’s spirit shines brightest when the outcome hangs in the balance."
  ],
  finisher: [
    "Aang unleashes his last, decisive strike.",
    "With a deep breath, Aang commits to his final move.",
    "This is it—Aang channels everything into one moment.",
    "All hesitation vanishes as Aang makes his stand.",
    "A surge of wind heralds Aang’s finishing blow.",
    "He acts with perfect clarity, every motion deliberate.",
    "The battle’s end is written in Aang’s eyes.",
    "Aang’s final technique leaves no room for doubt.",
    "He stakes everything on a single act of will.",
    "Aang closes his eyes, trusting the world to guide him."
  ],
  forced_ending: [
    "Aang exhales, accepting the unresolved outcome.",
    "He stands tall, undiminished by the draw.",
    "Sometimes, balance means letting go.",
    "Aang lowers his guard—there’s no winner today.",
    "The air settles, and Aang bows with respect.",
    "He seeks understanding in stalemate, not victory.",
    "Both sides retreat, the lesson unfinished.",
    "Aang’s gaze is calm—this fight isn’t the end.",
    "Peace, even imperfect, is better than senseless struggle.",
    "Aang’s spirit remains unbroken, even as the battle halts."
  ],
  taunt: [
    "Is that really your best move?",
    "Come on, you can do better than that!",
    "Try to keep up!",
    "You’ll have to be quicker than that to catch me.",
    "Hey, I thought you were supposed to be tough!",
    "Maybe you should try some airbending—looks fun, right?",
    "Careful, or you’ll trip over your own feet!",
    "You’re making this too easy for me.",
    "Are you even taking this seriously?",
    "If this gets any slower, I’ll take a nap!"
  ],
  comeback: [
    "You haven’t seen anything yet!",
    "I’m just getting started.",
    "Don’t count me out!",
    "It’s not over till it’s over.",
    "Aang finds new strength when it matters most.",
    "I’m not finished—I never give up!",
    "You thought I was done? Not even close.",
    "No matter how hard it gets, I keep moving.",
    "Time for me to turn this around!",
    "Let’s see how you handle this!"
  ],
  pattern_break: [
    "Let’s shake things up!",
    "Didn’t see that coming, did you?",
    "Switching things up!",
    "Time to break the cycle.",
    "Try predicting this one!",
    "I can change faster than the wind.",
    "Just when you think you’ve got me figured out—surprise!",
    "Ready for something new?",
    "A little unpredictability never hurt.",
    "Expect the unexpected."
  ],
  interrupt: [
    "Not so fast!",
    "I saw that coming a mile away.",
    "Nice try, but not today.",
    "I can stop you before you start.",
    "You’ll have to try harder to get past me.",
    "Caught you off guard, huh?",
    "You’re not the only one who can think fast.",
    "Sorry, but that won’t work on me.",
    "Blocked and reversed!",
    "I’ve turned the tables!"
  ],
  stalemate: [
    "Looks like we’re evenly matched.",
    "Neither of us is budging, huh?",
    "We could be here all day at this rate.",
    "This is turning into a real standoff.",
    "Balance, I guess, means nobody wins.",
    "You’re not giving up—and neither am I.",
    "I guess we’ll call this a draw... for now.",
    "No ground gained, no ground lost.",
    "Sometimes, the world just stands still.",
    "I could do this all day!"
  ]
};
export { AangNarrativePool };

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
    "The Avatar's attack is too controlled.",
    "The wind answers, but too late.",
    "He moves to strike—then remembers what it means to harm.",
    "A breath held too long becomes hesitation.",
    "The air shifts, uncertain, like his heart.",
    "He steps lightly... but the world demands weight.",
    "His strike drifts wide—like a leaf with no current to follow."
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
    "His gentle spirit holds back his fury—but the strike still lands.",
    "Balance guides him—the strike lands not in anger, but in harmony.",
    "The force is not his own, but the world's—he simply channels it.",
    "Even in violence, he bends with purpose.",
    "The air itself wanted this blow to land.",
    "The wind carries justice with it—soft, but undeniable.",
    "He closes his eyes—and still connects."
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
    "His gentle spirit is tested by the intensity of the conflict.",
    "The still air becomes a storm—not by choice, but by calling.",
    "He stops holding back—not out of anger, but duty.",
    "The cyclone inside him begins to turn.",
    "Every movement now carries the legacy of a thousand Avatars.",
    "He no longer avoids the fight—he shapes it."
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
    "The young monk's resolve leads to triumph.",
    "Aang bows—not to gloat, but to remember who he is.",
    "Peace, just for a moment, finds him again.",
    "He does not cheer. He just breathes, deeply.",
    "He wins without hate. That is his strength.",
    "Even in triumph, he searches for what was lost.",
    "The air settles. The fight is over. He remains."
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
    "The young monk's gentle heart cannot prevail.",
    "He falls—not from pain, but from the weight of the world.",
    "Even the Avatar cannot bend fate every time.",
    "The wind dies with him—but only for now.",
    "His failure is quiet, like dusk falling on a monastery.",
    "He doesn't cry. The air does, for him.",
    "He lost—but did not break."
  ];

  // Expanded move-specific flavor pools
  private moveFlavors: Record<string, string[]> = {
    'Air Glide': [
      "Aang spins low, wind snaking between Azula's feet.",
      "He leaps, gliding just out of reach.",
      "Aang's airbending lets him float above the fray.",
      "A gentle breeze carries Aang's strike to its target.",
      "His staff flickers, air rippling around the opponent.",
      "Aang flows like water, staff flickering—his strike snaps across their shoulder, stinging pride and skin alike.",
      "He becomes a thought on the breeze—impossible to grasp.",
      "Aang doesn't dodge—he dances on the world's breath.",
      "His body floats, but his will does not waver."
    ],
    'Wind Slice': [
      "A sharp current rips through the throne room, cutting with a surgeon's precision.",
      "Aang whips his staff, sending a blade of air at Azula.",
      "The air shreds forward, slicing through the tension.",
      "A razor-thin blast tears the dust from the throne room floor.",
      "Aang's hands whip the air into a shimmering blade.",
      "The wind becomes a weapon in Aang's skilled hands.",
      "His staff carves a rift through the very breath of the room.",
      "The air splits—sharp, clean, regretful.",
      "With a flick, the wind itself becomes righteous."
    ],
    'Air Blast': [
      "Aang channels the wind into a focused blast.",
      "The air itself becomes his weapon.",
      "A concentrated gust strikes with precision.",
      "The wind responds to Aang's gentle command.",
      "Air ripples outward from Aang's staff.",
      "The breeze becomes a battering ram.",
      "It isn't a blast—it's a lesson in pressure.",
      "The gale doesn't roar. It teaches.",
      "The push carries no anger—only certainty."
    ],
    'Staff Strike': [
      "Aang's staff finds its mark with monk precision.",
      "The wooden staff strikes with controlled force.",
      "His training shows in every staff movement.",
      "The staff becomes an extension of Aang's will.",
      "Monk discipline guides the staff's path.",
      "The staff strikes with the wisdom of his masters.",
      "Each strike echoes his teachers' voices.",
      "The staff hums—not with power, but principle.",
      "Wood meets flesh with purpose, not fury."
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
  updateEmotionalState(event: string): void {
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
  getEscalationLine(): string {
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
  getMoveFlavor(moveName: string): string | null {
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