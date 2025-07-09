// CONTEXT: Narrative System, // FOCUS: Opening Sequence and Pre-Fight Banter
import type { BattleCharacter, BattleState, BattleLogEntry } from '../../types';
import { logStory, logMechanics } from '../utils/mechanicLogUtils';
import { ensureNonEmpty } from '../utils/strings';

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
 * @description Generates a complete opening sequence for the battle
 */
export function generateOpeningSequence(
  player1: BattleCharacter,
  player2: BattleCharacter
): BattleLogEntry[] {
  const openingEntries: BattleLogEntry[] = [];
  let turnCounter = 1; // Start from turn 1 for opening sequence

  // System opening (INFO)
  const sysLog = logMechanics({
    turn: 0,
    text: ensureNonEmpty('System: Battle begins!')
  });
  if (sysLog) openingEntries.push({ ...(sysLog as BattleLogEntry), prologue: true });

  // NEW: Add a narrative entry for Prologue
  const prologueNarrative = logStory({
    turn: 0,
    narrative: ensureNonEmpty('The arena is silent as the battle is about to begin.')
  });
  if (prologueNarrative) openingEntries.push({ ...(prologueNarrative as BattleLogEntry), prologue: true });

  turnCounter++; // Now increment for subsequent entries

  // Narrator introduction (NARRATIVE)
  const intro = logStory({
    turn: turnCounter++,
    narrative: ensureNonEmpty('Two legendary fighters enter the arena.')
  });
  if (intro) openingEntries.push(intro);

  // Character 1 opening dialogue
  const char1Sequence = OPENING_SEQUENCES[player1.name];
  if (char1Sequence) {
    const c1 = logStory({
      turn: turnCounter++,
      narrative: ensureNonEmpty(`${player1.name} stands ready.`)
    });
    if (c1) openingEntries.push(c1);
  }

  // Character 2 opening dialogue
  const char2Sequence = OPENING_SEQUENCES[player2.name];
  if (char2Sequence) {
    const c2 = logStory({
      turn: turnCounter++,
      narrative: ensureNonEmpty(`${player2.name} stands ready.`)
    });
    if (c2) openingEntries.push(c2);
  }

  // Narrator character descriptions
  const desc1 = logStory({
    turn: turnCounter++,
    narrative: ensureNonEmpty('The crowd holds its breath.')
  });
  if (desc1) openingEntries.push(desc1);

  const desc2 = logStory({
    turn: turnCounter++,
    narrative: ensureNonEmpty('A hush falls over the arena.')
  });
  if (desc2) openingEntries.push(desc2);

  // Final tension building
  const tension = logStory({
    turn: turnCounter++,
    narrative: ensureNonEmpty('Tension crackles in the air.')
  });
  if (tension) openingEntries.push(tension);

  return openingEntries;
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