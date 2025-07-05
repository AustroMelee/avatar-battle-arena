// CONTEXT: Emotion Modifier
// RESPONSIBILITY: Generate emotion-based narrative modifiers only

/**
 * @description Service for generating emotion-based narrative modifiers only
 */
export class EmotionModifier {
  private emotionModifiers = {
    confident: [
      'with unwavering confidence',
      'with absolute certainty',
      'with unshakeable resolve',
      'with perfect conviction',
      'with supreme confidence',
      'with iron determination',
      'with unbreakable will',
      'with steely focus',
      'with indomitable spirit',
      'with flawless precision'
    ],
    fearful: [
      'with trembling hands',
      'with growing fear',
      'with mounting terror',
      'with desperate hope',
      'with shaking resolve',
      'with wavering confidence',
      'with uncertain steps',
      'with nervous energy',
      'with anxious movements',
      'with hesitant precision'
    ],
    angry: [
      'with burning fury',
      'with seething rage',
      'with explosive anger',
      'with volcanic wrath',
      'with uncontained fury',
      'with white-hot rage',
      'with primal fury',
      'with destructive intent',
      'with vengeful precision',
      'with wrathful determination'
    ],
    determined: [
      'with iron resolve',
      'with unbreakable will',
      'with steely determination',
      'with unwavering focus',
      'with indomitable spirit',
      'with relentless drive',
      'with unyielding purpose',
      'with fierce determination',
      'with unstoppable force',
      'with absolute focus'
    ],
    desperate: [
      'with desperate energy',
      'with last-ditch effort',
      'with survival instinct',
      'with final reserves',
      'with desperate hope',
      'with wild abandon',
      'with reckless fury',
      'with nothing left to lose',
      'with primal survival',
      'with final defiance'
    ],
    neutral: [
      'with measured precision',
      'with calm focus',
      'with steady hand',
      'with controlled movement',
      'with balanced approach',
      'with practiced skill',
      'with calculated precision',
      'with disciplined form',
      'with focused intent',
      'with methodical execution'
    ]
  };

  private emotionalBeats = {
    confident: [
      'determination flickers behind their eyes',
      'confidence radiates from every movement',
      'their resolve is unshakeable',
      'perfect control in every motion',
      'their spirit burns bright',
      'unwavering focus guides their hand',
      'their confidence is absolute',
      'every movement speaks of mastery',
      'their will is indomitable',
      'supreme confidence flows through them'
    ],
    fearful: [
      'doubt creeps into their movements',
      'fear flickers behind their eyes',
      'uncertainty shows in their stance',
      'nervous energy courses through them',
      'their confidence wavers',
      'anxiety tightens their grip',
      'fear shadows their every move',
      'their resolve begins to crack',
      'uncertainty clouds their judgment',
      'their spirit falters'
    ],
    angry: [
      'rage burns in their eyes',
      'fury fuels every movement',
      'anger sharpens their focus',
      'wrath drives their attacks',
      'their fury is uncontained',
      'rage flows through their veins',
      'anger gives them strength',
      'their wrath is absolute',
      'fury burns away all doubt',
      'rage becomes their weapon'
    ],
    determined: [
      'resolve hardens in their gaze',
      'determination flows through them',
      'their will is unbreakable',
      'focus sharpens their movements',
      'resolve strengthens their stance',
      'determination guides their hand',
      'their spirit refuses to yield',
      'unwavering purpose drives them',
      'their resolve is absolute',
      'determination becomes their shield'
    ],
    desperate: [
      'desperation fuels their movements',
      'survival instinct takes over',
      'their mask of control slips',
      'desperation becomes their strength',
      'they fight like cornered animals',
      'desperation sharpens their focus',
      'their facade crumbles',
      'survival overrides all else',
      'desperation drives them forward',
      'they fight with nothing left to lose'
    ],
    neutral: [
      'their movements are controlled',
      'calm focus guides their hand',
      'their technique is flawless',
      'measured precision in every motion',
      'their form is perfect',
      'disciplined execution flows naturally',
      'their control is absolute',
      'practiced skill shows in every move',
      'their focus is unwavering',
      'calculated precision defines their style'
    ]
  };

  private intensityModifiers = {
    low: [
      'slightly',
      'subtly',
      'gently',
      'softly',
      'quietly',
      'delicately',
      'carefully',
      'tenderly',
      'lightly',
      'mildly'
    ],
    medium: [
      'clearly',
      'noticeably',
      'distinctly',
      'obviously',
      'markedly',
      'visibly',
      'apparently',
      'evidently',
      'plainly',
      'definitely'
    ],
    high: [
      'intensely',
      'powerfully',
      'overwhelmingly',
      'dramatically',
      'forcefully',
      'violently',
      'fiercely',
      'wildly',
      'passionately',
      'ferociously'
    ]
  };

  /**
   * @description Get emotion modifier for a given emotion
   */
  getEmotionModifier(emotion: string): string {
    const modifiers = this.emotionModifiers[emotion as keyof typeof this.emotionModifiers];
    if (!modifiers || modifiers.length === 0) {
      return this.emotionModifiers.neutral[Math.floor(Math.random() * this.emotionModifiers.neutral.length)];
    }
    return modifiers[Math.floor(Math.random() * modifiers.length)];
  }

  /**
   * @description Get emotional beat for narrative enhancement
   */
  getEmotionalBeat(emotion: string): string {
    const beats = this.emotionalBeats[emotion as keyof typeof this.emotionalBeats];
    if (!beats || beats.length === 0) {
      return this.emotionalBeats.neutral[Math.floor(Math.random() * this.emotionalBeats.neutral.length)];
    }
    return beats[Math.floor(Math.random() * beats.length)];
  }

  /**
   * @description Get emotion-based narrative enhancement with micro-variations
   */
  getEmotionEnhancement(emotion: string, intensity: number, turnNumber: number): string {
    const baseModifier = this.getEmotionModifier(emotion);
    const emotionalBeat = this.getEmotionalBeat(emotion);
    
    // Use turn number to cycle through variations
    const intensityLevel = intensity > 0.8 ? 'high' : intensity > 0.5 ? 'medium' : 'low';
    const intensityModifier = this.intensityModifiers[intensityLevel][turnNumber % this.intensityModifiers[intensityLevel].length];
    
    // Alternate between modifier and beat based on turn
    if (turnNumber % 2 === 0) {
      return `${baseModifier}, ${intensityModifier} showing their ${emotion}`;
    } else {
      return `${baseModifier}; ${emotionalBeat}`;
    }
  }

  /**
   * @description Get character-specific emotional response
   */
  getCharacterEmotionalResponse(characterName: string, emotion: string, turnNumber: number): string {
    if (characterName.toLowerCase().includes('aang')) {
      return this.getAangEmotionalResponse(emotion, turnNumber);
    } else if (characterName.toLowerCase().includes('azula')) {
      return this.getAzulaEmotionalResponse(emotion, turnNumber);
    }
    return this.getEmotionalBeat(emotion);
  }

  /**
   * @description Get Aang-specific emotional response
   */
  private getAangEmotionalResponse(emotion: string, turnNumber: number): string {
    const aangResponses = {
      confident: [
        'his gentle spirit burns bright',
        'the Avatar\'s confidence flows through him',
        'his pacifist nature gives way to determination',
        'the young monk\'s resolve hardens',
        'his hope for peace strengthens his resolve'
      ],
      fearful: [
        'his pacifist nature shows in his hesitation',
        'the Avatar\'s doubt flickers',
        'his desire for peace weakens his strike',
        'the young monk\'s uncertainty is evident',
        'his hope for reconciliation stays his hand'
      ],
      angry: [
        'his gentle nature is tested by fury',
        'the Avatar\'s pacifism gives way to anger',
        'his compassion is pushed to its limits',
        'the young monk\'s patience wears thin',
        'his peaceful spirit is challenged by rage'
      ],
      desperate: [
        'his pacifism gives way to survival instinct',
        'the Avatar\'s gentle nature is tested',
        'his hope flickers but refuses to die',
        'the young monk\'s innocence begins to fade',
        'his compassion is pushed to absolute limits'
      ]
    };

    const responses = aangResponses[emotion as keyof typeof aangResponses] || aangResponses.confident;
    return responses[turnNumber % responses.length];
  }

  /**
   * @description Get Azula-specific emotional response
   */
  private getAzulaEmotionalResponse(emotion: string, turnNumber: number): string {
    const azulaResponses = {
      confident: [
        'her perfect facade remains unbroken',
        'the princess\'s calculated fury is precise',
        'her arrogance fuels her confidence',
        'the Fire Nation heir\'s control is absolute',
        'her calculated approach shows mastery'
      ],
      fearful: [
        'her perfect facade begins to crack',
        'the princess\'s confidence wavers',
        'her arrogance is replaced by doubt',
        'the Fire Nation heir\'s control slips',
        'her calculated approach becomes uncertain'
      ],
      angry: [
        'her perfect facade crumbles under fury',
        'the princess\'s calculated control gives way to rage',
        'her arrogance becomes destructive',
        'the Fire Nation heir\'s precision becomes wild',
        'her calculated approach becomes chaotic'
      ],
      desperate: [
        'her perfect facade finally shatters',
        'the princess\'s calculated control is lost',
        'her arrogance is replaced by desperation',
        'the Fire Nation heir\'s precision becomes frantic',
        'her calculated approach becomes desperate'
      ]
    };

    const responses = azulaResponses[emotion as keyof typeof azulaResponses] || azulaResponses.confident;
    return responses[turnNumber % responses.length];
  }

  /**
   * @description Get available emotions
   */
  getAvailableEmotions(): string[] {
    return Object.keys(this.emotionModifiers);
  }

  /**
   * @description Get modifier count for an emotion
   */
  getModifierCount(emotion: string): number {
    const modifiers = this.emotionModifiers[emotion as keyof typeof this.emotionModifiers];
    return modifiers ? modifiers.length : 0;
  }
} 