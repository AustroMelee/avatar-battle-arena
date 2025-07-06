// CONTEXT: Narrative System, // FOCUS: Opening Sequence and Pre-Fight Banter
import type { BattleCharacter, BattleState, BattleLogEntry } from '../../types';
import { createEventId, generateUniqueLogId } from '../ai/logQueries';

/**
 * @description Opening sequence configuration for each character
 */
export type OpeningSequence = {
  character: string;
  dialogue: string[];
  narrator: string[];
  mood: 'confident' | 'worried' | 'aggressive' | 'peaceful' | 'determined';
};

/**
 * @description Character-specific opening sequences
 */
const OPENING_SEQUENCES: Record<string, OpeningSequence> = {
  Aang: {
    character: 'Aang',
    dialogue: [
      "I don't want to fight you, Azula. There's another way.",
      "We can still find peace together.",
      "The world needs balance, not more conflict.",
      "I believe there's good in everyone, even you.",
      "Let's talk this out instead of fighting.",
      "Violence only leads to more violence.",
      "I'm the Avatar, and I choose peace.",
      "There's always another path forward."
    ],
    narrator: [
      "The young Avatar stands ready, his staff held with practiced ease.",
      "Aang's gentle eyes betray his reluctance to fight.",
      "The airbender's stance is defensive, seeking peace even in conflict.",
      "Wind whispers around the Avatar, responding to his inner calm.",
      "Aang's movements are fluid, his training evident in every gesture."
    ],
    mood: 'peaceful'
  },
  Azula: {
    character: 'Azula',
    dialogue: [
      "You're out of your league, Avatar. This ends now.",
      "The Fire Nation will not be stopped by a child.",
      "Your pacifism will be your downfall.",
      "I've been waiting for this moment.",
      "The Avatar cycle ends with you.",
      "You think you can defeat the Fire Nation's might?",
      "Your airbending is no match for true power.",
      "Time to prove who's stronger."
    ],
    narrator: [
      "Azula's blue flames crackle with barely contained fury.",
      "The princess's stance is aggressive, every muscle coiled for attack.",
      "Fire dances around Azula's fingertips, a deadly promise.",
      "Her golden eyes burn with determination and pride.",
      "The Fire Nation princess exudes confidence and menace."
    ],
    mood: 'aggressive'
  }
};

/**
 * @description Location-specific opening narratives
 */
const LOCATION_OPENINGS: Record<string, string[]> = {
  'Fire Nation Capital': [
    "The ancient throne room echoes with the weight of history.",
    "Shadows dance across the stone walls as flames illuminate the chamber.",
    "The very foundations of the Fire Nation tremble with anticipation.",
    "Centuries of Fire Nation power resonate through these halls.",
    "The throne room bears witness to this epic confrontation."
  ],
  'Ba Sing Se': [
    "The walls of Ba Sing Se have never seen such a battle.",
    "The ancient city's defenses seem insignificant now.",
    "Earth and stone bear witness to this elemental clash.",
    "The city's heart beats with the rhythm of conflict.",
    "Ba Sing Se's history is written in stone and earth."
  ],
  'Northern Water Tribe': [
    "The ice and snow of the North Pole provide a stark backdrop.",
    "Ancient ice formations reflect the battle's intensity.",
    "The spirits of the North watch this confrontation.",
    "Snow swirls around the combatants, nature's own audience.",
    "The frozen landscape amplifies every sound and movement."
  ],
  'Southern Air Temple': [
    "The sacred halls of the Air Nomads echo with conflict.",
    "Ancient airbending wisdom seems to whisper through the ruins.",
    "The spirits of Aang's people watch this confrontation.",
    "Wind howls through the temple, carrying the weight of history.",
    "The temple's peaceful past contrasts with the present violence."
  ],
  'Open Field': [
    "The open sky provides no shelter from this confrontation.",
    "Nature itself seems to hold its breath.",
    "The elements themselves gather to witness this clash.",
    "No walls or barriers contain this elemental fury.",
    "The battlefield stretches as far as the eye can see."
  ]
};

/**
 * @description Generates a complete opening sequence for the battle
 */
export function generateOpeningSequence(
  player1: BattleCharacter,
  player2: BattleCharacter,
  location: string
): BattleLogEntry[] {
  const openingEntries: BattleLogEntry[] = [];
  let turnCounter = 1; // Start from turn 1 for opening sequence

  // System opening
  openingEntries.push({
    id: generateUniqueLogId('opening'),
    turn: turnCounter++,
    actor: 'System',
    type: 'INFO',
    action: 'Battle Start',
    result: `The battle begins in the ${location}!`,
    narrative: getLocationOpening(location, player1.name, player2.name),
    timestamp: Date.now()
  });

  // Narrator introduction
  openingEntries.push({
    id: generateUniqueLogId('opening'),
    turn: turnCounter++,
    actor: 'Narrator',
    type: 'NARRATIVE',
    action: 'Opening',
    result: getNarratorOpening(player1, player2, location),
    narrative: getNarratorOpening(player1, player2, location),
    timestamp: Date.now()
  });

  // Character 1 opening dialogue
  const char1Sequence = OPENING_SEQUENCES[player1.name];
  if (char1Sequence) {
    openingEntries.push({
      id: generateUniqueLogId('opening'),
      turn: turnCounter++,
      actor: player1.name,
      type: 'NARRATIVE',
      action: 'Opening',
      result: getRandomDialogue(char1Sequence.dialogue),
      narrative: getRandomDialogue(char1Sequence.dialogue),
      timestamp: Date.now()
    });
  }

  // Character 2 opening dialogue
  const char2Sequence = OPENING_SEQUENCES[player2.name];
  if (char2Sequence) {
    openingEntries.push({
      id: generateUniqueLogId('opening'),
      turn: turnCounter++,
      actor: player2.name,
      type: 'NARRATIVE',
      action: 'Opening',
      result: getRandomDialogue(char2Sequence.dialogue),
      narrative: getRandomDialogue(char2Sequence.dialogue),
      timestamp: Date.now()
    });
  }

  // Narrator character descriptions
  openingEntries.push({
    id: generateUniqueLogId('opening'),
    turn: turnCounter++,
    actor: 'Narrator',
    type: 'NARRATIVE',
    action: 'Character Description',
    result: getCharacterDescription(player1, char1Sequence),
    narrative: getCharacterDescription(player1, char1Sequence),
    timestamp: Date.now()
  });

  openingEntries.push({
    id: generateUniqueLogId('opening'),
    turn: turnCounter++,
    actor: 'Narrator',
    type: 'NARRATIVE',
    action: 'Character Description',
    result: getCharacterDescription(player2, char2Sequence),
    narrative: getCharacterDescription(player2, char2Sequence),
    timestamp: Date.now()
  });

  // Final tension building
  openingEntries.push({
    id: generateUniqueLogId('opening'),
    turn: turnCounter++,
    actor: 'Narrator',
    type: 'NARRATIVE',
    action: 'Tension',
    result: getTensionBuilding(player1, player2),
    narrative: getTensionBuilding(player1, player2),
    timestamp: Date.now()
  });

  return openingEntries;
}

/**
 * @description Gets location-specific opening narrative
 */
function getLocationOpening(location: string, player1: string, player2: string): string {
  const locationOpenings = LOCATION_OPENINGS[location] || LOCATION_OPENINGS['Open Field'];
  const baseOpening = locationOpenings[Math.floor(Math.random() * locationOpenings.length)];
  
  return `The air crackles with anticipation as ${player1} and ${player2} face off in the ${location}. ${baseOpening}`;
}

/**
 * @description Gets narrator opening commentary
 */
function getNarratorOpening(player1: BattleCharacter, player2: BattleCharacter, location: string): string {
  const openings = [
    `The stage is set. ${player1.bending} and ${player2.bending} clash in the heart of the ${location}.`,
    `Two masters of their elements prepare for battle. The ${location} will witness this epic confrontation.`,
    `The elements themselves seem to gather, anticipating the clash between ${player1.name} and ${player2.name}.`,
    `Ancient forces stir as ${player1.name} and ${player2.name} prepare to settle their differences.`,
    `The ${location} becomes the arena for this legendary battle between master benders.`
  ];
  
  return openings[Math.floor(Math.random() * openings.length)];
}

/**
 * @description Gets random dialogue from character sequence
 */
function getRandomDialogue(dialogue: string[]): string {
  return dialogue[Math.floor(Math.random() * dialogue.length)];
}

/**
 * @description Gets character description from narrator
 */
function getCharacterDescription(character: BattleCharacter, sequence?: OpeningSequence): string {
  if (sequence && sequence.narrator.length > 0) {
    return getRandomDialogue(sequence.narrator);
  }
  
  // Fallback descriptions
  const fallbacks = [
    `${character.name} stands ready, their ${character.bending} abilities evident in their stance.`,
    `The ${character.bending}bender's movements betray years of training and discipline.`,
    `${character.name}'s presence commands attention, their power undeniable.`,
    `Every gesture from ${character.name} speaks of mastery over their element.`
  ];
  
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/**
 * @description Gets tension building narrative
 */
function getTensionBuilding(player1: BattleCharacter, player2: BattleCharacter): string {
  const tensions = [
    `The tension between ${player1.name} and ${player2.name} is palpable. The first move will decide everything.`,
    `Both combatants circle each other warily, searching for any opening. The battle is about to begin.`,
    `The air itself seems charged with anticipation. ${player1.name} and ${player2.name} prepare for the first strike.`,
    `A moment of stillness before the storm. The clash between ${player1.name} and ${player2.name} is inevitable.`,
    `The elements themselves hold their breath. This battle between ${player1.name} and ${player2.name} will be legendary.`
  ];
  
  return tensions[Math.floor(Math.random() * tensions.length)];
}

/**
 * @description Integrates opening sequence into battle state
 */
export function integrateOpeningSequence(
  state: BattleState,
  openingEntries: BattleLogEntry[]
): BattleState {
  const newState = { ...state };
  
  // Add opening entries to battle log
  newState.battleLog = [...openingEntries, ...newState.battleLog];
  
  // Add opening narratives to log
  const openingNarratives = openingEntries.map(entry => entry.narrative).filter(Boolean) as string[];
  newState.log = [...openingNarratives, ...newState.log];
  
  return newState;
} 