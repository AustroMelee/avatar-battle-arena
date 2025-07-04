// CONTEXT: Narrative System, // FOCUS: Character Voices
import type { NarrativeHook, CharacterNarratives } from './types';


/**
 * @description Azula's narrative hooks - snide, sharp, aggressive, self-assured
 */
const azulaHooks: NarrativeHook[] = [
  // Opening taunts
  {
    when: (ctx) => ctx.battlePhase === 'start' && ctx.turnIndex === 0,
    speaker: 'Azula',
    text: () => "You're out of your league, Avatar. This ends now.",
    mood: 'smug',
    priority: 5
  },
  
  // First blood reactions
  {
    when: (ctx) => Boolean(ctx.isFirstBlood) && Boolean(ctx.damage) && ctx.damage! > 0,
    speaker: 'Azula',
    text: () => "First blood. How predictable.",
    mood: 'smug',
    priority: 8
  },
  
  // Critical hits
  {
    when: (ctx) => Boolean(ctx.isCritical) && Boolean(ctx.damage) && ctx.damage! > 15,
    speaker: 'Azula',
    text: () => [
      "Feel the power of true firebending!",
      "This is what real power looks like!",
      "Burn in my flames!",
      "The fire nation's might!",
      "Inferno strike!"
    ],
    mood: 'furious',
    priority: 7
  },
  
  // When opponent is low health
  {
    when: (ctx) => ctx.targetHealthPercent < 0.3 && Boolean(ctx.damage) && ctx.damage! > 0,
    speaker: 'Azula',
    text: () => "You're finished. Accept your defeat.",
    mood: 'confident',
    priority: 6
  },
  
  // When Azula is low health but fighting back
  {
    when: (ctx) => ctx.actorHealthPercent < 0.3 && Boolean(ctx.damage) && ctx.damage! > 0,
    speaker: 'Azula',
    text: () => "I won't be defeated by the likes of you!",
    mood: 'defiant',
    priority: 7
  },
  
  // Desperation moves
  {
    when: (ctx) => Boolean(ctx.isDesperation),
    speaker: 'Azula',
    text: () => "You leave me no choice... DIE!",
    mood: 'furious',
    priority: 9
  },
  
  // Rally sequences
  {
    when: (ctx) => Boolean(ctx.isRally) && Boolean(ctx.damage) && ctx.damage! > 0,
    speaker: 'Azula',
    text: () => "You can't stop me!",
    mood: 'confident',
    priority: 6
  },
  
  // Chi exhaustion
  {
    when: (ctx) => ctx.actorChiPercent < 0.2,
    speaker: 'Azula',
    text: () => "I don't need chi to destroy you.",
    mood: 'defiant',
    priority: 5
  },
  
  // Victory taunt
  {
    when: (ctx) => ctx.targetHealthPercent <= 0,
    speaker: 'Azula',
    text: () => "As expected. You were never a match for me.",
    mood: 'smug',
    priority: 10
  },
  
  // Defeat reaction
  {
    when: (ctx) => ctx.actorHealthPercent <= 0,
    speaker: 'Azula',
    text: () => "This... this isn't possible...",
    mood: 'scared',
    priority: 10
  },
  
  // Mid-battle taunts
  {
    when: (ctx) => ctx.battlePhase === 'mid' && ctx.turnIndex % 3 === 0,
    speaker: 'Azula',
    text: () => [
      "Your bending is pathetic.",
      "Is that the best you can do?",
      "You're wasting my time.",
      "How disappointing.",
      "I expected more from the Avatar.",
      "This is getting boring.",
      "Your technique is sloppy.",
      "Are you even trying?",
      "You fight like a child.",
      "The Avatar should be more impressive.",
      "This is beneath me.",
      "Your airbending is weak.",
      "I've fought better opponents.",
      "You're not worthy of my full power.",
      "This battle is a joke."
    ],
    mood: 'taunt',
    priority: 3
  },
  
  // Thought bubbles (internal monologue)
  {
    when: (ctx) => ctx.actorHealthPercent < 0.5 && ctx.targetHealthPercent > 0.7,
    speaker: 'Azula',
    text: () => "I need to be more careful...",
    mood: 'thought',
    priority: 4
  }
];

/**
 * @description Aang's narrative hooks - hopeful, worried, thoughtful, sometimes humorous
 */
const aangHooks: NarrativeHook[] = [
  // Opening dialogue
  {
    when: (ctx) => ctx.battlePhase === 'start' && ctx.turnIndex === 0,
    speaker: 'Aang',
    text: () => "I don't want to fight you, Azula. There's another way.",
    mood: 'worried',
    priority: 5
  },
  
  // First blood reactions
  {
    when: (ctx) => Boolean(ctx.isFirstBlood) && Boolean(ctx.damage) && ctx.damage! > 0,
    speaker: 'Aang',
    text: () => "I'm sorry it had to come to this...",
    mood: 'worried',
    priority: 8
  },
  
  // Critical hits
  {
    when: (ctx) => Boolean(ctx.isCritical) && Boolean(ctx.damage) && ctx.damage! > 15,
    speaker: 'Aang',
    text: () => [
      "The wind is with me!",
      "Airbending power!",
      "The spirits guide my hand!",
      "Balance and harmony!",
      "Air fury!"
    ],
    mood: 'heroic',
    priority: 7
  },
  
  // When opponent is low health
  {
    when: (ctx) => ctx.targetHealthPercent < 0.3 && Boolean(ctx.damage) && ctx.damage! > 0,
    speaker: 'Aang',
    text: () => "Please, just surrender. No one has to get hurt.",
    mood: 'worried',
    priority: 6
  },
  
  // When Aang is low health but fighting back
  {
    when: (ctx) => ctx.actorHealthPercent < 0.3 && Boolean(ctx.damage) && ctx.damage! > 0,
    speaker: 'Aang',
    text: () => "I won't give up! The world needs me!",
    mood: 'heroic',
    priority: 7
  },
  
  // Desperation moves
  {
    when: (ctx) => Boolean(ctx.isDesperation),
    speaker: 'Aang',
    text: () => "I have no choice... Air Mastery!",
    mood: 'desperate',
    priority: 9
  },
  
  // Rally sequences
  {
    when: (ctx) => Boolean(ctx.isRally) && Boolean(ctx.damage) && ctx.damage! > 0,
    speaker: 'Aang',
    text: () => "I can do this!",
    mood: 'heroic',
    priority: 6
  },
  
  // Chi exhaustion
  {
    when: (ctx) => ctx.actorChiPercent < 0.2,
    speaker: 'Aang',
    text: () => "I need to conserve my energy...",
    mood: 'worried',
    priority: 5
  },
  
  // Victory dialogue
  {
    when: (ctx) => ctx.targetHealthPercent <= 0,
    speaker: 'Aang',
    text: () => "It's over. I hope you understand now.",
    mood: 'stoic',
    priority: 10
  },
  
  // Defeat reaction
  {
    when: (ctx) => ctx.actorHealthPercent <= 0,
    speaker: 'Aang',
    text: () => "I... I failed...",
    mood: 'scared',
    priority: 10
  },
  
  // Mid-battle encouragement
  {
    when: (ctx) => ctx.battlePhase === 'mid' && ctx.turnIndex % 4 === 0,
    speaker: 'Aang',
    text: () => [
      "We can still find peace!",
      "There's always another way!",
      "I believe in you, Azula!",
      "We don't have to fight!",
      "Let's talk this out!",
      "There's good in everyone!",
      "We can work together!",
      "Peace is always possible!"
    ],
    mood: 'heroic',
    priority: 3
  },
  
  // Thought bubbles (internal monologue)
  {
    when: (ctx) => ctx.actorHealthPercent < 0.5 && ctx.targetHealthPercent > 0.7,
    speaker: 'Aang',
    text: () => "I need to be smarter about this...",
    mood: 'thought',
    priority: 4
  },
  
  // Humorous moments
  {
    when: (ctx) => ctx.battlePhase === 'start' && ctx.turnIndex === 1,
    speaker: 'Aang',
    text: () => "At least the weather's nice for a fight!",
    mood: 'amused',
    priority: 2
  }
];

/**
 * @description Character-specific narrative collections
 */
export const characterNarratives: CharacterNarratives = {
  'Azula': azulaHooks,
  'Aang': aangHooks
}; 