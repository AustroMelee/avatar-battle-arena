// CONTEXT: Narrative System, // FOCUS: Template-Driven Storytelling
import type { BattleContext, MechanicalState } from './types';

/**
 * @description Narrative template categories for different mechanical states
 */
export type NarrativeTemplate = {
  id: string;
  condition: (ctx: BattleContext) => boolean;
  templates: {
    [character: string]: {
      [tone: string]: string[];
    };
  };
  narratorTemplates?: string[];
  priority: number;
};

/**
 * @description Enhanced narrative templates with rich, dramatic prose
 */
export const NARRATIVE_TEMPLATES: NarrativeTemplate[] = [
  // ESCALATION TEMPLATES - Dramatic forced escalation moments
  {
    id: 'forced_escalation',
    condition: (ctx) => ctx.mechanics.forcedEscalation && ctx.damage !== undefined && ctx.damage > 0,
    templates: {
      'Aang': {
        'furious': [
          "Aang's patience finally snaps! His normally peaceful demeanor shatters as frustration boils over, and he unleashes a tempest of raw power!",
          "The air itself seems to answer Aang's desperate call as he's forced to escalate dramatically!",
          "Aang's eyes narrow with determination—no more holding back! He channels his frustration into devastating force!",
          "The normally gentle airbender erupts with unexpected fury, his attacks becoming a whirlwind of desperate power!"
        ],
        'desperate': [
          "Aang feels the weight of desperation pressing down. With a determined grimace, he channels everything into this attack!",
          "Time is running out, and Aang knows it. He throws caution to the wind and unleashes his full power!",
          "Aang's back is against the wall—he has no choice but to escalate dramatically!",
          "The young Avatar's patience wears thin. He's forced to fight with everything he has!"
        ]
      },
      'Azula': {
        'furious': [
          "Azula's calculated facade cracks! Her eyes burn with pure rage as she's forced to unleash her full destructive power!",
          "The princess's patience evaporates. She channels her fury into a devastating assault!",
          "Azula's control slips—she's forced to escalate dramatically, her attacks becoming a storm of blue fire!",
          "The normally precise Azula erupts with raw power, her frustration manifesting as devastating force!"
        ],
        'desperate': [
          "Azula's strategic mind gives way to desperation. She's forced to fight with everything she has!",
          "The princess feels time slipping away. She channels her desperation into overwhelming power!",
          "Azula's back is against the wall—she has no choice but to escalate dramatically!",
          "The calculated warrior's patience wears thin. She's forced to unleash her full destructive potential!"
        ]
      }
    },
    narratorTemplates: [
      "The battle reaches a fever pitch as desperation drives them to unleash their ultimate power!",
      "The very air crackles with tension as both fighters are forced to escalate dramatically!",
      "No more holding back—the battle erupts into a flurry of desperate, devastating blows!",
      "The elements themselves seem to answer the call as the fighters channel their frustration into raw power!"
    ],
    priority: 9
  },

  // VULNERABILITY PUNISHMENT - Capitalizing on enemy mistakes
  {
    id: 'vulnerability_punish_charging',
    condition: (ctx) => ctx.mechanics.isVulnerable && ctx.mechanics.vulnerabilityType === 'charging' && ctx.mechanics.punishDamage > 0,
    templates: {
      'Aang': {
        'calculated': [
          "Aang spots the perfect opening! While his opponent is charging, he strikes with devastating precision!",
          "The airbender capitalizes on the charging vulnerability, his attack landing with perfect timing!",
          "Aang's eyes light up—he sees the weakness and exploits it with surgical precision!",
          "The moment his opponent starts charging, Aang pounces, his attack finding the perfect opening!"
        ]
      },
      'Azula': {
        'calculated': [
          "Azula's predatory instincts kick in! She spots the charging vulnerability and strikes with lethal precision!",
          "The princess capitalizes on the moment of weakness, her attack landing with devastating accuracy!",
          "Azula's eyes narrow—she sees the opening and exploits it with ruthless efficiency!",
          "The moment her opponent starts charging, Azula strikes like lightning, finding the perfect weakness!"
        ]
      }
    },
    narratorTemplates: [
      "A devastating counter-attack! The charging opponent is caught completely off-guard!",
      "Perfect timing! The vulnerability is exploited with surgical precision!",
      "The charging attack leaves them wide open—and the opponent capitalizes mercilessly!",
      "A masterful counter-strike that turns the charging opponent's strength into their greatest weakness!"
    ],
    priority: 8
  },

  // PATTERN REPETITION - Breaking predictable patterns
  {
    id: 'pattern_break',
    condition: (ctx) => ctx.mechanics.moveRepetition >= 3,
    templates: {
      'Aang': {
        'desperate': [
          "Aang's rhythm shifts dramatically! He breaks free from the predictable pattern, fighting with wild abandon!",
          "The airbender snaps out of his repetitive attacks, his movements becoming unpredictable and dangerous!",
          "Aang realizes he's become predictable. With a determined grimace, he changes tactics completely!",
          "The young Avatar's strategy unravels—he's forced to adapt and fight with renewed unpredictability!"
        ]
      },
      'Azula': {
        'desperate': [
          "Azula's calculated facade cracks! She breaks free from the predictable pattern, her attacks becoming erratic and dangerous!",
          "The princess's strategic mind adapts—she realizes the pattern and changes tactics completely!",
          "Azula's precision gives way to unpredictability as she's forced to break her own patterns!",
          "The normally methodical Azula becomes unpredictable, her attacks taking on a wild, dangerous edge!"
        ]
      }
    },
    narratorTemplates: [
      "The tempo shifts dramatically! Predictable patterns give way to wild, unpredictable combat!",
      "The battle rhythm breaks as both fighters adapt to avoid becoming predictable!",
      "No more patterns—the combat becomes a chaotic dance of desperate adaptation!",
      "The predictable exchanges shatter as both warriors realize the need for unpredictability!"
    ],
    priority: 7
  },

  // HIGH DAMAGE MOMENTS - Devastating attacks
  {
    id: 'high_damage',
    condition: (ctx) => ctx.damage !== undefined && ctx.damage > 20,
    templates: {
      'Aang': {
        'confident': [
          "Aang's attack lands with devastating force! The very air itself seems to answer his call!",
          "The young Avatar channels his power perfectly—the impact is absolutely devastating!",
          "Aang's technique is flawless! His attack strikes with the force of a hurricane!",
          "The airbender's mastery shows—his attack lands with overwhelming power!"
        ]
      },
      'Azula': {
        'confident': [
          "Azula's attack strikes with devastating precision! Her blue fire burns with overwhelming intensity!",
          "The princess's technique is perfect—the impact is absolutely devastating!",
          "Azula's attack lands like lightning—fast, precise, and utterly devastating!",
          "The firebender's mastery is evident—her attack strikes with overwhelming destructive force!"
        ]
      }
    },
    narratorTemplates: [
      "A devastating blow! The very elements themselves seem to answer the call!",
      "The impact is absolutely devastating! Such raw power unleashed upon the battlefield!",
      "A masterful strike that shakes the very foundations of the arena!",
      "The attack lands with the force of a natural disaster—absolutely overwhelming!"
    ],
    priority: 8
  },

  // LOW DAMAGE MOMENTS - Weak or blocked attacks
  {
    id: 'low_damage',
    condition: (ctx) => ctx.damage !== undefined && ctx.damage <= 5,
    templates: {
      'Aang': {
        'defensive': [
          "Aang's attack lacks power—he's clearly holding back or exhausted from the battle!",
          "The airbender's strike is weak, his energy clearly depleted from the intense combat!",
          "Aang's attack barely connects, lacking the force needed to make a real impact!",
          "The young Avatar's technique is off—his attack lands but with little power behind it!"
        ]
      },
      'Azula': {
        'defensive': [
          "Azula's attack lacks her usual precision—she's clearly exhausted or distracted!",
          "The princess's strike is weak, her normally devastating power diminished by fatigue!",
          "Azula's attack barely connects, lacking the destructive force she's known for!",
          "The firebender's technique is off—her attack lands but with little impact!"
        ]
      }
    },
    narratorTemplates: [
      "The attack connects but lacks power—fatigue is clearly taking its toll!",
      "A weak strike that barely makes an impact—the fighter's energy is clearly depleted!",
      "The attack lands but with little force—exhaustion is evident in every movement!",
      "A feeble attempt that barely connects—the intense battle has clearly taken its toll!"
    ],
    priority: 4
  },

  // COMEBACK MOMENTS - Turning the tide
  {
    id: 'comeback',
    condition: (ctx) => ctx.mechanics.isComeback,
    templates: {
      'Aang': {
        'desperate': [
          "Against all odds, Aang finds the strength to fight back! His determination burns brighter than ever!",
          "The young Avatar refuses to give up! He channels his desperation into renewed strength!",
          "Aang's spirit refuses to break! He finds reserves of strength he didn't know he had!",
          "The airbender's willpower is unbreakable! He turns his desperation into a fighting chance!"
        ]
      },
      'Azula': {
        'desperate': [
          "Azula's pride refuses to accept defeat! She channels her desperation into renewed destructive power!",
          "The princess's determination is unbreakable! She finds strength in her refusal to lose!",
          "Azula's willpower is legendary! She turns her desperation into a fighting chance!",
          "The firebender's pride drives her forward! She refuses to accept anything but victory!"
        ]
      }
    },
    narratorTemplates: [
      "Against all odds, they find the strength to fight back! The battle is far from over!",
      "The tide begins to turn as desperation fuels renewed determination!",
      "A miraculous comeback! The fighter refuses to accept defeat!",
      "The impossible becomes possible as sheer willpower overcomes overwhelming odds!"
    ],
    priority: 7
  },

  // RALLY MOMENTS - Building momentum
  {
    id: 'rally',
    condition: (ctx) => ctx.mechanics.isRally,
    templates: {
      'Aang': {
        'confident': [
          "Aang's confidence builds with each successful strike! He's finding his rhythm!",
          "The airbender is on a roll! His attacks flow together with perfect timing!",
          "Aang's momentum builds—he's hitting his stride and showing no signs of slowing!",
          "The young Avatar is unstoppable! His confidence grows with every successful attack!"
        ]
      },
      'Azula': {
        'confident': [
          "Azula's confidence grows with each devastating strike! She's in perfect form!",
          "The princess is unstoppable! Her attacks land with increasing precision and power!",
          "Azula's momentum builds—she's hitting her stride and showing no mercy!",
          "The firebender is on fire! Her confidence grows with every successful attack!"
        ]
      }
    },
    narratorTemplates: [
      "They're on a roll! Momentum builds with each successful strike!",
      "The fighter is unstoppable! Confidence grows with every attack!",
      "A perfect rhythm! The combatant is hitting their stride!",
      "The momentum is undeniable! The fighter shows no signs of slowing down!"
    ],
    priority: 6
  },

  // POSITIONING MOMENTS - Strategic movement
  {
    id: 'positioning',
    condition: (ctx) => ctx.mechanics.repositionAttempts > 0,
    templates: {
      'Aang': {
        'calculated': [
          "Aang shifts his position strategically, looking for the perfect angle of attack!",
          "The airbender moves with purpose, positioning himself for maximum advantage!",
          "Aang's footwork is precise as he maneuvers for the perfect tactical position!",
          "The young Avatar's positioning is masterful—he's setting up for something big!"
        ]
      },
      'Azula': {
        'calculated': [
          "Azula's movements are calculated and precise as she positions herself for maximum advantage!",
          "The princess maneuvers with deadly precision, setting up the perfect tactical position!",
          "Azula's positioning is strategic—she's clearly planning something devastating!",
          "The firebender's footwork is flawless as she moves into the perfect attack position!"
        ]
      }
    },
    narratorTemplates: [
      "Strategic positioning! The fighter maneuvers for maximum advantage!",
      "Precise footwork! The combatant sets up the perfect tactical position!",
      "Masterful movement! The fighter positions themselves for something big!",
      "Calculated positioning! The warrior sets up for maximum impact!"
    ],
    priority: 5
  }
];

/**
 * @description Selects the most appropriate narrative template based on battle context
 * @param ctx - Battle context
 * @returns Selected narrative template or null
 */
export function selectNarrativeTemplate(ctx: BattleContext): NarrativeTemplate | null {
  // Sort templates by priority (highest first) and find the first one that matches
  const sortedTemplates = [...NARRATIVE_TEMPLATES].sort((a, b) => b.priority - a.priority);
  
  for (const template of sortedTemplates) {
    if (template.condition(ctx)) {
      return template;
    }
  }
  
  return null;
}

/**
 * @description Generates narrative text from a template for a specific character
 * @param template - Selected narrative template
 * @param ctx - Battle context
 * @param characterName - Name of the character
 * @returns Generated narrative text
 */
export function generateNarrativeText(
  template: NarrativeTemplate,
  ctx: BattleContext,
  characterName: string
): string {
  const characterTemplates = template.templates[characterName];
  if (!characterTemplates) {
    // Fallback to generic templates if character-specific ones don't exist
    return '';
  }
  
  const tone = determineNarrativeTone(ctx);
  const toneTemplates = characterTemplates[tone] || characterTemplates['desperate'] || characterTemplates['calculated'];
  
  if (!toneTemplates || toneTemplates.length === 0) {
    return '';
  }
  
  // Select random template from available options
  const selectedTemplate = toneTemplates[Math.floor(Math.random() * toneTemplates.length)];
  
  // Enhance template with damage information if available
  let enhancedText = selectedTemplate;
  
  if (ctx.damage !== undefined) {
    if (ctx.damage > 0) {
      enhancedText += ` (${ctx.damage} damage)`;
    } else {
      enhancedText += ` (0 damage)`;
    }
  }
  
  return enhancedText;
}

/**
 * @description Determines the narrative tone based on mechanical state
 * @param ctx - Battle context
 * @returns Narrative tone
 */
export function determineNarrativeTone(ctx: BattleContext): string {
  const { mechanics } = ctx;
  
  if (mechanics.forcedEscalation) {
    return mechanics.damageDealt > 15 ? 'furious' : 'desperate';
  }
  
  if (mechanics.isVulnerable && mechanics.punishDamage > 0) {
    return 'calculated';
  }
  
  if (mechanics.moveRepetition >= 3) {
    return 'desperate';
  }
  
  if (mechanics.isLowDamage) {
    return 'defensive';
  }
  
  if (mechanics.isHighDamage) {
    return 'confident';
  }
  
  if (mechanics.isRally) {
    return 'confident';
  }
  
  if (mechanics.isComeback) {
    return 'desperate';
  }
  
  return 'calculated';
}

/**
 * @description Generates narrator commentary based on battle context
 * @param ctx - Battle context
 * @returns Narrator commentary text
 */
export function generateNarratorCommentary(ctx: BattleContext): string {
  const template = selectNarrativeTemplate(ctx);
  
  if (template && template.narratorTemplates && template.narratorTemplates.length > 0) {
    const selectedCommentary = template.narratorTemplates[Math.floor(Math.random() * template.narratorTemplates.length)];
    
    // Enhance commentary with mechanical context
    let enhancedCommentary = selectedCommentary;
    
    if (ctx.damage !== undefined) {
      if (ctx.damage > 20) {
        enhancedCommentary += ` The impact is absolutely devastating!`;
      } else if (ctx.damage > 10) {
        enhancedCommentary += ` The strike lands with significant force!`;
      } else if (ctx.damage > 0) {
        enhancedCommentary += ` The attack connects, but lacks power.`;
      } else {
        enhancedCommentary += ` The attack fails to connect entirely.`;
      }
    }
    
    return enhancedCommentary;
  }
  
  // Fallback commentary
  return `The battle continues, each fighter searching for an advantage.`;
} 