// CONTEXT: Narrative System, // FOCUS: Narrator Commentary
import type { NarrativeHook } from './types';

/**
 * @description Narrator hooks for epic battle commentary
 */
export const narratorHooks: NarrativeHook[] = [
  // Battle opening
  {
    when: (ctx) => ctx.turnIndex === 0,
    speaker: 'Narrator',
    text: () => "The stage is set. Fire and Air clash in the heart of the Fire Nation Capital.",
    priority: 6
  },
  
  // First blood commentary
  {
    when: (ctx) => Boolean(ctx.isFirstBlood) && Boolean(ctx.damage) && ctx.damage! > 0,
    speaker: 'Narrator',
    text: () => "First blood is drawn. The battle has truly begun.",
    priority: 8
  },
  
  // Critical hit commentary
  {
    when: (ctx) => Boolean(ctx.isCritical) && Boolean(ctx.damage) && ctx.damage! > 20,
    speaker: 'Narrator',
    text: () => [
      "A devastating blow! The very air crackles with power.",
      "The elements themselves seem to answer the call.",
      "Such raw power unleashed upon the battlefield."
    ],
    priority: 7
  },
  
  // Desperation move commentary
  {
    when: (ctx) => Boolean(ctx.isDesperation),
    speaker: 'Narrator',
    text: () => "Desperation drives them to unleash their ultimate power!",
    priority: 9
  },
  
  // Comeback commentary
  {
    when: (ctx) => Boolean(ctx.isComeback),
    speaker: 'Narrator',
    text: () => "Against all odds, they find the strength to fight back!",
    priority: 7
  },
  
  // Rally commentary
  {
    when: (ctx) => Boolean(ctx.isRally),
    speaker: 'Narrator',
    text: () => "They're on a roll! Momentum builds with each strike.",
    priority: 6
  },
  
  // Low health commentary
  {
    when: (ctx) => ctx.actorHealthPercent < 0.2 || ctx.targetHealthPercent < 0.2,
    speaker: 'Narrator',
    text: () => "The battle reaches its climax. One wrong move could be fatal.",
    priority: 8
  },
  
  // Chi exhaustion commentary
  {
    when: (ctx) => ctx.actorChiPercent < 0.1 || ctx.targetChiPercent < 0.1,
    speaker: 'Narrator',
    text: () => "Their chi reserves are nearly depleted. The end draws near.",
    priority: 6
  },
  
  // Victory commentary
  {
    when: (ctx) => ctx.targetHealthPercent <= 0,
    speaker: 'Narrator',
    text: () => "The victor stands triumphant. The battle is won.",
    priority: 10
  },
  
  // Defeat commentary
  {
    when: (ctx) => ctx.actorHealthPercent <= 0,
    speaker: 'Narrator',
    text: () => "Defeat comes to all, even the strongest.",
    priority: 10
  },
  
  // Mid-battle tension
  {
    when: (ctx) => ctx.battlePhase === 'mid' && ctx.turnIndex % 5 === 0,
    speaker: 'Narrator',
    text: () => [
      "The battle rages on, neither side willing to yield.",
      "Fire and Air dance their deadly dance across the battlefield.",
      "The clash of elements echoes through the ancient halls.",
      "Each combatant tests the other's limits.",
      "The air crackles with elemental energy.",
      "Neither warrior shows signs of backing down.",
      "The ancient chamber witnesses this epic duel.",
      "Power meets power in this elemental clash.",
      "The intensity builds with each exchange.",
      "Both fighters demonstrate masterful technique.",
      "The battle reaches new heights of ferocity.",
      "Elemental forces collide in spectacular fashion.",
      "The chamber resonates with the power of their clash.",
      "Each strike carries the weight of their determination.",
      "The battle becomes a test of endurance and skill.",
      "Flames and wind swirl in a deadly ballet.",
      "The very air seems charged with their energy.",
      "Their movements blur with speed and precision."
    ],
    priority: 4
  },
  
  // Environmental commentary (Fire Nation Capital specific)
  {
    when: (ctx) => ctx.location === 'Fire Nation Capital' && ctx.turnIndex % 4 === 0,
    speaker: 'Narrator',
    text: () => [
      "The ancient stone walls bear witness to this epic confrontation.",
      "Shadows dance across the throne room as flames illuminate the battle.",
      "The very foundations of the Fire Nation tremble with each clash."
    ],
    priority: 3
  },
  
  // Battle phase transitions
  {
    when: (ctx) => ctx.battlePhase === 'end' && ctx.turnIndex > 7,
    speaker: 'Narrator',
    text: () => "The battle enters its final phase. The endgame approaches.",
    priority: 5
  },
  
  // High damage moments
  {
    when: (ctx) => Boolean(ctx.damage) && ctx.damage! > 25,
    speaker: 'Narrator',
    text: () => "A thunderous impact! The force of the blow is felt throughout the chamber.",
    priority: 6
  },
  
  // Defensive moments
  {
    when: (ctx) => Boolean(ctx.damage) && ctx.damage! < 5,
    speaker: 'Narrator',
    text: () => "The attack is skillfully deflected. Defense proves as important as offense.",
    priority: 4
  },
  
  // Piercing move commentary
  {
    when: (ctx) => Boolean(ctx.move.tags?.includes('piercing')) && Boolean(ctx.damage) && ctx.damage! > 0,
    speaker: 'Narrator',
    text: () => [
      "The attack pierces through their defenses with surgical precision!",
      "Their guard is shattered by the focused strike!",
      "The blow finds its mark, bypassing all protection!",
      "Defense crumbles before this penetrating assault!",
      "The strike cuts through their defenses like a hot knife!",
      "Their protective stance is rendered useless!",
      "The attack slices through their guard effortlessly!",
      "No defense can withstand this focused power!",
      "Their barriers shatter under the concentrated force!",
      "The strike penetrates their defenses with devastating effect!"
    ],
    priority: 6
  },
  
  // Resource management commentary - spaced out more
  {
    when: (ctx) => ctx.actorChiPercent < 0.3 && ctx.targetChiPercent < 0.3 && ctx.turnIndex % 8 === 0,
    speaker: 'Narrator',
    text: () => [
      "Both combatants feel the strain of battle. Chi becomes precious.",
      "The warriors' energy reserves dwindle as the battle continues.",
      "Fatigue begins to show in their movements.",
      "Their chi reserves are running dangerously low.",
      "The cost of battle takes its toll on both fighters."
    ],
    priority: 5
  }
]; 