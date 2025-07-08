// Used via dynamic registry in Narrative system. See SYSTEM ARCHITECTURE.MD for flow.
// CONTEXT: Narrative System, // FOCUS: Template-Driven Storytelling
import type { BattleContext } from './types';

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
  // FORCED ESCALATION (Legendary Overhaul)
  {
    id: 'forced_escalation',
    condition: (ctx) => ctx.mechanics.forcedEscalation && ctx.damage !== undefined && ctx.damage > 0,
    templates: {
      'Aang': {
        'furious': [
          "Aang’s serenity is shattered—he becomes a whirlwind of desperation, his bending wild and unrestrained.",
          "Cornered by fate, Aang lashes out, every movement a storm breaking through the silence.",
          "All pacifism abandoned, the Avatar’s fury bends the air itself—he fights for more than victory.",
          "Aang’s hope becomes hurricane force; no more mercy, only pure will unleashed.",
          "Desperation for peace is twisted into violent motion—Aang strikes with a force that chills even his own heart."
        ],
        'desperate': [
          "Aang’s serenity is shattered—he becomes a whirlwind of desperation, his bending wild and unrestrained.",
          "Cornered by fate, Aang lashes out, every movement a storm breaking through the silence.",
          "All pacifism abandoned, the Avatar’s fury bends the air itself—he fights for more than victory.",
          "Aang’s hope becomes hurricane force; no more mercy, only pure will unleashed.",
          "Desperation for peace is twisted into violent motion—Aang strikes with a force that chills even his own heart."
        ]
      },
      'Azula': {
        'furious': [
          "Azula’s composure splinters; blue fire erupts, unpredictable and raw, her ambition burning through exhaustion.",
          "Every failure feeds her rage—Azula’s attacks become wilder, her technique a storm of risk and brilliance.",
          "With nowhere left to retreat, the princess becomes predator and prey—her power now reckless and sublime.",
          "Azula bends not just fire, but the very rules of the fight—her need for victory eclipses all caution.",
          "Desperation strips her of perfection—what’s left is Azula, unchained and terrifying."
        ],
        'desperate': [
          "Azula’s composure splinters; blue fire erupts, unpredictable and raw, her ambition burning through exhaustion.",
          "Every failure feeds her rage—Azula’s attacks become wilder, her technique a storm of risk and brilliance.",
          "With nowhere left to retreat, the princess becomes predator and prey—her power now reckless and sublime.",
          "Azula bends not just fire, but the very rules of the fight—her need for victory eclipses all caution.",
          "Desperation strips her of perfection—what’s left is Azula, unchained and terrifying."
        ]
      }
    },
    narratorTemplates: [
      "A furious crescendo overtakes the arena—both fighters abandon restraint, risking everything in a storm of will.",
      "The air sizzles with desperation; benders turn instinct to weapon, unleashing fury unseen since ancient legends.",
      "Strategy is cast aside. Only courage, hunger, and heartbreak remain in the battle’s final act.",
      "No more hesitation; even the elements recoil as every secret technique, every forbidden trick is bared.",
      "Pressure forges heroes—or destroys them. Both warriors reach beyond exhaustion into pure, ungoverned power.",
      "With tactics exhausted, the duelists become raw force—bending their very destinies with every move.",
      "The crowd falls silent as history is written in sweat and sparks—no holding back, no second chances.",
      "Each attack becomes a prayer and a gamble; victory and ruin now hang on a single breath.",
      "Boundaries shatter. The world narrows to a single truth: escalate or be erased.",
      "All plans are ash—only heart and fury dictate the final exchanges of this legendary duel."
    ],
    priority: 9
  },
  // PATTERN BREAK (Legendary Overhaul)
  {
    id: 'pattern_break',
    condition: (ctx) => ctx.mechanics.moveRepetition >= 3,
    templates: {
      'Aang': {
        'desperate': [
          "Aang’s movement becomes impossible to read—a dance of wind and intuition, adapting with every heartbeat.",
          "He senses the trap of repetition and answers with sudden, joyful chaos.",
          "The Avatar abandons old habits, inventing new rhythms mid-fight.",
          "Aang breaks the cycle; his bending becomes a question the enemy cannot answer."
        ]
      },
      'Azula': {
        'desperate': [
          "Azula snaps the chain of predictability, her strikes weaving new, lethal patterns.",
          "Her eyes narrow—pattern shattered, she turns unpredictability into her deadliest weapon.",
          "Perfection cracks, and from its shards Azula creates something utterly unexpected.",
          "The princess improvises with reckless genius, her flames now wild, untraceable."
        ]
      }
    },
    narratorTemplates: [
      "The rhythm of battle fractures—familiarity is shattered, and invention reigns.",
      "Predictability dies in an instant; the fight becomes a storm of daring and surprise.",
      "Stale tactics are tossed aside—creativity and chaos rush in like a flood.",
      "A flash of wildness turns the duel on its head—what was safe is now lethal.",
      "From routine, a spark: improvisation breathes new danger into the arena.",
      "Sudden inspiration upends the duel, both fighters forced to invent on the fly.",
      "Cautious repetition gives way to brilliance—this fight is now anyone’s to win or lose.",
      "An unexpected gambit spins order into uncertainty—strategy dissolves into pure instinct.",
      "The duelists change their dance; the familiar steps vanish beneath risk and imagination.",
      "All patterns broken, all plans reborn—the battlefield is now a blank canvas for genius."
    ],
    priority: 7
  },
  // VULNERABILITY PUNISHMENT (Legendary Overhaul)
  {
    id: 'vulnerability_punish_charging',
    condition: (ctx) => ctx.mechanics.isVulnerable && ctx.mechanics.vulnerabilityType === 'charging' && ctx.mechanics.punishDamage > 0,
    templates: {
      'Aang': {
        'calculated': [
          "Aang flows around the opponent’s charge, striking at the exact moment of weakness.",
          "He exploits the flaw with monk’s discipline—swift, precise, unstoppable.",
          "A heartbeat’s hesitation is all Aang needs to turn defense into victory."
        ]
      },
      'Azula': {
        'calculated': [
          "Azula pounces—her flames find the gap, punishing the mistake with regal cruelty.",
          "Predator’s instincts—Azula strikes before her foe can recover, her precision absolute.",
          "Her blue fire bites deep, a lesson in pain for the overzealous."
        ]
      }
    },
    narratorTemplates: [
      "Opportunity flashes—one bender is exposed, punished with flawless, brutal timing.",
      "The crowd gasps as a charging move is countered with devastating precision.",
      "A single mistake, and the duel shifts—vulnerability ruthlessly exploited.",
      "Caught wide open, the aggressor is humbled by a merciless counter-strike."
    ],
    priority: 8
  },
  // HIGH DAMAGE (Legendary Overhaul)
  {
    id: 'high_damage',
    condition: (ctx) => ctx.damage !== undefined && ctx.damage > 20,
    templates: {
      'Aang': {
        'confident': [
          "An attack like an earthquake—devastation written in every movement.",
          "Shockwaves ripple through the crowd—someone just bent the limits of power.",
          "The very ground trembles—a masterstroke lands, reshaping the duel.",
          "Raw elemental force explodes—this strike could end legends."
        ]
      },
      'Azula': {
        'confident': [
          "An attack like an earthquake—devastation written in every movement.",
          "Shockwaves ripple through the crowd—someone just bent the limits of power.",
          "The very ground trembles—a masterstroke lands, reshaping the duel.",
          "Raw elemental force explodes—this strike could end legends."
        ]
      }
    },
    narratorTemplates: [
      "An attack like an earthquake—devastation written in every movement.",
      "Shockwaves ripple through the crowd—someone just bent the limits of power.",
      "The very ground trembles—a masterstroke lands, reshaping the duel.",
      "Raw elemental force explodes—this strike could end legends."
    ],
    priority: 8
  },
  // LOW DAMAGE (Legendary Overhaul)
  {
    id: 'low_damage',
    condition: (ctx) => ctx.damage !== undefined && ctx.damage <= 5,
    templates: {
      'Aang': {
        'defensive': [
          "A feeble attempt—fatigue and doubt sap all strength from the blow.",
          "The attack lands, but it is little more than a plea for mercy.",
          "Effort outweighs effect—weariness is written in every gesture.",
          "A tired motion, quickly forgotten—a reminder that even titans tire."
        ]
      },
      'Azula': {
        'defensive': [
          "A feeble attempt—fatigue and doubt sap all strength from the blow.",
          "The attack lands, but it is little more than a plea for mercy.",
          "Effort outweighs effect—weariness is written in every gesture.",
          "A tired motion, quickly forgotten—a reminder that even titans tire."
        ]
      }
    },
    narratorTemplates: [
      "A feeble attempt—fatigue and doubt sap all strength from the blow.",
      "The attack lands, but it is little more than a plea for mercy.",
      "Effort outweighs effect—weariness is written in every gesture.",
      "A tired motion, quickly forgotten—a reminder that even titans tire."
    ],
    priority: 4
  },
  // COMEBACK (Legendary Overhaul)
  {
    id: 'comeback',
    condition: (ctx) => ctx.mechanics.isComeback,
    templates: {
      'Aang': {
        'desperate': [
          "A last stand becomes a miracle—one fighter’s spirit blazes back from the brink.",
          "When all seemed lost, willpower ignites—momentum swings like a hammer.",
          "Defeat snatched from the jaws of victory—resilience turns fate upside down.",
          "Sheer stubbornness rewrites the story—one more attack, one more hope."
        ]
      },
      'Azula': {
        'desperate': [
          "A last stand becomes a miracle—one fighter’s spirit blazes back from the brink.",
          "When all seemed lost, willpower ignites—momentum swings like a hammer.",
          "Defeat snatched from the jaws of victory—resilience turns fate upside down.",
          "Sheer stubbornness rewrites the story—one more attack, one more hope."
        ]
      }
    },
    narratorTemplates: [
      "A last stand becomes a miracle—one fighter’s spirit blazes back from the brink.",
      "When all seemed lost, willpower ignites—momentum swings like a hammer.",
      "Defeat snatched from the jaws of victory—resilience turns fate upside down.",
      "Sheer stubbornness rewrites the story—one more attack, one more hope."
    ],
    priority: 7
  },
  // RALLY (Legendary Overhaul)
  {
    id: 'rally',
    condition: (ctx) => ctx.mechanics.isRally,
    templates: {
      'Aang': {
        'confident': [
          "Momentum builds—a rising storm of attacks signals a champion’s return.",
          "A fighter catches the rhythm—the tide of battle begins to turn.",
          "The crowd feels it—each move sharper, faster, more sure.",
          "This is the moment the legend is born—one strike at a time."
        ]
      },
      'Azula': {
        'confident': [
          "Momentum builds—a rising storm of attacks signals a champion’s return.",
          "A fighter catches the rhythm—the tide of battle begins to turn.",
          "The crowd feels it—each move sharper, faster, more sure.",
          "This is the moment the legend is born—one strike at a time."
        ]
      }
    },
    narratorTemplates: [
      "Momentum builds—a rising storm of attacks signals a champion’s return.",
      "A fighter catches the rhythm—the tide of battle begins to turn.",
      "The crowd feels it—each move sharper, faster, more sure.",
      "This is the moment the legend is born—one strike at a time."
    ],
    priority: 6
  },
  // POSITIONING (Legendary Overhaul)
  {
    id: 'positioning',
    condition: (ctx) => ctx.mechanics.repositionAttempts > 0,
    templates: {
      'Aang': {
        'calculated': [
          "A subtle dance—each step carves out new advantage, unseen by most.",
          "Strategy is a blade; every footfall another cut.",
          "Masterful movement—position becomes as deadly as power itself.",
          "The wise warrior wins the ground before the battle is decided."
        ]
      },
      'Azula': {
        'calculated': [
          "A subtle dance—each step carves out new advantage, unseen by most.",
          "Strategy is a blade; every footfall another cut.",
          "Masterful movement—position becomes as deadly as power itself.",
          "The wise warrior wins the ground before the battle is decided."
        ]
      }
    },
    narratorTemplates: [
      "A subtle dance—each step carves out new advantage, unseen by most.",
      "Strategy is a blade; every footfall another cut.",
      "Masterful movement—position becomes as deadly as power itself.",
      "The wise warrior wins the ground before the battle is decided."
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