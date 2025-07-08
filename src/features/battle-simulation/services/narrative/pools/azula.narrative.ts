/**
 * @fileoverview Contains all narrative line pools specifically for Azula.
 * @description Lines reflect Azula's personality: sharp, dominant, cruel, and obsessed with perfection.
 */

import { CharacterNarrativePool } from '../narrative.types';

export const azulaNarrativePool: CharacterNarrativePool = {
  BasicStrike: {
    hit: [
      "Azula’s fingers spark as her strike lands—precision incarnate.",
      "Blue flame erupts, searing her foe.",
      "She moves with deadly intent, landing each blow."
    ],
    miss: [
      "Azula scoffs, annoyed by the miss.",
      "A rare lapse, gone as soon as it appears.",
      "The fire whips past—Azula never misses for long."
    ]
  },
  Lightning: {
    hit: [
      "A jagged bolt leaps from Azula’s hand, cracking the air.",
      "Her eyes narrow; lightning answers her will.",
      "The heavens split—her opponent writhes."
    ],
    miss: [
      "The lightning fizzles, her focus slipping.",
      "She grits her teeth; the next will not fail.",
      "Static crackles, but nothing strikes."
    ]
  },
  Reversal: {
    trigger: [
      "Azula twists, turning weakness to strength.",
      "She lashes back, relentless.",
      "No advantage goes unclaimed."
    ]
  },
  ForcedEscalation: {
    trigger: [
      "Azula smiles—she thrives on chaos.",
      "The more desperate the fight, the sharper her edge.",
      "Escalation? She welcomes it."
    ]
  },
  DesperationTrigger: {
    trigger: [
      "Azula’s grin widens, eyes wild with anticipation.",
      "Cornered, her flames burn hotter.",
      "Desperation brings out her true cruelty."
    ]
  },
  Finisher: {
    victory: [
      "Azula stands victorious—untouchable, unstoppable.",
      "She basks in the ruin she wrought.",
      "Victory is her birthright."
    ],
    fail: [
      "Azula snarls, pride wounded, fire guttering.",
      "Her confidence shatters; defeat is unthinkable.",
      "She falls, but vengeance simmers."
    ]
  },
  Stalemate: {
    trigger: [
      "This is tiresome. End it, or I will.",
      "Azula’s patience wears thinner than her mercy.",
      "A stalemate? How… disappointing."
    ]
  },
  Clash: {
    trigger: [
      "The clash continues, neither side yielding.",
      "Every move leaves its mark, but nothing is settled.",
      "Each moment brings new danger."
    ]
  }
};
